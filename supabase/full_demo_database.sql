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
-- ==============================================================================
-- OPSIONAL: SEED DATA DEMO LENGKAP UNTUK SUPABASE POSTGRESQL
-- SIMPRO (Sistem Informasi Manajemen Proyek) • CV. Arthamas Graha
-- ==============================================================================
-- Jalankan skrip ini di Supabase Web Dashboard -> SQL Editor -> Klik "Run"
-- setelah menjalankan supabase/schema.sql.
-- ==============================================================================

-- 1. Klien / Mitra Perusahaan Demo
INSERT INTO clients (id, name, company, category, contact_person, phone, email, address, status) VALUES
  (1, 'PT Maju Jaya', 'PT Maju Jaya Perkasa', 'Swasta', 'Ir. Bambang Soedibyo', '021-12345678', 'info@majujaya.com', 'Gedung Cyber 2 Lantai 18, Jakarta Selatan', 'Aktif'),
  (2, 'Dinas Bina Marga Provinsi', 'Dinas Bina Marga & Bina Konstruksi', 'Pemerintah', 'Drs. Hendro Wibowo, M.Si', '0251-8321098', 'kontak@binamarga.go.id', 'Jl. Pemuda No. 45, Bogor', 'Aktif'),
  (3, 'Balai Besar Wilayah Sungai (BBWS)', 'Kementerian PUPR Ditjen SDA', 'Pemerintah', 'Ir. Agus Prasetyo, MT', '021-7298311', 'bbws.ciliwung@pu.go.id', 'Jl. Inspeksi Saluran Kali Malang, Jakarta Timur', 'Aktif'),
  (4, 'PT Mitra Propertindo', 'PT Mitra Propertindo Abadi', 'Swasta', 'Clarissa Tanudjaja', '021-55667788', 'tender@mitrapropertindo.co.id', 'Ruko BSD Junction Blok A-12, Tangerang', 'Aktif')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  company = EXCLUDED.company,
  category = EXCLUDED.category,
  contact_person = EXCLUDED.contact_person,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  address = EXCLUDED.address,
  status = EXCLUDED.status;

-- 2. Portofolio Proyek Demo (P001 - P008)
INSERT INTO projects (id, project_code, name, location, client_id, client_name, contract_value, budget, spent, progress, target_progress, deviasi, start_date, end_date, manager, description, status) VALUES
  (1, 'P001', 'Pembangunan Gedung Kantor PT Maju Jaya', 'Jakarta Selatan', 1, 'PT Maju Jaya', 15000000000, 12000000000, 5240000000, 45, 42, '+3.0%', '2026-01-10', '2026-12-20', 'Andi Wijaya, ST', 'Pembangunan gedung kantor modern 5 lantai dengan konsep green building dan ruang kerja terbuka (open space).', 'aktif'),
  (2, 'P002', 'Renovasi Hotel Bintang Lima Nusantara', 'Bali', 4, 'PT Mitra Propertindo', 9500000000, 7500000000, 5100000000, 68, 65, '+3.0%', '2025-11-01', '2026-08-30', 'Ir. Budi Santoso', 'Renovasi fasad luar, 120 kamar suite, dan penataan ulang area kolam renang infinity tepi laut.', 'aktif'),
  (3, 'P003', 'Pembangunan Jembatan Sungai Ciliwung', 'Bogor', 3, 'Balai Besar Wilayah Sungai (BBWS)', 26000000000, 22000000000, 7040000000, 32, 35, '-3.0%', '2026-02-15', '2027-02-14', 'Andi Wijaya, ST', 'Konstruksi jembatan girder beton prategang bentang 60 meter menghubungkan dua kecamatan terisolir.', 'aktif'),
  (4, 'P004', 'Perumahan Green Valley Residence', 'Tangerang', 4, 'PT Mitra Propertindo', 35000000000, 30000000000, 16500000000, 55, 55, '0.0%', '2025-08-01', '2026-11-30', 'Hendrik Pratama, ST', 'Pembangunan 150 unit rumah tapak tipe 72/120 beserta infrastruktur jalan lingkungan dan drainase tertutup.', 'aktif'),
  (5, 'P005', 'Renovasi Gedung Sekolah SDN 01 Depok', 'Depok', 2, 'Dinas Bina Marga Provinsi', 2400000000, 2000000000, 1980000000, 100, 100, '0.0%', '2025-09-01', '2026-01-25', 'Ir. Budi Santoso', 'Rehabilitasi 12 ruang kelas belajar, laboratorium komputer, dan lapangan olahraga serbaguna.', 'selesai'),
  (6, 'P006', 'Pembangunan Gudang Logistik Cikupa', 'Tangerang', 1, 'PT Maju Jaya', 12000000000, 10000000000, 500000000, 5, 5, '0.0%', '2026-04-01', '2026-11-30', 'Andi Wijaya, ST', 'Konstruksi pergudangan baja bentang lebar seluas 4.500 m2 dengan lantai cor floor hardener heavy duty.', 'perencanaan'),
  (7, 'P007', 'Pembangunan Masjid Al-Ikhlas', 'Bekasi', 2, 'Dinas Bina Marga Provinsi', 4200000000, 3500000000, 2520000000, 72, 70, '+2.0%', '2025-10-15', '2026-06-30', 'Hendrik Pratama, ST', 'Pembangunan masjid 2 lantai dengan ornamen GRC bermotif islami dan kubah enamel diameter 12 meter.', 'aktif'),
  (8, 'P008', 'Infrastruktur Jalan Tol Serpong', 'Tangerang', 3, 'Balai Besar Wilayah Sungai (BBWS)', 52000000000, 45000000000, 9900000000, 22, 30, '-8.0%', '2025-12-01', '2027-06-30', 'Andi Wijaya, ST', 'Pekerjaan tanah galian dan timbunan, saluran samping beton precast, dan perkerasan kaku rigid pavement STA 12+000 s/d 18+500.', 'tertunda')
