const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const difficultySelect = document.getElementById('task-difficulty');
const levelLabel = document.getElementById('level-label');
const xpLabel = document.getElementById('xp-label');
const xpFill = document.getElementById('xp-fill');
const levelBadge = document.getElementById('level-badge');
const summaryEl = document.getElementById('summary');
const emptyState = document.getElementById('empty-state');
const streakChip = document.getElementById('streak-chip');
const streakCount = document.getElementById('streak-count');
const habitsOpenBtn = document.getElementById('habits-open');
const habitsProgress = document.getElementById('habits-progress');
const habitsDialog = document.getElementById('habits-dialog');
const habitsCloseBtn = document.getElementById('habits-close');
const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitList = document.getElementById('habit-list');
const habitsEmpty = document.getElementById('habits-empty');

function pluralRu(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

const translations = {
  ru: {
    pageTitle: 'Список задач',
    heading: 'Список задач',
    loading: 'Загрузка…',
    placeholder: 'Что нужно сделать?',
    difficulty: 'Сложность',
    easy: 'Легко · 10 XP',
    medium: 'Средне · 25 XP',
    hard: 'Сложно · 50 XP',
    add: 'Добавить',
    empty: 'Задач пока нет — добавьте первую ✨',
    level: (n) => `Уровень ${n}`,
    levelUp: (n) => `Уровень ${n}!`,
    summaryEmpty: 'Список пуст',
    summaryAll: (total) => `Все ${total} выполнены — красота! 🎉`,
    summary: (done, total) => `Выполнено ${done} из ${total}`,
    deleteTitle: 'Удалить',
    deleteLabel: 'Удалить задачу',
    addError: 'Не удалось добавить задачу',
    updateError: 'Не удалось обновить задачу',
    deleteError: 'Не удалось удалить задачу',
    praise: ['Отлично!', 'Так держать!', 'Супер!', 'Молодец!', 'Огонь!', 'Красота!', 'Вот это да!', 'Ещё одна!'],
    motivation: [
      'Ты справишься!', 'Шаг за шагом', 'Верь в себя', 'Маленький шаг — тоже шаг', 'Начни с малого',
      'Сегодня твой день', 'Всё получится!', 'Не сдавайся!', 'Просто начни', 'Ты молодец'
    ],
    streakTitle: (n) => `${n} ${pluralRu(n, 'день', 'дня', 'дней')} подряд с выполненными задачами`,
    habitsButton: 'Ежедневные задачи',
    habitsTitle: 'Ежедневные задачи',
    habitsHint: 'Отмечайте каждый день — у каждой задачи свой стрик. +15 XP за отметку.',
    habitPlaceholder: 'Например: зарядка',
    habitsEmpty: 'Пока пусто — добавьте первую ежедневную задачу',
    habitStreakTitle: (n, best) => `${n} ${pluralRu(n, 'день', 'дня', 'дней')} подряд · рекорд: ${best}`,
    habitDeleteConfirm: (title) => `Удалить «${title}»? Стрик этой задачи пропадёт.`,
    close: 'Закрыть'
  },
  en: {
    pageTitle: 'Task list',
    heading: 'Task list',
    loading: 'Loading…',
    placeholder: 'What needs to be done?',
    difficulty: 'Difficulty',
    easy: 'Easy · 10 XP',
    medium: 'Medium · 25 XP',
    hard: 'Hard · 50 XP',
    add: 'Add',
    empty: 'No tasks yet — add your first one ✨',
    level: (n) => `Level ${n}`,
    levelUp: (n) => `Level ${n}!`,
    summaryEmpty: 'The list is empty',
    summaryAll: (total) => `All ${total} done — awesome! 🎉`,
    summary: (done, total) => `Completed ${done} of ${total}`,
    deleteTitle: 'Delete',
    deleteLabel: 'Delete task',
    addError: "Couldn't add the task",
    updateError: "Couldn't update the task",
    deleteError: "Couldn't delete the task",
    praise: ['Nice!', 'Well Done!', 'Great job!', 'Keep it up!', 'Awesome!', 'Nailed it!', 'On fire!', 'Boom!'],
    motivation: [
      'You got this!', 'Step by step', 'Believe in yourself', 'Small steps count', 'Start small',
      'Today is your day', 'Keep going!', "Don't give up!", 'Just start', 'One thing at a time'
    ],
    streakTitle: (n) => `${n} ${n === 1 ? 'day' : 'days'} in a row with completed tasks`,
    habitsButton: 'Daily tasks',
    habitsTitle: 'Daily tasks',
    habitsHint: 'Check them off every day — each one has its own streak. +15 XP per check.',
    habitPlaceholder: 'For example: workout',
    habitsEmpty: 'Nothing here yet — add your first daily task',
    habitStreakTitle: (n, best) => `${n} ${n === 1 ? 'day' : 'days'} in a row · best: ${best}`,
    habitDeleteConfirm: (title) => `Delete “${title}”? Its streak will be lost.`,
    close: 'Close'
  }
};

// Дата по часам пользователя, а не сервера.
function today() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function detectLanguage() {
  try {
    const saved = localStorage.getItem('lang');
    if (translations[saved]) return saved;
  } catch {}
  return navigator.language.startsWith('ru') ? 'ru' : 'en';
}

let lang = detectLanguage();
const t = (key) => translations[lang][key];

const xpByDifficulty = { 1: 10, 2: 25, 3: 50 };
let currentLevel = 1;
let currentXp = 0;
let currentStreak = 0;
let habits = [];

// Чтобы перейти с уровня N на N + 1, нужно N * 100 опыта.
function levelFromXp(xp) {
  let level = 1;
  let need = 100;
  while (xp >= need) {
    xp -= need;
    level++;
    need = level * 100;
  }
  return { level, current: xp, need };
}

function renderStats(xp) {
  currentXp = xp;
  const { level, current, need } = levelFromXp(xp);
  levelBadge.textContent = level;
  levelLabel.textContent = t('level')(level);
  xpLabel.textContent = `${current} / ${need} XP`;
  xpFill.style.width = (current / need) * 100 + '%';

  const leveledUp = level > currentLevel;
  currentLevel = level;
  return leveledUp;
}

function renderStreak(streak) {
  const grew = streak > currentStreak;
  currentStreak = streak;
  streakCount.textContent = streak;
  streakChip.title = t('streakTitle')(streak);
  streakChip.classList.toggle('cold', streak === 0);

  if (grew) {
    streakChip.classList.remove('bump');
    void streakChip.offsetWidth; // перезапуск анимации
    streakChip.classList.add('bump');
  }
}

async function loadStats() {
  const response = await fetch(`/api/stats?today=${today()}`);
  const stats = await response.json();
  currentLevel = levelFromXp(stats.xp).level;
  currentStreak = stats.streak;
  renderStats(stats.xp);
  renderStreak(stats.streak);
}

// Ответ сервера на отметку задачи или ежедневки: обновляем опыт и стрик и празднуем.
function celebrate(checkbox, result, withPraise) {
  const leveledUp = renderStats(result.xp);
  renderStreak(result.streak);

  if (result.gained <= 0) return;

  const rect = checkbox.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  launchConfetti(x, y);
  showXpGain(x, y, result.gained);

  if (leveledUp) {
    showLevelUp(currentLevel);
  } else if (withPraise) {
    showPraise();
  }
}

// Открытое модальное окно лежит поверх всей страницы,
// поэтому эффекты добавляем внутрь него, иначе их не будет видно.
function effectsRoot() {
  return habitsDialog.open ? habitsDialog : document.body;
}

function updateSummary() {
  const total = taskList.querySelectorAll('.task:not(.removing)').length;
  const done = taskList.querySelectorAll('.task.done:not(.removing)').length;

  emptyState.hidden = total > 0;
  if (total === 0) {
    summaryEl.textContent = t('summaryEmpty');
  } else if (done === total) {
    summaryEl.textContent = t('summaryAll')(total);
  } else {
    summaryEl.textContent = t('summary')(done, total);
  }
}

let tasksLoaded = false;

function setLanguage(newLang) {
  lang = newLang;
  try {
    localStorage.setItem('lang', lang);
  } catch {}

  document.documentElement.lang = lang;
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.title = t('deleteTitle');
    btn.setAttribute('aria-label', t('deleteLabel'));
  });
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active);
  });

  renderStats(currentXp);
  streakChip.title = t('streakTitle')(currentStreak);
  if (tasksLoaded) updateSummary();
  renderHabits();
}

