import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/api';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Badge } from '../components/common/Badge';

export const NotifikasiPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Semua');

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.getAll();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, dibaca: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const filters = ['Semua', 'Approval', 'Material', 'Logistik', 'Keuangan'];

  const filteredNotifs =
    activeFilter === 'Semua'
      ? notifications
      : notifications.filter((n) => n.tipe.toLowerCase() === activeFilter.toLowerCase());

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadNotifications} title="Gagal Memuat Notifikasi" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pusat Pemberitahuan & Approval</h1>
          <p className="text-xs text-slate-500 mt-1">
            Broadcast instruksi kantor pusat, konfirmasi approval, dan peringatan darurat
          </p>
        </div>

        <button
          onClick={handleMarkAll}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 transition"
        >
          <i className="fa-solid fa-check-double text-blue-600 text-xs"></i>
          <span>Tandai Semua Dibaca</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
              activeFilter === f
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200 p-8">
            <i className="fa-regular fa-bell text-3xl text-slate-300 mx-auto mb-2 block"></i>
            <p className="text-xs font-bold text-slate-600">Tidak ada notifikasi dalam kategori ini</p>
          </div>
        ) : (
          filteredNotifs.map((n) => {
            const isUnread = !n.dibaca;
            return (
              <div
                key={n.id}
                onClick={() => handleMarkAsRead(n.id)}
                className={`p-4 rounded-xl border transition duration-150 cursor-pointer flex items-start gap-4 ${
                  isUnread
                    ? 'bg-white border-blue-200 shadow-xs ring-1 ring-blue-50'
                    : 'bg-slate-50/70 border-slate-200/80 text-slate-600'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    n.tipe === 'approval'
                      ? 'bg-emerald-100 text-emerald-700'
                      : n.tipe === 'material'
                        ? 'bg-rose-100 text-rose-700'
                        : n.tipe === 'logistik'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {n.tipe === 'approval' && <i className="fa-solid fa-circle-check text-base"></i>}
                  {n.tipe === 'material' && <i className="fa-solid fa-triangle-exclamation text-base"></i>}
                  {n.tipe === 'logistik' && <i className="fa-solid fa-boxes-stacked text-base"></i>}
                  {n.tipe === 'keuangan' && <i className="fa-solid fa-file-invoice-dollar text-base"></i>}
                  {(n.tipe === 'sistem' || !['approval', 'material', 'logistik', 'keuangan'].includes(n.tipe)) && (
                    <i className="fa-solid fa-bell text-base"></i>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-xs font-bold truncate ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                      {n.judul}
                    </h3>
                    <span className="text-[10px] text-slate-400 shrink-0">{n.waktu}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.pesan}</p>
                </div>

                {isUnread && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-1.5" title="Belum dibaca"></span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotifikasiPage;
