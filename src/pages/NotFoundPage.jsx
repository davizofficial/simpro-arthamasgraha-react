import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="text-center py-20 px-4 max-w-lg mx-auto space-y-5 animate-fade-in">
      <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
        <i className="fa-solid fa-triangle-exclamation text-2xl text-slate-400"></i>
      </div>
      <div className="space-y-2">
        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Error 404 • Halaman Tidak Ditemukan
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Halaman Yang Anda Cari Tidak Ada</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Tautan yang Anda tuju mungkin telah dipindahkan, dihapus, atau Anda mengetikkan alamat URL yang salah.
        </p>
      </div>

      <div className="pt-2 flex justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs transition"
        >
          <i className="fa-solid fa-house text-xs"></i>
          <span>Kembali ke Beranda Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