document.querySelectorAll('.lang-btn').forEach((btn) => {
  btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

function showXpGain(x, y, amount) {
  const pop = document.createElement('div');
  pop.className = 'xp-pop';
  pop.textContent = `+${amount} XP`;
  pop.style.left = x + 'px';
  pop.style.top = y + 'px';
  pop.addEventListener('animationend', () => pop.remove());
  effectsRoot().append(pop);
}

function showLevelUp(level) {
  const banner = document.createElement('div');
  banner.className = 'level-up';
  banner.textContent = t('levelUp')(level);
  banner.addEventListener('animationend', () => banner.remove());
  effectsRoot().append(banner);
  launchConfetti(innerWidth / 2, innerHeight / 2);
}

const confettiColors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];

function launchConfetti(x, y) {
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left = x + 'px';
    piece.style.top = y + 'px';
    piece.style.setProperty('--dx', (Math.random() - 0.5) * 300 + 'px');
    piece.style.setProperty('--rise', -(50 + Math.random() * 150) + 'px');
    piece.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    piece.style.animationDuration = 1.5 + Math.random() * 1.5 + 's';
    piece.style.animationDelay = Math.random() * 0.2 + 's';
    piece.addEventListener('animationend', () => piece.remove());
    effectsRoot().append(piece);
  }
}

