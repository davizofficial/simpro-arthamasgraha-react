export default function registerDocuments(app, { db, logActivity, pushNotification, getUserPermissions }) {
  app.get('/api/documents', (req, res) => {
    const { category = 'semua', project_id } = req.query;
    try {
      let query = 'SELECT * FROM project_documents WHERE 1=1';
      const params = [];
      if (category && category !== 'semua') {
        query += ' AND LOWER(category) = LOWER(?)';
        params.push(category);
      }
      if (project_id) {
        query += ' AND project_id = ?';
        params.push(project_id);
      }
      query += ' ORDER BY id DESC';
      const documents = db.prepare(query).all(...params);
      res.json({ success: true, count: documents.length, data: documents });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/documents', (req, res) => {
    const { name, category, project_id, size, uploaded_by } = req.body;
    if (!name || !project_id || !category) {
      return res.status(400).json({ success: false, error: 'Nama berkas, proyek, dan kategori wajib diisi' });
    }
    try {
      const project = db.prepare('SELECT name FROM projects WHERE id = ?').get(project_id);
      const today = new Date().toISOString().split('T')[0];
      const stmt = db.prepare(`
        INSERT INTO project_documents (name, category, project_id, project_name, size, uploaded_by, date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        name,
        category,
        project_id,
        project ? project.name : 'Proyek Terkait',
        size || '1.8 MB',
        uploaded_by || 'Administrasi',
        today
      );
      logActivity(uploaded_by || 'Administrasi', `Mengunggah dokumen ${name}`, project ? project.name : 'Proyek');
      res.status(201).json({
        success: true,
        message: 'Dokumen berhasil diarsipkan ke database!',
        data: { id: info.lastInsertRowid },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