ON CONFLICT (project_code) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  contract_value = EXCLUDED.contract_value,
  budget = EXCLUDED.budget,
  spent = EXCLUDED.spent,
  progress = EXCLUDED.progress,
  target_progress = EXCLUDED.target_progress,
  deviasi = EXCLUDED.deviasi,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  manager = EXCLUDED.manager,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- 3. Katalog Material Konstruksi Gudang
INSERT INTO materials (id, code, name, stock, unit, minimum_stock, price_per_unit, specification, supplier) VALUES
  (1, 'MAT-001', 'Semen Gresik (50kg)', 1250, 'sak', 500, 65000, 'Portland Composite Cement (PCC) SNI 15-7064-2004', 'PT Semen Indonesia Distributor'),
  (2, 'MAT-002', 'Besi Beton Ulir D12 (12m)', 380, 'batang', 500, 145000, 'Besi Tulangan Sirip BJTS 420B SNI 2052:2017', 'PT Krakatau Steel Cilegon'),
  (3, 'MAT-003', 'Pasir Cor Super Bangka', 120, 'm3', 150, 310000, 'Pasir Alami Bebas Lumpur (Kadar Lumpur < 3%)', 'CV Tambang Pasir Berkah'),
  (4, 'MAT-004', 'Batu Belah Kali 15/20', 240, 'm3', 100, 260000, 'Batu Andesit Keras Bebas Pelapukan', 'Quarry Rumpin Bogor'),
  (5, 'MAT-005', 'Baja Profil H-Beam 200x200', 85, 'batang', 40, 3850000, 'Structural Steel SS400 SNI 03-1729-2002', 'PT Gunung Raja Paksi'),
  (6, 'MAT-006', 'Keramik Lantai Roman 60x60', 650, 'dus', 200, 195000, 'Granite Tile Polish Glazed Porcelain', 'PT Satya Djaya Raya'),
  (7, 'MAT-007', 'Semen Tiga Roda (40kg)', 900, 'sak', 300, 54000, 'Portland Cement Type I Standar ASTM C-150', 'PT Indocement Tunggal Prakarsa')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  stock = EXCLUDED.stock,
  unit = EXCLUDED.unit,
  minimum_stock = EXCLUDED.minimum_stock,
  price_per_unit = EXCLUDED.price_per_unit,
  specification = EXCLUDED.specification,
  supplier = EXCLUDED.supplier;