// width — примерная ширина одной буквы в долях размера шрифта, чтобы фраза не вылезала за экран.
const praiseFonts = [
  { family: "'Pacifico', cursive", weight: 'normal', width: 0.62 },
  { family: "'Caveat', cursive", weight: 700, width: 0.45 },
  { family: "'Lobster', cursive", weight: 'normal', width: 0.5 },
  { family: "'Comfortaa', sans-serif", weight: 700, width: 0.62 },
  { family: "'Russo One', sans-serif", weight: 'normal', width: 0.66 },
  { family: "'Press Start 2P', monospace", weight: 'normal', width: 1 },
  { family: "'Marck Script', cursive", weight: 'normal', width: 0.45 },
  { family: "'Manrope', sans-serif", weight: 800, width: 0.62 }
];
const praiseColors = ['#ffffff', '#fde047', '#f9a8d4', '#6ee7b7', '#7dd3fc', '#fdba74', '#e9d5ff'];
const praiseGradients = [
  'linear-gradient(90deg, #fde047, #f472b6)',
  'linear-gradient(90deg, #6ee7b7, #60a5fa)',
  'linear-gradient(90deg, #fdba74, #f87171)',
  'linear-gradient(90deg, #ffffff, #c4b5fd)',
  'linear-gradient(90deg, #f9a8d4, #a78bfa, #7dd3fc)'
];
const praiseAnimations = ['praiseFade', 'praiseZoom', 'praiseSpin', 'praiseDrift', 'praiseBounce'];

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const random = (min, max) => min + Math.random() * (max - min);

// Без координат фраза появляется в случайном месте экрана.
function showPraise({ words = t('praise'), x, y } = {}) {
  const text = pick(words);
  const font = pick(praiseFonts);

  const word = document.createElement('div');
  word.className = 'praise';
  word.textContent = text;
  word.style.fontFamily = font.family;
  word.style.fontWeight = font.weight;

  const maxSize = (innerWidth * 0.9) / (text.length * font.width);
  const size = Math.min(random(32, 80), maxSize);
  word.style.fontSize = size + 'px';

  const halfWidth = (text.length * font.width * size) / 2;
  const margin = 12;
  const minX = halfWidth + margin;
  const maxX = Math.max(minX, innerWidth - halfWidth - margin);
  const minY = size + margin;
  const maxY = Math.max(minY, innerHeight - size - margin);
  const left = x === undefined ? random(minX, maxX) : Math.min(Math.max(x, minX), maxX);
  const top = y === undefined ? random(minY, maxY) : Math.min(Math.max(y, minY), maxY);
  word.style.left = left + 'px';
  word.style.top = top + 'px';

  word.style.setProperty('--rot', random(-12, 12) + 'deg');
  word.style.animationName = pick(praiseAnimations);
  word.style.animationDuration = random(2, 3) + 's';

  if (Math.random() < 0.35) {
    word.classList.add('gradient');
    word.style.backgroundImage = pick(praiseGradients);
  } else {
    word.style.color = pick(praiseColors);
  }

  word.addEventListener('animationend', () => word.remove());
  document.body.append(word);
}

// Клик по пустому фону (не по карточке, кнопкам или окну) — мотивационная фраза.
document.addEventListener('click', (event) => {
  if (event.target !== document.body && event.target !== document.documentElement) return;

  // Не даём заспамить экран: не больше 8 фраз одновременно.
  const shown = document.querySelectorAll('.praise');
  if (shown.length >= 8) shown[0].remove();

  showPraise({ words: t('motivation'), x: event.clientX, y: event.clientY });
});

function shakeInput(input) {
  input.classList.add('shake');
  input.addEventListener('animationend', () => input.classList.remove('shake'), { once: true });
}

