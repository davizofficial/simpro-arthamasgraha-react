import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { surveyService, projectService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Modal } from '../components/common/Modal';
import { Can } from '../components/common/Can';

export const SiteSurveysPage = () => {
  const { user, can } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    project_id: '',
    project_name: '',
    area_size: '',
    elevation: '',
    soil_type: '',
    contour: 'Relatif Datar',
    accessibility: '',
    user_name: user?.name || 'Pengawas Lapangan',
  });

  const [formErrors, setFormErrors] = useState({});

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [survRes, projRes] = await Promise.all([
        surveyService.getAll({ status: statusFilter }),
        projectService.getAll(),
      ]);
      if (survRes.success) setSurveys(survRes.data);
      if (projRes.success) {
        setProjects(projRes.data);
        if (projRes.data.length > 0 && !formData.project_id) {
          setFormData((prev) => ({
            ...prev,
            project_id: projRes.data[0].id,
            project_name: projRes.data[0].name,
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
    loadData();
  }, [statusFilter]);

  const validate = () => {
    const errs = {};
    if (!formData.project_name) errs.project_name = 'Pilih proyek terkait';
    if (!formData.area_size) errs.area_size = 'Luas lahan wajib diisi';
    if (!formData.soil_type) errs.soil_type = 'Karakteristik tanah wajib diisi';
    if (!formData.accessibility) errs.accessibility = 'Kondisi aksesibilitas wajib diisi';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await surveyService.create(formData);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Hasil survei lokasi berhasil disimpan dan diajukan ke Owner!' });
        setIsModalOpen(false);
        setFormData({
          project_id: projects[0]?.id || 1,
          project_name: projects[0]?.name || '',
          area_size: '',
          elevation: '',
          soil_type: '',
          contour: 'Relatif Datar',
          accessibility: '',
          user_name: user?.name || 'Pengawas Lapangan',
        });
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = surveys.filter((s) => s.status === 'pending').length;
  const reviewCount = surveys.filter((s) => s.status === 'review').length;
  const approvedCount = surveys.filter((s) => s.status === 'approved').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">Survei Lokasi Proyek</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Dokumentasi kondisi lahan, elevasi, karakteristik tanah, kontur, dan aksesibilitas armada CV. Arthamas
            Graha.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Can permission="site-surveys.approve">
            <Link
              to="/site-surveys/approvals"
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition"
            >
              <i className="fa-solid fa-file-circle-check text-amber-700 mr-1.5 text-xs"></i>
              <span>Meja Validasi ({pendingCount + reviewCount})</span>
            </Link>
          </Can>

          <Can permission="site-surveys.create">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition flex items-center"
            >
              <i className="fa-solid fa-plus mr-1.5 text-xs"></i>
              <span>Input Survei Baru</span>
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
          <p className="text-xs font-bold uppercase text-slate-400">Total Survei Lapangan</p>
          <p className="mt-1.5 text-2xl font-display font-extrabold text-slate-900">{surveys.length}</p>
          <p className="mt-1 text-xs text-slate-500 font-semibold">Terdokumentasi dalam sistem</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Menunggu ACC Owner</p>
          <p className="mt-1.5 text-2xl font-display font-extrabold text-amber-700">{pendingCount}</p>
          <p className="mt-1 text-xs text-amber-700 font-semibold">Memerlukan tinjauan direksi</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Telah Disetujui (Approved)</p>
          <p className="mt-1.5 text-2xl font-display font-extrabold text-emerald-700">{approvedCount}</p>
          <p className="mt-1 text-xs text-emerald-700 font-semibold">Siap masuk tahap konstruksi</p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'semua', label: 'Semua Status' },
          { key: 'pending', label: 'Menunggu ACC' },
          { key: 'review', label: 'Perlu Revisi' },
          { key: 'approved', label: 'Disetujui' },
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
        <CardSkeleton count={3} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : surveys.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <i className="fa-solid fa-map-location-dot text-3xl mb-2 text-slate-300 block"></i>
          <h4 className="font-semibold text-slate-700 text-sm">Belum Ada Data Survei Lokasi</h4>
          <p className="text-xs text-slate-400 mt-0.5 max-w-sm mx-auto">
            Belum ada hasil survei lapangan yang terdaftar dalam sistem.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {surveys.map((s) => {
            const isApproved = s.status === 'approved';
            const isReview = s.status === 'review';
            const isPending = s.status === 'pending';

            return (
              <div
                key={s.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs hover:border-blue-300 transition flex flex-col justify-between ${
                  isReview ? 'border-rose-200/90' : isPending ? 'border-amber-200/90' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Survei #{s.id}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 mt-1">{s.project_name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Surveyor: <strong className="text-slate-700">{s.user_name}</strong> • Tanggal: {s.date}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isReview
                            ? 'bg-rose-50 text-rose-800 border border-rose-300'
                            : 'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <i
                            className="fa-solid fa-circle-check text-emerald-600 text-[11px] mr-1"
                            aria-hidden="true"
                          ></i>
                          <span>Disetujui</span>
                        </>
                      ) : isReview ? (
                        <>
                          <i
                            className="fa-solid fa-arrow-rotate-left text-rose-600 text-[11px] mr-1"
                            aria-hidden="true"
                          ></i>
                          <span>Perlu Revisi</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-regular fa-clock text-amber-600 text-[11px] mr-1" aria-hidden="true"></i>
                          <span>Menunggu ACC</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 mt-3">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Luas Lahan</span>
                      <strong className="text-slate-800">{s.area_size} m²</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Elevasi Tanah</span>
                      <strong className="text-slate-800">{s.elevation || '+0.0 m dpl'}</strong>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Karakteristik & Jenis Tanah
                      </span>
                      <p className="text-slate-700 font-semibold">{s.soil_type}</p>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Aksesibilitas Kendaraan Berat
                      </span>
                      <p className="text-slate-700 font-semibold">{s.accessibility}</p>
                    </div>
                  </div>

                  {s.reviewer_notes && (
                    <div
                      className={`mt-3 p-3 rounded-xl text-xs border ${
                        isReview ? 'bg-rose-50/80 border-rose-200' : 'bg-emerald-50/70 border-emerald-200'
                      }`}
                    >
                      <p
                        className={`text-[10px] font-bold uppercase flex items-center gap-1 ${
                          isReview ? 'text-rose-800' : 'text-emerald-800'
                        }`}
                      >
                        <i
                          className={`fa-solid ${
                            isReview ? 'fa-triangle-exclamation' : 'fa-circle-check'
                          } text-xs mr-1`}
                          aria-hidden="true"
                        ></i>
                        {isReview ? 'Instruksi Revisi Direksi' : 'Catatan ACC Direksi'}
                      </p>
                      <p className="text-slate-800 mt-1 font-medium">{s.reviewer_notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Kontur: <strong>{s.contour}</strong>
                  </span>
                  {can('site-surveys.approve') && !isApproved && (
                    <Link
                      to="/site-surveys/approvals"
                      className="text-xs font-bold text-blue-800 hover:text-blue-900 flex items-center gap-1"
                    >
                      <span>Buka di Meja Validasi</span>
                      <i className="fa-solid fa-arrow-right text-[10px]" aria-hidden="true"></i>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Input Data Survei Lokasi Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Proyek Terkait <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.project_id}
              onChange={(e) => {
                const p = projects.find((proj) => proj.id === parseInt(e.target.value));
                setFormData({
                  ...formData,
                  project_id: e.target.value,
                  project_name: p ? p.name : '',
                });
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_code} - {p.name} ({p.location})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimasi Luas Lahan (m²) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={formData.area_size}
                onChange={(e) => setFormData({ ...formData, area_size: e.target.value })}
                placeholder="Contoh: 1500"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {formErrors.area_size && <p className="text-[11px] text-rose-600 mt-1">{formErrors.area_size}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Elevasi Kontur Lapangan</label>
              <input
                type="text"
                value={formData.elevation}
                onChange={(e) => setFormData({ ...formData, elevation: e.target.value })}
                placeholder="Contoh: +18.5 m dpl"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Karakteristik & Jenis Tanah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.soil_type}
              onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
              placeholder="Contoh: Lempung Berpasir (Sondir > 200 kg/cm2)"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {formErrors.soil_type && <p className="text-[11px] text-rose-600 mt-1">{formErrors.soil_type}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Aksesibilitas Armada Berat <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.accessibility}
              onChange={(e) => setFormData({ ...formData, accessibility: e.target.value })}
              placeholder="Contoh: Jalan aspal lebar 8m, truk tronton & mixer dapat masuk"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {formErrors.accessibility && <p className="text-[11px] text-rose-600 mt-1">{formErrors.accessibility}</p>}
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
              {submitting ? 'Menyimpan...' : 'Ajukan Survei ke Owner'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SiteSurveysPage;