-- 4. Aset Alat Berat di Pool & Proyek
INSERT INTO equipments (id, code, name, status, current_project_id, current_project_name, borrowed_at, condition, daily_cost, operator) VALUES
  (1, 'EQ-EXC-01', 'Excavator Komatsu PC200-8', 'Di Lokasi Proyek', 3, 'Pembangunan Jembatan Sungai Ciliwung', '2026-10-15T08:00:00', 'Prima / Operasional', 2200000, 'Supardi'),
  (2, 'EQ-CRN-01', 'Mobile Crane Kato 50 Ton', 'Di Lokasi Proyek', 1, 'Pembangunan Gedung Kantor PT Maju Jaya', '2026-11-02T07:30:00', 'Prima / Operasional', 4500000, 'Mulyono'),
  (3, 'EQ-DMP-01', 'Dump Truck Hino 500 FM 260 TI', 'Tersedia di Pool', NULL, NULL, NULL, 'Prima / Operasional', 850000, 'Tersedia'),
  (4, 'EQ-GEN-01', 'Genset Silent Perkins 150 kVA', 'Di Lokasi Proyek', 2, 'Renovasi Hotel Bintang Lima Nusantara', '2026-09-20T09:00:00', 'Servis Ringan / Rutin', 750000, 'I Wayan Sudiarta'),
  (5, 'EQ-ROL-01', 'Vibro Roller Bomag BW211 D-40', 'Tersedia di Pool', NULL, NULL, NULL, 'Prima / Operasional', 1600000, 'Tersedia')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  current_project_id = EXCLUDED.current_project_id,
  current_project_name = EXCLUDED.current_project_name,
  borrowed_at = EXCLUDED.borrowed_at,
  condition = EXCLUDED.condition,
  daily_cost = EXCLUDED.daily_cost,
  operator = EXCLUDED.operator;

-- 5. Survei Lokasi Pra-Konstruksi
INSERT INTO site_surveys (id, project_id, project_name, user_name, area_size, elevation, soil_type, contour, accessibility, status, reviewer_notes, date) VALUES
  (1, 1, 'Pembangunan Gedung Kantor PT Maju Jaya', 'Budi Prakoso (Pengawas)', 2400, '+18.5 m dpl', 'Lempung Berpasir (Sondir > 200 kg/cm2)', 'Relatif Datar (Kemiringan 2%)', 'Sangat Baik (Jalan Aspal Lebar 12m, Truk Tronton Masuk)', 'approved', 'Survei disetujui, daya dukung tanah sesuai untuk pondasi bore pile kedalaman 18 meter.', '2026-01-05'),
  (2, 3, 'Pembangunan Jembatan Sungai Ciliwung', 'Konsultan Teknik Lapangan', 1800, '+12.0 m dpl', 'Batuan Sedimen & Aluvial Sungai', 'Curam (Bantaran Sungai 15%)', 'Cukup (Perlu Pembuatan Jalan Akses Sementara 200m)', 'approved', 'ACC dengan catatan perlu perkuatan lereng bronjong sebelum bore pile dimulai.', '2026-02-08'),
  (3, 6, 'Pembangunan Gudang Logistik Cikupa', 'Budi Prakoso (Pengawas)', 5000, '+24.0 m dpl', 'Tanah Lempung Ekspansif (Perlu Soil Improvement)', 'Datar Sempurna', 'Prima (Kawasan Industri Cikupa, Akses Tol 2 KM)', 'pending', NULL, '2026-03-20')
ON CONFLICT (id) DO NOTHING;

