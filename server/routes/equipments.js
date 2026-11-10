export default function registerEquipments(app, { db, logActivity, pushNotification, getUserPermissions }) {
  app.get('/api/equipments', (req, res) => {
    try {
      const equipments = db.prepare('SELECT * FROM equipments ORDER BY id ASC').all();
      res.json({ success: true, count: equipments.length, data: equipments });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/equipments', (req, res) => {
    const { name, condition, daily_cost, operator } = req.body;
    if (!name || !daily_cost)
      return res.status(400).json({ success: false, error: 'Nama alat dan tarif sewa wajib diisi' });
    try {
      const count = db.prepare('SELECT count(*) as c FROM equipments').get().c;
      const code = `EQ-AST-${(count + 1).toString().padStart(2, '0')}`;
      const stmt = db.prepare(`
        INSERT INTO equipments (code, name, status, current_project_id, current_project_name, condition, daily_cost, operator)
        VALUES (?, ?, 'Tersedia di Pool', NULL, NULL, ?, ?, ?)
      `);
      const info = stmt.run(
        code,
        name,
        condition || 'Prima / Operasional',
        parseFloat(daily_cost),
        operator || 'Tersedia'
      );
      logActivity('Logistik', `Mendaftarkan aset alat berat baru: ${name}`, code);
      res.status(201).json({
        success: true,
        message: 'Alat berat berhasil didaftarkan!',
        data: { id: info.lastInsertRowid, code, name },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/equipments/:id/assign', (req, res) => {
    const { id } = req.params;
    const { project_id, project_name, status } = req.body;
    try {
      const eq = db.prepare('SELECT name FROM equipments WHERE id = ?').get(id);
      if (!eq) return res.status(404).json({ success: false, error: 'Alat berat tidak ditemukan' });

      if (project_id) {
        db.prepare(
          `
          UPDATE equipments SET current_project_id = ?, current_project_name = ?, status = ?, borrowed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `
        ).run(project_id, project_name || 'Proyek Lapangan', status || 'Di Lokasi Proyek', id);
      } else {
        db.prepare(
          `
          UPDATE equipments SET current_project_id = NULL, current_project_name = NULL, status = 'Tersedia di Pool', borrowed_at = NULL
          WHERE id = ?
        `
        ).run(id);
      }

      logActivity('Logistik', `Penugasan alat berat ${eq.name}`, project_name || 'Pool Logistik');
      res.json({ success: true, message: 'Status penugasan armada berhasil diperbarui!' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
