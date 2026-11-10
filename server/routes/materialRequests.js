export default function registerMaterialRequests(app, { db, logActivity, pushNotification, getUserPermissions }) {
  app.get('/api/material-requests', (req, res) => {
    const { status = 'semua' } = req.query;
    try {
      let query = 'SELECT * FROM material_requests';
      const params = [];
      if (status && status !== 'semua') {
        query += ' WHERE LOWER(status) = LOWER(?)';
        params.push(status);
      }
      query += ' ORDER BY id DESC';
      const requests = db.prepare(query).all(...params);
      res.json({ success: true, count: requests.length, data: requests });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/material-requests', (req, res) => {
    const { project_id, material_id, quantity, notes, requested_by } = req.body;
    if (!project_id || !material_id || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Proyek, material, dan kuantitas valid wajib diisi' });
    }
    try {
      const project = db.prepare('SELECT name FROM projects WHERE id = ?').get(project_id);
      const material = db.prepare('SELECT name, unit, price_per_unit FROM materials WHERE id = ?').get(material_id);

      if (!project || !material)
        return res.status(404).json({ success: false, error: 'Proyek atau material tidak valid' });

      const totalPrice = parseInt(quantity) * material.price_per_unit;
      const today = new Date().toISOString().split('T')[0];

      const stmt = db.prepare(`
        INSERT INTO material_requests (
          project_id, project_name, material_id, material_name, material_unit, price_per_unit,
          quantity, total_price, status, requested_by, approved_by, notes, date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NULL, ?, ?)
      `);

      const info = stmt.run(
        project_id,
        project.name,
        material_id,
        material.name,
        material.unit,
        material.price_per_unit,
        parseInt(quantity),
        totalPrice,
        requested_by || 'Pengawas Lapangan',
        notes || '',
        today
      );

      logActivity(
        requested_by || 'Pengawas',
        `Mengajukan material ${quantity} ${material.unit} ${material.name}`,
        project.name
      );
      pushNotification(
        `Pengajuan Material Baru`,
        `${requested_by || 'Pengawas'} mengajukan ${quantity} ${material.unit} ${material.name}`,
        'logistik'
      );

      res
        .status(201)
        .json({ success: true, message: 'Pengajuan material berhasil dibuat!', data: { id: info.lastInsertRowid } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/material-requests/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, approved_by } = req.body;
    try {
      const reqItem = db.prepare('SELECT * FROM material_requests WHERE id = ?').get(id);
      if (!reqItem) return res.status(404).json({ success: false, error: 'Pengajuan tidak ditemukan' });

      if (['approved', 'rejected'].includes(status) && !req.user.can('material_requests.approve')) {
        return res
          .status(403)
          .json({ success: false, error: 'Anda tidak berwenang menyetujui/menolak pengajuan material' });
      }
      if (reqItem.status === 'delivered') {
        return res.status(409).json({ success: false, error: 'Pengajuan yang sudah dikirim tidak dapat diubah lagi' });
      }

      db.prepare('UPDATE material_requests SET status = ?, approved_by = COALESCE(?, approved_by) WHERE id = ?').run(
        status,
        approved_by || 'Owner',
        id
      );

      if (status === 'delivered') {
        db.prepare('UPDATE materials SET stock = MAX(0, stock - ?) WHERE id = ?').run(
          reqItem.quantity,
          reqItem.material_id
        );
      }

      logActivity(
        approved_by || 'Owner',
        `Memperbarui status pengajuan material #${id} menjadi ${status}`,
        reqItem.project_name
      );
      res.json({ success: true, message: `Status pengajuan material berhasil diubah menjadi ${status}` });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
