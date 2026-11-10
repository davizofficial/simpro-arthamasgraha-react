import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BCRYPT_ROUNDS = 10;

export function seedDatabase(db) {
  db.exec(`
    DROP TABLE IF EXISTS role_has_permissions;
    DROP TABLE IF EXISTS permissions;
    DROP TABLE IF EXISTS roles;
    DROP TABLE IF EXISTS progress_reports;
    DROP TABLE IF EXISTS project_documents;
    DROP TABLE IF EXISTS project_transactions;
    DROP TABLE IF EXISTS material_requests;
    DROP TABLE IF EXISTS site_surveys;
    DROP TABLE IF EXISTS equipments;
    DROP TABLE IF EXISTS materials;
    DROP TABLE IF EXISTS projects;
    DROP TABLE IF EXISTS clients;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS activity_logs;
    DROP TABLE IF EXISTS notifications;
    DROP TABLE IF EXISTS system_settings;

    -- 1. System Settings
    CREATE TABLE system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- 2. Roles & Permissions (Spatie RBAC)
    CREATE TABLE roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL
    );

    CREATE TABLE permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE role_has_permissions (
      role_id INTEGER NOT NULL,
      permission_id INTEGER NOT NULL,
      PRIMARY KEY (role_id, permission_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    );

    -- 3. Users
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      role_label TEXT NOT NULL,
      avatar TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Aktif',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Clients
    CREATE TABLE clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      category TEXT NOT NULL,
      contact_person TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      status TEXT NOT NULL DEFAULT 'Aktif',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. Projects (P001 - P008)
    CREATE TABLE projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      client_id INTEGER,
      client_name TEXT NOT NULL,
      contract_value REAL NOT NULL,
      budget REAL NOT NULL,
      spent REAL NOT NULL DEFAULT 0,
      progress REAL NOT NULL DEFAULT 0,
      target_progress REAL NOT NULL DEFAULT 50,
      deviasi TEXT DEFAULT '+0.0%',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      manager TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'aktif',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
    );

    -- 6. Site Surveys
    CREATE TABLE site_surveys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      project_name TEXT NOT NULL,
      user_name TEXT NOT NULL,
      area_size REAL NOT NULL,
      elevation TEXT,
      soil_type TEXT NOT NULL,
      contour TEXT NOT NULL,
      accessibility TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      reviewer_notes TEXT,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    );

    -- 7. Materials Catalog
    CREATE TABLE materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      unit TEXT NOT NULL,
      minimum_stock INTEGER NOT NULL DEFAULT 100,
      price_per_unit REAL NOT NULL,
      specification TEXT,
      supplier TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. Material Requests
    CREATE TABLE material_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      project_name TEXT NOT NULL,
      material_id INTEGER,
      material_name TEXT NOT NULL,
      material_unit TEXT NOT NULL,
      price_per_unit REAL NOT NULL,
      quantity INTEGER NOT NULL,
      total_price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      requested_by TEXT NOT NULL,
      approved_by TEXT,
      notes TEXT,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
      FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE SET NULL
    );

    -- 9. Heavy Equipments & Assets
    CREATE TABLE equipments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Tersedia di Pool',
      current_project_id INTEGER,
      current_project_name TEXT,
      borrowed_at TEXT,
      condition TEXT NOT NULL DEFAULT 'Prima / Operasional',
      daily_cost REAL NOT NULL,
      operator TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (current_project_id) REFERENCES projects(id) ON DELETE SET NULL
    );

    -- 10. Project Transactions
    CREATE TABLE project_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      project_name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'expense',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    );

    -- 11. Project Documents
    CREATE TABLE project_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      project_id INTEGER,
      project_name TEXT NOT NULL,
      size TEXT NOT NULL,
      uploaded_by TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    );

    -- 12. Weekly Progress Reports
    CREATE TABLE progress_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      project_name TEXT NOT NULL,
      week_number INTEGER NOT NULL,
      progress REAL NOT NULL,
      progress_gain REAL NOT NULL DEFAULT 2.5,
      notes TEXT NOT NULL,
      issues TEXT,
      reporter TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- 13. Activity Logs
    CREATE TABLE activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 14. Notifications
    CREATE TABLE notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      judul TEXT NOT NULL,
      pesan TEXT NOT NULL,
      tipe TEXT NOT NULL DEFAULT 'info',
      waktu TEXT NOT NULL DEFAULT 'Baru saja',
      dibaca INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('[SIMPRO] Skema tabel berhasil dibuat.');

  const insertSetting = db.prepare('INSERT INTO system_settings (key, value) VALUES (?, ?)');
  insertSetting.run('company_name', 'CV. Arthamas Graha');
  insertSetting.run('company_tagline', 'Sistem Informasi Manajemen Proyek Konstruksi & Pengawasan');
  insertSetting.run('address', 'Jl. ZA. Pagar Alam No. 42, Rajabasa, Bandar Lampung');
  insertSetting.run('phone', '(0721) 781290');
  insertSetting.run('email', 'kontak@arthamasgraha.com');
  insertSetting.run('google_drive_connected', 'true');
  insertSetting.run('finance_sheet_id', '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');

  const rolesData = [
    { id: 1, name: 'owner', label: 'Owner / Direktur Utama' },
    { id: 2, name: 'admin', label: 'Administrator Sistem' },
    { id: 3, name: 'administrasi', label: 'Administrasi & Legal' },
    { id: 4, name: 'konsultan', label: 'Konsultan Pengawas' },
    { id: 5, name: 'pengawas', label: 'Pengawas Lapangan' },
    { id: 6, name: 'logistik', label: 'Logistik & Gudang' },
    { id: 7, name: 'marketing', label: 'Marketing & Klien' },
    { id: 8, name: 'keuangan', label: 'Keuangan & Akuntansi' },
  ];

  const insertRole = db.prepare('INSERT INTO roles (id, name, label) VALUES (?, ?, ?)');
  rolesData.forEach((r) => insertRole.run(r.id, r.name, r.label));

  const permissionsList = [
    'dashboard.view',
    'clients.view',
    'clients.create',
    'clients.edit',
    'clients.delete',
    'projects.view',
    'projects.create',
    'projects.edit',
    'projects.delete',
    'progress.view',
    'progress.create',
    'materials.view',
    'materials.create',
    'materials.edit',
    'materials.delete',
    'material_requests.view',
    'material_requests.create',
    'material_requests.edit',
    'material_requests.delete',
    'material_requests.approve',
    'equipments.view',
    'equipments.create',
    'equipments.edit',
    'equipments.delete',
    'finance.view',
    'finance.create',
    'finance.edit',
    'documents.view',
    'documents.create',
    'documents.delete',
    'reports.view',
    'reports.export',
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'site-surveys.view',
    'site-surveys.create',
    'site-surveys.edit',
    'site-surveys.approve',
    'settings.view',
    'settings.edit',
  ];

  const insertPermission = db.prepare('INSERT INTO permissions (name) VALUES (?)');
  permissionsList.forEach((p) => insertPermission.run(p));

  const allPermissions = db.prepare('SELECT id, name FROM permissions').all();
  const permMap = Object.fromEntries(allPermissions.map((p) => [p.name, p.id]));

  const rolePermMapping = {
    owner: permissionsList,
    admin: permissionsList,
    administrasi: [
      'dashboard.view',
      'clients.view',
      'clients.create',
      'clients.edit',
      'projects.view',
      'projects.create',
      'projects.edit',
      'documents.view',
      'documents.create',
      'reports.view',
      'reports.export',
    ],
    keuangan: [
      'dashboard.view',
      'projects.view',
      'material_requests.view',
      'material_requests.edit',
      'material_requests.approve',
      'finance.view',
      'finance.create',
      'documents.view',
      'reports.view',
      'reports.export',
      'finance.edit',
    ],
    konsultan: [
      'dashboard.view',
      'projects.view',
      'progress.view',
      'progress.create',
      'documents.view',
      'documents.create',
      'reports.view',
      'site-surveys.view',
      'site-surveys.create',
      'site-surveys.edit',
    ],
    logistik: [
      'dashboard.view',
      'projects.view',
      'materials.view',
      'materials.create',
      'materials.edit',
      'materials.delete',
      'material_requests.view',
      'material_requests.edit',
      'equipments.view',
      'equipments.create',
      'equipments.edit',
      'equipments.delete',
      'documents.view',
      'reports.view',
    ],
    marketing: [
      'dashboard.view',
      'clients.view',
      'clients.create',
      'clients.edit',
      'projects.view',
      'documents.view',
      'documents.create',
      'reports.view',
    ],
    pengawas: [
      'dashboard.view',
      'projects.view',
      'progress.view',
      'progress.create',
      'materials.view',
      'material_requests.view',
      'material_requests.create',
      'material_requests.edit',
      'equipments.view',
      'documents.view',
      'documents.create',
      'reports.view',
      'site-surveys.view',
      'site-surveys.create',
      'site-surveys.edit',
    ],
  };

  const insertRolePerm = db.prepare('INSERT INTO role_has_permissions (role_id, permission_id) VALUES (?, ?)');
  for (const [roleName, pNames] of Object.entries(rolePermMapping)) {
    const role = rolesData.find((r) => r.name === roleName);
    pNames.forEach((pn) => {
      if (permMap[pn]) {
        insertRolePerm.run(role.id, permMap[pn]);
      }
    });
  }

  const usersData = [
    {
      id: 1,
      name: 'Owner / Direktur Utama',
      username: 'owner',
      email: 'owner@arthamasgraha.com',
      password: 'password',
      role: 'owner',
      role_label: 'Owner / Direktur Utama',
      avatar: 'OW',
    },
    {
      id: 2,
      name: 'Admin Sistem',
      username: 'admin',
      email: 'admin@arthamasgraha.com',
      password: 'password',
      role: 'admin',
      role_label: 'Administrator Sistem',
      avatar: 'AD',
    },
    {
      id: 3,
      name: 'Staf Administrasi & Legal',
      username: 'administrasi',
      email: 'administrasi@arthamasgraha.com',
      password: 'password',
      role: 'administrasi',
      role_label: 'Administrasi & Legal',
      avatar: 'AM',
    },
    {
      id: 4,
      name: 'Konsultan Teknik Lapangan',
      username: 'konsultan',
      email: 'konsultan@arthamasgraha.com',
      password: 'password',
      role: 'konsultan',
      role_label: 'Konsultan Pengawas',
      avatar: 'KT',
    },
    {
      id: 5,
      name: 'Budi Prakoso (Pengawas)',
      username: 'pengawas',
      email: 'pengawas@arthamasgraha.com',
      password: 'password',
      role: 'pengawas',
      role_label: 'Pengawas Lapangan',
      avatar: 'BP',
    },
    {
      id: 6,
      name: 'Staf Logistik & Gudang',
      username: 'logistik',
      email: 'logistik@arthamasgraha.com',
      password: 'password',
      role: 'logistik',
      role_label: 'Logistik & Gudang',
      avatar: 'LG',
    },
    {
      id: 7,
      name: 'Marketing & Hubungan Klien',
      username: 'marketing',
      email: 'marketing@arthamasgraha.com',
      password: 'password',
      role: 'marketing',
      role_label: 'Marketing & Klien',
      avatar: 'MK',
    },
    {
      id: 8,
      name: 'Finance Controller',
      username: 'keuangan',
      email: 'keuangan@arthamasgraha.com',
      password: 'password',
      role: 'keuangan',
      role_label: 'Keuangan & Akuntansi',
      avatar: 'KU',
    },
  ];

  const insertUser = db.prepare(
    'INSERT INTO users (id, name, username, email, password, role, role_label, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  usersData.forEach((u) =>
    insertUser.run(
      u.id,
      u.name,
      u.username,
      u.email,
      bcrypt.hashSync(u.password, BCRYPT_ROUNDS),
      u.role,
      u.role_label,
      u.avatar
    )
  );

  const clientsData = [
    {
      id: 1,
      name: 'PT Maju Jaya',
      company: 'PT Maju Jaya Perkasa',
      category: 'Swasta',
      contact_person: 'Ir. Bambang Soedibyo',
      phone: '021-12345678',
      email: 'info@majujaya.com',
      address: 'Gedung Cyber 2 Lantai 18, Jakarta Selatan',
    },
    {
      id: 2,
      name: 'Dinas Bina Marga Provinsi',
      company: 'Dinas Bina Marga & Bina Konstruksi',
      category: 'Pemerintah',
      contact_person: 'Drs. Hendro Wibowo, M.Si',
      phone: '0251-8321098',
      email: 'kontak@binamarga.go.id',
      address: 'Jl. Pemuda No. 45, Bogor',
    },
    {
      id: 3,
      name: 'Balai Besar Wilayah Sungai (BBWS)',
      company: 'Kementerian PUPR Ditjen SDA',
      category: 'Pemerintah',
      contact_person: 'Ir. Agus Prasetyo, MT',
      phone: '021-7298311',
      email: 'bbws.ciliwung@pu.go.id',
      address: 'Jl. Inspeksi Saluran Kali Malang, Jakarta Timur',
    },
    {
      id: 4,
      name: 'PT Mitra Propertindo',
      company: 'PT Mitra Propertindo Abadi',
      category: 'Swasta',
      contact_person: 'Clarissa Tanudjaja',
      phone: '021-55667788',
      email: 'tender@mitrapropertindo.co.id',
      address: 'Ruko BSD Junction Blok A-12, Tangerang',
    },
  ];

  const insertClient = db.prepare(
    'INSERT INTO clients (id, name, company, category, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  clientsData.forEach((c) =>
    insertClient.run(c.id, c.name, c.company, c.category, c.contact_person, c.phone, c.email, c.address)
  );

  const projectsData = [
    {
      id: 1,
      project_code: 'P001',
      name: 'Pembangunan Gedung Kantor PT Maju Jaya',
      location: 'Jakarta Selatan',
      client_id: 1,
      client_name: 'PT Maju Jaya',
      contract_value: 15000000000,
      budget: 12000000000,
      spent: 5240000000,
      progress: 45,
      target_progress: 42,
      deviasi: '+3.0%',
      start_date: '2026-01-10',
      end_date: '2026-12-20',
      manager: 'Andi Wijaya, ST',
      description:
        'Pembangunan gedung kantor modern 5 lantai dengan konsep green building dan ruang kerja terbuka (open space).',
      status: 'aktif',
    },
    {
      id: 2,
      project_code: 'P002',
      name: 'Renovasi Hotel Bintang Lima Nusantara',
      location: 'Bali',
      client_id: 4,
      client_name: 'PT Mitra Propertindo',
      contract_value: 9500000000,
      budget: 7500000000,
      spent: 5100000000,
      progress: 68,
      target_progress: 65,
      deviasi: '+3.0%',
      start_date: '2025-11-01',
      end_date: '2026-08-30',
      manager: 'Ir. Budi Santoso',
      description: 'Renovasi fasad luar, 120 kamar suite, dan penataan ulang area kolam renang infinity tepi laut.',
      status: 'aktif',
    },
    {
      id: 3,
      project_code: 'P003',
      name: 'Pembangunan Jembatan Sungai Ciliwung',
      location: 'Bogor',
      client_id: 3,
      client_name: 'Balai Besar Wilayah Sungai (BBWS)',
      contract_value: 26000000000,
      budget: 22000000000,
      spent: 7040000000,
      progress: 32,
      target_progress: 35,
      deviasi: '-3.0%',
      start_date: '2026-02-15',
      end_date: '2027-02-14',
      manager: 'Andi Wijaya, ST',
      description: 'Konstruksi jembatan girder beton prategang bentang 60 meter menghubungkan dua kecamatan terisolir.',
      status: 'aktif',
    },
    {
      id: 4,
      project_code: 'P004',
      name: 'Perumahan Green Valley Residence',
      location: 'Tangerang',
      client_id: 4,
      client_name: 'PT Mitra Propertindo',
      contract_value: 35000000000,
      budget: 30000000000,
      spent: 16500000000,
      progress: 55,
      target_progress: 55,
      deviasi: '0.0%',
      start_date: '2025-08-01',
      end_date: '2026-11-30',
      manager: 'Hendrik Pratama, ST',
      description:
        'Pembangunan 150 unit rumah tapak tipe 72/120 beserta infrastruktur jalan lingkungan dan drainase tertutup.',
      status: 'aktif',
    },
    {
      id: 5,
      project_code: 'P005',
      name: 'Renovasi Gedung Sekolah SDN 01 Depok',
      location: 'Depok',
      client_id: 2,
      client_name: 'Dinas Bina Marga Provinsi',
      contract_value: 2400000000,
      budget: 2000000000,
      spent: 1980000000,
      progress: 100,
      target_progress: 100,
      deviasi: '0.0%',
      start_date: '2025-09-01',
      end_date: '2026-01-25',
      manager: 'Ir. Budi Santoso',
      description: 'Rehabilitasi 12 ruang kelas belajar, laboratorium komputer, dan lapangan olahraga serbaguna.',
      status: 'selesai',
    },
    {
      id: 6,
      project_code: 'P006',
      name: 'Pembangunan Gudang Logistik Cikupa',
      location: 'Tangerang',
      client_id: 1,
      client_name: 'PT Maju Jaya',
      contract_value: 12000000000,
      budget: 10000000000,
      spent: 500000000,
      progress: 5,
      target_progress: 5,
      deviasi: '0.0%',
      start_date: '2026-04-01',
      end_date: '2026-11-30',
      manager: 'Andi Wijaya, ST',
      description:
        'Konstruksi pergudangan baja bentang lebar seluas 4.500 m2 dengan lantai cor floor hardener heavy duty.',
      status: 'perencanaan',
    },
    {
      id: 7,
      project_code: 'P007',
      name: 'Pembangunan Masjid Al-Ikhlas',
      location: 'Bekasi',
      client_id: 2,
      client_name: 'Dinas Bina Marga Provinsi',
      contract_value: 4200000000,
      budget: 3500000000,
      spent: 2520000000,
      progress: 72,
      target_progress: 70,
      deviasi: '+2.0%',
      start_date: '2025-10-15',
      end_date: '2026-06-30',
      manager: 'Hendrik Pratama, ST',
      description: 'Pembangunan masjid 2 lantai dengan ornamen GRC bermotif islami dan kubah enamel diameter 12 meter.',
      status: 'aktif',
    },
    {
      id: 8,
      project_code: 'P008',
      name: 'Infrastruktur Jalan Tol Serpong',
      location: 'Tangerang',
      client_id: 3,
      client_name: 'Balai Besar Wilayah Sungai (BBWS)',
      contract_value: 52000000000,
      budget: 45000000000,
      spent: 9900000000,
      progress: 22,
      target_progress: 30,
      deviasi: '-8.0%',
      start_date: '2025-12-01',
      end_date: '2027-06-30',
      manager: 'Andi Wijaya, ST',
      description:
        'Pekerjaan tanah galian dan timbunan, saluran samping beton precast, dan perkerasan kaku rigid pavement STA 12+000 s/d 18+500.',
      status: 'tertunda',
    },
  ];

  const insertProject = db.prepare(`
    INSERT INTO projects (
      id, project_code, name, location, client_id, client_name, contract_value, budget, spent,
      progress, target_progress, deviasi, start_date, end_date, manager, description, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  projectsData.forEach((p) =>
    insertProject.run(
      p.id,
      p.project_code,
      p.name,
      p.location,
      p.client_id,
      p.client_name,
      p.contract_value,
      p.budget,
      p.spent,
      p.progress,
      p.target_progress,
      p.deviasi,
      p.start_date,
      p.end_date,
      p.manager,
      p.description,
      p.status
    )
  );

  const surveysData = [
    {
      id: 1,
      project_id: 1,
      project_name: 'Pembangunan Gedung Kantor PT Maju Jaya',
      user_name: 'Budi Prakoso (Pengawas)',
      area_size: 2400,
      elevation: '+18.5 m dpl',
      soil_type: 'Lempung Berpasir (Sondir > 200 kg/cm2)',
      contour: 'Relatif Datar (Kemiringan 2%)',
      accessibility: 'Sangat Baik (Jalan Aspal Lebar 12m, Truk Tronton Masuk)',
      status: 'approved',
      reviewer_notes: 'Survei disetujui, daya dukung tanah sesuai untuk pondasi bore pile kedalaman 18 meter.',
      date: '2026-01-05',
    },
    {
      id: 2,
      project_id: 3,
      project_name: 'Pembangunan Jembatan Sungai Ciliwung',
      user_name: 'Konsultan Teknik Lapangan',
      area_size: 1800,
      elevation: '+12.0 m dpl',
      soil_type: 'Batuan Sedimen & Aluvial Sungai',
      contour: 'Curam (Bantaran Sungai 15%)',
      accessibility: 'Cukup (Perlu Pembuatan Jalan Akses Sementara 200m)',
      status: 'approved',
      reviewer_notes: 'ACC dengan catatan perlu perkuatan lereng bronjong sebelum bore pile dimulai.',
      date: '2026-02-08',
    },
    {
      id: 3,
      project_id: 6,
      project_name: 'Pembangunan Gudang Logistik Cikupa',
      user_name: 'Budi Prakoso (Pengawas)',
      area_size: 5000,
      elevation: '+24.0 m dpl',
      soil_type: 'Tanah Lempung Ekspansif (Perlu Soil Improvement)',
      contour: 'Datar Sempurna',
      accessibility: 'Prima (Kawasan Industri Cikupa, Akses Tol 2 KM)',
      status: 'pending',
      reviewer_notes: null,
      date: '2026-03-20',
    },
  ];

  const insertSurvey = db.prepare(`
    INSERT INTO site_surveys (
      id, project_id, project_name, user_name, area_size, elevation, soil_type, contour,
      accessibility, status, reviewer_notes, date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  surveysData.forEach((s) =>
    insertSurvey.run(
      s.id,
      s.project_id,
      s.project_name,
      s.user_name,
      s.area_size,
      s.elevation,
      s.soil_type,
      s.contour,
      s.accessibility,
      s.status,
      s.reviewer_notes,
      s.date
    )
  );

  const materialsData = [
    {
      id: 1,
      code: 'MAT-001',
      name: 'Semen Gresik (50kg)',
      stock: 1250,
      unit: 'sak',
      minimum_stock: 500,
      price_per_unit: 65000,
      specification: 'Portland Composite Cement (PCC) SNI 15-7064-2004',
      supplier: 'PT Semen Indonesia Distributor',
    },
    {
      id: 2,
      code: 'MAT-002',
      name: 'Besi Beton Ulir D12 (12m)',
      stock: 380,
      unit: 'batang',
      minimum_stock: 500,
      price_per_unit: 145000,
      specification: 'Besi Tulangan Sirip BJTS 420B SNI 2052:2017',
      supplier: 'PT Krakatau Steel Cilegon',
    },
    {
      id: 3,
      code: 'MAT-003',
      name: 'Pasir Cor Super Bangka',
      stock: 120,
      unit: 'm3',
      minimum_stock: 150,
      price_per_unit: 310000,
      specification: 'Pasir Alami Bebas Lumpur (Kadar Lumpur < 3%)',
      supplier: 'CV Tambang Pasir Berkah',
    },
    {
      id: 4,
      code: 'MAT-004',
      name: 'Batu Belah Kali 15/20',
      stock: 240,
      unit: 'm3',
      minimum_stock: 100,
      price_per_unit: 260000,
      specification: 'Batu Andesit Keras Bebas Pelapukan',
      supplier: 'Quarry Rumpin Bogor',
    },
    {
      id: 5,
      code: 'MAT-005',
      name: 'Baja Profil H-Beam 200x200',
      stock: 85,
      unit: 'batang',
      minimum_stock: 40,
      price_per_unit: 3850000,
      specification: 'Structural Steel SS400 SNI 03-1729-2002',
      supplier: 'PT Gunung Raja Paksi',
    },
    {
      id: 6,
      code: 'MAT-006',
      name: 'Keramik Lantai Roman 60x60',
      stock: 650,
      unit: 'dus',
      minimum_stock: 200,
      price_per_unit: 195000,
      specification: 'Granite Tile Polish Glazed Porcelain',
      supplier: 'PT Satya Djaya Raya',
    },
    {
      id: 7,
      code: 'MAT-007',
      name: 'Semen Tiga Roda (40kg)',
      stock: 900,
      unit: 'sak',
      minimum_stock: 300,
      price_per_unit: 54000,
      specification: 'Portland Cement Type I Standar ASTM C-150',
      supplier: 'PT Indocement Tunggal Prakarsa',
    },
  ];

  const insertMaterial = db.prepare(`
    INSERT INTO materials (id, code, name, stock, unit, minimum_stock, price_per_unit, specification, supplier)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  materialsData.forEach((m) =>
    insertMaterial.run(
      m.id,
      m.code,
      m.name,
      m.stock,
      m.unit,
      m.minimum_stock,
      m.price_per_unit,
      m.specification,
      m.supplier
    )
  );

  const requestsData = [
    {
      id: 1,
      project_id: 1,
      project_name: 'Pembangunan Gedung Kantor PT Maju Jaya',
      material_id: 1,
      material_name: 'Semen Gresik (50kg)',
      material_unit: 'sak',
      price_per_unit: 65000,
      quantity: 300,
      total_price: 19500000,
      status: 'approved',
      requested_by: 'Budi Prakoso (Pengawas)',
      approved_by: 'Owner / Direktur Utama',
      notes: 'Untuk pengecoran lantai 3 zona B, mendesak sebelum musim hujan',
      date: '2026-11-08',
    },
    {
      id: 2,
      project_id: 3,
      project_name: 'Pembangunan Jembatan Sungai Ciliwung',
      material_id: 2,
      material_name: 'Besi Beton Ulir D12 (12m)',
      material_unit: 'batang',
      price_per_unit: 145000,
      quantity: 100,
      total_price: 14500000,
      status: 'pending',
      requested_by: 'Konsultan Teknik Lapangan',
      approved_by: null,
      notes: 'Perakitan tulangan abutment jembatan sisi timur',
      date: '2026-11-09',
    },
    {
      id: 3,
      project_id: 1,
      project_name: 'Pembangunan Gedung Kantor PT Maju Jaya',
      material_id: 3,
      material_name: 'Pasir Cor Super Bangka',
      material_unit: 'm3',
      price_per_unit: 310000,
      quantity: 20,
      total_price: 6200000,
      status: 'delivered',
      requested_by: 'Budi Prakoso (Pengawas)',
      approved_by: 'Owner / Direktur Utama',
      notes: 'Pasir cor ready mix site',
      date: '2026-11-05',
    },
  ];

  const insertRequest = db.prepare(`
    INSERT INTO material_requests (
      id, project_id, project_name, material_id, material_name, material_unit, price_per_unit,
      quantity, total_price, status, requested_by, approved_by, notes, date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  requestsData.forEach((r) =>
    insertRequest.run(
      r.id,
      r.project_id,
      r.project_name,
      r.material_id,
      r.material_name,
      r.material_unit,
      r.price_per_unit,
      r.quantity,
      r.total_price,
      r.status,
      r.requested_by,
      r.approved_by,
      r.notes,
      r.date
    )
  );

  const equipmentsData = [
    {
      id: 1,
      code: 'EQ-EXC-01',
      name: 'Excavator Komatsu PC200-8',
      status: 'Di Lokasi Proyek',
      current_project_id: 3,
      current_project_name: 'Pembangunan Jembatan Sungai Ciliwung',
      borrowed_at: '2026-10-15T08:00:00',
      condition: 'Prima / Operasional',
      daily_cost: 2200000,
      operator: 'Supardi',
    },
    {
      id: 2,
      code: 'EQ-CRN-01',
      name: 'Mobile Crane Kato 50 Ton',
      status: 'Di Lokasi Proyek',
      current_project_id: 1,
      current_project_name: 'Pembangunan Gedung Kantor PT Maju Jaya',
      borrowed_at: '2026-11-02T07:30:00',
      condition: 'Prima / Operasional',
      daily_cost: 4500000,
      operator: 'Mulyono',
    },
    {
      id: 3,
      code: 'EQ-DMP-01',
      name: 'Dump Truck Hino 500 FM 260 TI',
      status: 'Tersedia di Pool',
      current_project_id: null,
      current_project_name: null,
      borrowed_at: null,
      condition: 'Prima / Operasional',
      daily_cost: 850000,
      operator: 'Tersedia',
    },
    {
      id: 4,
      code: 'EQ-GEN-01',
      name: 'Genset Silent Perkins 150 kVA',
      status: 'Di Lokasi Proyek',
      current_project_id: 2,
      current_project_name: 'Renovasi Hotel Bintang Lima Nusantara',
      borrowed_at: '2026-09-20T09:00:00',
      condition: 'Servis Ringan / Rutin',
      daily_cost: 750000,
      operator: 'I Wayan Sudiarta',
    },
    {
      id: 5,
      code: 'EQ-ROL-01',
      name: 'Vibro Roller Bomag BW211 D-40',
      status: 'Tersedia di Pool',
      current_project_id: null,
      current_project_name: null,
      borrowed_at: null,
      condition: 'Prima / Operasional',
      daily_cost: 1600000,
      operator: 'Tersedia',
    },
  ];

  const insertEquipment = db.prepare(`
    INSERT INTO equipments (
      id, code, name, status, current_project_id, current_project_name, borrowed_at,
      condition, daily_cost, operator
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  equipmentsData.forEach((e) =>
    insertEquipment.run(
      e.id,
      e.code,
      e.name,
      e.status,
      e.current_project_id,
      e.current_project_name,
      e.borrowed_at,
      e.condition,
      e.daily_cost,
      e.operator
    )
  );

  const transactionsData = [
    {
      id: 1,
      project_id: 1,
      project_name: 'Pembangunan Gedung Kantor PT Maju Jaya',
      category: 'material',
      description: 'Pembelian Semen Gresik 500 sak dan Besi Beton D12 tahap 2',
      amount: 64500000,
      date: '2026-11-04',
      type: 'expense',
    },
    {
      id: 2,
      project_id: 1,
      project_name: 'Pembangunan Gedung Kantor PT Maju Jaya',
      category: 'sewa_alat',
      description: 'Sewa Mobile Crane Kato 50T periode 10 hari',
      amount: 45000000,
      date: '2026-11-02',
      type: 'expense',
    },
    {
      id: 3,
      project_id: 3,
      project_name: 'Pembangunan Jembatan Sungai Ciliwung',
      category: 'upah',
      description: 'Upah mingguan tukang pembesian dan operator excavator (35 orang)',
      amount: 48500000,
      date: '2026-11-06',
      type: 'expense',
    },
    {
      id: 4,
      project_id: 2,
      project_name: 'Renovasi Hotel Bintang Lima Nusantara',
      category: 'material',
      description: 'Pengadaan Keramik Roman 60x60 sebanyak 400 dus',
      amount: 78000000,
      date: '2026-10-28',
      type: 'expense',
    },
    {
      id: 5,
      project_id: 1,
      project_name: 'Pembangunan Gedung Kantor PT Maju Jaya',
      category: 'operasional',
      description: 'Biaya BBM solar genset, perizinan dinas lingkungan, dan K3 helm rompi',
      amount: 3400000,
      date: '2026-11-01',
      type: 'expense',
    },
  ];

  const insertTransaction = db.prepare(`
    INSERT INTO project_transactions (id, project_id, project_name, category, description, amount, date, type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  transactionsData.forEach((t) =>
    insertTransaction.run(t.id, t.project_id, t.project_name, t.category, t.description, t.amount, t.date, t.type)
  );

  const documentsData = [
    {
      id: 1,
      name: 'Surat_Perjanjian_Kontrak_PT_Maju_Jaya.pdf',
      category: 'kontrak',
      project_id: 1,
      project_name: 'Pembangunan Gedung Kantor PT Maju Jaya',
      size: '4.2 MB',
      uploaded_by: 'Administrasi',
      date: '2026-01-12',
    },
    {
      id: 2,
      name: 'Gambar_DED_Struktur_Gedung_5_Lantai.dwg',
      category: 'ded',
      project_id: 1,
      project_name: 'Pembangunan Gedung Kantor PT Maju Jaya',
      size: '18.6 MB',
      uploaded_by: 'Konsultan',
      date: '2026-01-15',
    },
    {
      id: 3,
      name: 'RAB_Final_Pembangunan_Gedung_Kantor.xlsx',
      category: 'rab',
      project_id: 1,
      project_name: 'Pembangunan Gedung Kantor PT Maju Jaya',
      size: '1.8 MB',
      uploaded_by: 'Owner',
      date: '2026-01-08',
    },
    {
      id: 4,
      name: 'Kontrak_Kerja_BBWS_Jembatan_Ciliwung.pdf',
      category: 'kontrak',
      project_id: 3,
      project_name: 'Pembangunan Jembatan Sungai Ciliwung',
      size: '6.5 MB',
      uploaded_by: 'Administrasi',
      date: '2026-02-18',
    },
    {
      id: 5,
      name: 'DED_Abutment_dan_Girder_Prategang_60M.pdf',
      category: 'ded',
      project_id: 3,
      project_name: 'Pembangunan Jembatan Sungai Ciliwung',
      size: '12.4 MB',
      uploaded_by: 'Konsultan',
      date: '2026-02-20',
    },
    {
      id: 6,
      name: 'BAPP_Kemajuan_Pekerjaan_SDN_01_Depok_100.pdf',
      category: 'laporan',
      project_id: 5,
      project_name: 'Renovasi Gedung Sekolah SDN 01 Depok',
      size: '2.1 MB',
      uploaded_by: 'Administrasi',
      date: '2026-01-26',
    },
  ];

  const insertDocument = db.prepare(`
    INSERT INTO project_documents (id, name, category, project_id, project_name, size, uploaded_by, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  documentsData.forEach((d) =>
    insertDocument.run(d.id, d.name, d.category, d.project_id, d.project_name, d.size, d.uploaded_by, d.date)
  );

  const progressReportsData = [
    {
      id: 1,
      project_id: 1,
      project_name: 'Pembangunan Gedung Kantor PT Maju Jaya',
      week_number: 24,
      progress: 45,
      progress_gain: 2.5,
      notes: 'Pengecoran plat lantai 3 zona B selesai. Persiapan bekisting kolom lantai 4.',
      issues: 'Sempat terkendala hujan lebat 2 hari, dialihkan ke perakitan besi tulangan di workshop.',
      reporter: 'Budi Prakoso (Pengawas)',
      date: '2026-11-02',
    },
    {
      id: 2,
      project_id: 3,
      project_name: 'Pembangunan Jembatan Sungai Ciliwung',
      week_number: 16,
      progress: 32,
      progress_gain: 1.8,
      notes: 'Pengecoran bore pile titik P1-P4 selesai, dilanjutkan galian pile cap abutment barat.',
      issues: 'Debit air sungai ciliwung naik 80 cm, penempatan cofferdam diperkuat.',
      reporter: 'Konsultan Teknik Lapangan',
      date: '2026-11-06',
    },
  ];

  const insertReport = db.prepare(`
    INSERT INTO progress_reports (id, project_id, project_name, week_number, progress, progress_gain, notes, issues, reporter, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  progressReportsData.forEach((r) =>
    insertReport.run(
      r.id,
      r.project_id,
      r.project_name,
      r.week_number,
      r.progress,
      r.progress_gain,
      r.notes,
      r.issues,
      r.reporter,
      r.date
    )
  );

  const activityLogsData = [
    {
      id: 1,
      user: 'Budi Prakoso (Pengawas)',
      action: 'Mengajukan pengadaan material',
      target: '300 sak Semen Gresik untuk Proyek P001',
    },
    {
      id: 2,
      user: 'Owner / Direktur Utama',
      action: 'Memvalidasi ACC Survei Lokasi',
      target: 'Survei Lahan Jembatan Ciliwung (P003)',
    },
    {
      id: 3,
      user: 'Finance Controller',
      action: 'Membukukan pengeluaran kas',
      target: 'Rp 64.500.000 untuk pengadaan material P001',
    },
    {
      id: 4,
      user: 'Staf Logistik & Gudang',
      action: 'Memperbarui status alat berat',
      target: 'Excavator Komatsu PC200 ditugaskan ke P003',
    },
    {
      id: 5,
      user: 'Konsultan Teknik Lapangan',
      action: 'Mengunggah gambar teknis DED',
      target: 'DED Abutment dan Girder Prategang 60M (P003)',
    },
  ];

  const insertActivity = db.prepare('INSERT INTO activity_logs (id, user, action, target) VALUES (?, ?, ?, ?)');
  activityLogsData.forEach((a) => insertActivity.run(a.id, a.user, a.action, a.target));

  const notificationsData = [
    {
      id: 1,
      judul: 'Pengajuan Material Menunggu ACC',
      pesan: 'Pengawas mengajukan 300 sak Semen Gresik untuk Gedung Maju Jaya (P001)',
      tipe: 'logistik',
      waktu: '10 menit lalu',
      dibaca: 0,
    },
    {
      id: 2,
      judul: 'Survei Lokasi Baru Diajukan',
      pesan: 'Survei lahan Gudang Cikupa (P006) menunggu validasi direksi',
      tipe: 'approval',
      waktu: '1 jam lalu',
      dibaca: 0,
    },
    {
      id: 3,
      judul: 'Peringatan Stok Buffer Gudang',
      pesan: 'Besi Beton D12 tersisa 380 btg (di bawah batas minimum 500 btg)',
      tipe: 'warning',
      waktu: '3 jam lalu',
      dibaca: 1,
    },
    {
      id: 4,
      judul: 'Deviasi Kurva-S Positif',
      pesan: 'Proyek P001 mencapai progres 45% (deviasi +3.0% di atas rencana)',
      tipe: 'progress',
      waktu: '1 hari lalu',
      dibaca: 1,
    },
  ];

  const insertNotification = db.prepare(
    'INSERT INTO notifications (id, judul, pesan, tipe, waktu, dibaca) VALUES (?, ?, ?, ?, ?, ?)'
  );
  notificationsData.forEach((n) => insertNotification.run(n.id, n.judul, n.pesan, n.tipe, n.waktu, n.dibaca));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dbPath = process.env.DB_PATH || path.join(__dirname, 'simpro.sqlite');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  console.log('[SIMPRO] Menginisialisasi skema database relasional SQLite:', dbPath);
  seedDatabase(db);
  console.log('[SIMPRO] Seluruh entitas data berhasil di-seed ke basis data SQLite!');
  db.close();
}
