import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchProjectWeather } from '../../services/weatherApi';
import { notificationService } from '../../services/api';

export const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const [weather, setWeather] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/clients')) return 'Klien & Vendor';
    if (pathname === '/site-surveys') return 'Survei Lokasi';
    if (pathname.startsWith('/site-surveys/approvals')) return 'Validasi Survei';
    if (pathname.startsWith('/projects') || pathname.startsWith('/proyek')) return 'Daftar Proyek';
    if (pathname.startsWith('/progress') || pathname.startsWith('/lapor-progres')) return 'Laporan Pengerjaan Proyek';
    if (pathname === '/materials' || pathname === '/logistik') return 'Logistik & Material';
    if (pathname.startsWith('/material-requests')) return 'Pengajuan Material';
    if (pathname.startsWith('/equipments')) return 'Alat Berat & Aset';
    if (pathname.startsWith('/finance') || pathname.startsWith('/keuangan')) return 'Keuangan Proyek';
    if (pathname.startsWith('/documents')) return 'Dokumen Proyek';
    if (pathname.startsWith('/reports')) return 'Generate Laporan';
    if (pathname.startsWith('/users')) return 'Kelola User';
    if (pathname.startsWith('/settings')) return 'Pengaturan Sistem';
    if (pathname.startsWith('/notifikasi')) return 'Pusat Notifikasi';
    return 'SIMPRO';
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      };
      const formatted = new Intl.DateTimeFormat('id-ID', options).format(now).replace(/\./g, ':');
      setCurrentTime(`${formatted} WIB`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchProjectWeather()
      .then((res) => {
        if (res && res.data) setWeather(res.data);
      })
      .catch(() => {});

    notificationService
      .getAll()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const unread = res.data.filter((n) => !n.dibaca).length;
          setUnreadCount(unread);
        }
      })
      .catch(() => {});
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center min-w-0 flex-1">
            <button
              onClick={onToggleSidebar}
              type="button"
              className="flex-shrink-0 text-slate-500 hover:text-slate-800 mr-3 p-2 rounded-lg hover:bg-slate-100 focus:outline-none transition-colors"
              aria-label="Toggle navigasi sidebar"
            >
              <i className="fa-solid fa-bars text-lg"></i>
            </button>

            <h1 className="text-base md:text-xl font-display font-bold text-blue-800 tracking-tight truncate">
              {getPageTitle(location.pathname)}
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 mx-4">
            <i className="fa-solid fa-cloud-sun text-amber-500 text-sm"></i>
            <span className="font-medium text-slate-500">Cuaca Proyek:</span>
            {weather ? (
              <span className="font-bold text-slate-800">
                {weather.temperature}°C • {weather.condition}
              </span>
            ) : (
              <span className="text-slate-400">Memuat BMKG...</span>
            )}
          </div>

          <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
            <div className="hidden lg:flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-xs text-slate-500 font-medium">
              <i className="fa-regular fa-clock mr-1.5 text-slate-400"></i>
              <span>{currentTime || 'Memuat waktu...'}</span>
            </div>

            <Link
              to="/notifikasi"
              className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors relative"
              title="Notifikasi"
            >
              <i
                className={`${unreadCount > 0 ? 'fa-solid fa-bell text-amber-500 animate-bell-ring' : 'fa-regular fa-bell text-slate-500'} text-base md:text-lg`}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px]">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-bold rounded-full items-center justify-center ring-2 ring-white shadow-xs leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </span>
              )}
            </Link>

            <div className="flex items-center space-x-2.5 pl-2 md:pl-3 border-l border-slate-200">
              <div
                className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-xl bg-blue-800 text-white font-bold text-sm shadow-2xs"
                title={`${user?.name} (${user?.roleLabel || user?.role})`}
              >
                {user?.avatar || (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
              </div>
              <div className="hidden lg:flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 truncate leading-tight">{user?.name}</span>
                <span className="text-[10px] text-slate-400 font-medium capitalize truncate">
                  {user?.roleLabel || user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
