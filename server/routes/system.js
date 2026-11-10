export default function registerSystem(app, { db, logActivity, pushNotification, getUserPermissions }) {
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date(),
    });
  });

  app.get('/api/settings', (req, res) => {
    try {
      const rows = db.prepare('SELECT key, value FROM system_settings').all();
      const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
      res.json({ success: true, data: settings });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/settings', (req, res) => {
    try {
      const upsert = db.prepare('INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)');
      const updateMany = db.transaction((data) => {
        for (const [key, val] of Object.entries(data)) {
          upsert.run(key, String(val));
        }
      });
      updateMany(req.body);
      logActivity('Owner', 'Memperbarui profil & pengaturan CV. Arthamas Graha', req.body.company_name || 'Pengaturan');
      res.json({ success: true, message: 'Pengaturan sistem berhasil disimpan ke SQLite!' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
