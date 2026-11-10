import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { surveyService, materialRequestService } from '../../services/api';

export const Sidebar = ({ isOpen, onClose }) => {
  const { can, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingSurveys, setPendingSurveys] = useState(0);
  const [pendingMaterialRequests, setPendingMaterialRequests] = useState(0);

  useEffect(() => {
    surveyService
      .getAll({ status: 'pending' })
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setPendingSurveys(res.data.length);
        }
      })
      .catch(() => {});

    materialRequestService
      .getAll({ status: 'pending' })
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setPendingMaterialRequests(res.data.length);
        }
      })
      .catch(() => {});
  }, []);

  const allModules = [
    {
      name: 'Dashboard',
      path: '/',
      iconClass: 'fa-solid fa-chart-pie',
      permission: 'dashboard.view',
    },
    {
      name: 'Klien & Vendor',
      path: '/clients',
      iconClass: 'fa-solid fa-handshake',
      permission: 'clients.view',
    },
    {
      name: 'Survei Lokasi',
      path: '/site-surveys',
      iconClass: 'fa-solid fa-map-location-dot',
      permission: 'site-surveys.view',
    },
    {
      name: 'Validasi Survei',
      path: '/site-surveys/approvals',
      iconClass: 'fa-solid fa-file-circle-check',
      permission: 'site-surveys.approve',
      badge: pendingSurveys > 0 ? pendingSurveys : null,
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
    },
    {
      name: 'Daftar Proyek',
      path: '/projects',
      iconClass: 'fa-solid fa-list-check',
      permission: 'projects.view',
    },
    {
      name: 'Laporan Pengerjaan Proyek',
      path: '/progress',
      iconClass: 'fa-solid fa-bars-progress',
      permission: 'progress.view',
    },
    {
      name: 'Logistik & Material',
      path: '/materials',
      iconClass: 'fa-solid fa-boxes-stacked',
      permission: 'materials.view',
    },
    {
      name: 'Pengajuan Material',
      path: '/material-requests',
      iconClass: 'fa-solid fa-clipboard-list',
      permission: 'material_requests.view',
      badge: pendingMaterialRequests > 0 ? pendingMaterialRequests : null,
      badgeColor: 'bg-blue-100 text-blue-900 border border-blue-300',
    },
    {
      name: 'Alat Berat & Aset',
      path: '/equipments',
      iconClass: 'fa-solid fa-truck-pickup',
      permission: 'equipments.view',
    },
    {
      name: 'Keuangan Proyek',
      path: '/finance',
      iconClass: 'fa-solid fa-file-invoice-dollar',
      permission: 'finance.view',
    },
    {
      name: 'Dokumen Proyek',
      path: '/documents',
      iconClass: 'fa-solid fa-folder-open',
      permission: 'documents.view',
    },
    {
      name: 'Generate Laporan',
      path: '/reports',
      iconClass: 'fa-solid fa-print',
      permission: 'reports.view',
    },
    {
      name: 'Kelola User',
      path: '/users',
      iconClass: 'fa-solid fa-users-gear',
      permission: 'users.view',
    },
    {
      name: 'Pengaturan Sistem',
      path: '/settings',
      iconClass: 'fa-solid fa-gears',
      permission: 'settings.view',
    },
  ];

  const accessibleModules = allModules.filter((m) => can(m.permission));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 h-full bg-white border-r border-slate-200 shadow-sm transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="Sidebar Navigasi SIMPRO"
      >
        <div className="flex items-center justify-between px-5 py-5 bg-white border-b border-slate-200">
          <NavLink
            to="/"
            className="flex items-center space-x-3.5 min-w-0"
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
          >
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs overflow-hidden p-1">
              <img src="/icon.png" alt="SIMPRO Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-display font-black tracking-widest text-slate-900 text-lg uppercase leading-tight truncate">
                SIMPRO
              </span>
              <span className="text-[9.5px] text-blue-800 font-bold uppercase mt-0.5 truncate tracking-wide">
                CV. ARTHAMAS GRAHA
              </span>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Tutup sidebar"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" aria-label="Daftar Modul SIMPRO">
          {accessibleModules.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-800 text-white font-semibold shadow-md shadow-blue-800/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-blue-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center min-w-0">
                    <i
                      className={`${item.iconClass} w-6 text-center text-base ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-700'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="ml-2 text-xs font-medium truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`ml-2 px-2 py-0.5 text-[10.5px] font-black rounded-full shrink-0 ${
                        isActive
                          ? 'bg-white text-blue-900'
                          : item.badgeColor || 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-rose-600 hover:text-white rounded-xl transition duration-150 border border-slate-200 shadow-2xs group"
          >
            <i className="fa-solid fa-right-from-bracket mr-2 text-slate-500 group-hover:text-white text-sm"></i>
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
