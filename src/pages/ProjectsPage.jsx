import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { projectService, clientService } from '../services/api';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Modal } from '../components/common/Modal';
import { Can } from '../components/common/Can';
import { formatRupiah } from '../utils/formatters';

export const ProjectsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'semua';

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    client_id: '',
    client_name: '',
    budget: '',
    contract_value: '',
    start_date: '',
    end_date: '',
    manager: 'Andi Wijaya, ST',
    description: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projRes, clientRes] = await Promise.all([
        projectService.getAll({ search, status }),
        clientService.getAll(),
      ]);
      if (projRes.success) setProjects(projRes.data);
      if (clientRes.success) {
        setClients(clientRes.data);
        if (clientRes.data.length > 0 && !formData.client_id) {
          setFormData((prev) => ({
            ...prev,
            client_id: clientRes.data[0].id,
            client_name: clientRes.data[0].name,
          }));
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, status]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Nama proyek wajib diisi';
    if (!formData.location.trim()) errs.location = 'Lokasi proyek wajib diisi';
    if (!formData.budget || isNaN(formData.budget) || formData.budget <= 0) {
      errs.budget = 'Alokasi anggaran RAB wajib berupa angka valid';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await projectService.create(formData);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Proyek baru berhasil didaftarkan ke SIMPRO!' });
        setIsModalOpen(false);
        setFormData({
          name: '',
          location: '',
          client_id: clients[0]?.id || 1,
          client_name: clients[0]?.name || '',
          budget: '',
          contract_value: '',
          start_date: '',
          end_date: '',
          manager: 'Andi Wijaya, ST',
          description: '',
        });
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const statusOptions = [
    { key: 'semua', label: 'Semua Proyek' },
    { key: 'aktif', label: 'Aktif Berjalan' },
    { key: 'selesai', label: 'Selesai (BAST)' },
    { key: 'perencanaan', label: 'Perencanaan' },
    { key: 'tertunda', label: 'Tertunda' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
            Portofolio Proyek Konstruksi
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Daftar master pekerjaan fisik, gedung, dan infrastruktur CV. Arthamas Graha.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Can permission="progress.create">
            <Link
              to="/progress"
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <i className="fa-solid fa-bars-progress text-blue-700 mr-1.5 text-xs"></i>
              <span>Lapor Progres</span>
            </Link>
          </Can>

          <Can permission="projects.create">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition"
            >
              <i className="fa-solid fa-plus mr-1.5 text-xs"></i>
              <span>Tambah Proyek</span>
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

      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode, nama proyek, lokasi, atau klien..."
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none transition"
          />
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {statusOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                setStatus(opt.key);
                setSearchParams({ status: opt.key });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                status === opt.key
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <CardSkeleton count={4} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : projects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <i className="fa-regular fa-folder-open text-3xl mb-2 text-slate-300 block"></i>
          <h4 className="font-semibold text-slate-700 text-sm">Tidak Ada Proyek Terdaftar</h4>
          <p className="text-xs text-slate-400 mt-0.5 max-w-sm mx-auto">
            Silakan sesuaikan kata kunci pencarian Anda atau tambahkan proyek baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((p) => {
            const isCompleted = p.status === 'selesai';
            const isPending = p.status === 'perencanaan' || p.status === 'tertunda';
            const progressColor = isCompleted ? 'bg-emerald-600' : p.progress >= 50 ? 'bg-blue-700' : 'bg-amber-500';

            return (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-display font-black text-xs text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {p.project_code}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full capitalize ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isPending
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-800 transition line-clamp-2">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <i className="fa-solid fa-location-dot text-slate-400 text-xs shrink-0"></i>
                    <span className="truncate">{p.location}</span>
                  </div>

                  <div className="mt-3 py-2 border-y border-slate-100 text-xs space-y-1">
                    <p className="text-slate-500 truncate">
                      Klien: <strong className="text-slate-800">{p.client_name}</strong>
                    </p>
                    <p className="text-slate-500 truncate">
                      Project Manager: <strong className="text-slate-800">{p.manager}</strong>
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-600">Realisasi Fisik</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-extrabold text-slate-900 text-sm">{p.progress}%</span>
                        {p.deviasi && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              p.deviasi.startsWith('+')
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {p.deviasi}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                        style={{ width: `${Math.min(p.progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Pagu RAB</span>
                      <p className="font-extrabold text-slate-900 text-xs truncate">{formatRupiah(p.budget)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Realisasi</span>
                      <p className="font-extrabold text-slate-800 text-xs truncate">{formatRupiah(p.spent || 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {p.start_date} s/d {p.end_date}
                  </span>
                  <Link
                    to={`/projects/${p.id}`}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition flex items-center"
                  >
                    Detail <i className="fa-solid fa-arrow-right ml-1 text-[10px] text-slate-400"></i>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buka Portofolio Proyek Baru">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Proyek Konstruksi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Pembangunan Jembatan Beton Serpong"
              className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                formErrors.name ? 'border-rose-500' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-600`}
            />
            {formErrors.name && <p className="text-[11px] text-rose-600 mt-1">{formErrors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lokasi Proyek / Kota <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Contoh: Tangerang Selatan"
                className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                  formErrors.location ? 'border-rose-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-600`}
              />
              {formErrors.location && <p className="text-[11px] text-rose-600 mt-1">{formErrors.location}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Klien Pemilik Proyek</label>
              <select
                value={formData.client_id}
                onChange={(e) => {
                  const c = clients.find((cl) => cl.id === parseInt(e.target.value));
                  setFormData({
                    ...formData,
                    client_id: e.target.value,
                    client_name: c ? c.name : '',
                  });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alokasi Pagu RAB (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="Contoh: 15000000000"
                className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                  formErrors.budget ? 'border-rose-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-600`}
              />
              {formErrors.budget && <p className="text-[11px] text-rose-600 mt-1">{formErrors.budget}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Project Manager (Site Eng.)</label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                placeholder="Nama Manajer Proyek"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai SPK</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Selesai (BAST)</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Ruang Lingkup</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Uraian spesifikasi teknis dan ruang lingkup pekerjaan konstruksi..."
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
              {submitting ? 'Mendaftarkan...' : 'Buka Proyek Baru'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
