import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Silakan masukkan username Anda.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await login({ username: username.trim(), password });
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMessage(res.error || 'Username atau kata sandi tidak valid.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white antialiased font-sans">
      <div
        id="branding-panel"
        className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-center px-12 xl:px-24"
      >
        <div className="absolute inset-0 z-0">
          <picture>
            <source srcSet="/bg.webp" type="image/webp" />
            <img src="/bg.jpg" alt="Background Proyek CV. Arthamas Graha" className="w-full h-full object-cover" />
          </picture>
        </div>

        <div className="absolute inset-0 bg-black/55 z-0 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center space-x-6 mb-10">
            <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-3 transition-transform duration-500 hover:scale-105 hover:rotate-3 cursor-default">
              <img src="/icon.png" alt="SIMPRO Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-display font-black text-6xl tracking-widest text-white uppercase">SIMPRO</h1>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Selamat Datang di <br />
            <span className="text-slate-200">Platform SIMPRO</span>
          </h2>

          <p className="text-slate-300 text-lg max-w-lg leading-relaxed mb-10 font-medium">
            Sistem Informasi Manajemen Proyek untuk CV. Arthamas Graha.
          </p>

          <div className="flex items-center">
            <span className="inline-flex items-center px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-xs font-bold tracking-widest uppercase backdrop-blur-sm shadow-lg">
              <i className="fa-solid fa-building mr-2"></i> CV. ARTHAMAS GRAHA
            </span>
          </div>
        </div>

        <div className="absolute bottom-10 left-12 xl:left-24 text-slate-400 text-xs font-bold tracking-widest uppercase">
          &copy; {new Date().getFullYear()} CV. Arthamas Graha
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-white">
        <div className="lg:hidden flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-20 h-20 rounded-3xl shadow-md border border-slate-100 mb-4 p-3 bg-white">
            <img src="/icon.png" alt="SIMPRO Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-display font-black text-3xl tracking-wider text-slate-900 uppercase">SIMPRO</h1>
          <span className="text-[11px] text-slate-500 tracking-widest font-bold uppercase mt-1">
            CV. ARTHAMAS GRAHA
          </span>
        </div>

        <div className="w-full max-w-lg">
          <div className="mb-8">
            <h3 className="font-display font-extrabold text-3xl md:text-4xl text-slate-900 tracking-tight mb-2">
              Selamat Datang
            </h3>
            <p className="text-sm md:text-base text-slate-500 font-medium">
              Silakan masukkan username dan kata sandi Anda untuk mengakses sistem.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 bg-rose-50 text-rose-800 p-4 rounded-xl text-xs font-bold border border-rose-200 flex items-center">
              <i className="fa-solid fa-circle-exclamation text-rose-600 mr-2 text-sm"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="username-field"
                className="block text-xs font-bold text-slate-700 tracking-wider uppercase"
              >
                USERNAME
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-700 transition-colors">
                  <i className="fa-solid fa-user text-base"></i>
                </div>
                <input
                  id="username-field"
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-700 transition duration-200 outline-none placeholder:text-slate-400"
                  placeholder="Contoh: owner, admin, pengawas, logistik"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password-field"
                  className="block text-xs font-bold text-slate-700 tracking-wider uppercase"
                >
                  KATA SANDI
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-700 transition-colors">
                  <i className="fa-solid fa-lock text-base"></i>
                </div>
                <input
                  id="password-field"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-700 transition duration-200 outline-none placeholder:text-slate-400 font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 focus:outline-none"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-base`}></i>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-700 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-600">Biarkan saya tetap masuk</span>
              </label>
              <span className="text-xs font-bold text-blue-800 hover:underline cursor-pointer">Lupa sandi?</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group flex justify-center items-center py-4 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 focus:ring-4 focus:ring-blue-500/30 text-white rounded-xl text-sm font-bold tracking-wider uppercase transition-all duration-300 shadow-lg shadow-blue-700/30 hover:shadow-blue-700/50 transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <span>{loading ? 'Memvalidasi Sesi...' : 'Masuk'}</span>
              <i className="fa-solid fa-arrow-right ml-3 transition-transform duration-300 group-hover:translate-x-1.5"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
