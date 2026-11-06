const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const difficultySelect = document.getElementById('task-difficulty');
const levelLabel = document.getElementById('level-label');
const xpLabel = document.getElementById('xp-label');
const xpFill = document.getElementById('xp-fill');

const xpByDifficulty = { 1: 10, 2: 25, 3: 50 };
let currentLevel = 1;

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
  const { level, current, need } = levelFromXp(xp);
  levelLabel.textContent = `Уровень ${level}`;
  xpLabel.textContent = `${current} / ${need} XP`;
  xpFill.style.width = (current / need) * 100 + '%';

  const leveledUp = level > currentLevel;
  currentLevel = level;
  return leveledUp;
}

async function loadStats() {
  const response = await fetch('/api/stats');
  const stats = await response.json();
  currentLevel = levelFromXp(stats.xp).level;
  renderStats(stats.xp);
}

function showXpGain(x, y, amount) {
  const pop = document.createElement('div');
  pop.className = 'xp-pop';
  pop.textContent = `+${amount} XP`;
  pop.style.left = x + 'px';
  pop.style.top = y + 'px';
  pop.addEventListener('animationend', () => pop.remove());
  document.body.append(pop);
}

function showLevelUp(level) {
  const banner = document.createElement('div');
  banner.className = 'level-up';
  banner.textContent = `Уровень ${level}!`;
  banner.addEventListener('animationend', () => banner.remove());
  document.body.append(banner);
  launchConfetti(innerWidth / 2, innerHeight / 2);
}

const confettiColors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];
const praiseWords = ['Nice!', 'Well Done!', 'Great job!', 'Отлично!', 'Так держать!'];

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
    document.body.append(piece);
  }
}

function showPraise() {
  const word = document.createElement('div');
  word.className = 'praise';
  word.textContent = praiseWords[Math.floor(Math.random() * praiseWords.length)];
  word.style.left = 20 + Math.random() * 60 + '%';
  word.style.top = 20 + Math.random() * 60 + '%';
  word.addEventListener('animationend', () => word.remove());
  document.body.append(word);
}

function shakeInput() {
  taskInput.classList.add('shake');
  taskInput.addEventListener('animationend', () => taskInput.classList.remove('shake'), { once: true });
}

function renderTask(task) {
  const li = document.createElement('li');
  li.className = 'task';
  if (task.done === 1) {
    li.classList.add('done');
  }

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
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

  checkbox.addEventListener('change', async () => {
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: checkbox.checked })
    });

    if (!response.ok) {
      alert('Не удалось обновить задачу');
      checkbox.checked = !checkbox.checked;
      return;
    }

    li.classList.toggle('done', checkbox.checked);

    const result = await response.json();
    const leveledUp = renderStats(result.xp);

    if (result.gained > 0) {
      const rect = checkbox.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      launchConfetti(x, y);
      showXpGain(x, y, result.gained);

      if (leveledUp) {
        showLevelUp(currentLevel);
      } else {
        showPraise();
      }
    }
  });

  deleteBtn.addEventListener('click', () => {
    li.classList.add('removing');
    li.addEventListener('animationend', async () => {
      const response = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });

      if (!response.ok && response.status !== 404) {
        alert('Не удалось удалить задачу');
        li.classList.remove('removing');
        return;
      }

      li.remove();
    }, { once: true });
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
}

loadTasks();
loadStats();

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();
  if (title === '') {
    shakeInput();
    return;
  }

  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title, difficulty: Number(difficultySelect.value) })
  });

  if (!response.ok) {
    shakeInput();
    alert('Не удалось добавить задачу');
    return;
  }

  const newTask = await response.json();
  renderTask(newTask).classList.add('appear');

  taskInput.value = '';
  taskInput.focus();
});
