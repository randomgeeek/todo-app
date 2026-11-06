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

function getXp() {
  return db.prepare('SELECT xp FROM stats WHERE id = 1').get().xp;
}

app.get('/api/stats', (req, res) => {
  res.json({ xp: getXp() });
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
    db.prepare('UPDATE stats SET xp = MAX(0, xp + ?) WHERE id = 1').run(gained);
  }

  res.json({ id: id, done: done, gained: gained, xp: getXp() });
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);

  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});