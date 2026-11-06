const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('todo.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);

const columns = db.prepare('PRAGMA table_info(tasks)').all();
if (!columns.some((column) => column.name === 'difficulty')) {
  db.exec('ALTER TABLE tasks ADD COLUMN difficulty INTEGER NOT NULL DEFAULT 1');
}

db.exec(`
  CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    xp INTEGER NOT NULL DEFAULT 0
  );
  INSERT OR IGNORE INTO stats (id, xp) VALUES (1, 0);
`);

module.exports = db;