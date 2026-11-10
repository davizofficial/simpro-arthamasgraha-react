import React, { useState, useMemo } from 'react';

export const ActivityMonitoringFeed = ({ activities = [], onRefresh, isRefreshing = false }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const now = new Date();
      const date = new Date(dateStr.replace(' ', 'T'));
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSec < 60) return 'Baru saja';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} mnt lalu`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours} jam lalu`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Kemarin';
      if (diffDays < 7) return `${diffDays} hari lalu`;
      return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const formatExactTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr.replace(' ', 'T'));
      return (
        date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }) + ' WIB'
      );
    } catch {
      return dateStr;
    }
  };

  const categorizeActivity = (act) => {
    const text = `${act.action || ''} ${act.target || ''}`.toLowerCase();

    if (text.includes('login')) {
      return {
        category: 'session',
        badge: 'Login Sesi',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: 'fa-solid fa-right-to-bracket',
        iconBg: 'bg-emerald-100 text-emerald-700 border-emerald-300',
        avatarBg: 'bg-emerald-600',
      };
    }
    if (text.includes('logout')) {
      return {
        category: 'session',
        badge: 'Logout Sesi',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        icon: 'fa-solid fa-right-from-bracket',
        iconBg: 'bg-slate-100 text-slate-500 border-slate-300',
        avatarBg: 'bg-slate-500',
      };
    }
    if (text.includes('survei')) {
      return {
        category: 'project',
        badge: 'Survei Lapangan',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: 'fa-solid fa-map-location-dot',
        iconBg: 'bg-amber-100 text-amber-700 border-amber-300',
        avatarBg: 'bg-amber-600',
      };
    }
    if (text.includes('progres') || text.includes('laporan')) {
      return {
        category: 'project',
        badge: 'Lapor Progres',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: 'fa-solid fa-bars-progress',
        iconBg: 'bg-blue-100 text-blue-700 border-blue-300',
        avatarBg: 'bg-blue-600',
      };
    }
    if (text.includes('material') || text.includes('pengadaan')) {
      return {
        category: 'logistic',
        badge: 'Logistik Material',
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: 'fa-solid fa-boxes-stacked',
        iconBg: 'bg-indigo-100 text-indigo-700 border-indigo-300',
        avatarBg: 'bg-indigo-600',
      };
    }
    if (text.includes('alat') || text.includes('armada')) {
      return {
        category: 'logistic',
        badge: 'Aset Alat Berat',
        badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: 'fa-solid fa-truck-pickup',
        iconBg: 'bg-orange-100 text-orange-700 border-orange-300',
        avatarBg: 'bg-orange-600',
      };
    }
    if (text.includes('kas') || text.includes('upah') || text.includes('transaksi') || text.includes('pengeluaran')) {
      return {
        category: 'finance',
        badge: 'Keuangan & Kas',
        badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
        icon: 'fa-solid fa-file-invoice-dollar',
        iconBg: 'bg-teal-100 text-teal-700 border-teal-300',
        avatarBg: 'bg-teal-600',
      };
    }
    if (text.includes('validasi') || text.includes('acc') || text.includes('revisi')) {
      return {
        category: 'project',
        badge: 'Validasi Direksi',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: 'fa-solid fa-clipboard-check',
        iconBg: 'bg-purple-100 text-purple-700 border-purple-300',
        avatarBg: 'bg-purple-600',
      };
    }
    if (text.includes('dokumen') || text.includes('ded') || text.includes('as-built')) {
      return {
        category: 'finance',
        badge: 'Dokumen Teknis',
        badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
        icon: 'fa-solid fa-folder-open',
        iconBg: 'bg-sky-100 text-sky-700 border-sky-300',
        avatarBg: 'bg-sky-600',
      };
    }

    return {
      category: 'other',
      badge: 'Operasional',
      badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
      icon: 'fa-solid fa-gear',
      iconBg: 'bg-slate-100 text-slate-600 border-slate-300',
      avatarBg: 'bg-slate-600',
    };
  };

  const getInitials = (name = '') => {
    return (
      name
        .replace(/[^a-zA-Z\s]/g, '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'ST'
    );
  };

  const getRoleHint = (act) => {
    const user = (act.user || '').toLowerCase();
    const target = (act.target || '').toLowerCase();

    if (user.includes('owner') || user.includes('direktur')) return 'Direksi Utama';
    if (user.includes('pengawas') || user.includes('budi')) return 'Pengawas Lapangan';
    if (user.includes('logistik') || user.includes('gudang')) return 'Logistik & Gudang';
    if (user.includes('finance') || user.includes('keuangan')) return 'Keuangan & Akuntansi';
    if (user.includes('konsultan')) return 'Konsultan Pengawas';
    if (user.includes('marketing')) return 'Marketing & Klien';
    if (user.includes('admin')) return 'Administrator';

    if (target.includes('sesi') || target.includes('pengawas')) return 'Staf Lapangan';
    return 'Staf SIMPRO';
  };

  const counts = useMemo(() => {
    let session = 0;
    let project = 0;
    let logistic = 0;
    let finance = 0;

    activities.forEach((act) => {
      const meta = categorizeActivity(act);
      if (meta.category === 'session') session++;
      else if (meta.category === 'project') project++;
      else if (meta.category === 'logistic') logistic++;
      else if (meta.category === 'finance') finance++;
    });

    return {
      all: activities.length,
      session,
      project,
      logistic,
      finance,
    };
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const meta = categorizeActivity(act);

      if (activeFilter !== 'all' && meta.category !== activeFilter) {
        return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchUser = (act.user || '').toLowerCase().includes(query);
        const matchAction = (act.action || '').toLowerCase().includes(query);
        const matchTarget = (act.target || '').toLowerCase().includes(query);
        const matchBadge = meta.badge.toLowerCase().includes(query);
        return matchUser || matchAction || matchTarget || matchBadge;
      }

      return true;
    });
  }, [activities, activeFilter, searchTerm]);

  const displayedActivities = filteredActivities.slice(0, visibleCount);
  const hasMore = visibleCount < filteredActivities.length;

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden"
      aria-label="Monitoring Aktivitas Staf"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 p-5 bg-gradient-to-r from-slate-50 via-white to-blue-50/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-800 text-white shadow-2xs">
            <i className="fa-solid fa-chart-line text-base"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 font-display">Monitoring Aktivitas Akun & Staf</h3>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Feed</span>
              </span>
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Pelacakan transparan sesi login, logout, dan pengoperasian fitur oleh staf CV. Arthamas Graha.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-800 transition shadow-2xs disabled:opacity-50"
              title="Segarkan aktivitas terbaru"
            >
              <i
                className={`fa-solid fa-arrows-rotate text-xs ${isRefreshing ? 'animate-spin text-blue-800' : ''}`}
              ></i>
              <span>{isRefreshing ? 'Memuat...' : 'Segarkan'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 bg-slate-50/60 border-b border-slate-200 text-xs">
        <div className="p-3 px-4">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">Total Aktivitas</span>
          <p className="text-lg font-extrabold font-display text-slate-900 mt-0.5">
            {counts.all} <span className="text-xs font-semibold text-slate-400">tercatat</span>
          </p>
        </div>
        <div className="p-3 px-4">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">
            Sesi Login / Logout
          </span>
          <p className="text-lg font-extrabold font-display text-emerald-700 mt-0.5">
            {counts.session} <span className="text-xs font-semibold text-slate-400">riwayat</span>
          </p>
        </div>
        <div className="p-3 px-4">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">
            Survei & Lapangan
          </span>
          <p className="text-lg font-extrabold font-display text-blue-800 mt-0.5">
            {counts.project} <span className="text-xs font-semibold text-slate-400">aksi</span>
          </p>
        </div>
        <div className="p-3 px-4">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">
            Logistik & Keuangan
          </span>
          <p className="text-lg font-extrabold font-display text-indigo-700 mt-0.5">
            {counts.logistic + counts.finance} <span className="text-xs font-semibold text-slate-400">transaksi</span>
          </p>
        </div>
      </div>

      <div className="p-4 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Semua</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeFilter === 'all' ? 'bg-blue-900 text-blue-100' : 'bg-slate-200 text-slate-700'}`}
            >
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('session')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeFilter === 'session'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className="fa-solid fa-user-clock text-[10px]"></i>
            <span>Sesi (Login/Logout)</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeFilter === 'session' ? 'bg-blue-900 text-blue-100' : 'bg-slate-200 text-slate-700'}`}
            >
              {counts.session}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('project')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeFilter === 'project'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className="fa-solid fa-map-location-dot text-[10px]"></i>
            <span>Survei & Proyek</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeFilter === 'project' ? 'bg-blue-900 text-blue-100' : 'bg-slate-200 text-slate-700'}`}
            >
              {counts.project}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('logistic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeFilter === 'logistic'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className="fa-solid fa-boxes-stacked text-[10px]"></i>
            <span>Logistik & Material</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeFilter === 'logistic' ? 'bg-blue-900 text-blue-100' : 'bg-slate-200 text-slate-700'}`}
            >
              {counts.logistic}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('finance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeFilter === 'finance'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className="fa-solid fa-receipt text-[10px]"></i>
            <span>Keuangan & Dokumen</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeFilter === 'finance' ? 'bg-blue-900 text-blue-100' : 'bg-slate-200 text-slate-700'}`}
            >
              {counts.finance}
            </span>
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Cari nama staf atau aksi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {displayedActivities.length > 0 ? (
          displayedActivities.map((act) => {
            const meta = categorizeActivity(act);
            const initials = getInitials(act.user);
            const roleHint = getRoleHint(act);

            return (
              <div key={act.id} className="p-4 sm:px-5 flex items-start gap-3.5 hover:bg-slate-50/80 transition group">
                <div className="relative shrink-0 mt-0.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-2xs ${meta.avatarBg}`}
                  >
                    {initials}
                  </div>

                  <span
                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-md flex items-center justify-center text-[10px] border shadow-xs ${meta.iconBg}`}
                    title={meta.badge}
                  >
                    <i className={meta.icon}></i>
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-extrabold text-slate-900 text-sm group-hover:text-blue-800 transition">
                      {act.user}
                    </span>

                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {roleHint}
                    </span>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${meta.badgeClass}`}
                    >
                      {meta.badge}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 leading-snug">{act.action}</p>

                  {act.target && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/80 max-w-full truncate font-medium">
                        <i className="fa-solid fa-tag text-[9px] text-slate-400 shrink-0"></i>
                        <span className="truncate">{act.target}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-slate-700 block">{getRelativeTime(act.created_at)}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 hidden sm:block">
                    {formatExactTime(act.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <i className="fa-solid fa-inbox text-lg"></i>
            </div>
            <p className="text-sm font-bold text-slate-800">Tidak ada riwayat aktivitas yang sesuai</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm
                ? `Tidak ditemukan aktivitas dengan kata kunci "${searchTerm}".`
                : 'Belum ada catatan aktivitas dalam kategori yang dipilih.'}
            </p>
            {(searchTerm || activeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilter('all');
                }}
                className="mt-3 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold hover:bg-blue-100 transition"
              >
                Reset Filter Pencarian
              </button>
            )}
          </div>
        )}
      </div>

      {filteredActivities.length > 8 && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Menampilkan <strong className="text-slate-800">{displayedActivities.length}</strong> dari{' '}
            <strong className="text-slate-800">{filteredActivities.length}</strong> aktivitas
          </span>

          <div className="flex items-center gap-2">
            {hasMore ? (
              <button
                onClick={() => setVisibleCount((prev) => prev + 10)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 transition shadow-2xs"
              >
                <span>Tampilkan Lebih Banyak</span>
                <i className="fa-solid fa-chevron-down text-[10px] ml-1.5"></i>
              </button>
            ) : (
              <button
                onClick={() => setVisibleCount(8)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
              >
                <span>Tampilkan Ringkas</span>
                <i className="fa-solid fa-chevron-up text-[10px] ml-1.5"></i>
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ActivityMonitoringFeed;
