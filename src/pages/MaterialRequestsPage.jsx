import React, { useState, useEffect } from 'react';
import { materialRequestService, projectService, materialService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Modal } from '../components/common/Modal';
import { Can } from '../components/common/Can';
import { formatRupiah } from '../utils/formatters';

export const MaterialRequestsPage = () => {
  const { user, can } = useAuth();
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    project_id: '',
    material_id: '',
    quantity: '',
    notes: '',
    requested_by: user?.name || 'Pengawas Lapangan',
  });

  const [formErrors, setFormErrors] = useState({});

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqRes, projRes, matRes] = await Promise.all([
        materialRequestService.getAll({ status: statusFilter }),
        projectService.getAll({ status: 'aktif' }),
        materialService.getAll(),
      ]);
      if (reqRes.success) setRequests(reqRes.data);
      if (projRes.success) {
        setProjects(projRes.data);
        if (projRes.data.length > 0 && !formData.project_id) {
          setFormData((prev) => ({ ...prev, project_id: projRes.data[0].id }));
        }
      }
      if (matRes.success) {
        setMaterials(matRes.data);
        if (matRes.data.length > 0 && !formData.material_id) {
          setFormData((prev) => ({ ...prev, material_id: matRes.data[0].id }));
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const validate = () => {
    const errs = {};
    if (!formData.project_id) errs.project_id = 'Pilih proyek penerima';
    if (!formData.material_id) errs.material_id = 'Pilih material';
    if (!formData.quantity || isNaN(formData.quantity) || formData.quantity <= 0) {
      errs.quantity = 'Kuantitas harus berupa angka lebih besar dari 0';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await materialRequestService.create({
        ...formData,
        requested_by: user?.name || 'Pengawas Lapangan',
      });
      if (res.success) {
        setFeedback({ type: 'success', message: 'Pengajuan material berhasil dibuat!' });
        setIsModalOpen(false);
        setFormData((prev) => ({ ...prev, quantity: '', notes: '' }));
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status, approver) => {
    try {
      const res = await materialRequestService.updateStatus(id, {
        status,
        approved_by: approver || user?.name || 'Owner',
      });
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Status pengajuan #${id} berhasil diubah menjadi ${status}!`,
        });
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const deliveredCount = requests.filter((r) => r.status === 'delivered').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
            Pengajuan Material Proyek
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Alur permohonan material oleh pengawas, persetujuan Owner, hingga serah terima surat jalan (DO) di proyek.
          </p>
        </div>

        <Can permission="material_requests.create">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition flex items-center self-start sm:self-auto"
          >
            <i className="fa-solid fa-plus mr-1.5 text-xs"></i>
            <span>Buat Pengajuan Material</span>
          </button>
        </Can>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center">
            <i
              className={`fa-solid ${feedback.type === 'success' ? 'fa-circle-check text-emerald-600' : 'fa-circle-exclamation text-rose-600'} mr-2`}
            ></i>
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Total Pengajuan</p>
          <p className="mt-1.5 text-2xl font-display font-extrabold text-slate-900">{requests.length}</p>
          <p className="mt-1 text-xs text-slate-500 font-semibold">Seluruh siklus pengadaan</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Menunggu ACC Owner</p>
          <p className="mt-1.5 text-2xl font-display font-extrabold text-amber-700">{pendingCount}</p>
          <p className="mt-1 text-xs text-amber-700 font-semibold">Verifikasi anggaran</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Disetujui / Di Jalan</p>
          <p className="mt-1.5 text-2xl font-display font-extrabold text-blue-800">{approvedCount}</p>
          <p className="mt-1 text-xs text-blue-700 font-semibold">Proses kirim distributor</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Diterima di Proyek</p>
          <p className="mt-1.5 text-2xl font-display font-extrabold text-emerald-700">{deliveredCount}</p>
          <p className="mt-1 text-xs text-emerald-700 font-semibold">Stok terpotong dari gudang</p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'semua', label: 'Semua Status' },
          { key: 'pending', label: 'Menunggu ACC' },
          { key: 'approved', label: 'Disetujui / Pengiriman' },
          { key: 'delivered', label: 'Selesai Diterima' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === tab.key
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Proyek & Tanggal</th>
                  <th className="px-4 py-3.5">Material & Kuantitas</th>
                  <th className="px-4 py-3.5 text-right">Perkiraan Biaya</th>
                  <th className="px-4 py-3.5">Pemohon / Catatan</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.length > 0 ? (
                  requests.map((r) => {
                    const isPending = r.status === 'pending';
                    const isApproved = r.status === 'approved';
                    const isDelivered = r.status === 'delivered';

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4">
                          <p className="font-extrabold text-slate-900 text-sm">{r.project_name}</p>
                          <span className="text-[10.5px] text-slate-400">Tgl Pengajuan: {r.date}</span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-slate-900">{r.material_name}</p>
                          <span className="font-display font-extrabold text-blue-800 text-xs">
                            {r.quantity} {r.material_unit}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <p className="font-extrabold text-slate-900 font-display">
                            {formatRupiah(r.total_price || r.quantity * (r.price_per_unit || 50000))}
                          </p>
                          <span className="text-[10px] text-slate-400">@ {formatRupiah(r.price_per_unit || 0)}</span>
                        </td>
                        <td className="px-4 py-4 max-w-xs">
                          <p className="font-semibold text-slate-800">{r.requested_by}</p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{r.notes}</p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isDelivered
                                ? 'bg-emerald-100 text-emerald-800'
                                : isApproved
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isDelivered ? 'Diterima di Proyek' : isApproved ? 'Disetujui Owner' : 'Menunggu ACC'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {isPending && can('material_requests.approve') && (
                            <button
                              onClick={() => handleStatusUpdate(r.id, 'approved', user?.name)}
                              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-xs transition flex items-center gap-1 ml-auto"
                            >
                              <i className="fa-solid fa-check text-xs"></i>
                              <span>Setujui (ACC)</span>
                            </button>
                          )}

                          {isApproved && (
                            <button
                              onClick={() => handleStatusUpdate(r.id, 'delivered')}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-xs transition flex items-center gap-1 ml-auto"
                            >
                              <i className="fa-solid fa-box-open text-xs"></i>
                              <span>Konfirmasi Terima</span>
                            </button>
                          )}

                          {isDelivered && <span className="text-[11px] font-bold text-slate-400">Selesai</span>}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                      Tidak ada pengajuan material pada filter ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Form Pengajuan Material Proyek">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Proyek Penerima <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Material Gudang <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.material_id}
                onChange={(e) => setFormData({ ...formData, material_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (Tersedia: {m.stock} {m.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kuantitas yang Diajukan <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Contoh: 150"
                className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                  formErrors.quantity ? 'border-rose-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-600`}
              />
              {formErrors.quantity && <p className="text-[11px] text-rose-600 mt-1">{formErrors.quantity}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Kebutuhan / Zona Pengecoran</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Contoh: Untuk pengecoran balok dan plat lantai 4 zona C"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold bg-blue-800 text-white hover:bg-blue-900 rounded-xl shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Mengirim...' : 'Kirim Pengajuan ke Owner'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaterialRequestsPage;
