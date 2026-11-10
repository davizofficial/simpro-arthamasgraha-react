export default function registerSurveys(app, { db, logActivity, pushNotification, getUserPermissions }) {
  app.get('/api/site-surveys', (req, res) => {
    const { status = 'semua' } = req.query;
    try {
      let query = 'SELECT * FROM site_surveys';
      const params = [];
      if (status && status !== 'semua') {
        query += ' WHERE LOWER(status) = LOWER(?)';
        params.push(status);
      }
      query += ' ORDER BY id DESC';
      const surveys = db.prepare(query).all(...params);
      res.json({ success: true, count: surveys.length, data: surveys });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/site-surveys', (req, res) => {
    const { project_id, project_name, area_size, elevation, soil_type, contour, accessibility, user_name } = req.body;
    if (!project_name || !soil_type || !accessibility) {
      return res.status(400).json({ success: false, error: 'Nama proyek, jenis tanah, dan aksesibilitas wajib diisi' });
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const stmt = db.prepare(`
        INSERT INTO site_surveys (project_id, project_name, user_name, area_size, elevation, soil_type, contour, accessibility, status, reviewer_notes, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, ?)
      `);
      const info = stmt.run(
        project_id || 1,
        project_name,
        user_name || 'Pengawas Lapangan',
        parseFloat(area_size) || 1000,
        elevation || '+0.0 m dpl',
        soil_type,
        contour || 'Datar',
        accessibility,
        today
      );

      logActivity(user_name || 'Pengawas Lapangan', 'Mengajukan survei lokasi baru untuk ditinjau', project_name);
      pushNotification(`Survei Baru Diajukan`, `${project_name} menunggu validasi teknis direksi`, 'approval');

      res.status(201).json({
        success: true,
        message: 'Survei lokasi berhasil diajukan ke Owner!',
        data: { id: info.lastInsertRowid },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/site-surveys/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, reviewer_notes, user_name } = req.body;
    try {
      const survey = db.prepare('SELECT * FROM site_surveys WHERE id = ?').get(id);
      if (!survey) return res.status(404).json({ success: false, error: 'Survei tidak ditemukan' });

      db.prepare('UPDATE site_surveys SET status = ?, reviewer_notes = ? WHERE id = ?').run(
        status || 'approved',
        reviewer_notes || 'ACC Direksi',
        id
      );

      logActivity(
        user_name || 'Owner / Direktur Utama',
        `Memvalidasi survei proyek (${status}): ${survey.project_name}`,
        reviewer_notes || 'ACC'
      );
      pushNotification(
        `Survei ${status === 'approved' ? 'Disetujui' : 'Direvisi'}`,
        `${survey.project_name}: ${reviewer_notes || 'ACC Direksi'}`,
        'approval'
      );

      res.json({ success: true, message: `Status survei berhasil diperbarui menjadi ${status}` });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
