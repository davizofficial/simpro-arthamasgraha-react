import React from 'react';

export const PageLoader = ({ label = 'Memuat modul...' }) => {
  return (
    <div
      className="flex min-h-[50vh] w-full items-center justify-center p-8 animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center border border-blue-100 shadow-xs">
          <i className="fa-solid fa-circle-notch fa-spin text-base" aria-hidden="true"></i>
        </div>
        <p className="text-xs font-semibold text-slate-500 font-display">{label}</p>
      </div>
    </div>
  );
};

export default PageLoader;