-- 6. Pengajuan Material Lapangan
INSERT INTO material_requests (id, project_id, project_name, material_id, material_name, material_unit, price_per_unit, quantity, total_price, status, requested_by, approved_by, notes, date) VALUES
  (1, 1, 'Pembangunan Gedung Kantor PT Maju Jaya', 1, 'Semen Gresik (50kg)', 'sak', 65000, 300, 19500000, 'approved', 'Budi Prakoso (Pengawas)', 'Owner / Direktur Utama', 'Untuk pengecoran lantai 3 zona B, mendesak sebelum musim hujan', '2026-11-08'),
  (2, 3, 'Pembangunan Jembatan Sungai Ciliwung', 2, 'Besi Beton Ulir D12 (12m)', 'batang', 145000, 100, 14500000, 'pending', 'Konsultan Teknik Lapangan', NULL, 'Perakitan tulangan abutment jembatan sisi timur', '2026-11-09'),
  (3, 1, 'Pembangunan Gedung Kantor PT Maju Jaya', 3, 'Pasir Cor Super Bangka', 'm3', 310000, 20, 6200000, 'delivered', 'Budi Prakoso (Pengawas)', 'Owner / Direktur Utama', 'Pasir cor ready mix site', '2026-11-05')
ON CONFLICT (id) DO NOTHING;

-- 7. Transaksi Pengeluaran Kas Proyek
INSERT INTO project_transactions (id, project_id, project_name, category, description, amount, date, type) VALUES
  (1, 1, 'Pembangunan Gedung Kantor PT Maju Jaya', 'material', 'Pembelian Semen Gresik 500 sak dan Besi Beton D12 tahap 2', 64500000, '2026-11-04', 'expense'),
  (2, 1, 'Pembangunan Gedung Kantor PT Maju Jaya', 'sewa_alat', 'Sewa Mobile Crane Kato 50T periode 10 hari', 45000000, '2026-11-02', 'expense'),
  (3, 3, 'Pembangunan Jembatan Sungai Ciliwung', 'upah', 'Upah mingguan tukang pembesian dan operator excavator (35 orang)', 48500000, '2026-11-06', 'expense'),
  (4, 2, 'Renovasi Hotel Bintang Lima Nusantara', 'material', 'Pengadaan Keramik Roman 60x60 sebanyak 400 dus', 78000000, '2026-10-28', 'expense'),
  (5, 1, 'Pembangunan Gedung Kantor PT Maju Jaya', 'operasional', 'Biaya BBM solar genset, perizinan dinas lingkungan, dan K3 helm rompi', 3400000, '2026-11-01', 'expense')
ON CONFLICT (id) DO NOTHING;

-- 8. Pengarsipan Dokumen Proyek
INSERT INTO project_documents (id, name, category, project_id, project_name, size, uploaded_by, date) VALUES
  (1, 'Surat_Perjanjian_Kontrak_PT_Maju_Jaya.pdf', 'kontrak', 1, 'Pembangunan Gedung Kantor PT Maju Jaya', '4.2 MB', 'Administrasi', '2026-01-12'),
  (2, 'Gambar_DED_Struktur_Gedung_5_Lantai.dwg', 'ded', 1, 'Pembangunan Gedung Kantor PT Maju Jaya', '18.6 MB', 'Konsultan', '2026-01-15'),
  (3, 'RAB_Final_Pembangunan_Gedung_Kantor.xlsx', 'rab', 1, 'Pembangunan Gedung Kantor PT Maju Jaya', '1.8 MB', 'Owner', '2026-01-08'),
  (4, 'Kontrak_Kerja_BBWS_Jembatan_Ciliwung.pdf', 'kontrak', 3, 'Pembangunan Jembatan Sungai Ciliwung', '6.5 MB', 'Administrasi', '2026-02-18'),
  (5, 'DED_Abutment_dan_Girder_Prategang_60M.pdf', 'ded', 3, 'Pembangunan Jembatan Sungai Ciliwung', '12.4 MB', 'Konsultan', '2026-02-20'),
  (6, 'BAPP_Kemajuan_Pekerjaan_SDN_01_Depok_100.pdf', 'laporan', 5, 'Renovasi Gedung Sekolah SDN 01 Depok', '2.1 MB', 'Administrasi', '2026-01-26')
ON CONFLICT (id) DO NOTHING;

