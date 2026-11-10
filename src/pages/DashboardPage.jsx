import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';
import { KPISkeleton, CardSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { DonutExpenseChart } from '../components/dashboard/DonutExpenseChart';
import { ProjectComparisonChart } from '../components/dashboard/ProjectComparisonChart';
import { ActivityMonitoringFeed } from '../components/dashboard/ActivityMonitoringFeed';
import { formatRupiah } from '../utils/formatters';

export const DashboardPage = () => {
  const { user, can } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [projectTab, setProjectTab] = useState('visual');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await dashboardService.getSummary(user?.role || 'owner');
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      if (!silent) setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-slate-200 rounded-2xl animate-pulse"></div>
        <KPISkeleton />
        <CardSkeleton count={2} />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => loadData(false)} title="Gagal Memuat Dashboard SIMPRO" />;
  }

  const { stats, projects, categoriesData, pendingSurveys, recentActivities } = dashboardData;
  const isExecutive = can('finance.view');
  const greeting = getGreeting();
  const totalExpenses = categoriesData ? categoriesData.reduce((acc, curr) => acc + curr.total, 0) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {greeting}, {user?.name}
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Ringkasan kondisi proyek, grafik alokasi anggaran, dan pemantauan aktivitas staf CV. Arthamas Graha.
        </p>
      </div>

      {isExecutive && (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Akses Cepat Eksekutif">
          <Link
            to="/reports"
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-blue-400 hover:bg-blue-50/40 group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-800 group-hover:bg-blue-800 group-hover:text-white transition">
                <i className="fa-solid fa-file-invoice text-lg"></i>
              </span>
              <div>
                <p className="text-sm font-extrabold text-slate-900">Laporan Proyek</p>
                <p className="text-xs font-medium text-slate-500">Rekapitulasi fisik & cetak</p>
              </div>
            </div>
          </Link>

          <Link
            to="/finance"
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-blue-400 hover:bg-blue-50/40 group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-800 group-hover:bg-blue-800 group-hover:text-white transition">
                <i className="fa-solid fa-chart-line text-lg"></i>
              </span>
              <div>
                <p className="text-sm font-extrabold text-slate-900">Keuangan</p>
                <p className="text-xs font-medium text-slate-500">Pantau arus kas & RAB</p>
              </div>
            </div>
          </Link>

          <Link
            to="/site-surveys/approvals"
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-blue-400 hover:bg-blue-50/40 group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-800 group-hover:bg-blue-800 group-hover:text-white transition">
                <i className="fa-solid fa-clipboard-check text-lg"></i>
              </span>
              <div>
                <p className="text-sm font-extrabold text-slate-900">Validasi Survei</p>
                <p className="text-xs font-medium text-slate-500">{pendingSurveys?.length || 0} menunggu tinjauan</p>
              </div>
            </div>
          </Link>

          <Link
            to="/users"
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-blue-400 hover:bg-blue-50/40 group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-800 group-hover:bg-blue-800 group-hover:text-white transition">
                <i className="fa-solid fa-users-gear text-lg"></i>
              </span>
              <div>
                <p className="text-sm font-extrabold text-slate-900">Pengguna</p>
                <p className="text-xs font-medium text-slate-500">Kelola akun dan akses staf</p>
              </div>
            </div>
          </Link>
        </section>
      )}

      <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Statistik Utama">
        <Link
          to="/projects?status=aktif"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:bg-blue-50/30"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Proyek Aktif</p>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-xs">
              <i className="fa-solid fa-person-digging"></i>
            </span>
          </div>
          <p className="mt-2 text-3xl font-display font-extrabold text-slate-900">{stats.active_projects}</p>
          <p className="mt-1 text-xs font-semibold text-blue-800">Proyek sedang berjalan di lapangan</p>
        </Link>

        <Link
          to="/projects?status=selesai"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:bg-blue-50/30"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Proyek Selesai</p>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs">
              <i className="fa-solid fa-circle-check"></i>
            </span>
          </div>
          <p className="mt-2 text-3xl font-display font-extrabold text-slate-900">{stats.finished_projects}</p>
          <p className="mt-1 text-xs font-semibold text-emerald-700">Telah serah terima (BAST)</p>
        </Link>

        {isExecutive ? (
          <Link
            to="/finance"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:bg-blue-50/30"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pagu RAB</p>
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs">
                <i className="fa-solid fa-wallet"></i>
              </span>
            </div>
            <p className="mt-2 text-xl font-display font-extrabold text-slate-900 truncate">
              {formatRupiah(stats.total_budget)}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Total komitmen portofolio</p>
          </Link>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Proyek</p>
              <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs">
                <i className="fa-solid fa-folder-closed"></i>
              </span>
            </div>
            <p className="mt-2 text-3xl font-display font-extrabold text-slate-900">{stats.total_projects}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Master database proyek</p>
          </div>
        )}

        {isExecutive ? (
          <Link
            to="/finance"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:bg-blue-50/30"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Realisasi Biaya Kas</p>
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs">
                <i className="fa-solid fa-receipt"></i>
              </span>
            </div>
            <p className="mt-2 text-xl font-display font-extrabold text-slate-900 truncate">
              {formatRupiah(stats.total_spent)}
            </p>
            <p className={`mt-1 text-xs font-semibold ${stats.budget_status[1]}`}>
              {stats.percent_spent.toFixed(1)}% serapan ({stats.budget_status[0]})
            </p>
          </Link>
        ) : (
          <Link
            to="/material-requests"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:bg-blue-50/30"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pengajuan Material</p>
              <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-xs">
                <i className="fa-solid fa-truck-ramp-box"></i>
              </span>
            </div>
            <p className="mt-2 text-3xl font-display font-extrabold text-slate-900">{stats.pending_requests_count}</p>
            <p className="mt-1 text-xs font-semibold text-amber-700">Menunggu persetujuan pengadaan</p>
          </Link>
        )}
      </section>

      {isExecutive && (
        <section
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
          aria-label="Status Anggaran Proyek"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-display">Status Anggaran Portofolio</h3>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Perbandingan total alokasi RAB dengan serapan realisasi biaya operasional.
              </p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${stats.budget_status[1]} bg-slate-100 border border-slate-200`}
            >
              Status: {stats.budget_status[0]}
            </span>
          </div>

          <div className="mt-4 h-3.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${stats.budget_status[2]}`}
              style={{ width: `${Math.min(stats.percent_spent, 100)}%` }}
            />
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold text-slate-600">
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block text-[11px] uppercase">Sisa Anggaran Kas</span>
              <strong
                className={stats.remaining_budget >= 0 ? 'text-emerald-700 font-display' : 'text-rose-700 font-display'}
              >
                {formatRupiah(stats.remaining_budget)}
              </strong>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block text-[11px] uppercase">Realisasi Pengeluaran</span>
              <strong className="text-slate-900 font-display">{formatRupiah(stats.total_spent)}</strong>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block text-[11px] uppercase">Pagu Total RAB</span>
              <strong className="text-slate-900 font-display">{formatRupiah(stats.total_budget)}</strong>
            </div>
          </div>
        </section>
      )}

      <div className={`grid gap-6 grid-cols-1 ${isExecutive ? 'lg:grid-cols-12' : ''}`}>
        <section
          className={`rounded-xl border border-slate-200 bg-white shadow-xs ${isExecutive ? 'lg:col-span-7' : 'w-full'} flex flex-col justify-between overflow-hidden`}
        >
          <div>
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display">Progres Proyek Lapangan</h3>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Capaian fisik aktual dan serapan biaya tiap proyek.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
                  <button
                    onClick={() => setProjectTab('visual')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold transition ${
                      projectTab === 'visual'
                        ? 'bg-white text-blue-800 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <i className="fa-solid fa-chart-simple text-[10px]"></i>
                    <span>Grafik Visual</span>
                  </button>
                  <button
                    onClick={() => setProjectTab('table')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold transition ${
                      projectTab === 'table'
                        ? 'bg-white text-blue-800 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <i className="fa-solid fa-table-list text-[10px]"></i>
                    <span>Tabel Rinci</span>
                  </button>
                </div>

                <Link
                  to="/projects"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-900 transition shadow-2xs"
                >
                  <span>Lihat Proyek</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </Link>
              </div>
            </div>

            {projectTab === 'visual' ? (
              <ProjectComparisonChart projects={projects} isExecutive={isExecutive} />
            ) : (
              <div>
                <div className="divide-y divide-slate-100 sm:hidden">
                  {projects.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">Belum ada proyek aktif yang tercatat.</div>
                  ) : (
                    projects.map((p) => {
                      const spendingPct = p.budget > 0 ? (p.spent / p.budget) * 100 : 0;
                      const progressColor =
                        p.progress >= 80 ? 'bg-emerald-600' : p.progress >= 40 ? 'bg-blue-700' : 'bg-amber-500';
                      return (
                        <Link key={p.id} to={`/projects/${p.id}`} className="block p-4 hover:bg-slate-50 transition">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-extrabold text-slate-900">{p.name}</p>
                              <p className="text-xs font-medium text-slate-400 mt-0.5">
                                {p.project_code} • {p.location}
                              </p>
                            </div>
                            <span className="text-sm font-extrabold text-slate-900 font-display">{p.progress}%</span>
                          </div>

                          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${progressColor}`}
                              style={{ width: `${Math.min(p.progress, 100)}%` }}
                            />
                          </div>

                          {isExecutive && (
                            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
                              <span>RAB: Rp {(p.budget / 1000000000).toFixed(1)} M</span>
                              <span>Biaya {spendingPct.toFixed(1)}%</span>
                            </div>
                          )}
                        </Link>
                      );
                    })
                  )}
                </div>

                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Nama Proyek</th>
                        <th className="px-3 py-3 text-right">Progres Fisik</th>
                        {isExecutive && (
                          <>
                            <th className="px-3 py-3 text-right">Pagu RAB</th>
                            <th className="px-3 py-3 text-right">Realisasi</th>
                          </>
                        )}
                        <th className="px-4 py-3 min-w-[120px]">Indikator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {projects.length === 0 ? (
                        <tr>
                          <td colSpan={isExecutive ? 5 : 3} className="px-4 py-8 text-center text-slate-400 text-xs">
                            Belum ada proyek aktif yang tercatat.
                          </td>
                        </tr>
                      ) : (
                        projects.map((p) => {
                          const spendingPct = p.budget > 0 ? (p.spent / p.budget) * 100 : 0;
                          const progressColor =
                            p.progress >= 80 ? 'bg-emerald-600' : p.progress >= 40 ? 'bg-blue-700' : 'bg-amber-500';
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/80 transition">
                              <td className="px-4 py-3.5 max-w-[200px]">
                                <Link
                                  to={`/projects/${p.id}`}
                                  className="font-extrabold text-slate-900 hover:text-blue-800 truncate block"
                                >
                                  {p.name}
                                </Link>
                                <span className="text-[10.5px] text-slate-400 block">
                                  {p.project_code} • {p.location}
                                </span>
                              </td>
                              <td className="px-3 py-3.5 text-right font-display font-extrabold text-slate-900 text-sm whitespace-nowrap">
                                {p.progress}%
                              </td>
                              {isExecutive && (
                                <>
                                  <td className="px-3 py-3.5 text-right font-medium text-slate-700 whitespace-nowrap">
                                    {formatRupiah(p.budget)}
                                  </td>
                                  <td className="px-3 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                                    {formatRupiah(p.spent)}
                                  </td>
                                </>
                              )}
                              <td className="px-4 py-3.5">
                                <div className="mb-1 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                                  <span>Fisik</span>
                                  {isExecutive && <span>{spendingPct.toFixed(0)}% Biaya</span>}
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className={`h-full rounded-full ${progressColor}`}
                                    style={{ width: `${Math.min(p.progress, 100)}%` }}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>

        {isExecutive && (
          <div className="space-y-6 lg:col-span-5">
            <section
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
              aria-label="Distribusi Pengeluaran"
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-display">Kategori Pengeluaran</h3>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    Distribusi realisasi biaya berdasarkan pos operasional.
                  </p>
                </div>
                <Link
                  to="/finance"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-800 hover:text-blue-900"
                >
                  <span>Detail Kas</span>
                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </Link>
              </div>

              <div className="mt-3">
                <DonutExpenseChart categoriesData={categoriesData || []} totalExpenses={totalExpenses} />
              </div>
            </section>

            <section
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
              aria-label="Persetujuan Survei"
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-display">Persetujuan Survei Lokasi</h3>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    Survei lapangan yang menunggu tinjauan Owner / Direksi.
                  </p>
                </div>
                <Link
                  to="/site-surveys/approvals"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-800 hover:text-blue-900"
                >
                  <span>Lihat Semua</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {pendingSurveys && pendingSurveys.length > 0 ? (
                  pendingSurveys.map((survey) => (
                    <div
                      key={survey.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 hover:border-blue-300 transition"
                    >
                      <p className="text-sm font-extrabold text-slate-900 truncate">{survey.project_name}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Disurvei oleh: <strong className="text-slate-700">{survey.user_name}</strong> • {survey.date}
                      </p>
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">Luas: {survey.area_size} m²</span>
                        <Link
                          to="/site-surveys/approvals"
                          className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-800 text-white text-xs font-bold hover:bg-blue-900 shadow-2xs"
                        >
                          Tinjau Survei
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs font-medium text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    <i className="fa-solid fa-circle-check text-2xl text-emerald-500 mx-auto mb-1.5 block"></i>
                    Semua survei lokasi telah ditinjau dan divalidasi.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      <ActivityMonitoringFeed
        activities={recentActivities || []}
        onRefresh={() => loadData(true)}
        isRefreshing={refreshing}
      />
    </div>
  );
};

export default DashboardPage;
