import React, { useState, useEffect } from 'react';
import { settingService } from '../services/api';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const SettingsPage = () => {
  const [settings, setSettings] = useState({
    company_name: 'CV. Arthamas Graha',
    company_tagline: 'Sistem Informasi Manajemen Proyek Konstruksi & Pengawasan',
    address: 'Jl. ZA. Pagar Alam No. 42, Rajabasa, Bandar Lampung',
    phone: '(0721) 781290',
    email: 'kontak@arthamasgraha.com',
    site_survey_photo_required: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await settingService.getSettings();
      if (res.success && res.data) {
        setSettings((prev) => ({
          ...prev,
          ...res.data,
          site_survey_photo_required:
            res.data.site_survey_photo_required !== undefined
              ? Boolean(res.data.site_survey_photo_required)
              : prev.site_survey_photo_required,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await settingService.updateSettings(settings);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Pengaturan profil CV. Arthamas Graha berhasil diperbarui!' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
            Pengaturan Sistem & Profil Perusahaan
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Konfigurasi identitas resmi perusahaan, kontak operasional, dan parameter sistem CV. Arthamas Graha.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between animate-fade-in ${
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

      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0 border border-blue-100">
            <i className="fa-solid fa-building text-sm"></i>
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base font-display">
              Profil & Identitas Perusahaan
            </h2>
            <p className="text-xs text-slate-500">
              Informasi ini dicantumkan pada kop dokumen, lembar cetak PDF, dan laporan resmi.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Resmi Perusahaan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                placeholder="Contoh: CV. Arthamas Graha"
                className="w-full px-3.5 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alamat Email Perusahaan <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="Contoh: kontak@arthamasgraha.com"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nomor Telepon Kantor <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="Contoh: (0721) 781290"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Slogan / Tagline Sistem</label>
              <input
                type="text"
                value={settings.company_tagline}
                onChange={(e) => setSettings({ ...settings, company_tagline: e.target.value })}
                placeholder="Contoh: Sistem Informasi Manajemen Proyek Konstruksi"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Alamat Kantor Operasional <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="Tuliskan alamat lengkap kantor operasional atau kantor pusat..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Alamat ini otomatis dicantumkan pada bagian kepala dokumen laporan dan formulir berita acara.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-2">Kebijakan Validasi Lapangan</label>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
              <input
                type="checkbox"
                id="site_survey_photo_required"
                checked={settings.site_survey_photo_required}
                onChange={(e) => setSettings({ ...settings, site_survey_photo_required: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-blue-600 shadow-2xs focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <label
                  htmlFor="site_survey_photo_required"
                  className="text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  Wajibkan Lampiran Foto pada Survei Lokasi (Site Survey)
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Jika diaktifkan, pengawas wajib melampirkan minimal 1 berkas foto/dokumen saat mengajukan laporan
                  survei baru.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <i className="fa-solid fa-clock-rotate-left"></i>
              <span>Pembaruan tersimpan otomatis ke basis data konfigurasi.</span>
            </span>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition duration-150 shadow-xs flex items-center gap-2 disabled:opacity-50 btn-press cursor-pointer"
            >
              <i className="fa-solid fa-floppy-disk text-xs"></i>
              <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
