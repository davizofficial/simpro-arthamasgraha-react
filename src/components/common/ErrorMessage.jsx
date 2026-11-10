import React from 'react';

export const ErrorMessage = ({ message, onRetry, title = 'Gagal Memuat Data' }) => {
  return (
    <div
      role="alert"
      className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-xl mx-auto my-8 shadow-xs"
    >
      <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
        <i className="fa-solid fa-triangle-exclamation text-xl" aria-hidden="true"></i>
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
        {message || 'Terjadi gangguan saat mengambil data dari server. Periksa koneksi atau coba muat ulang.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-semibold text-sm rounded-lg transition duration-150 shadow-xs"
        >
          <i className="fa-solid fa-arrows-rotate text-xs" aria-hidden="true"></i>
          <span>Coba Lagi (Retry)</span>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
