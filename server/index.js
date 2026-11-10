import { config } from './config.js';
import { migratePlaintextPasswords, openDatabase } from './db.js';
import { createApp } from './app.js';

const db = openDatabase(config.dbPath);

const migrated = migratePlaintextPasswords(db);
if (migrated > 0) {
  console.log(`[SIMPRO] ${migrated} kata sandi plaintext lama berhasil di-hash (bcrypt).`);
}

const app = createApp(db);

app.listen(config.port, () => {
  console.log(`[SIMPRO CV. Arthamas Graha API] Berjalan di port ${config.port} terhubung ke SQLite: ${config.dbPath}`);
});