-- 9. Laporan Mingguan Progres Fisik
INSERT INTO progress_reports (id, project_id, project_name, week_number, progress, progress_gain, notes, issues, reporter, date) VALUES
  (1, 1, 'Pembangunan Gedung Kantor PT Maju Jaya', 24, 45, 2.5, 'Pengecoran plat lantai 3 zona B selesai. Persiapan bekisting kolom lantai 4.', 'Sempat terkendala hujan lebat 2 hari, dialihkan ke perakitan besi tulangan di workshop.', 'Budi Prakoso (Pengawas)', '2026-11-02'),
  (2, 3, 'Pembangunan Jembatan Sungai Ciliwung', 16, 32, 1.8, 'Pengecoran bore pile titik P1-P4 selesai, dilanjutkan galian pile cap abutment barat.', 'Debit air sungai ciliwung naik 80 cm, penempatan cofferdam diperkuat.', 'Konsultan Teknik Lapangan', '2026-11-06')
ON CONFLICT (id) DO NOTHING;

-- 10. Audit Trail Aktivitas Staf
INSERT INTO activity_logs (id, "user", action, target) VALUES
  (1, 'Budi Prakoso (Pengawas)', 'Mengajukan pengadaan material', '300 sak Semen Gresik untuk Proyek P001'),
  (2, 'Owner / Direktur Utama', 'Memvalidasi ACC Survei Lokasi', 'Survei Lahan Jembatan Ciliwung (P003)'),
  (3, 'Finance Controller', 'Membukukan pengeluaran kas', 'Rp 64.500.000 untuk pengadaan material P001'),
  (4, 'Staf Logistik & Gudang', 'Memperbarui status alat berat', 'Excavator Komatsu PC200 ditugaskan ke P003'),
  (5, 'Konsultan Teknik Lapangan', 'Mengunggah gambar teknis DED', 'DED Abutment dan Girder Prategang 60M (P003)')
ON CONFLICT (id) DO NOTHING;

-- 11. Pusat Notifikasi
INSERT INTO notifications (id, judul, pesan, tipe, waktu, dibaca) VALUES
  (1, 'Pengajuan Material Menunggu ACC', 'Pengawas mengajukan 300 sak Semen Gresik untuk Gedung Maju Jaya (P001)', 'logistik', '10 menit lalu', 0),
  (2, 'Survei Lokasi Baru Diajukan', 'Survei lahan Gudang Cikupa (P006) menunggu validasi direksi', 'approval', '1 jam lalu', 0),
  (3, 'Peringatan Stok Buffer Gudang', 'Besi Beton D12 tersisa 380 btg (di bawah batas minimum 500 btg)', 'warning', '3 jam lalu', 1),
  (4, 'Deviasi Kurva-S Positif', 'Proyek P001 mencapai progres 45% (deviasi +3.0% di atas rencana)', 'progress', '1 hari lalu', 1)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- SINKRONISASI SEQUENCE SERIAL POSTGRESQL
-- ==============================================================================
SELECT setval('clients_id_seq', COALESCE((SELECT MAX(id) FROM clients), 1));
SELECT setval('projects_id_seq', COALESCE((SELECT MAX(id) FROM projects), 1));
SELECT setval('materials_id_seq', COALESCE((SELECT MAX(id) FROM materials), 1));
SELECT setval('equipments_id_seq', COALESCE((SELECT MAX(id) FROM equipments), 1));
SELECT setval('site_surveys_id_seq', COALESCE((SELECT MAX(id) FROM site_surveys), 1));
SELECT setval('material_requests_id_seq', COALESCE((SELECT MAX(id) FROM material_requests), 1));
SELECT setval('project_transactions_id_seq', COALESCE((SELECT MAX(id) FROM project_transactions), 1));
SELECT setval('project_documents_id_seq', COALESCE((SELECT MAX(id) FROM project_documents), 1));
SELECT setval('progress_reports_id_seq', COALESCE((SELECT MAX(id) FROM progress_reports), 1));
SELECT setval('activity_logs_id_seq', COALESCE((SELECT MAX(id) FROM activity_logs), 1));
SELECT setval('notifications_id_seq', COALESCE((SELECT MAX(id) FROM notifications), 1));
