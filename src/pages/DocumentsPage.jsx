import React, { useState, useEffect } from 'react';
import { documentService, projectService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Modal } from '../components/common/Modal';
import { Can } from '../components/common/Can';

export const DocumentsPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'kontrak',
    project_id: '',
    size: '2.4 MB',
    uploaded_by: user?.name || 'Administrasi',
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [docRes, projRes] = await Promise.all([documentService.getAll({ category }), projectService.getAll()]);
      if (docRes.success) setDocuments(docRes.data);
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
    loadData();
  }, [category]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.project_id) return;

    setSubmitting(true);
    try {
      const res = await documentService.create(formData);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Berkas dokumen proyek berhasil diarsipkan!' });
        setIsModalOpen(false);
        setFormData((prev) => ({ ...prev, name: '' }));
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const getDocIcon = (cat) => {
    if (cat === 'ded') return <i className="fa-solid fa-compass-drafting text-indigo-700 text-lg"></i>;
    if (cat === 'rab') return <i className="fa-solid fa-file-excel text-emerald-700 text-lg"></i>;
    if (cat === 'kontrak') return <i className="fa-solid fa-file-signature text-blue-700 text-lg"></i>;
    return <i className="fa-solid fa-file-lines text-slate-600 text-lg"></i>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
            Dokumen Proyek & Berkas Legal
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Pengarsipan berkas kontrak SPK, gambar DED struktur CAD, RAB Excel, dan berita acara CV. Arthamas Graha.
          </p>
        </div>

        <Can permission="documents.create">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition flex items-center self-start sm:self-auto"
          >
            <i className="fa-solid fa-plus mr-1.5 text-xs"></i>
            <span>Unggah Dokumen Baru</span>
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

      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { key: 'semua', label: 'Semua Kategori' },
          { key: 'kontrak', label: 'Kontrak & Legal SPK' },
          { key: 'ded', label: 'Gambar DED & CAD' },
          { key: 'rab', label: 'RAB & BoQ Excel' },
          { key: 'laporan', label: 'Laporan & BAPP' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCategory(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              category === tab.key
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
                  <th className="px-5 py-3.5">Nama Berkas & Format</th>
                  <th className="px-4 py-3.5">Proyek Terkait</th>
                  <th className="px-4 py-3.5">Kategori</th>
                  <th className="px-4 py-3.5">Pengunggah & Tanggal</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          {getDocIcon(d.category)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{d.name}</p>
                          <span className="text-[11px] text-slate-400">{d.size}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-800">{d.project_name}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {d.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-[11px]">
                      {d.uploaded_by} • {d.date}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => alert(`Mengunduh berkas ${d.name} dari server CV. Arthamas Graha...`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 font-semibold text-xs rounded-lg hover:bg-blue-100 transition"
                      >
                        <i className="fa-solid fa-arrow-down-to-bracket text-xs"></i>
                        <span>Unduh</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Unggah Berkas Dokumen Proyek">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Dokumen / File <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: SPK_P001_Pembangunan_Gedung.pdf"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Berkas</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="kontrak">Kontrak Kerja / SPK</option>
                <option value="ded">Gambar DED Struktur CAD</option>
                <option value="rab">RAB / BoQ Anggaran</option>
                <option value="laporan">Berita Acara / Laporan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran Berkas Estimasi</label>
            <input
              type="text"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
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
              {submitting ? 'Mengunggah...' : 'Arsipkan Dokumen'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DocumentsPage;
