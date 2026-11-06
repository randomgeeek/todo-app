const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const difficultySelect = document.getElementById('task-difficulty');
const deadlineSelect = document.getElementById('task-deadline');
const dueInput = document.getElementById('task-due');
const levelLabel = document.getElementById('level-label');
const levelNameEl = document.getElementById('level-name');
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
const challengeList = document.getElementById('challenge-list');
const challengesCount = document.getElementById('challenges-count');

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
    ideaButton: 'Придумать задачу',
    challengesTitle: 'Челленджи дня',
    challengeDone: 'Челлендж выполнен!',
    challenges: {
      tasks3: (n) => `Закрыть ${n} ${pluralRu(n, 'задачу', 'задачи', 'задач')}`,
      tasks5: (n) => `Закрыть ${n} ${pluralRu(n, 'задачу', 'задачи', 'задач')}`,
      hard1: () => 'Закрыть сложную задачу',
      medium2: (n) => `Закрыть ${n} ${pluralRu(n, 'задачу', 'задачи', 'задач')} средней или высокой сложности`,
      habits2: (n) => `Отметить ${n} ${pluralRu(n, 'ежедневную задачу', 'ежедневные задачи', 'ежедневных задач')}`,
      habitsAll: () => 'Отметить все ежедневные задачи',
      xp80: (n) => `Заработать ${n} XP за день`,
      xp150: (n) => `Заработать ${n} XP за день`
    },
    levelNames: [
      'Новичок', 'Ученик', 'Исполнитель', 'Деятель', 'Организатор',
      'Мастер дел', 'Стратег', 'Гуру продуктивности', 'Чемпион', 'Легенда'
    ],
    deadline: 'Срок',
    deadlineNone: 'Без срока',
    deadlineDate: 'К дате',
    dueLabel: 'Дедлайн',
    dueToday: 'Сегодня',
    dueTomorrow: 'Завтра',
    dueTitle: (date) => `Дедлайн: ${date}`,
    dueOverdueTitle: (date) => `Просрочено! Дедлайн был ${date}`,
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
    ideaButton: 'Suggest a task',
    challengesTitle: 'Daily challenges',
    challengeDone: 'Challenge complete!',
    challenges: {
      tasks3: (n) => `Complete ${n} tasks`,
      tasks5: (n) => `Complete ${n} tasks`,
      hard1: () => 'Complete a hard task',
      medium2: (n) => `Complete ${n} medium or hard tasks`,
      habits2: (n) => `Check off ${n} daily tasks`,
      habitsAll: () => 'Check off all daily tasks',
      xp80: (n) => `Earn ${n} XP today`,
      xp150: (n) => `Earn ${n} XP today`
    },
    levelNames: [
      'Newbie', 'Apprentice', 'Doer', 'Go-getter', 'Organizer',
      'Task Master', 'Strategist', 'Productivity Guru', 'Champion', 'Legend'
    ],
    deadline: 'Deadline',
    deadlineNone: 'No deadline',
    deadlineDate: 'By date',
    dueLabel: 'Due date',
    dueToday: 'Today',
    dueTomorrow: 'Tomorrow',
    dueTitle: (date) => `Due: ${date}`,
    dueOverdueTitle: (date) => `Overdue! It was due ${date}`,
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
let challenges = [];

const challengeIcons = { tasks3: '✅', tasks5: '✅', hard1: '💪', medium2: '⚡', habits2: '🔁', habitsAll: '🔁', xp80: '⭐', xp150: '⭐' };

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

// После последнего названия уровень остаётся «Легендой».
function levelName(level) {
  const names = t('levelNames');
  return names[Math.min(level, names.length) - 1];
}

// Сколько дней до дедлайна: 0 — сегодня, отрицательное — просрочено.
function daysUntil(date) {
  return Math.round((Date.parse(date) - Date.parse(today())) / 86400000);
}

function formatDate(date, options) {
  return new Intl.DateTimeFormat(lang, { ...options, timeZone: 'UTC' }).format(new Date(date));
}

