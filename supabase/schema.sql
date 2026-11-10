-- ==============================================================================
-- SKEMA BASIS DATA POSTGRESQL UNTUK SUPABASE
-- SIMPRO (Sistem Informasi Manajemen Proyek) • CV. Arthamas Graha
-- ==============================================================================
-- Jalankan skrip ini langsung di Supabase Web Dashboard -> SQL Editor -> Klik "Run"
-- ==============================================================================

-- 1. Tabel Pengaturan Sistem & Profil Perusahaan
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL
);

-- 2. Spatie RBAC: Roles & Permissions
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS role_has_permissions (
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 3. Akun Pengguna / Staf (Password di-hash bcrypt)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  role_label VARCHAR(100) NOT NULL,
  avatar VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Klien / Mitra Perusahaan
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  company VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  contact_person VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(150),
  address TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Proyek Konstruksi (Pagu RAB, Realisasi, Capaian Fisik)
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  project_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  location VARCHAR(200) NOT NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  client_name VARCHAR(150) NOT NULL,
  contract_value NUMERIC(15, 2) NOT NULL,
  budget NUMERIC(15, 2) NOT NULL,
  spent NUMERIC(15, 2) NOT NULL DEFAULT 0,
  progress NUMERIC(5, 2) NOT NULL DEFAULT 0,
  target_progress NUMERIC(5, 2) NOT NULL DEFAULT 50,
  deviasi VARCHAR(20) DEFAULT '+0.0%',
  start_date VARCHAR(20) NOT NULL,
  end_date VARCHAR(20) NOT NULL,
  manager VARCHAR(150) NOT NULL,
  description TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'aktif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Survei Lokasi Lapangan (Pra-Konstruksi)
CREATE TABLE IF NOT EXISTS site_surveys (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  project_name VARCHAR(200) NOT NULL,
  user_name VARCHAR(150) NOT NULL,
  area_size NUMERIC(12, 2) NOT NULL,
  elevation VARCHAR(50),
  soil_type VARCHAR(100) NOT NULL,
  contour VARCHAR(100) NOT NULL,
  accessibility VARCHAR(100) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  reviewer_notes TEXT,
  date VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Katalog Material Gudang
CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(30) NOT NULL,
  minimum_stock INTEGER NOT NULL DEFAULT 100,
  price_per_unit NUMERIC(15, 2) NOT NULL,
  specification TEXT,
  supplier VARCHAR(150),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Pengajuan Material Proyek
CREATE TABLE IF NOT EXISTS material_requests (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  project_name VARCHAR(200) NOT NULL,
  material_id INTEGER REFERENCES materials(id) ON DELETE SET NULL,
  material_name VARCHAR(150) NOT NULL,
  material_unit VARCHAR(30) NOT NULL,
  price_per_unit NUMERIC(15, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  total_price NUMERIC(15, 2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  requested_by VARCHAR(150) NOT NULL,
  approved_by VARCHAR(150),
  notes TEXT,
  date VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Aset Alat Berat di Pool & Proyek
CREATE TABLE IF NOT EXISTS equipments (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Tersedia di Pool',
  current_project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  current_project_name VARCHAR(200),
  borrowed_at VARCHAR(20),
  condition VARCHAR(50) NOT NULL DEFAULT 'Prima / Operasional',
  daily_cost NUMERIC(15, 2) NOT NULL,
  operator VARCHAR(150),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. Buku Kas & Transaksi Pengeluaran
CREATE TABLE IF NOT EXISTS project_transactions (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  project_name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  date VARCHAR(20) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'expense',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. Dokumen & Arsip Legal Proyek
CREATE TABLE IF NOT EXISTS project_documents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  project_name VARCHAR(200) NOT NULL,
  size VARCHAR(30) NOT NULL,
  uploaded_by VARCHAR(150) NOT NULL,
  date VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. Laporan Mingguan Progres Fisik
CREATE TABLE IF NOT EXISTS progress_reports (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  project_name VARCHAR(200) NOT NULL,
  week_number INTEGER NOT NULL,
  progress NUMERIC(5, 2) NOT NULL,
  progress_gain NUMERIC(5, 2) NOT NULL DEFAULT 2.5,
  notes TEXT NOT NULL,
  issues TEXT,
  reporter VARCHAR(150) NOT NULL,
  date VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. Audit Trail Aktivitas Staf
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  "user" VARCHAR(150) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14. Notifikasi
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  pesan TEXT NOT NULL,
  tipe VARCHAR(30) NOT NULL DEFAULT 'info',
  waktu VARCHAR(50) NOT NULL DEFAULT 'Baru saja',
  dibaca SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INDEXING UNTUK KECEPATAN QUERY TINGGI
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_site_surveys_status ON site_surveys(status);
CREATE INDEX IF NOT EXISTS idx_material_requests_status ON material_requests(status);
CREATE INDEX IF NOT EXISTS idx_project_transactions_project_id ON project_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_project_id ON progress_reports(project_id);

-- ==============================================================================
-- INITIAL SEED: PENGATURAN SISTEM CV. ARTHAMAS GRAHA
-- ==============================================================================
INSERT INTO system_settings (key, value) VALUES
  ('company_name', 'CV. Arthamas Graha'),
  ('company_tagline', 'Sistem Informasi Manajemen Proyek Konstruksi & Pengawasan'),
  ('address', 'Jl. ZA. Pagar Alam No. 42, Rajabasa, Bandar Lampung'),
  ('phone', '(0721) 781290'),
  ('email', 'kontak@arthamasgraha.com'),
  ('google_drive_connected', 'true'),
  ('finance_sheet_id', '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ==============================================================================
-- INITIAL SEED: SPATIE RBAC ROLES (8 PERAN UTAMA)
-- ==============================================================================
INSERT INTO roles (id, name, label) VALUES
  (1, 'owner', 'Owner / Direktur Utama'),
  (2, 'admin', 'Administrator Sistem'),
  (3, 'administrasi', 'Administrasi & Legal'),
  (4, 'konsultan', 'Konsultan Pengawas'),
  (5, 'pengawas', 'Pengawas Lapangan'),
  (6, 'logistik', 'Logistik & Gudang'),
  (7, 'marketing', 'Marketing & Klien'),
  (8, 'keuangan', 'Keuangan & Akuntansi')
ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label;

-- ==============================================================================
-- INITIAL SEED: 42 DAFTAR PERMISSIONS
-- ==============================================================================
INSERT INTO permissions (name) VALUES
  ('dashboard.view'),
  ('clients.view'), ('clients.create'), ('clients.edit'), ('clients.delete'),
  ('projects.view'), ('projects.create'), ('projects.edit'), ('projects.delete'),
  ('progress.view'), ('progress.create'),
  ('materials.view'), ('materials.create'), ('materials.edit'), ('materials.delete'),
  ('material_requests.view'), ('material_requests.create'), ('material_requests.edit'), ('material_requests.delete'), ('material_requests.approve'),
  ('equipments.view'), ('equipments.create'), ('equipments.edit'), ('equipments.delete'),
  ('finance.view'), ('finance.create'), ('finance.edit'),
  ('documents.view'), ('documents.create'), ('documents.delete'),
  ('reports.view'), ('reports.export'),
  ('users.view'), ('users.create'), ('users.edit'), ('users.delete'),
  ('site-surveys.view'), ('site-surveys.create'), ('site-surveys.edit'), ('site-surveys.approve'),
  ('settings.view'), ('settings.edit')
ON CONFLICT (name) DO NOTHING;

-- ==============================================================================
-- INITIAL SEED: MAPPING ROLE-HAS-PERMISSIONS
-- ==============================================================================
-- Owner & Admin: Semua Hak Akses
INSERT INTO role_has_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name IN ('owner', 'admin')
ON CONFLICT DO NOTHING;

-- Administrasi & Legal
INSERT INTO role_has_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'administrasi' AND p.name IN (
  'dashboard.view', 'clients.view', 'clients.create', 'clients.edit',
  'projects.view', 'projects.create', 'projects.edit',
  'documents.view', 'documents.create', 'reports.view', 'reports.export'
)
ON CONFLICT DO NOTHING;

-- Keuangan & Akuntansi
INSERT INTO role_has_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'keuangan' AND p.name IN (
  'dashboard.view', 'projects.view', 'material_requests.view', 'material_requests.edit', 'material_requests.approve',
  'finance.view', 'finance.create', 'documents.view', 'reports.view', 'reports.export', 'finance.edit'
)
ON CONFLICT DO NOTHING;

-- Konsultan Pengawas
INSERT INTO role_has_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'konsultan' AND p.name IN (
  'dashboard.view', 'projects.view', 'progress.view', 'progress.create',
  'documents.view', 'documents.create', 'reports.view',
  'site-surveys.view', 'site-surveys.create', 'site-surveys.edit'
)
ON CONFLICT DO NOTHING;

-- Logistik & Gudang
INSERT INTO role_has_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'logistik' AND p.name IN (
  'dashboard.view', 'projects.view', 'materials.view', 'materials.create', 'materials.edit', 'materials.delete',
  'material_requests.view', 'material_requests.edit', 'equipments.view', 'equipments.create', 'equipments.edit',
  'equipments.delete', 'documents.view', 'reports.view'
)
ON CONFLICT DO NOTHING;

-- Marketing & Klien
INSERT INTO role_has_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'marketing' AND p.name IN (
  'dashboard.view', 'clients.view', 'clients.create', 'clients.edit',
  'projects.view', 'documents.view', 'documents.create', 'reports.view'
)
ON CONFLICT DO NOTHING;

-- Pengawas Lapangan
INSERT INTO role_has_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'pengawas' AND p.name IN (
  'dashboard.view', 'projects.view', 'progress.view', 'progress.create',
  'materials.view', 'material_requests.view', 'material_requests.create', 'material_requests.edit',
  'equipments.view', 'documents.view', 'documents.create', 'reports.view',
  'site-surveys.view', 'site-surveys.create', 'site-surveys.edit'
)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- INITIAL SEED: 8 AKUN PENGGUNA DEFAULT (Password: "password" - Bcrypt Hash)
-- ==============================================================================
INSERT INTO users (id, name, username, email, password, role, role_label, avatar, status) VALUES
  (1, 'Owner / Direktur Utama', 'owner', 'owner@arthamasgraha.com', '$2b$10$rOKXMuIp0t.jB/IMvlNm5ucgjNhKgQKyEp9HZPbX82jVgWVpM3Zp.', 'owner', 'Owner / Direktur Utama', 'OW', 'Aktif'),
  (2, 'Admin Sistem', 'admin', 'admin@arthamasgraha.com', '$2b$10$rOKXMuIp0t.jB/IMvlNm5ucgjNhKgQKyEp9HZPbX82jVgWVpM3Zp.', 'admin', 'Administrator Sistem', 'AD', 'Aktif'),
  (3, 'Staf Administrasi & Legal', 'administrasi', 'administrasi@arthamasgraha.com', '$2b$10$rOKXMuIp0t.jB/IMvlNm5ucgjNhKgQKyEp9HZPbX82jVgWVpM3Zp.', 'administrasi', 'Administrasi & Legal', 'AM', 'Aktif'),
  (4, 'Konsultan Teknik Lapangan', 'konsultan', 'konsultan@arthamasgraha.com', '$2b$10$rOKXMuIp0t.jB/IMvlNm5ucgjNhKgQKyEp9HZPbX82jVgWVpM3Zp.', 'konsultan', 'Konsultan Pengawas', 'KT', 'Aktif'),
  (5, 'Budi Prakoso (Pengawas)', 'pengawas', 'pengawas@arthamasgraha.com', '$2b$10$rOKXMuIp0t.jB/IMvlNm5ucgjNhKgQKyEp9HZPbX82jVgWVpM3Zp.', 'pengawas', 'Pengawas Lapangan', 'BP', 'Aktif'),
  (6, 'Staf Logistik & Gudang', 'logistik', 'logistik@arthamasgraha.com', '$2b$10$rOKXMuIp0t.jB/IMvlNm5ucgjNhKgQKyEp9HZPbX82jVgWVpM3Zp.', 'logistik', 'Logistik & Gudang', 'LG', 'Aktif'),
  (7, 'Marketing & Hubungan Klien', 'marketing', 'marketing@arthamasgraha.com', '$2b$10$rOKXMuIp0t.jB/IMvlNm5ucgjNhKgQKyEp9HZPbX82jVgWVpM3Zp.', 'marketing', 'Marketing & Klien', 'MK', 'Aktif'),
  (8, 'Finance Controller', 'keuangan', 'keuangan@arthamasgraha.com', '$2b$10$rOKXMuIp0t.jB/IMvlNm5ucgjNhKgQKyEp9HZPbX82jVgWVpM3Zp.', 'keuangan', 'Keuangan & Akuntansi', 'KU', 'Aktif')
ON CONFLICT (username) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  role_label = EXCLUDED.role_label,
  avatar = EXCLUDED.avatar;

-- Sinkronisasi Sequence ID Terakhir
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
