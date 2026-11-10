import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ForbiddenPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs text-center space-y-6">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center mx-auto border border-rose-100">
          <i className="fa-solid fa-ban text-2xl text-rose-600"></i>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            HTTP 403 FORBIDDEN
          </span>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">Akses Ditolak</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Akun Anda saat ini (<strong className="text-slate-800 capitalize">{user?.roleLabel || user?.role}</strong>)
            tidak memiliki hak akses untuk membuka halaman ini.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <i className="fa-solid fa-arrow-left text-xs"></i>
            <span>Kembali</span>
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-700 text-xs font-semibold text-white hover:bg-blue-800 transition shadow-xs"
          >
            <i className="fa-solid fa-house text-xs"></i>
            <span>Ke Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