function updateDueBadge(badge) {
  const due = badge.dataset.due;
  const done = badge.closest('.task').classList.contains('done');
  const days = daysUntil(due);
  const fullDate = formatDate(due, { day: 'numeric', month: 'long', year: 'numeric' });

  let text = `📅 ${formatDate(due, { day: 'numeric', month: 'short' })}`;
  if (days === 0) text = `⏰ ${t('dueToday')}`;
  if (days === 1) text = `📅 ${t('dueTomorrow')}`;

  const overdue = days < 0 && !done;
  badge.textContent = overdue ? `⚠️ ${formatDate(due, { day: 'numeric', month: 'short' })}` : text;
  badge.title = overdue ? t('dueOverdueTitle')(fullDate) : t('dueTitle')(fullDate);
  badge.classList.toggle('overdue', overdue);
  badge.classList.toggle('today', !done && days === 0);
  badge.classList.toggle('soon', !done && (days === 1 || days === 2));
}

function renderStats(xp) {
  currentXp = xp;
  const { level, current, need } = levelFromXp(xp);
  levelBadge.textContent = level;
  levelLabel.textContent = t('level')(level);
  levelNameEl.textContent = levelName(level);
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

function challengeText(challenge) {
  const text = t('challenges')[challenge.id];
  return text ? text(challenge.target) : challenge.id;
}

function renderChallenges() {
  challengeList.innerHTML = '';

  for (const challenge of challenges) {
    const li = document.createElement('li');
    li.className = 'challenge';
    li.classList.toggle('done', challenge.done);

    const icon = document.createElement('span');
    icon.className = 'challenge-icon';
    icon.textContent = challenge.done ? '🏆' : challengeIcons[challenge.id] || '🎯';

    const text = document.createElement('span');
    text.className = 'challenge-text';
    text.textContent = challengeText(challenge);

    const reward = document.createElement('span');
    reward.className = 'challenge-reward';
    reward.textContent = challenge.done
      ? `✓ +${challenge.reward} XP`
      : `${challenge.current}/${challenge.target} · +${challenge.reward} XP`;

    const bar = document.createElement('div');
    bar.className = 'challenge-bar';
    const fill = document.createElement('div');
    fill.className = 'challenge-fill';
    fill.style.width = (challenge.done ? 100 : (challenge.current / challenge.target) * 100) + '%';
    bar.append(fill);

    li.append(icon, text, reward, bar);
    challengeList.append(li);
  }

  const done = challenges.filter((challenge) => challenge.done).length;
  challengesCount.textContent = `${done}/${challenges.length}`;
  challengesCount.classList.toggle('complete', challenges.length > 0 && done === challenges.length);
}

async function loadChallenges() {
  const response = await fetch(`/api/challenges?today=${today()}`);
  challenges = await response.json();
  renderChallenges();
}

function showChallengeDone(challenge) {
  const toast = document.createElement('div');
  toast.className = 'challenge-toast';

  const icon = document.createElement('span');
  icon.className = 'challenge-toast-icon';
  icon.textContent = '🏆';

  const body = document.createElement('div');
  const title = document.createElement('div');
  title.className = 'challenge-toast-title';
  title.textContent = `${t('challengeDone')} +${challenge.reward} XP`;
  const text = document.createElement('div');
  text.className = 'challenge-toast-text';
  text.textContent = challengeText(challenge);
  body.append(title, text);

  toast.append(icon, body);
  toast.addEventListener('animationend', () => toast.remove());
  effectsRoot().append(toast);
  launchConfetti(innerWidth / 2, 40);
}

// Ответ сервера на отметку задачи или ежедневки: обновляем опыт, стрик и челленджи и празднуем.
function celebrate(checkbox, result, withPraise) {
  const leveledUp = renderStats(result.xp);
  renderStreak(result.streak);

  if (result.challenges) {
    challenges = result.challenges;
    renderChallenges();
  }
  // Если выполнено сразу несколько, показываем уведомления по очереди.
  (result.completedChallenges || []).forEach((challenge, i) => {
    setTimeout(() => showChallengeDone(challenge), 400 + i * 1200);
  });

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
  document.querySelectorAll('.task-due').forEach(updateDueBadge);
  streakChip.title = t('streakTitle')(currentStreak);
  if (tasksLoaded) updateSummary();
  renderHabits();
  renderChallenges();
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
  const name = document.createElement('span');
  name.className = 'level-up-name';
  name.textContent = levelName(level);
  banner.append(t('levelUp')(level), name);
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

  let dueBadge = null;
  if (task.due_date) {
    dueBadge = document.createElement('span');
    dueBadge.className = 'task-due';
    dueBadge.dataset.due = task.due_date;
  }

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
    if (dueBadge) updateDueBadge(dueBadge);
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

  li.append(checkbox, title);
  if (dueBadge) li.append(dueBadge);
  li.append(badge, deleteBtn);
  if (dueBadge) updateDueBadge(dueBadge); // нужен li: бейдж смотрит, выполнена ли задача
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
    loadChallenges(); // цель «отметить все ежедневки» зависит от их числа
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
  loadChallenges();

  habitInput.value = '';
  habitInput.focus();
});

