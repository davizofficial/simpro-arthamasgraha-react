import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { surveyService } from '../services/api';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { SurveyActionModal } from '../components/surveys/SurveyActionModal';

export const SurveyApprovalsPage = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('semua');

  const [modalState, setModalState] = useState({
    isOpen: false,
    survey: null,
    actionType: 'approved',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadSurveys = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await surveyService.getAll();
      if (res.success) {
        setSurveys(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const openActionModal = (survey, actionType) => {
    setModalState({
      isOpen: true,
      survey,
      actionType,
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      survey: null,
      actionType: 'approved',
    });
  };

  const handleProcessAction = async (notes) => {
    if (!modalState.survey) return;

    setSubmitting(true);
    try {
      const res = await surveyService.updateStatus(modalState.survey.id, {
        status: modalState.actionType,
        reviewer_notes: notes,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message:
            modalState.actionType === 'approved'
              ? `Survei lokasi "${modalState.survey.project_name}" berhasil disetujui (ACC)!`
              : `Instruksi revisi untuk "${modalState.survey.project_name}" berhasil dikirimkan ke tim surveyor lapangan.`,
        });
        handleCloseModal();
        await loadSurveys();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const pendingSurveys = surveys.filter((s) => s.status === 'pending');
  const reviewSurveys = surveys.filter((s) => s.status === 'review');
  const approvedSurveys = surveys.filter((s) => s.status === 'approved');

  const displayedSurveys =
    activeTab === 'pending'
      ? pendingSurveys
      : activeTab === 'review'
        ? reviewSurveys
        : activeTab === 'approved'
          ? approvedSurveys
          : surveys;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              to="/site-surveys"
              className="text-xs font-bold text-blue-800 hover:text-blue-950 flex items-center gap-1 transition-transform hover:-translate-x-0.5"
            >
              <i className="fa-solid fa-arrow-left text-xs mr-1" aria-hidden="true"></i>
              <span>Kembali ke Daftar Survei</span>
            </Link>
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
            Validasi & ACC Survei Lokasi
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Persetujuan resmi direksi CV. Arthamas Graha terhadap kelayakan teknis lahan pra-konstruksi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {pendingSurveys.length > 0 && (
            <div className="px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-2 shadow-2xs animate-pulse">
              <i className="fa-regular fa-clock text-amber-700 text-xs" aria-hidden="true"></i>
              <span>{pendingSurveys.length} Butuh Tinjauan</span>
            </div>
          )}
          {reviewSurveys.length > 0 && (
            <div className="px-3.5 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-900 flex items-center gap-2 shadow-2xs">
              <i className="fa-solid fa-arrow-rotate-left text-rose-700 text-xs" aria-hidden="true"></i>
              <span>{reviewSurveys.length} Dalam Revisi</span>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 animate-fade-in ${
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
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
            aria-label="Tutup notifikasi"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`bg-white border rounded-xl p-4 text-left transition-all duration-200 cursor-pointer hover:shadow-xs ${
            activeTab === 'pending'
              ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Menunggu Tinjauan</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <p className="mt-2 text-2xl font-display font-extrabold text-slate-900">{pendingSurveys.length}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-amber-800">Menunggu keputusan direksi</p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('review')}
          className={`bg-white border rounded-xl p-4 text-left transition-all duration-200 cursor-pointer hover:shadow-xs ${
            activeTab === 'review'
              ? 'border-rose-400 ring-2 ring-rose-400/20 bg-rose-50/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Perlu Revisi</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          </div>
          <p className="mt-2 text-2xl font-display font-extrabold text-slate-900">{reviewSurveys.length}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-rose-800">Instruksi perbaikan terkirim</p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('approved')}
          className={`bg-white border rounded-xl p-4 text-left transition-all duration-200 cursor-pointer hover:shadow-xs ${
            activeTab === 'approved'
              ? 'border-emerald-400 ring-2 ring-emerald-400/20 bg-emerald-50/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Telah Disetujui</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <p className="mt-2 text-2xl font-display font-extrabold text-slate-900">{approvedSurveys.length}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-emerald-800">Kelayakan teknis disahkan</p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('semua')}
          className={`bg-white border rounded-xl p-4 text-left transition-all duration-200 cursor-pointer hover:shadow-xs ${
            activeTab === 'semua'
              ? 'border-blue-400 ring-2 ring-blue-400/20 bg-blue-50/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pengajuan</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          </div>
          <p className="mt-2 text-2xl font-display font-extrabold text-slate-900">{surveys.length}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-blue-800">Seluruh berkas survei</p>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full" role="tablist">
          {[
            { key: 'semua', label: 'Semua Status', count: surveys.length },
            { key: 'pending', label: 'Menunggu Tinjauan', count: pendingSurveys.length },
            { key: 'review', label: 'Perlu Revisi Lapangan', count: reviewSurveys.length },
            { key: 'approved', label: 'Disetujui (ACC)', count: approvedSurveys.length },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <CardSkeleton count={2} />
        ) : error ? (
          <ErrorMessage message={error} onRetry={loadSurveys} />
        ) : displayedSurveys.length > 0 ? (
          <div className="space-y-4">
            {displayedSurveys.map((s) => {
              const isApproved = s.status === 'approved';
              const isReview = s.status === 'review';
              const isPending = s.status === 'pending';

              return (
                <div
                  key={s.id}
                  className={`bg-white rounded-2xl p-5 shadow-xs transition-all duration-300 hover:shadow-md border-2 ${
                    isPending ? 'border-amber-200/90' : isReview ? 'border-rose-200/90' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200 inline-flex items-center gap-1">
                            <i className="fa-regular fa-clock text-amber-700 text-[10px]" aria-hidden="true"></i>
                            <span>Menunggu Tinjauan Direksi</span>
                          </span>
                        )}
                        {isReview && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-extrabold bg-rose-100 text-rose-900 border border-rose-200 inline-flex items-center gap-1">
                            <i
                              className="fa-solid fa-arrow-rotate-left text-rose-700 text-[10px]"
                              aria-hidden="true"
                            ></i>
                            <span>Perlu Revisi Lapangan</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200 inline-flex items-center gap-1">
                            <i className="fa-solid fa-circle-check text-emerald-700 text-[10px]" aria-hidden="true"></i>
                            <span>Disetujui Resmi (ACC)</span>
                          </span>
                        )}
                        <span className="text-xs text-slate-400">Diajukan: {s.date}</span>
                      </div>

                      <h3 className="text-lg font-extrabold text-slate-900 font-display">{s.project_name}</h3>
                      <p className="text-xs text-slate-500">
                        Diserahkan oleh: <strong className="text-slate-800">{s.user_name}</strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                      {!isApproved ? (
                        <>
                          <button
                            type="button"
                            onClick={() => openActionModal(s, 'review')}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all duration-200 flex items-center gap-1.5 cursor-pointer btn-press"
                          >
                            <i className="fa-solid fa-arrow-rotate-left text-xs" aria-hidden="true"></i>
                            <span>{isReview ? 'Perbarui Catatan Revisi' : 'Minta Revisi'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openActionModal(s, 'approved')}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-800 text-white hover:bg-blue-900 transition-all duration-200 shadow-xs flex items-center gap-1.5 cursor-pointer btn-press"
                          >
                            <i className="fa-solid fa-check text-xs" aria-hidden="true"></i>
                            <span>Setujui Survei (ACC)</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openActionModal(s, 'approved')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center gap-1 cursor-pointer"
                          >
                            <i className="fa-solid fa-pen text-slate-400 text-xs" aria-hidden="true"></i>
                            <span>Ubah Catatan ACC</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openActionModal(s, 'review')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition flex items-center gap-1 cursor-pointer"
                          >
                            <i className="fa-solid fa-arrow-rotate-left text-rose-600 text-xs" aria-hidden="true"></i>
                            <span>Tarik Kembali ke Revisi</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Luas Lahan</span>
                      <strong className="text-slate-800 text-sm font-display">{s.area_size} m²</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Elevasi Kontur</span>
                      <strong className="text-slate-800 text-sm font-display">{s.elevation}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Jenis Tanah (Sondir)</span>
                      <p className="text-slate-700 font-semibold truncate">{s.soil_type}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Aksesibilitas Alat</span>
                      <p className="text-slate-700 font-semibold truncate">{s.accessibility}</p>
                    </div>
                  </div>

                  {isReview && s.reviewer_notes && (
                    <div className="mt-3.5 p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl text-xs animate-fade-in">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-rose-900 flex items-center gap-1.5">
                          <i className="fa-solid fa-triangle-exclamation text-rose-600" aria-hidden="true"></i>
                          <span>Instruksi Revisi Resmi Direksi:</span>
                        </span>
                        <span className="text-[10.5px] font-bold text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-md">
                          Menunggu Tindak Lanjut Lapangan
                        </span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium mt-1 pl-4 border-l-2 border-rose-400">
                        "{s.reviewer_notes}"
                      </p>
                    </div>
                  )}

                  {isApproved && s.reviewer_notes && (
                    <div className="mt-3.5 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs animate-fade-in">
                      <span className="font-extrabold text-emerald-900 flex items-center gap-1.5 mb-1">
                        <i className="fa-solid fa-circle-check text-emerald-600" aria-hidden="true"></i>
                        <span>Catatan Resmi ACC Direksi:</span>
                      </span>
                      <p className="text-slate-800 leading-relaxed font-medium pl-4 border-l-2 border-emerald-400">
                        "{s.reviewer_notes}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-xs font-medium text-slate-500 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <i className="fa-solid fa-clipboard-check text-xl" aria-hidden="true"></i>
            </div>
            <p className="font-bold text-slate-800 text-sm">Tidak Ada Survei di Kategori Ini</p>
            <p className="text-slate-400 mt-1">
              {activeTab === 'pending'
                ? 'Semua pengajuan survei baru telah ditindaklanjuti oleh Direksi.'
                : activeTab === 'review'
                  ? 'Tidak ada survei lapangan yang sedang dalam status revisi.'
                  : activeTab === 'approved'
                    ? 'Belum ada survei yang disetujui (ACC).'
                    : 'Belum ada data pengajuan survei lokasi di sistem.'}
            </p>
          </div>
        )}
      </div>

      <SurveyActionModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        survey={modalState.survey}
        actionType={modalState.actionType}
        onSubmit={handleProcessAction}
        submitting={submitting}
      />
    </div>
  );
};

export default SurveyApprovalsPage;
