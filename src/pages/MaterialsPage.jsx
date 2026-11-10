import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { materialService } from '../services/api';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Modal } from '../components/common/Modal';
import { Can } from '../components/common/Can';
import { formatRupiah, formatNumber } from '../utils/formatters';

export const MaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    stock: '',
    unit: 'sak',
    minimum_stock: '500',
    price_per_unit: '',
    specification: 'Standar Mutu SNI',
    supplier: 'PT Semen Indonesia Distributor',
  });

  const [formErrors, setFormErrors] = useState({});

  const loadMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await materialService.getAll({
        search,
        low_stock: onlyLowStock ? 'true' : undefined,
      });
      if (res.success) {
        setMaterials(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMaterials();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, onlyLowStock]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Nama material wajib diisi';
    if (!formData.unit.trim()) errs.unit = 'Satuan material wajib diisi';
    if (!formData.price_per_unit || isNaN(formData.price_per_unit) || formData.price_per_unit <= 0) {
      errs.price_per_unit = 'Harga per unit valid wajib diisi';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await materialService.create(formData);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Material baru berhasil ditambahkan ke inventori gudang!' });
        setIsModalOpen(false);
        setFormData({
          name: '',
          stock: '',
          unit: 'sak',
          minimum_stock: '500',
          price_per_unit: '',
          specification: 'Standar Mutu SNI',
          supplier: 'PT Semen Indonesia Distributor',
        });
        loadMaterials();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const criticalItems = materials.filter((m) => m.stock <= m.minimum_stock);
  const totalValuation = materials.reduce((acc, curr) => acc + curr.stock * curr.price_per_unit, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
            Logistik & Master Material
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Pengawasan ketersediaan bahan konstruksi, peringatan stok kritis, dan katalog harga gudang CV. Arthamas
            Graha.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/material-requests"
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <i className="fa-solid fa-clipboard-list text-blue-700 mr-1.5 text-xs"></i>
            <span>Pengajuan Material</span>
          </Link>

          <Can permission="materials.create">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition flex items-center"
            >
              <i className="fa-solid fa-plus mr-1.5 text-xs"></i>
              <span>Tambah Material</span>
            </button>
          </Can>
        </div>
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
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Total Katalog Material</p>
          <p className="mt-1.5 text-2xl font-display font-extrabold text-slate-900">{materials.length} Item</p>
          <p className="mt-1 text-xs text-slate-500 font-semibold">Tersimpan di gudang utama</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Peringatan Stok Kritis</p>
          <p className="mt-1.5 text-2xl font-display font-extrabold text-rose-700">{criticalItems.length} Item</p>
          <p className="mt-1 text-xs text-rose-600 font-semibold">Di bawah batas minimum buffer</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Total Valuasi Inventori</p>
          <p className="mt-1.5 text-xl font-display font-extrabold text-slate-900 truncate">
            {formatRupiah(totalValuation)}
          </p>
          <p className="mt-1 text-xs text-blue-700 font-semibold">Aset logistik siap alokasi</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama material, kode, supplier..."
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none transition"
          />
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyLowStock(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              !onlyLowStock ? 'bg-blue-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Stok
          </button>
          <button
            onClick={() => setOnlyLowStock(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              onlyLowStock
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <i className="fa-solid fa-triangle-exclamation text-xs"></i>
            <span>Hanya Stok Kritis ({criticalItems.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadMaterials} />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Kode & Nama Material</th>
                  <th className="px-4 py-3.5 text-right">Sisa Stok</th>
                  <th className="px-4 py-3.5 text-right">Batas Minimum</th>
                  <th className="px-4 py-3.5 text-right">Harga Satuan</th>
                  <th className="px-4 py-3.5">Distributor / Supplier</th>
                  <th className="px-4 py-3.5 text-center">Status Buffer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <i className="fa-solid fa-boxes-stacked text-3xl mb-2 text-slate-300 block"></i>
                      <p className="font-semibold text-slate-700 text-sm">Belum Ada Katalog Material</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {search
                          ? `Tidak ditemukan material dengan kata kunci "${search}".`
                          : 'Katalog inventori gudang masih kosong.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  materials.map((m) => {
                    const isCritical = m.stock <= m.minimum_stock;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <span className="font-display font-bold text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                              {m.code}
                            </span>
                            <div>
                              <p className="font-extrabold text-slate-900 text-sm">{m.name}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">{m.specification}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-display font-extrabold text-slate-900 text-sm">
                            {formatNumber(m.stock)}
                          </span>{' '}
                          <span className="text-slate-500 font-semibold text-[11px]">{m.unit}</span>
                        </td>
                        <td className="px-4 py-4 text-right text-slate-500 font-medium">
                          {m.minimum_stock} {m.unit}
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-slate-900">
                          {formatRupiah(m.price_per_unit)}
                        </td>
                        <td className="px-4 py-4 text-slate-600 font-medium">{m.supplier}</td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isCritical
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {isCritical ? (
                              <>
                                <i className="fa-solid fa-triangle-exclamation mr-1 text-rose-600 text-[10px]"></i>
                                Stok Kritis
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-circle-check mr-1 text-emerald-600 text-[10px]"></i>
                                Aman
                              </>
                            )}
                          </span>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Katalog Material Gudang">
        <form onSubmit={handleCreateMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Material / Bahan Bangunan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Semen Dynamix 50kg / Besi Ulir D16"
              className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                formErrors.name ? 'border-rose-500' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-600`}
            />
            {formErrors.name && <p className="text-[11px] text-rose-600 mt-1">{formErrors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stok Awal di Gudang</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="1000"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Satuan Ukuran <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="sak / batang / m3"
                className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                  formErrors.unit ? 'border-rose-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-600`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Batas Minimum</label>
              <input
                type="number"
                value={formData.minimum_stock}
                onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                placeholder="300"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Harga per Satuan (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price_per_unit}
                onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                placeholder="Contoh: 68000"
                className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                  formErrors.price_per_unit ? 'border-rose-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-600`}
              />
              {formErrors.price_per_unit && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.price_per_unit}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pemasok / Distributor</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Nama PT / Toko Bangunan"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Spesifikasi Mutu & SNI</label>
            <input
              type="text"
              value={formData.specification}
              onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
              placeholder="Contoh: SNI 15-7064-2004 / Mutu Beton K-350"
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
              {submitting ? 'Menyimpan...' : 'Simpan Material'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaterialsPage;
