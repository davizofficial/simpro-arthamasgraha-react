export default function registerReports(app, { db, logActivity, pushNotification, getUserPermissions }) {
  app.get('/api/reports', (req, res) => {
    try {
      const setRows = db.prepare('SELECT key, value FROM system_settings').all();
      const company = Object.fromEntries(setRows.map((r) => [r.key, r.value]));

      const totals = db
        .prepare(
          'SELECT count(*) as total_projects, COALESCE(SUM(budget), 0) as total_rab, COALESCE(SUM(spent), 0) as total_realisasi, COALESCE(AVG(progress), 0) as avg_progress FROM projects'
        )
        .get();
      const projects = db.prepare('SELECT * FROM projects ORDER BY id ASC').all();
      const recentProgress = db.prepare('SELECT * FROM progress_reports ORDER BY id DESC LIMIT 10').all();

      res.json({
        success: true,
        data: {
          company,
          rekap_proyek: {
            total_proyek: totals.total_projects,
            rata_progres: Math.round(totals.avg_progress),
            total_rab: totals.total_rab,
            total_realisasi: totals.total_realisasi,
            efisiensi:
              totals.total_rab > 0
                ? Math.round(((totals.total_rab - totals.total_realisasi) / totals.total_rab) * 100)
                : 0,
          },
          projects,
          recent_progress: recentProgress,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
