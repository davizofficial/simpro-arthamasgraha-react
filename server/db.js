import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from './config.js';

export function openDatabase(dbPath) {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export function migratePlaintextPasswords(db) {
  const rows = db.prepare("SELECT id, password FROM users WHERE password NOT LIKE '$2%'").all();
  const update = db.prepare('UPDATE users SET password = ? WHERE id = ?');
  const run = db.transaction((items) => {
    for (const row of items) update.run(bcrypt.hashSync(row.password, BCRYPT_ROUNDS), row.id);
  });
  run(rows);
  return rows.length;
}
