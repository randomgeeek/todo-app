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

app.get('/api/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks').all();
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const title = String(req.body.title || '').trim();

  if (!title) {
    return res.status(400).json({ error: 'Текст задачи не может быть пустым' });
  }

  const result = db.prepare('INSERT INTO tasks (title) VALUES (?)').run(title);

  res.status(201).json({ id: result.lastInsertRowid, title: title, done: 0 });
});

app.patch('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const done = req.body.done ? 1 : 0;

  const result = db.prepare('UPDATE tasks SET done = ? WHERE id = ?').run(done, id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  res.json({ id: id, done: done });
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