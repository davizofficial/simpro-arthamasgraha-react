export default function registerFinance(app, { db, logActivity, pushNotification, getUserPermissions }) {
  app.get(['/api/finance', '/api/keuangan/kas'], (req, res) => {
    try {
      const transactions = db.prepare('SELECT * FROM project_transactions ORDER BY id DESC').all();
      const expRow = db
        .prepare("SELECT COALESCE(SUM(amount), 0) as s FROM project_transactions WHERE type = 'expense'")
        .get();
      const totalExpense = expRow.s;
      const incomeRow = db
        .prepare("SELECT COALESCE(SUM(amount), 0) as s FROM project_transactions WHERE type = 'income'")
        .get();
      const totalIncome = incomeRow.s;

      const catRows = db
        .prepare(
          "SELECT category, COALESCE(SUM(amount), 0) as s FROM project_transactions WHERE type = 'expense' GROUP BY category"
        )
        .all();
      const catMap = Object.fromEntries(catRows.map((r) => [r.category, r.s]));

      res.json({
        success: true,
        data: {
          summary: {
            total_pemasukan: totalIncome,
            total_pengeluaran: totalExpense,
            saldo_kas: totalIncome - totalExpense,
          },
          category_breakdown: catMap,
          transactions,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/finance/transactions', (req, res) => {
    const { project_id, category, description, amount, type = 'expense' } = req.body;
    if (!project_id || !category || !amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Proyek, pos biaya, dan nominal valid wajib diisi' });
    }
    try {
      const project = db.prepare('SELECT name, project_code FROM projects WHERE id = ?').get(project_id);
      if (!project) return res.status(404).json({ success: false, error: 'Proyek tidak ditemukan' });

      const today = new Date().toISOString().split('T')[0];
      const stmt = db.prepare(`
        INSERT INTO project_transactions (project_id, project_name, category, description, amount, date, type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        project_id,
        project.name,
        category,
        description || 'Biaya operasional',
        parseFloat(amount),
        today,
        type
      );

      if (type === 'expense') {
        db.prepare('UPDATE projects SET spent = spent + ? WHERE id = ?').run(parseFloat(amount), project_id);
      }

      logActivity(
        'Keuangan',
        `Membukukan pengeluaran kas Rp ${parseFloat(amount).toLocaleString('id-ID')} untuk ${project.project_code}`,
        description
      );
      res.status(201).json({
        success: true,
        message: 'Transaksi kas berhasil dibukukan ke database!',
        data: { id: info.lastInsertRowid },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
