import { createPgPool, isPostgresConfigured } from './supabase.js';

async function testSupabase() {
  console.log('===============================================================');
  console.log('            UJI KONEKSI SUPABASE POSTGRESQL (SIMPRO)           ');
  console.log('===============================================================');

  if (!isPostgresConfigured()) {
    console.log('⚠️  DATABASE_URL belum diisi pada file .env.');
    console.log('ℹ️  Format yang didukung:');
    console.log(
      '   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true'
    );
    console.log('\nIkuti petunjuk di SUPABASE_VERCEL_GUIDE.md untuk membuat proyek Supabase gratis.');
    console.log('===============================================================');
    return;
  }

  console.log('Menguji koneksi ke cloud Supabase...');
  const pool = createPgPool();
  try {
    const res = await pool.query('SELECT NOW() as server_time, current_database() as db_name, version() as pg_version');
    console.log('✅ KONEKSI BERHASIL TERHUBUNG KE SUPABASE!');
    console.log('Waktu Server Supabase :', res.rows[0].server_time);
    console.log('Nama Database          :', res.rows[0].db_name);
    console.log('Versi PostgreSQL       :', res.rows[0].pg_version.split(',')[0]);

    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log(`\nTabel Terdaftar di Public Schema (${tablesRes.rows.length} tabel):`);
    if (tablesRes.rows.length === 0) {
      console.log('  (Belum ada tabel. Jalankan supabase/schema.sql di SQL Editor Supabase)');
    } else {
      tablesRes.rows.forEach((r) => console.log(`  ✓ ${r.table_name}`));
    }
    console.log('===============================================================');
  } catch (err) {
    console.error('❌ GAGAL TERHUBUNG KE SUPABASE:', err.message);
    console.error('Tips: Pastikan kata sandi (password) dan project ref benar.');
    console.log('===============================================================');
  } finally {
    await pool.end();
  }
}

testSupabase();
