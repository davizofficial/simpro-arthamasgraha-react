export default function registerDashboard(app, { db, logActivity, pushNotification, getUserPermissions }) {
  app.get('/api/dashboard', (req, res) => {
    try {
      const activeProjectsCount = db.prepare("SELECT count(*) as c FROM projects WHERE status = 'aktif'").get().c;
      const finishedProjectsCount = db.prepare("SELECT count(*) as c FROM projects WHERE status = 'selesai'").get().c;
      const totalProjectsCount = db.prepare('SELECT count(*) as c FROM projects').get().c;

      const totals = db
        .prepare(
          'SELECT COALESCE(SUM(budget), 0) as total_budget, COALESCE(SUM(spent), 0) as total_spent FROM projects'
        )
        .get();
      const totalBudget = totals.total_budget;
      const totalSpent = totals.total_spent;
      const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
      const remainingBudget = totalBudget - totalSpent;

      let budgetStatusLabel = 'Aman';
      let budgetStatusText = 'text-emerald-700';
      let budgetStatusBg = 'bg-emerald-500';

      if (percentSpent > 90) {
        budgetStatusLabel = 'Kritis';
        budgetStatusText = 'text-rose-700';
        budgetStatusBg = 'bg-rose-500';
      } else if (percentSpent > 70) {
        budgetStatusLabel = 'Perhatian';
        budgetStatusText = 'text-amber-700';
        budgetStatusBg = 'bg-amber-500';
      }

      const projects = db.prepare('SELECT * FROM projects ORDER BY id ASC').all();

      const catRows = db
        .prepare(
          "SELECT category, COALESCE(SUM(amount), 0) as total FROM project_transactions WHERE type = 'expense' GROUP BY category"
        )
        .all();
      const categoryLabels = {
        material: 'Logistik Material',
        upah: 'Upah Tenaga Kerja',
        sewa_alat: 'Sewa Alat Berat',
        operasional: 'Operasional Lapangan',
        subkon: 'Pekerjaan Subkontraktor',
      };

      const categoriesData = catRows.map((r) => ({
        category: categoryLabels[r.category] || r.category,
        total: r.total,
      }));

      const pendingSurveys = db
        .prepare("SELECT * FROM site_surveys WHERE status IN ('pending', 'review') ORDER BY id DESC")
        .all();
      const criticalStock = db.prepare('SELECT * FROM materials WHERE stock <= minimum_stock').all();
      const pendingRequests = db
        .prepare("SELECT count(*) as c FROM material_requests WHERE status = 'pending'")
        .get().c;
      const recentActivities = db.prepare('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 30').all();

      const seeFinance = req.user.can('finance.view');
      const money = (v) => (seeFinance ? v : 0);

      res.json({
        success: true,
        data: {
          stats: {
            active_projects: activeProjectsCount,
            finished_projects: finishedProjectsCount,
            total_projects: totalProjectsCount,
            total_budget: money(totalBudget),
            total_spent: money(totalSpent),
            percent_spent: money(percentSpent),
            remaining_budget: money(remainingBudget),
            budget_status: [budgetStatusLabel, budgetStatusText, budgetStatusBg],
            critical_stock_count: criticalStock.length,
            pending_requests_count: pendingRequests,
            pending_surveys_count: pendingSurveys.length,
          },
          projects: seeFinance ? projects : projects.map((p) => ({ ...p, budget: 0, spent: 0, contract_value: 0 })),
          categoriesData: seeFinance ? categoriesData : [],
          pendingSurveys,
          criticalStock,
          recentActivities: seeFinance ? recentActivities : [],
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
