import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Modal } from '../components/common/Modal';
import { Can } from '../components/common/Can';

export const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'pengawas',
    roleLabel: 'Pengawas Lapangan',
  });

  const [formErrors, setFormErrors] = useState({});

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getAll();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const rolesCatalog = [
    { key: 'owner', label: 'Owner / Direktur Utama' },
    { key: 'admin', label: 'Administrator Sistem' },
    { key: 'administrasi', label: 'Administrasi & Legal' },
    { key: 'konsultan', label: 'Konsultan Pengawas' },
    { key: 'pengawas', label: 'Pengawas Lapangan' },
    { key: 'logistik', label: 'Logistik & Gudang' },
    { key: 'keuangan', label: 'Keuangan & Akuntansi' },
    { key: 'marketing', label: 'Marketing & Klien' },
  ];

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Nama lengkap pengguna wajib diisi';
    if (!formData.email.trim()) errs.email = 'Alamat email pengguna wajib diisi';
    if (formData.password.length < 8 || !/[A-Za-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      errs.password = 'Kata sandi minimal 8 karakter dan memuat huruf serta angka';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const matched = rolesCatalog.find((r) => r.key === formData.role);
      const res = await userService.create({
        ...formData,
        roleLabel: matched ? matched.label : formData.role,
      });
      if (res.success) {
        setFeedback({ type: 'success', message: 'Pengguna baru berhasil ditambahkan!' });
        setIsModalOpen(false);
        setFormData({
          name: '',
          username: '',
          email: '',
          password: '',
          role: 'pengawas',
          roleLabel: 'Pengawas Lapangan',
        });
        loadUsers();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await userService.toggleStatus(id);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        loadUsers();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const activeUsers = users.filter((u) => u.status === 'Aktif').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">Kelola Pengguna</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Manajemen akun pengguna dan status keaktifan personil CV. Arthamas Graha.
          </p>
        </div>

        <Can permission="users.create">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition flex items-center self-start sm:self-auto"
          >
            <i className="fa-solid fa-user-plus mr-1.5 text-xs"></i>
            <span>Tambah Pengguna Baru</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Total Akun Terdaftar</p>
          <p className="mt-1.5 text-2xl font-display font-extrabold text-slate-900">{users.length} Akun</p>
          <p className="mt-1 text-xs text-slate-500 font-semibold">Terkonfigurasi dalam sistem</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Akun Aktif</p>
          <p className="mt-1.5 text-2xl font-display font-extrabold text-emerald-700">{activeUsers} Akun</p>
          <p className="mt-1 text-xs text-emerald-700 font-semibold">Memiliki akses ke sistem</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Jabatan & Peran</p>
          <p className="mt-1.5 text-2xl font-display font-extrabold text-blue-800">8 Peran</p>
          <p className="mt-1 text-xs text-blue-700 font-semibold">Direksi, Staf Lapangan, Keuangan, dll.</p>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadUsers} />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Nama Personil</th>
                  <th className="px-4 py-3.5">Username & Email</th>
                  <th className="px-4 py-3.5">Jabatan / Peran</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  const isActive = u.status === 'Aktif';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {u.avatar || u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm">{u.name}</p>
                            {isCurrent && (
                              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                Akun Anda Saat Ini
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <p className="font-bold text-slate-800">{u.username}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {u.roleLabel || u.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Can
                          permission="users.edit"
                          fallback={
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}
                            >
                              {isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                          }
                        >
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Klik untuk mengubah status aktif"
                          >
                            {isActive ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </Can>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {isCurrent ? 'Akun Aktif' : 'Terdaftar'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Pendaftaran Pengguna Baru">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap Personil <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Ir. Dwi Hartanto, S.T."
              className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                formErrors.name ? 'border-rose-500' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-600`}
            />
            {formErrors.name && <p className="text-[11px] text-rose-600 mt-1">{formErrors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nama@arthamasgraha.com"
                className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                  formErrors.email ? 'border-rose-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-600`}
              />
              {formErrors.email && <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Username Login</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="username"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="new-user-password" className="block text-xs font-bold text-slate-700 mb-1">
              Kata Sandi Awal <span className="text-rose-500">*</span>
            </label>
            <input
              id="new-user-password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimal 8 karakter, huruf dan angka"
              className={`w-full px-3.5 py-2 text-xs rounded-xl border ${formErrors.password ? 'border-rose-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-blue-600`}
            />
            {formErrors.password && <p className="text-[11px] text-rose-600 mt-1">{formErrors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan / Peran Pengguna</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              {rolesCatalog.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
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
              {submitting ? 'Menyimpan...' : 'Daftarkan Pengguna'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
