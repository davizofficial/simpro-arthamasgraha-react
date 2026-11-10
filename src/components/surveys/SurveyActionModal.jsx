import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';

const DEFAULT_APPROVED_NOTE =
  'Hasil survei lokasi disetujui. Kelayakan teknis lahan memadai untuk pelaksanaan pekerjaan fisik.';

const REVISION_TEMPLATES = [
  'Perlu uji sondir tambahan pada zona timur',
  'Perbaiki akses jalan untuk mobilisasi alat berat',
  'Ukur ulang elevasi kontur lahan eksisting',
  'Lengkapi dokumentasi foto kondisi lahan terkini',
  'Klarifikasi batas lahan dengan pemilik persil sekitar',
];

export const SurveyActionModal = ({
  isOpen,
  onClose,
  survey,
  actionType = 'approved',
  onSubmit,
  submitting = false,
}) => {
  const isApproved = actionType === 'approved';
  const [notes, setNotes] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && survey) {
      if (isApproved) {
        setNotes(survey.status === 'approved' && survey.reviewer_notes ? survey.reviewer_notes : DEFAULT_APPROVED_NOTE);
      } else {
        setNotes(survey.status === 'review' && survey.reviewer_notes ? survey.reviewer_notes : '');
      }

      const timer = setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const len = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(len, len);
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isOpen, survey, isApproved]);

  const handleAddTemplate = (tpl) => {
    setNotes((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return tpl;
      const endsWithPunctuation = /[.!?]$/.test(trimmed);
      return `${trimmed}${endsWithPunctuation ? ' ' : '. '}${tpl}`;
    });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim() && !isApproved) return;
    await onSubmit(notes.trim());
  };

  if (!isOpen || !survey) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isApproved ? 'Persetujuan ACC Survei Lokasi' : 'Instruksi Revisi Data Survei'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Proyek Terkait</span>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                survey.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : survey.status === 'review'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-900'
              }`}
            >
              Status:{' '}
              {survey.status === 'approved'
                ? 'Disetujui'
                : survey.status === 'review'
                  ? 'Perlu Revisi'
                  : 'Menunggu Review'}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-900">{survey.project_name}</p>
          <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
            <span>
              Surveyor: <strong className="text-slate-700">{survey.user_name}</strong>
            </span>
            <span>•</span>
            <span>
              Luas: <strong className="text-slate-700">{survey.area_size} m²</strong>
            </span>
            <span>•</span>
            <span>
              Elevasi: <strong className="text-slate-700">{survey.elevation}</strong>
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="survey-review-notes" className="block text-xs font-bold text-slate-700">
              {isApproved ? 'Catatan Resmi Evaluasi Direksi' : 'Catatan Resmi Instruksi Revisi'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10.5px] font-medium text-slate-400">{notes.length} karakter</span>
          </div>

          <textarea
            id="survey-review-notes"
            ref={textareaRef}
            rows={4}
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              isApproved
                ? 'Tuliskan catatan teknis dan rekomendasi pelaksanaan pekerjaan...'
                : 'Tuliskan rincian poin perbaikan teknis atau data lapangan yang wajib dilengkapi oleh tim surveyor...'
            }
            className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
              isApproved
                ? 'border-slate-300 focus:ring-blue-500/20 focus:border-blue-700'
                : 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-600'
            } focus:outline-none focus:ring-2 bg-white leading-relaxed resize-y transition shadow-2xs font-medium`}
          />

          {!isApproved && (
            <div className="mt-2.5 space-y-1.5">
              <span className="text-[10.5px] text-slate-500 font-semibold block">
                Pilih Template Catatan Cepat (klik untuk menyisipkan):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {REVISION_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => handleAddTemplate(tpl)}
                    className="text-[10.5px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-lg transition active:scale-95 cursor-pointer border border-slate-200"
                  >
                    + {tpl}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting || !notes.trim()}
            className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition disabled:opacity-50 btn-press cursor-pointer ${
              isApproved ? 'bg-blue-800 hover:bg-blue-900' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin text-xs" aria-hidden="true"></i>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <i
                  className={`fa-solid ${isApproved ? 'fa-circle-check' : 'fa-paper-plane'} text-xs`}
                  aria-hidden="true"
                ></i>
                <span>{isApproved ? 'Konfirmasi ACC Survei' : 'Kirim Catatan Revisi'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SurveyActionModal;