function renderTask(task) {
  const li = document.createElement('li');
  li.className = 'task';
  if (task.done === 1) {
    li.classList.add('done');
  }

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'check';
  checkbox.checked = task.done === 1;

  const title = document.createElement('span');
  title.className = 'task-title';
  title.textContent = task.title;

  const difficulty = xpByDifficulty[task.difficulty] ? task.difficulty : 1;
  const badge = document.createElement('span');
  badge.className = `task-xp difficulty-${difficulty}`;
  badge.textContent = `${xpByDifficulty[difficulty]} XP`;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '✕';
  deleteBtn.title = t('deleteTitle');
  deleteBtn.setAttribute('aria-label', t('deleteLabel'));

  checkbox.addEventListener('change', async () => {
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: checkbox.checked, date: today() })
    });

    if (!response.ok) {
      alert(t('updateError'));
      checkbox.checked = !checkbox.checked;
      return;
    }

    li.classList.toggle('done', checkbox.checked);
    updateSummary();
    celebrate(checkbox, await response.json(), true);
  });

  deleteBtn.addEventListener('click', () => {
    li.classList.add('removing');
    li.addEventListener('animationend', async () => {
      const response = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });

      if (!response.ok && response.status !== 404) {
        alert(t('deleteError'));
        li.classList.remove('removing');
        updateSummary();
        return;
      }

      li.remove();
    }, { once: true });
    updateSummary();
  });

  li.append(checkbox, title, badge, deleteBtn);
  taskList.append(li);
  return li;
}

async function loadTasks() {
  const response = await fetch('/api/tasks');
  const tasks = await response.json();

  taskList.innerHTML = '';
  tasks.forEach((task) => renderTask(task));
  tasksLoaded = true;
  updateSummary();
}

function renderHabits() {
  habitList.innerHTML = '';
  habits.forEach(renderHabit);
  habitsEmpty.hidden = habits.length > 0;

  const done = habits.filter((habit) => habit.doneToday).length;
  habitsProgress.textContent = `${done}/${habits.length}`;
  habitsProgress.classList.toggle('complete', habits.length > 0 && done === habits.length);
}

function renderHabit(habit) {
  const li = document.createElement('li');
  li.className = 'habit';
  li.classList.toggle('done', habit.doneToday);

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'check';
  checkbox.checked = habit.doneToday;

  const title = document.createElement('span');
  title.className = 'habit-title';
  title.textContent = habit.title;

  const streak = document.createElement('span');
  streak.className = 'habit-streak';
  streak.classList.toggle('cold', habit.streak === 0);
  streak.textContent = `🔥 ${habit.streak}`;
  streak.title = t('habitStreakTitle')(habit.streak, habit.best);

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '✕';
  deleteBtn.title = t('deleteTitle');
  deleteBtn.setAttribute('aria-label', t('deleteLabel'));

  checkbox.addEventListener('change', async () => {
    const response = await fetch(`/api/habits/${habit.id}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: checkbox.checked, date: today() })
    });

    if (!response.ok) {
      alert(t('updateError'));
      checkbox.checked = !checkbox.checked;
      return;
    }

    const result = await response.json();
    Object.assign(habit, result.habit);
    celebrate(checkbox, result, false);
    renderHabits();
  });

  deleteBtn.addEventListener('click', async () => {
    if (!confirm(t('habitDeleteConfirm')(habit.title))) return;

    const response = await fetch(`/api/habits/${habit.id}`, { method: 'DELETE' });

    if (!response.ok && response.status !== 404) {
      alert(t('deleteError'));
      return;
    }

    habits = habits.filter((item) => item.id !== habit.id);
    renderHabits();
  });

  li.append(checkbox, title, streak, deleteBtn);
  habitList.append(li);
}

async function loadHabits() {
  const response = await fetch(`/api/habits?today=${today()}`);
  habits = await response.json();
  renderHabits();
}

habitsOpenBtn.addEventListener('click', () => {
  habitsDialog.showModal();
  loadHabits(); // на случай, если страница открыта со вчерашнего дня
});

habitsCloseBtn.addEventListener('click', () => habitsDialog.close());

// Клик по затемнённому фону вокруг окна закрывает его.
habitsDialog.addEventListener('click', (event) => {
  if (event.target === habitsDialog) habitsDialog.close();
});

habitForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = habitInput.value.trim();
  if (title === '') {
    shakeInput(habitInput);
    return;
  }

  const response = await fetch('/api/habits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title, date: today() })
  });

  if (!response.ok) {
    shakeInput(habitInput);
    alert(t('addError'));
    return;
  }

  habits.push(await response.json());
  renderHabits();

  habitInput.value = '';
  habitInput.focus();
});

setLanguage(lang);
loadTasks();
loadStats();
loadHabits();

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();
  if (title === '') {
    shakeInput(taskInput);
    return;
  }

  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title, difficulty: Number(difficultySelect.value) })
  });

  if (!response.ok) {
    shakeInput(taskInput);
    alert(t('addError'));
    return;
  }

  const newTask = await response.json();
  renderTask(newTask).classList.add('appear');
  updateSummary();

  taskInput.value = '';
  taskInput.focus();
});
