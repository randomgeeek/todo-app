const express = require('express');
const db = require('./db');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Привет от сервера!' });
});

const XP_BY_DIFFICULTY = { 1: 10, 2: 25, 3: 50 };
const HABIT_XP = 15;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function getXp() {
  return db.prepare('SELECT xp FROM stats WHERE id = 1').get().xp;
}

function addXp(delta) {
  db.prepare('UPDATE stats SET xp = MAX(0, xp + ?) WHERE id = 1').run(delta);
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

function totalStreak(today) {
  const rows = db.prepare('SELECT date FROM completions UNION SELECT date FROM habit_checks').all();
  return currentStreak(rows.map((row) => row.date), today);
}

function habitView(habit, today) {
  const dates = db
    .prepare('SELECT date FROM habit_checks WHERE habit_id = ?')
    .all(habit.id)
    .map((row) => row.date);

  return {
    id: habit.id,
    title: habit.title,
    doneToday: dates.includes(today),
    streak: currentStreak(dates, today),
    best: bestStreak(dates)
  };
}

app.get('/api/stats', (req, res) => {
  const today = resolveDate(req.query.today);
  res.json({ xp: getXp(), streak: totalStreak(today) });
});

app.get('/api/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks').all();
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const title = String(req.body.title || '').trim();

  if (!title) {
    return res.status(400).json({ error: 'Текст задачи не может быть пустым' });
  }

  const difficulty = Number(req.body.difficulty);
  const safeDifficulty = XP_BY_DIFFICULTY[difficulty] ? difficulty : 1;

  const result = db
    .prepare('INSERT INTO tasks (title, difficulty) VALUES (?, ?)')
    .run(title, safeDifficulty);

  res.status(201).json({ id: result.lastInsertRowid, title: title, done: 0, difficulty: safeDifficulty });
});

app.patch('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const done = req.body.done ? 1 : 0;
  const today = resolveDate(req.body.date);

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

  if (!task) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  // Опыт меняется только при реальной смене статуса: повторный PATCH ничего не даёт,
  // а снятая галочка забирает опыт обратно.
  let gained = 0;
  if (task.done !== done) {
    db.prepare('UPDATE tasks SET done = ? WHERE id = ?').run(done, id);
    const xp = XP_BY_DIFFICULTY[task.difficulty] || XP_BY_DIFFICULTY[1];
    gained = done ? xp : -xp;
    addXp(gained);

    // completions не чистится при удалении задачи, чтобы стрик не ломался,
    // когда выполненные задачи убирают из списка.
    if (done) {
      db.prepare('INSERT INTO completions (task_id, date) VALUES (?, ?)').run(id, today);
    } else {
      db.prepare('DELETE FROM completions WHERE task_id = ?').run(id);
    }
  }

  res.json({ id: id, done: done, gained: gained, xp: getXp(), streak: totalStreak(today) });
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);

  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  res.status(204).end();
});

app.get('/api/habits', (req, res) => {
  const today = resolveDate(req.query.today);
  const habits = db.prepare('SELECT * FROM habits ORDER BY id').all();
  res.json(habits.map((habit) => habitView(habit, today)));
});

app.post('/api/habits', (req, res) => {
  const title = String(req.body.title || '').trim();

  if (!title) {
    return res.status(400).json({ error: 'Текст задачи не может быть пустым' });
  }

  const result = db.prepare('INSERT INTO habits (title) VALUES (?)').run(title);
  const habit = { id: result.lastInsertRowid, title: title };

  res.status(201).json(habitView(habit, resolveDate(req.body.date)));
});

app.post('/api/habits/:id/check', (req, res) => {
  const id = Number(req.params.id);
  const today = resolveDate(req.body.date);
  const done = Boolean(req.body.done);

  const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(id);

  if (!habit) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  const checked = db
    .prepare('SELECT 1 FROM habit_checks WHERE habit_id = ? AND date = ?')
    .get(id, today);

  let gained = 0;
  if (done && !checked) {
    db.prepare('INSERT INTO habit_checks (habit_id, date) VALUES (?, ?)').run(id, today);
    gained = HABIT_XP;
  } else if (!done && checked) {
    db.prepare('DELETE FROM habit_checks WHERE habit_id = ? AND date = ?').run(id, today);
    gained = -HABIT_XP;
  }
  addXp(gained);

  res.json({ habit: habitView(habit, today), gained: gained, xp: getXp(), streak: totalStreak(today) });
});

app.delete('/api/habits/:id', (req, res) => {
  const id = Number(req.params.id);

  const result = db.prepare('DELETE FROM habits WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  db.prepare('DELETE FROM habit_checks WHERE habit_id = ?').run(id);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});