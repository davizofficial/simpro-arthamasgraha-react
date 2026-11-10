export default function registerProjects(app, { db, logActivity, pushNotification, getUserPermissions }) {
  app.get(['/api/projects', '/api/proyek'], (req, res) => {
    const { search = '', status = 'semua' } = req.query;
    try {
      let query = 'SELECT * FROM projects WHERE 1=1';
      const params = [];

      if (status && status !== 'semua') {
        query += ' AND LOWER(status) = LOWER(?)';
        params.push(status);
      }

      if (search.trim()) {
        query += ' AND (name LIKE ? OR project_code LIKE ? OR location LIKE ? OR client_name LIKE ?)';
        const term = `%${search.trim()}%`;
        params.push(term, term, term, term);
      }

      query += ' ORDER BY id ASC';
      const projects = db.prepare(query).all(...params);
      res.json({ success: true, count: projects.length, data: projects });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get(['/api/projects/:id', '/api/proyek/:id'], (req, res) => {
    const { id } = req.params;
    try {
      const project = db.prepare('SELECT * FROM projects WHERE id = ? OR project_code = ?').get(id, id);
      if (!project) return res.status(404).json({ success: false, error: 'Proyek tidak ditemukan' });

      const reports = db
        .prepare('SELECT * FROM progress_reports WHERE project_id = ? ORDER BY id DESC')
        .all(project.id);
      const transactions = db
        .prepare('SELECT * FROM project_transactions WHERE project_id = ? ORDER BY id DESC')
        .all(project.id);
      const documents = db
        .prepare('SELECT * FROM project_documents WHERE project_id = ? ORDER BY id DESC')
        .all(project.id);
      const requests = db
        .prepare('SELECT * FROM material_requests WHERE project_id = ? ORDER BY id DESC')
        .all(project.id);
      const assignedEquipments = db.prepare('SELECT * FROM equipments WHERE current_project_id = ?').all(project.id);

      res.json({
        success: true,
        data: {
          ...project,
          progress_reports: reports,
          transactions,
          documents,
          material_requests: requests,
          equipments: assignedEquipments,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post(['/api/projects', '/api/proyek'], (req, res) => {
    const {
      name,
      location,
      client_name,
      client_id,
      budget,
      contract_value,
      start_date,
      end_date,
      manager,
      description,
    } = req.body;
    if (!name || !location || !budget) {
      return res.status(400).json({ success: false, error: 'Nama proyek, lokasi, dan anggaran RAB wajib diisi' });
    }
    try {
      const count = db.prepare('SELECT count(*) as c FROM projects').get().c;
      const nextCode = `P${(count + 1).toString().padStart(3, '0')}`;
      const cValue = parseFloat(contract_value) || parseFloat(budget) * 1.15;
      const sDate = start_date || new Date().toISOString().split('T')[0];
      const eDate = end_date || '2027-01-01';

      const stmt = db.prepare(`
        INSERT INTO projects (
          project_code, name, location, client_id, client_name, contract_value, budget, spent,
          progress, target_progress, deviasi, start_date, end_date, manager, description, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 5, '-5.0%', ?, ?, ?, ?, 'aktif')
      `);

      const info = stmt.run(
        nextCode,
        name,
        location,
        client_id || 1,
        client_name || 'Klien Mitra',
        cValue,
        parseFloat(budget),
        sDate,
        eDate,
        manager || 'Andi Wijaya, ST',
        description || ''
      );

      logActivity('Admin Sistem', `Membuka portofolio proyek baru: ${nextCode}`, name);
      pushNotification(`Proyek Baru: ${nextCode}`, `${name} di ${location} berhasil didaftarkan.`, 'project');

      res.status(201).json({
        success: true,
        message: 'Proyek baru berhasil didaftarkan!',
        data: { id: info.lastInsertRowid, project_code: nextCode, name, location, budget },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