setLanguage(lang);
loadTasks();
loadStats();
loadHabits();
loadChallenges();

async function addTask(title, difficulty, dueDate = null) {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title, difficulty: difficulty, dueDate: dueDate })
  });

  if (!response.ok) {
    alert(t('addError'));
    return null;
  }

  const li = renderTask(await response.json());
  li.classList.add('appear');
  updateSummary();
  return li;
}

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();
  if (title === '') {
    shakeInput(taskInput);
    return;
  }

  const withDeadline = deadlineSelect.value === 'date';
  if (withDeadline && !dueInput.value) {
    shakeInput(dueInput);
    try {
      dueInput.showPicker(); // открыть календарь, если браузер умеет
    } catch {}
    return;
  }

  const dueDate = withDeadline ? dueInput.value : null;
  if (!(await addTask(title, Number(difficultySelect.value), dueDate))) {
    shakeInput(taskInput);
    return;
  }

  taskInput.value = '';
  taskInput.focus();
});

deadlineSelect.addEventListener('change', () => {
  const withDeadline = deadlineSelect.value === 'date';
  dueInput.hidden = !withDeadline;

  if (withDeadline) {
    dueInput.min = today();
    if (!dueInput.value) {
      // По умолчанию — завтра.
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dueInput.valueAsDate = new Date(Date.UTC(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()));
    }
  }
});

