import React, { useState } from 'react';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ClientModal } from '../components/clients/ClientModal';
import { useClients } from '../hooks/useClients';

export const ClientsPage = () => {
  const {
    clients,
    loading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    feedback,
    setFeedback,
    reload,
    createClient,
    deleteClient,
    metrics,
  } = useClients();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async (formData) => {
    setSubmitting(true);
    try {
      const res = await createClient(formData);
      return res.success;
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    setDeleting(true);
    try {
      await deleteClient(clientToDelete.id, clientToDelete.name);
      setClientToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">Klien & Mitra Rekanan</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Kelola data kontak institusi pemberi kerja, instansi kedinasan, dan mitra CV. Arthamas Graha.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-xl transition shadow-xs btn-press self-start sm:self-auto cursor-pointer"
        >
          <i className="fa-solid fa-user-plus text-xs" aria-hidden="true"></i>
          <span>Tambah Klien Baru</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
          role="status"
        >
          <div className="flex items-center gap-2">
            <i
              className={`fa-solid ${
                feedback.type === 'success' ? 'fa-circle-check text-emerald-600' : 'fa-circle-exclamation text-rose-600'
              } text-sm`}
              aria-hidden="true"
            ></i>
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 transition p-1"
            aria-label="Tutup notifikasi"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Klien Terdaftar</p>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center text-xs">
              <i className="fa-regular fa-building" aria-hidden="true"></i>
            </span>
          </div>
          <p className="mt-2 text-2xl font-display font-extrabold text-slate-900">{metrics.total}</p>
          <p className="mt-1 text-xs text-blue-800 font-semibold">Mitra aktif dalam basis data</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sektor Swasta / Developer</p>
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs">
              <i className="fa-solid fa-city" aria-hidden="true"></i>
            </span>
          </div>
          <p className="mt-2 text-2xl font-display font-extrabold text-slate-900">{metrics.totalSwasta}</p>
          <p className="mt-1 text-xs text-slate-500 font-semibold">Proyek komersial & residensial</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Instansi Pemerintah & BUMN</p>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs">
              <i className="fa-solid fa-landmark" aria-hidden="true"></i>
            </span>
          </div>
          <p className="mt-2 text-2xl font-display font-extrabold text-slate-900">
            {metrics.totalPemerintah + metrics.totalBUMN}
          </p>
          <p className="mt-1 text-xs text-emerald-700 font-semibold">Tender dinas, APBN & BUMN</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama klien, instansi, atau PIC..."
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700 focus:bg-white focus:outline-none transition"
            aria-label="Cari nama klien, instansi, atau PIC"
          />
          <i
            className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"
            aria-hidden="true"
          ></i>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              aria-label="Hapus pencarian"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          )}
        </div>

        <div
          className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0"
          role="tablist"
          aria-label="Kategori Mitra"
        >
          {['semua', 'Swasta', 'Pemerintah', 'BUMN'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                category === cat ? 'bg-blue-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'semua' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Nama Instansi & Kategori</th>
                  <th className="px-4 py-3.5">PIC / Penanggung Jawab</th>
                  <th className="px-4 py-3.5">Kontak & Alamat</th>
                  <th className="px-3 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.length > 0 ? (
                  clients.map((c) => {
                    const categoryBadgeClass =
                      c.category === 'Pemerintah'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : c.category === 'BUMN'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200';

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold shrink-0 border border-blue-100">
                              <i className="fa-regular fa-building text-base" aria-hidden="true"></i>
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-900 text-sm truncate">{c.name}</p>
                              <span
                                className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold border ${categoryBadgeClass}`}
                              >
                                {c.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-bold text-slate-900">{c.contact_person}</p>
                          <p className="text-slate-400 text-[11px]">PIC Resmi Rekanan</p>
                        </td>

                        <td className="px-4 py-4 space-y-1 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <i className="fa-solid fa-phone text-slate-400 text-xs w-4 shrink-0" aria-hidden="true"></i>
                            <span className="font-mono font-medium">{c.phone}</span>
                          </div>
                          {c.email && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <i
                                className="fa-regular fa-envelope text-slate-400 text-xs w-4 shrink-0"
                                aria-hidden="true"
                              ></i>
                              <span className="truncate max-w-[200px]">{c.email}</span>
                            </div>
                          )}
                          {c.address && (
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <i
                                className="fa-solid fa-location-dot text-slate-300 text-xs w-4 shrink-0"
                                aria-hidden="true"
                              ></i>
                              <span className="truncate max-w-[220px]">{c.address}</span>
                            </div>
                          )}
                        </td>

                        <td className="px-3 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <i
                              className="fa-solid fa-circle-check text-[9px] mr-1 text-emerald-600"
                              aria-hidden="true"
                            ></i>
                            <span>{c.status || 'Aktif'}</span>
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => setClientToDelete(c)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title={`Hapus Klien ${c.name}`}
                            aria-label={`Hapus Klien ${c.name}`}
                          >
                            <i className="fa-regular fa-trash-can text-sm" aria-hidden="true"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <i className="fa-regular fa-address-book text-xl" aria-hidden="true"></i>
                      </div>
                      <p className="text-slate-700 font-bold text-sm">Tidak ada mitra/klien yang ditemukan</p>
                      <p className="text-slate-400 text-xs mt-1">
                        {search
                          ? `Tidak ditemukan klien yang cocok dengan "${search}".`
                          : 'Belum ada data klien yang tersimpan di sistem.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-800 text-white text-xs font-bold hover:bg-blue-900 shadow-2xs transition cursor-pointer"
                      >
                        <i className="fa-solid fa-plus text-xs" aria-hidden="true"></i>
                        <span>Tambah Klien Pertama</span>
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        submitting={submitting}
      />

      <ConfirmDialog
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Klien"
        message={`Apakah Anda yakin ingin menghapus data klien "${clientToDelete?.name}" dari sistem? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Klien"
        confirmVariant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default ClientsPage;
