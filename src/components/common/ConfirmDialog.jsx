import React from 'react';
import { Modal } from './Modal';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Tindakan',
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  confirmVariant = 'danger',
  loading = false,
}) => {
  const isDanger = confirmVariant === 'danger';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-700'
            }`}
          >
            <i
              className={`fa-solid ${isDanger ? 'fa-triangle-exclamation' : 'fa-circle-question'} text-base`}
              aria-hidden="true"
            ></i>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pt-1">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl transition cursor-pointer disabled:opacity-50 ${
              isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-800 hover:bg-blue-900'
            }`}
          >
            {loading && <i className="fa-solid fa-spinner fa-spin text-xs" aria-hidden="true"></i>}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
