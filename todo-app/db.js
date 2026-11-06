const { createClient } = require('@libsql/client');

// На Render база живёт в Turso (переменные TURSO_DATABASE_URL и TURSO_AUTH_TOKEN),
// локально — в файле todo.db, как раньше.
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:todo.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Строки результата превращаем в обычные объекты { колонка: значение }.
async function all(sql, args = []) {
  const result = await client.execute({ sql, args });
  return result.rows.map((row) =>
    Object.fromEntries(result.columns.map((column, i) => [column, row[i]]))
  );
}

async function get(sql, args = []) {
  const rows = await all(sql, args);
  return rows[0];
}

async function run(sql, args = []) {
  const result = await client.execute({ sql, args });
  return {
    changes: result.rowsAffected,
    lastInsertRowid: result.lastInsertRowid === undefined ? undefined : Number(result.lastInsertRowid)
  };
}

async function addColumnIfMissing(table, column, definition) {
  const columns = await all(`PRAGMA table_info(${table})`);
  if (!columns.some((item) => item.name === column)) {
    await client.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

async function init() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      xp INTEGER NOT NULL DEFAULT 0
    );
    INSERT OR IGNORE INTO stats (id, xp) VALUES (1, 0);

    CREATE TABLE IF NOT EXISTS completions (
      task_id INTEGER NOT NULL,
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habit_checks (
      habit_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      PRIMARY KEY (habit_id, date)
    );

    CREATE TABLE IF NOT EXISTS challenge_rewards (
      date TEXT NOT NULL,
      challenge TEXT NOT NULL,
      PRIMARY KEY (date, challenge)
    );
  `);

  await addColumnIfMissing('tasks', 'difficulty', 'INTEGER NOT NULL DEFAULT 1');
  await addColumnIfMissing('tasks', 'due_date', 'TEXT');
  // Сложность запоминается в момент выполнения: задачу потом могут удалить,
  // а челленджам дня она всё ещё нужна.
  await addColumnIfMissing('completions', 'difficulty', 'INTEGER NOT NULL DEFAULT 1');
}

module.exports = { all, get, run, init };
