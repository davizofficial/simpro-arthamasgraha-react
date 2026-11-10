export default function registerProgress(app, { db, logActivity, pushNotification, getUserPermissions }) {
  app.get('/api/progress', (req, res) => {
    try {
      const reports = db.prepare('SELECT * FROM progress_reports ORDER BY id DESC').all();
      res.json({ success: true, count: reports.length, data: reports });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post(['/api/progress', '/api/proyek/:id/laporan'], (req, res) => {
    const projectId = req.params.id || req.body.project_id;
    const { progress, progress_gain, notes, issues, reporter } = req.body;

    if (progress === undefined || isNaN(progress) || progress < 0 || progress > 100) {
      return res.status(400).json({ success: false, error: 'Capaian progres fisik harus berupa angka 0 - 100%' });
    }
    if (!notes || notes.trim().length < 8) {
      return res.status(400).json({ success: false, error: 'Uraian pekerjaan minimal 8 karakter' });
    }

    try {
      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
      if (!project) return res.status(404).json({ success: false, error: 'Proyek tidak ditemukan' });

      const weekCount =
        db.prepare('SELECT count(*) as c FROM progress_reports WHERE project_id = ?').get(projectId).c + 1;
      const today = new Date().toISOString().split('T')[0];

      const stmt = db.prepare(`
        INSERT INTO progress_reports (project_id, project_name, week_number, progress, progress_gain, notes, issues, reporter, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        project.id,
        project.name,
        weekCount,
        parseFloat(progress),
        parseFloat(progress_gain) || 2.5,
        notes,
        issues || 'Kondisi kondusif',
        reporter || 'Pengawas Lapangan',
        today
      );

      const dev = parseFloat(progress) - project.target_progress;
      const devStr = (dev >= 0 ? '+' : '') + dev.toFixed(1) + '%';
      const newStatus = parseFloat(progress) >= 100 ? 'selesai' : project.status;

      db.prepare('UPDATE projects SET progress = ?, deviasi = ?, status = ? WHERE id = ?').run(
        parseFloat(progress),
        devStr,
        newStatus,
        project.id
      );

      logActivity(
        reporter || 'Pengawas',
        `Melaporkan progres fisik ${project.project_code} sebesar ${progress}%`,
        notes
      );
      pushNotification(
        `Progres Baru: ${project.project_code}`,
        `${reporter || 'Pengawas'} menginput progres ${progress}% (${devStr})`,
        'progress'
      );

      res
        .status(201)
        .json({ success: true, message: 'Laporan progres mingguan berhasil dicatat ke basis data SQLite!' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
