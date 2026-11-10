import React, { useState, useEffect } from 'react';
import { financeService, projectService } from '../services/api';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Modal } from '../components/common/Modal';
import { Can } from '../components/common/Can';
import { formatRupiah } from '../utils/formatters';

export const FinancePage = () => {
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    project_id: '',
    category: 'material',
    description: '',
    amount: '',
    type: 'expense',
  });

  const [formErrors, setFormErrors] = useState({});

  const loadFinance = async () => {
    setLoading(true);
    setError(null);
    try {
      const [finRes, projRes] = await Promise.all([financeService.getOverview(), projectService.getAll()]);
      if (finRes.success) setData(finRes.data);
      if (projRes.success) {
        setProjects(projRes.data);
        if (projRes.data.length > 0 && !formData.project_id) {
          setFormData((prev) => ({ ...prev, project_id: projRes.data[0].id }));
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinance();
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.project_id) errs.project_id = 'Pilih proyek terkait';
    if (!formData.description.trim()) errs.description = 'Uraian transaksi wajib diisi';
    if (!formData.amount || isNaN(formData.amount) || formData.amount <= 0) {
      errs.amount = 'Nominal transaksi harus berupa angka lebih dari 0';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await financeService.createTransaction(formData);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Transaksi kas berhasil dibukukan ke sistem SIMPRO!' });
        setIsModalOpen(false);
        setFormData((prev) => ({ ...prev, description: '', amount: '' }));
        loadFinance();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-slate-200 rounded-2xl animate-pulse"></div>
        <TableSkeleton rows={6} />
      </div>
    );
  }

  if (error || !data) {
    return <ErrorMessage message={error || 'Gagal memuat keuangan'} onRetry={loadFinance} />;
  }

  const { summary, transactions, category_breakdown } = data;

  const categoryLabels = {
    material: 'Material & Bahan',
    upah: 'Upah Tenaga Kerja',
    sewa_alat: 'Sewa Alat Berat',
    operasional: 'Operasional Lapangan',
    subkon: 'Pekerjaan Subkon',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
            Keuangan Proyek & Buku Kas
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Pengendalian anggaran RAB, pemantauan arus kas masuk vs keluar, dan ledger transaksi CV. Arthamas Graha.
          </p>
        </div>

        <Can permission="finance.create">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition flex items-center self-start sm:self-auto"
          >
            <i className="fa-solid fa-plus mr-1.5 text-xs"></i>
            <span>Catat Transaksi Kas</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Total Komitmen Kas Masuk</p>
          <p className="mt-2 text-2xl font-display font-extrabold text-slate-900">
            {formatRupiah(summary.total_pemasukan || 0)}
          </p>
          <p className="mt-1 text-xs text-blue-700 font-semibold">Termin kontrak terminasi klien</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Total Realisasi Pengeluaran</p>
          <p className="mt-2 text-2xl font-display font-extrabold text-rose-700">
            {formatRupiah(summary.total_pengeluaran || 0)}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-semibold">Biaya material, upah, dan alat</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Saldo Kas Operasional</p>
          <p className="mt-2 text-2xl font-display font-extrabold text-emerald-700">
            {formatRupiah(summary.rekening_operasional || 0)}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-medium truncate">{summary.bank}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Distribusi Realisasi Berdasarkan Pos Pengeluaran
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.keys(category_breakdown || {}).map((catKey) => {
            const amount = category_breakdown[catKey];
            const pct = summary.total_pengeluaran > 0 ? (amount / summary.total_pengeluaran) * 100 : 0;
            return (
              <div key={catKey} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {categoryLabels[catKey] || catKey}
                </span>
                <p className="mt-1 font-display font-extrabold text-slate-900 text-sm">{formatRupiah(amount)}</p>
                <span className="mt-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded inline-block">
                  {pct.toFixed(1)}% serapan
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 font-display">Buku Kas & Riwayat Transaksi</h2>
            <p className="text-xs text-slate-400 mt-0.5">Catatan mutasi kas operasional proyek realtime.</p>
          </div>
          <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {transactions.length} Transaksi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-4 py-3.5">Proyek Terkait</th>
                <th className="px-4 py-3.5">Pos Biaya</th>
                <th className="px-4 py-3.5">Uraian Transaksi</th>
                <th className="px-5 py-3.5 text-right">Nominal Pengeluaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <i className="fa-solid fa-receipt text-3xl mb-2 text-slate-300 block"></i>
                    <p className="font-semibold text-slate-700 text-sm">Belum Ada Transaksi Kas</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Silakan catat mutasi pengeluaran kas baru melalui tombol di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{tx.date}</td>
                    <td className="px-4 py-4 font-bold text-slate-900">{tx.project_name}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 text-slate-700 capitalize">
                        {categoryLabels[tx.category] || tx.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700 font-medium">{tx.description}</td>
                    <td className="px-5 py-4 text-right font-display font-extrabold text-rose-700 whitespace-nowrap">
                      - {formatRupiah(tx.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Pencatatan Transaksi Kas Baru">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Proyek Terkait <span className="text-rose-500">*</span>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Pos Kategori Biaya</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="material">Logistik & Material</option>
                <option value="upah">Upah Tenaga Kerja</option>
                <option value="sewa_alat">Sewa Alat Berat</option>
                <option value="operasional">Operasional Lapangan</option>
                <option value="subkon">Subkontraktor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nominal Transaksi (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Contoh: 15000000"
                className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                  formErrors.amount ? 'border-rose-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-600`}
              />
              {formErrors.amount && <p className="text-[11px] text-rose-600 mt-1">{formErrors.amount}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Uraian & Keterangan Transaksi <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Contoh: Pembelian Semen Gresik 200 sak dan sewa genset 1 minggu"
              className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                formErrors.description ? 'border-rose-500' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-600`}
            />
            {formErrors.description && <p className="text-[11px] text-rose-600 mt-1">{formErrors.description}</p>}
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
              {submitting ? 'Membukukan...' : 'Bukukan Transaksi Kas'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FinancePage;
