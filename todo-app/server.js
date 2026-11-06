const express = require('express');
const db = require('./db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Привет от сервера!' });
});

const XP_BY_DIFFICULTY = { 1: 10, 2: 25, 3: 50 };
const HABIT_XP = 15;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

async function getXp() {
  return (await db.get('SELECT xp FROM stats WHERE id = 1')).xp;
}

async function addXp(delta) {
  if (delta === 0) return;
  await db.run('UPDATE stats SET xp = MAX(0, xp + ?) WHERE id = 1', [delta]);
}

// «Сегодня» присылает браузер: сервер на Render живёт в UTC,
// и полночь у пользователя наступает в другое время.
function resolveDate(value) {
  return DATE_RE.test(value) ? value : new Date().toISOString().slice(0, 10);
}

function shiftDay(date, days) {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Стрик не обрывается, пока сегодняшний день ещё не закончился:
// если сегодня отметок нет, считаем от вчера.
function currentStreak(dates, today) {
  const days = new Set(dates);
  let day = days.has(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (days.has(day)) {
    streak++;
    day = shiftDay(day, -1);
  }
  return streak;
}

function bestStreak(dates) {
  const sorted = [...new Set(dates)].sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const day of sorted) {
    run = prev && shiftDay(prev, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    prev = day;
  }
  return best;
}

async function totalStreak(today) {
  const rows = await db.all('SELECT date FROM completions UNION SELECT date FROM habit_checks');
  return currentStreak(rows.map((row) => row.date), today);
}

async function habitView(habit, today) {
  const rows = await db.all('SELECT date FROM habit_checks WHERE habit_id = ?', [habit.id]);
  const dates = rows.map((row) => row.date);

  return {
    id: habit.id,
    title: habit.title,
    doneToday: dates.includes(today),
    streak: currentStreak(dates, today),
    best: bestStreak(dates)
  };
}

// ---------- Челленджи дня ----------

// group — челленджи из одной группы не выпадают в один день.
// target может зависеть от данных дня (например, от числа ежедневок).
const CHALLENGES = [
  { id: 'tasks3', group: 'tasks', target: 3, reward: 30, progress: (day) => day.tasks },
  { id: 'tasks5', group: 'tasks', target: 5, reward: 50, progress: (day) => day.tasks },
  { id: 'hard1', group: 'hard', target: 1, reward: 40, progress: (day) => day.hard },
  { id: 'medium2', group: 'medium', target: 2, reward: 35, progress: (day) => day.mediumPlus },
  { id: 'habits2', group: 'habits', target: 2, reward: 30, progress: (day) => day.habitChecks },
  {
    id: 'habitsAll',
    group: 'habits',
    target: (day) => Math.max(1, day.habitCount),
    reward: 40,
    progress: (day) => day.habitChecks
  },
  { id: 'xp80', group: 'xp', target: 80, reward: 40, progress: (day) => day.xp },
  { id: 'xp150', group: 'xp', target: 150, reward: 60, progress: (day) => day.xp }
];
const CHALLENGES_PER_DAY = 3;

// Генератор псевдослучайных чисел с «зерном»: для одной даты всегда
// получается одна и та же последовательность, поэтому челленджи дня не меняются.
function seededRandom(seedText) {
  let seed = 0;
  for (const char of seedText) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let x = seed;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function challengesForDay(date) {
  const random = seededRandom(date);
  const shuffled = [...CHALLENGES];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const picked = [];
  for (const challenge of shuffled) {
    if (picked.length === CHALLENGES_PER_DAY) break;
    if (!picked.some((item) => item.group === challenge.group)) picked.push(challenge);
  }
  return picked;
}

async function dayStats(date) {
  const tasks = await db.get(
    `SELECT
       COUNT(*) AS tasks,
       SUM(difficulty = 3) AS hard,
       SUM(difficulty >= 2) AS mediumPlus,
       SUM(CASE difficulty WHEN 3 THEN ? WHEN 2 THEN ? ELSE ? END) AS xp
     FROM completions WHERE date = ?`,
    [XP_BY_DIFFICULTY[3], XP_BY_DIFFICULTY[2], XP_BY_DIFFICULTY[1], date]
  );
  const checks = await db.get('SELECT COUNT(*) AS n FROM habit_checks WHERE date = ?', [date]);
  const habits = await db.get('SELECT COUNT(*) AS n FROM habits');

  return {
    tasks: tasks.tasks || 0,
    hard: tasks.hard || 0,
    mediumPlus: tasks.mediumPlus || 0,
    habitChecks: checks.n,
    habitCount: habits.n,
    xp: (tasks.xp || 0) + checks.n * HABIT_XP
  };
}

// Считает прогресс и выдаёт награду за только что выполненные челленджи.
// Награда выдаётся один раз: если потом снять галочку, она остаётся.
async function evaluateChallenges(date) {
  const day = await dayStats(date);
  const rewardedRows = await db.all('SELECT challenge FROM challenge_rewards WHERE date = ?', [date]);
  const rewarded = new Set(rewardedRows.map((row) => row.challenge));

  const challenges = [];
  const completed = [];

  for (const challenge of challengesForDay(date)) {
    const target = typeof challenge.target === 'function' ? challenge.target(day) : challenge.target;
    const current = Math.min(challenge.progress(day), target);

    if (current >= target && !rewarded.has(challenge.id)) {
      await db.run('INSERT INTO challenge_rewards (date, challenge) VALUES (?, ?)', [date, challenge.id]);
      await addXp(challenge.reward);
      rewarded.add(challenge.id);
      completed.push({ id: challenge.id, target: target, reward: challenge.reward });
    }

    challenges.push({
      id: challenge.id,
      target: target,
      current: current,
      reward: challenge.reward,
      done: rewarded.has(challenge.id)
    });
  }

  return { challenges, completed };
}

// ---------- API ----------

app.get('/api/stats', async (req, res) => {
  const today = resolveDate(req.query.today);
  res.json({ xp: await getXp(), streak: await totalStreak(today) });
});

app.get('/api/challenges', async (req, res) => {
  const { challenges } = await evaluateChallenges(resolveDate(req.query.today));
  res.json(challenges);
});

app.get('/api/tasks', async (req, res) => {
  res.json(await db.all('SELECT * FROM tasks'));
});

app.post('/api/tasks', async (req, res) => {
  const title = String(req.body.title || '').trim();

  if (!title) {
    return res.status(400).json({ error: 'Текст задачи не может быть пустым' });
  }

  const difficulty = Number(req.body.difficulty);
  const safeDifficulty = XP_BY_DIFFICULTY[difficulty] ? difficulty : 1;

  // Без даты (или с некорректной) задача бессрочная.
  const dueDate = DATE_RE.test(req.body.dueDate) ? req.body.dueDate : null;

  const result = await db.run(
    'INSERT INTO tasks (title, difficulty, due_date) VALUES (?, ?, ?)',
    [title, safeDifficulty, dueDate]
  );

  res.status(201).json({
    id: result.lastInsertRowid,
    title: title,
    done: 0,
    difficulty: safeDifficulty,
    due_date: dueDate
  });
});

app.patch('/api/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);
  const done = req.body.done ? 1 : 0;
  const today = resolveDate(req.body.date);

  const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);

  if (!task) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  // Опыт меняется только при реальной смене статуса: повторный PATCH ничего не даёт,
  // а снятая галочка забирает опыт обратно.
  let gained = 0;
  if (task.done !== done) {
    await db.run('UPDATE tasks SET done = ? WHERE id = ?', [done, id]);
    const xp = XP_BY_DIFFICULTY[task.difficulty] || XP_BY_DIFFICULTY[1];
    gained = done ? xp : -xp;
    await addXp(gained);

    // completions не чистится при удалении задачи, чтобы стрик не ломался,
    // когда выполненные задачи убирают из списка.
    if (done) {
      await db.run(
        'INSERT INTO completions (task_id, date, difficulty) VALUES (?, ?, ?)',
        [id, today, task.difficulty]
      );
    } else {
      await db.run('DELETE FROM completions WHERE task_id = ?', [id]);
    }
  }

  const { challenges, completed } = await evaluateChallenges(today);

  res.json({
    id: id,
    done: done,
    gained: gained,
    xp: await getXp(),
    streak: await totalStreak(today),
    challenges: challenges,
    completedChallenges: completed
  });
});

app.delete('/api/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);

  const result = await db.run('DELETE FROM tasks WHERE id = ?', [id]);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  res.status(204).end();
});

