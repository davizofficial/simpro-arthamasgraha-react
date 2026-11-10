import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';

const INITIAL_FORM = {
  name: '',
  company: '',
  category: 'Swasta',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
};

export const ClientModal = ({ isOpen, onClose, onSubmit, submitting }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM);
      setFormErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Nama instansi atau perusahaan klien wajib diisi';
    }
    if (!formData.contact_person.trim()) {
      errors.contact_person = 'Nama PIC / penanggung jawab wajib diisi';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Nomor telepon / WhatsApp kontak wajib diisi';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const ok = await onSubmit(formData);
    if (ok) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Mitra Klien Baru" maxWidth="max-w-lg">
      <div className="p-1">
        <p className="text-xs text-slate-500 font-medium mb-4">
          Lengkapi formulir di bawah ini untuk mendaftarkan institusi atau perusahaan rekanan baru ke basis data CV.
          Arthamas Graha.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Instansi / Perusahaan Klien <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <i
                className="fa-regular fa-building absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                aria-hidden="true"
              ></i>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: PT. Maju Bersama / Dinas PUPR Cirebon"
                className={`w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border ${
                  formErrors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-white'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700 transition`}
              />
            </div>
            {formErrors.name && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                <i className="fa-solid fa-circle-exclamation text-[10px]" aria-hidden="true"></i>
                <span>{formErrors.name}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Sektor Mitra</label>
              <div className="relative">
                <i
                  className="fa-solid fa-layer-group absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                  aria-hidden="true"
                ></i>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700 bg-white appearance-none cursor-pointer transition font-medium"
                >
                  <option value="Swasta">Swasta (Komersial / Developer)</option>
                  <option value="Pemerintah">Pemerintah (Dinas / APBD / APBN)</option>
                  <option value="BUMN">BUMN / BUMD</option>
                </select>
                <i
                  className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none"
                  aria-hidden="true"
                ></i>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama PIC / Penanggung Jawab <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <i
                  className="fa-regular fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                  aria-hidden="true"
                ></i>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="Contoh: Ir. Budi Hartono, MT"
                  className={`w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border ${
                    formErrors.contact_person ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700 transition`}
                />
              </div>
              {formErrors.contact_person && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                  <i className="fa-solid fa-circle-exclamation text-[10px]" aria-hidden="true"></i>
                  <span>{formErrors.contact_person}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Telepon / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <i
                  className="fa-solid fa-phone absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                  aria-hidden="true"
                ></i>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0812-3456-7890 / 021-..."
                  className={`w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border ${
                    formErrors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700 transition`}
                />
              </div>
              {formErrors.phone && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                  <i className="fa-solid fa-circle-exclamation text-[10px]" aria-hidden="true"></i>
                  <span>{formErrors.phone}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Resmi Instansi (Opsional)</label>
              <div className="relative">
                <i
                  className="fa-regular fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                  aria-hidden="true"
                ></i>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="kontak@mitra.co.id"
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Kantor / Domisili Proyek (Opsional)
            </label>
            <div className="relative">
              <i
                className="fa-solid fa-location-dot absolute left-3.5 top-3 text-slate-400 text-xs"
                aria-hidden="true"
              ></i>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Jl. Jend. Sudirman No. 123, Jakarta"
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700 transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-blue-800 text-white hover:bg-blue-900 rounded-xl shadow-xs transition disabled:opacity-50 btn-press cursor-pointer"
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin text-xs" aria-hidden="true"></i>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk text-xs" aria-hidden="true"></i>
                  <span>Simpan Klien</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ClientModal;
