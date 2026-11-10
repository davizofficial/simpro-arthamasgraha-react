import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const OPERATIONAL_TABLES = [
  'progress_reports',
  'project_documents',
  'project_transactions',
  'material_requests',
  'site_surveys',
  'equipments',
  'projects',
  'clients',
  'materials',
  'activity_logs',
  'notifications',
];

export const PRESERVED_TABLES = ['system_settings', 'roles', 'permissions', 'role_has_permissions', 'users'];

export function cleanDatabase(db) {
  const getCounts = () => {
    const counts = {};
    for (const tbl of [...OPERATIONAL_TABLES, ...PRESERVED_TABLES]) {
      try {
        const row = db.prepare(`SELECT COUNT(*) as c FROM ${tbl}`).get();
        counts[tbl] = row ? row.c : 0;
      } catch {
        counts[tbl] = 0;
      }
    }
    return counts;
  };

  const before = getCounts();

  db.transaction(() => {
    db.pragma('foreign_keys = OFF');

    for (const table of OPERATIONAL_TABLES) {
      db.prepare(`DELETE FROM ${table}`).run();
    }

    const placeholders = OPERATIONAL_TABLES.map(() => '?').join(',');
    db.prepare(`DELETE FROM sqlite_sequence WHERE name IN (${placeholders})`).run(...OPERATIONAL_TABLES);

    db.pragma('foreign_keys = ON');
  })();

  const after = getCounts();
  return { before, after };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const dbPath = path.resolve(__dirname, 'simpro.sqlite');
  console.log(`[CLEAN-DB] Membuka database: ${dbPath}`);

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  const { before, after } = cleanDatabase(db);

  console.log('\n===============================================================');
  console.log('       HASIL PEMBERSIHAN DATA OPERASIONAL SIMPRO (SQLITE)      ');
  console.log('===============================================================');
  console.log('Tabel Operasional (Dibersihkan Menjadi 0):');
  for (const tbl of OPERATIONAL_TABLES) {
    console.log(
      `  - ${tbl.padEnd(25)} : ${String(before[tbl]).padStart(3)} baris -> ${String(after[tbl]).padStart(3)} baris [BERSIH]`
    );
  }

  console.log('\nTabel Master & Keamanan (Tetap Dipertahankan untuk Login):');
  for (const tbl of PRESERVED_TABLES) {
    console.log(`  - ${tbl.padEnd(25)} : ${String(before[tbl]).padStart(3)} baris (Aman)`);
  }
  console.log('===============================================================\n');

  db.close();
}