app.get('/api/habits', async (req, res) => {
  const today = resolveDate(req.query.today);
  const habits = await db.all('SELECT * FROM habits ORDER BY id');
  res.json(await Promise.all(habits.map((habit) => habitView(habit, today))));
});

app.post('/api/habits', async (req, res) => {
  const title = String(req.body.title || '').trim();

  if (!title) {
    return res.status(400).json({ error: 'Текст задачи не может быть пустым' });
  }

  const result = await db.run('INSERT INTO habits (title) VALUES (?)', [title]);
  const habit = { id: result.lastInsertRowid, title: title };

  res.status(201).json(await habitView(habit, resolveDate(req.body.date)));
});

app.post('/api/habits/:id/check', async (req, res) => {
  const id = Number(req.params.id);
  const today = resolveDate(req.body.date);
  const done = Boolean(req.body.done);

  const habit = await db.get('SELECT * FROM habits WHERE id = ?', [id]);

  if (!habit) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  const checked = await db.get(
    'SELECT 1 FROM habit_checks WHERE habit_id = ? AND date = ?',
    [id, today]
  );

  let gained = 0;
  if (done && !checked) {
    await db.run('INSERT INTO habit_checks (habit_id, date) VALUES (?, ?)', [id, today]);
    gained = HABIT_XP;
  } else if (!done && checked) {
    await db.run('DELETE FROM habit_checks WHERE habit_id = ? AND date = ?', [id, today]);
    gained = -HABIT_XP;
  }
  await addXp(gained);

  const { challenges, completed } = await evaluateChallenges(today);

  res.json({
    habit: await habitView(habit, today),
    gained: gained,
    xp: await getXp(),
    streak: await totalStreak(today),
    challenges: challenges,
    completedChallenges: completed
  });
});

app.delete('/api/habits/:id', async (req, res) => {
  const id = Number(req.params.id);

  const result = await db.run('DELETE FROM habits WHERE id = ?', [id]);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  await db.run('DELETE FROM habit_checks WHERE habit_id = ?', [id]);
  res.status(204).end();
});

db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Сервер запущен: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Не удалось подключиться к базе:', error);
    process.exit(1);
  });
