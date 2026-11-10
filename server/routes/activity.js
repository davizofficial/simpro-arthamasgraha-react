export default function registerActivity(app, { db, logActivity, pushNotification, getUserPermissions }) {
  app.get('/api/activity-logs', (req, res) => {
    try {
      const logs = db.prepare('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 50').all();
      res.json({ success: true, count: logs.length, data: logs });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get(['/api/notifications', '/api/notifikasi'], (req, res) => {
    try {
      const notifications = db.prepare('SELECT * FROM notifications ORDER BY id DESC').all();
      res.json({ success: true, count: notifications.length, data: notifications });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch(['/api/notifications/:id/read', '/api/notifikasi/:id/read'], (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('UPDATE notifications SET dibaca = 1 WHERE id = ?').run(id);
      res.json({ success: true, message: 'Notifikasi ditandai dibaca' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch(['/api/notifications/read-all', '/api/notifikasi/read-all'], (req, res) => {
    try {
      db.prepare('UPDATE notifications SET dibaca = 1').run();
      res.json({ success: true, message: 'Semua notifikasi ditandai dibaca' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
