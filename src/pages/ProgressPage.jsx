import React, { useState, useEffect } from 'react';
import { progressService, projectService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Can } from '../components/common/Can';

export const ProgressPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    project_id: '',
    progress: '',
    progress_gain: '2.5',
    notes: '',
    issues: '',
    reporter: user?.name || 'Pengawas Lapangan',
  });

  const [errors, setErrors] = useState({});

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projRes, repRes] = await Promise.all([
        projectService.getAll({ status: 'aktif' }),
        progressService.getAll(),
      ]);
      if (projRes.success) {
        setProjects(projRes.data);
        if (projRes.data.length > 0 && !formData.project_id) {
          setFormData((prev) => ({
            ...prev,
            project_id: projRes.data[0].id,
            progress: projRes.data[0].progress + 2,
          }));
        }
      }
      if (repRes.success) {
        setReports(repRes.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedProject = projects.find((p) => p.id === parseInt(formData.project_id));
  const currentProgress = selectedProject ? selectedProject.progress : 0;
  const targetProgress = selectedProject ? selectedProject.target_progress : 50;

  const validate = () => {
    const errs = {};
    if (!formData.project_id) errs.project_id = 'Pilih proyek yang dilaporkan';
    if (formData.progress === '' || isNaN(formData.progress) || formData.progress < 0 || formData.progress > 100) {
      errs.progress = 'Capaian fisik harus berupa angka antara 0 - 100%';
    }
    if (!formData.notes || formData.notes.trim().length < 8) {
      errs.notes = 'Uraian pekerjaan lapangan minimal 8 karakter';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await progressService.submit({
        ...formData,
        reporter: user?.name || 'Pengawas Lapangan',
      });
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Laporan progres ${selectedProject?.name} berhasil disinkronkan ke sistem!`,
        });
        setFormData((prev) => ({
          ...prev,
          notes: '',
          issues: '',
        }));
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
          Laporan Pengerjaan Proyek Lapangan
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Input mingguan capaian fisik, evaluasi deviasi terhadap Kurva-S, dan pencatatan kendala material/cuaca CV.
          Arthamas Graha.
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
              <i className="fa-solid fa-bars-progress text-lg"></i>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 font-display">Form Lapor Progres Mingguan</h2>
              <p className="text-xs text-slate-400">Verifikasi lapangan oleh {user?.roleLabel || user?.role}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Proyek Aktif <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.project_id}
                onChange={(e) => {
                  const p = projects.find((proj) => proj.id === parseInt(e.target.value));
                  setFormData({
                    ...formData,
                    project_id: e.target.value,
                    progress: p ? p.progress + 2 : '',
                  });
                }}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_code} - {p.name} (Progres saat ini: {p.progress}%)
                  </option>
                ))}
              </select>
            </div>

            {selectedProject && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Progres Terakhir</span>
                  <strong className="text-slate-800 font-display text-sm">{currentProgress}%</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Kurva-S</span>
                  <strong className="text-slate-800 font-display text-sm">{targetProgress}%</strong>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Deviasi Saat Ini</span>
                  <strong className={selectedProject.deviasi?.startsWith('+') ? 'text-emerald-700' : 'text-rose-700'}>
                    {selectedProject.deviasi || '0.0%'}
                  </strong>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Capaian Kumulatif Baru (%) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                  placeholder="Contoh: 48.5"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                    errors.progress ? 'border-rose-500' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-600`}
                />
                {errors.progress && <p className="text-[11px] text-rose-600 mt-1">{errors.progress}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kenaikan Minggu Ini (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.progress_gain}
                  onChange={(e) => setFormData({ ...formData, progress_gain: e.target.value })}
                  placeholder="Contoh: 2.5"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Uraian Item Pekerjaan yang Dikerjakan <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Rincian pekerjaan: Pengecoran plat lantai 3 zona timur, pemasangan bekisting balok, perakitan besi tulangan D12..."
                className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                  errors.notes ? 'border-rose-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-600`}
              />
              {errors.notes && <p className="text-[11px] text-rose-600 mt-1">{errors.notes}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan Kendala Lapangan / Cuaca (Jika Ada)
              </label>
              <input
                type="text"
                value={formData.issues}
                onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
                placeholder="Contoh: Hujan lebat pada hari Kamis menunda pekerjaan cor selama 4 jam"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="pt-2">
              <Can
                permission="progress.create"
                fallback={
                  <div className="p-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold text-center border border-slate-200">
                    Akun Anda tidak memiliki izin untuk menginput progres lapangan (Read-only).
                  </div>
                }
              >
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-extrabold text-xs rounded-lg shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                  <span>{submitting ? 'Menyinkronkan Progres...' : 'Kirim Laporan Progres Lapangan'}</span>
                </button>
              </Can>
            </div>
          </form>
        </section>

        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 font-display">Riwayat Laporan Mingguan</h2>
                <p className="text-xs text-slate-400 mt-0.5">Catatan terkini seluruh proyek CV. Arthamas Graha.</p>
              </div>
              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {reports.length} Laporan
              </span>
            </div>

            {loading ? (
              <div className="p-5">
                <CardSkeleton count={3} />
              </div>
            ) : error ? (
              <div className="p-5">
                <ErrorMessage message={error} onRetry={loadData} />
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
                {reports.length > 0 ? (
                  reports.map((r) => (
                    <div key={r.id} className="p-4 sm:p-5 hover:bg-slate-50 transition space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-extrabold text-xs text-slate-900 truncate">{r.project_name}</p>
                          <span className="text-[10px] text-slate-400">
                            Minggu Ke-{r.week_number || 1} • {r.date}
                          </span>
                        </div>
                        <span className="text-xs font-display font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                          {r.progress}% (+{r.progress_gain}%)
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-medium">{r.notes}</p>

                      <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>
                          Pelapor: <strong className="text-slate-600">{r.reporter}</strong>
                        </span>
                        <span className="truncate max-w-[140px] text-amber-700 font-semibold">{r.issues}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Belum ada riwayat laporan mingguan yang tercatat.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProgressPage;