// Простые задачи, которые под силу каждому. Сложность влияет на XP.
const taskIdeas = [
  { difficulty: 1, ru: 'Выпить стакан воды', en: 'Drink a glass of water' },
  { difficulty: 1, ru: 'Сделать 10 приседаний', en: 'Do 10 squats' },
  { difficulty: 1, ru: 'Проветрить комнату', en: 'Air out the room' },
  { difficulty: 1, ru: 'Написать другу «как дела?»', en: 'Text a friend “how are you?”' },
  { difficulty: 1, ru: 'Убрать со стола всё лишнее', en: 'Clear everything extra off your desk' },
  { difficulty: 1, ru: 'Потянуться 2 минуты', en: 'Stretch for 2 minutes' },
  { difficulty: 1, ru: 'Записать 3 вещи, за которые я благодарен', en: 'Write down 3 things you’re grateful for' },
  { difficulty: 1, ru: 'Полить цветы', en: 'Water the plants' },
  { difficulty: 1, ru: 'Выбросить 5 ненужных вещей', en: 'Throw away 5 things you don’t need' },
  { difficulty: 1, ru: 'Сделать 5 медленных глубоких вдохов', en: 'Take 5 slow, deep breaths' },
  { difficulty: 1, ru: 'Удалить 20 старых фото с телефона', en: 'Delete 20 old photos from your phone' },
  { difficulty: 1, ru: 'Заправить кровать', en: 'Make your bed' },
  { difficulty: 1, ru: 'Отписаться от 3 ненужных рассылок', en: 'Unsubscribe from 3 newsletters' },
  { difficulty: 1, ru: 'Послушать любимую песню и потанцевать', en: 'Play your favorite song and dance' },
  { difficulty: 1, ru: 'Сделать кому-нибудь комплимент', en: 'Give someone a compliment' },
  { difficulty: 1, ru: 'Выйти на улицу на 5 минут', en: 'Step outside for 5 minutes' },
  { difficulty: 2, ru: 'Прогуляться 20 минут', en: 'Take a 20-minute walk' },
  { difficulty: 2, ru: 'Прочитать 10 страниц книги', en: 'Read 10 pages of a book' },
  { difficulty: 2, ru: 'Приготовить что-то, чего раньше не готовил', en: 'Cook something you’ve never made before' },
  { difficulty: 2, ru: 'Разобрать один ящик', en: 'Tidy up one drawer' },
  { difficulty: 2, ru: 'Выучить 5 слов на иностранном языке', en: 'Learn 5 words in a foreign language' },
  { difficulty: 2, ru: 'Позвонить родным', en: 'Call your family' },
  { difficulty: 2, ru: 'Провести час без телефона', en: 'Spend an hour without your phone' },
  { difficulty: 2, ru: 'Сделать зарядку 15 минут', en: 'Do a 15-minute workout' },
  { difficulty: 2, ru: 'Нарисовать что-нибудь, как получится', en: 'Draw something, however it turns out' },
  { difficulty: 2, ru: 'Навести порядок на рабочем столе компьютера', en: 'Clean up your computer desktop' },
  { difficulty: 2, ru: 'Написать план на завтра', en: 'Write a plan for tomorrow' },
  { difficulty: 2, ru: 'Посмотреть короткую лекцию на новую тему', en: 'Watch a short lecture on a new topic' },
  { difficulty: 2, ru: 'Протереть пыль во всей комнате', en: 'Dust the whole room' },
  { difficulty: 3, ru: 'Пройти 10 000 шагов', en: 'Walk 10,000 steps' },
  { difficulty: 3, ru: 'Сделать генеральную уборку в одной комнате', en: 'Deep-clean one room' },
  { difficulty: 3, ru: 'Лечь спать до 23:00', en: 'Go to bed before 11 PM' },
  { difficulty: 3, ru: 'Прожить день без сладкого', en: 'Go a whole day without sweets' },
  { difficulty: 3, ru: 'Написать письмо себе через год', en: 'Write a letter to yourself a year from now' },
  { difficulty: 3, ru: 'Разобрать шкаф и отложить вещи на отдачу', en: 'Sort your closet and set aside clothes to donate' },
  { difficulty: 3, ru: 'Выучить короткое стихотворение наизусть', en: 'Learn a short poem by heart' },
  { difficulty: 3, ru: 'Пройти быстрым шагом или пробежать 3 км', en: 'Walk briskly or run 3 km' },
  { difficulty: 3, ru: 'Прочитать главу книги и пересказать её кому-нибудь', en: 'Read a chapter and retell it to someone' }
];

const ideaBtn = document.getElementById('idea-btn');

ideaBtn.addEventListener('click', async () => {
  // Не предлагаем то, что уже есть в списке.
  const existing = new Set(
    [...taskList.querySelectorAll('.task-title')].map((el) => el.textContent)
  );
  const fresh = taskIdeas.filter((idea) => !existing.has(idea.ru) && !existing.has(idea.en));
  const idea = pick(fresh.length > 0 ? fresh : taskIdeas);

  ideaBtn.disabled = true;
  ideaBtn.classList.remove('rolling');
  void ideaBtn.offsetWidth; // перезапуск анимации
  ideaBtn.classList.add('rolling');

  const li = await addTask(idea[lang], idea.difficulty);
  if (li) li.classList.add('idea');

  ideaBtn.disabled = false;
});
