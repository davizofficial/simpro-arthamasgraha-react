import React, { useState, useEffect } from 'react';
import { equipmentService, projectService } from '../services/api';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Can } from '../components/common/Can';
import { formatRupiah } from '../utils/formatters';

export const EquipmentsPage = () => {
  const [equipments, setEquipments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedEq, setSelectedEq] = useState(null);
  const [returnTarget, setReturnTarget] = useState(null);
  const [returning, setReturning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    daily_cost: '',
    condition: 'Prima / Operasional',
    operator: '',
  });

  const [assignProjectId, setAssignProjectId] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [eqRes, projRes] = await Promise.all([
        equipmentService.getAll(),
        projectService.getAll({ status: 'aktif' }),
      ]);
      if (eqRes.success) setEquipments(eqRes.data);
      if (projRes.success) {
        setProjects(projRes.data);
        if (projRes.data.length > 0) setAssignProjectId(projRes.data[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.daily_cost) return;

    setSubmitting(true);
    try {
      const res = await equipmentService.create(formData);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Alat berat berhasil didaftarkan ke SIMPRO!' });
        setIsModalOpen(false);
        setFormData({ name: '', daily_cost: '', condition: 'Prima / Operasional', operator: '' });
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedEq) return;

    setSubmitting(true);
    try {
      const proj = projects.find((p) => p.id === parseInt(assignProjectId));
      const res = await equipmentService.assign(selectedEq.id, {
        project_id: proj ? proj.id : null,
        project_name: proj ? proj.name : null,
        status: proj ? 'Di Lokasi Proyek' : 'Tersedia di Pool',
      });
      if (res.success) {
        setFeedback({ type: 'success', message: 'Status penugasan alat berat berhasil diperbarui!' });
        setIsAssignModalOpen(false);
        setSelectedEq(null);
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReturnToPool = async () => {
    if (!returnTarget) return;
    setReturning(true);
    try {
      const res = await equipmentService.assign(returnTarget.id, { project_id: null });
      if (res.success) {
        setFeedback({ type: 'success', message: `${returnTarget.name} telah kembali ke Pool Logistik.` });
        setReturnTarget(null);
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setReturning(false);
    }
  };

  const activeCount = equipments.filter((e) => e.status === 'Di Lokasi Proyek').length;
  const poolCount = equipments.filter((e) => e.status !== 'Di Lokasi Proyek').length;
  const totalDaily = equipments.reduce((acc, curr) => acc + (curr.daily_cost || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
            Alat Berat & Aset Proyek
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Manajemen armada alat berat (Excavator, Crane, Dump Truck), lokasi proyek aktif, dan kondisi mesin CV.
            Arthamas Graha.
          </p>
        </div>

        <Can permission="equipments.create">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition flex items-center self-start sm:self-auto"
          >
            <i className="fa-solid fa-plus mr-1.5 text-xs"></i>
            <span>Tambah Alat / Aset</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Total Armada Terdaftar</p>
          <p className="mt-1.5 text-2xl font-display font-extrabold text-slate-900">{equipments.length} Unit</p>
          <p className="mt-1 text-xs text-slate-500 font-semibold">Aset kepemilikan CV</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Beroperasi di Proyek</p>
          <p className="mt-1.5 text-2xl font-display font-extrabold text-blue-800">{activeCount} Unit</p>
          <p className="mt-1 text-xs text-blue-700 font-semibold">Sedang ditugaskan</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Tersedia di Pool</p>
          <p className="mt-1.5 text-2xl font-display font-extrabold text-emerald-700">{poolCount} Unit</p>
          <p className="mt-1 text-xs text-emerald-700 font-semibold">Siap dimobilisasi</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Total Tarif Harian</p>
          <p className="mt-1.5 text-xl font-display font-extrabold text-slate-900 truncate">
            {formatRupiah(totalDaily)}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-semibold">Akumulasi rate sewa</p>
        </div>
      </div>

      {loading ? (
        <CardSkeleton count={4} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : equipments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <i className="fa-solid fa-truck-monster text-3xl mb-2 text-slate-300 block"></i>
          <h4 className="font-semibold text-slate-700 text-sm">Tidak Ada Alat Berat Terdaftar</h4>
          <p className="text-xs text-slate-400 mt-0.5 max-w-sm mx-auto">
            Belum ada aset alat berat yang terdaftar di pool.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {equipments.map((eq) => {
            const isAssigned = eq.status === 'Di Lokasi Proyek';
            return (
              <div
                key={eq.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-display font-black text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {eq.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAssigned ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {eq.status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 font-display">{eq.name}</h3>

                  <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Tarif Sewa Harian:</span>
                      <strong className="text-slate-900 font-display">{formatRupiah(eq.daily_cost)} / hari</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Operator Resmi:</span>
                      <strong className="text-slate-700">{eq.operator || 'Siap Tugas'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Kondisi Mesin:</span>
                      <strong className="text-emerald-700">{eq.condition}</strong>
                    </div>
                  </div>

                  {isAssigned && eq.current_project_name && (
                    <div className="mt-3 p-2.5 bg-blue-50/70 rounded-xl border border-blue-200 text-xs">
                      <span className="text-[10px] uppercase font-bold text-blue-800 flex items-center gap-1">
                        <i className="fa-solid fa-location-dot text-blue-700 text-[10px]"></i>
                        Proyek Penugasan
                      </span>
                      <p className="font-bold text-slate-900 truncate mt-0.5">{eq.current_project_name}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Can
                    permission="equipments.edit"
                    fallback={
                      <span className="text-[11px] text-slate-400 font-semibold italic text-center w-full">
                        {isAssigned ? 'Sedang Ditugaskan' : 'Tersedia di Pool'}
                      </span>
                    }
                  >
                    {isAssigned ? (
                      <button
                        onClick={() => setReturnTarget(eq)}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-arrow-rotate-left text-xs"></i>
                        <span>Tarik ke Pool</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedEq(eq);
                          setIsAssignModalOpen(true);
                        }}
                        className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <i className="fa-solid fa-truck-pickup text-xs"></i>
                        <span>Tugaskan ke Proyek</span>
                      </button>
                    )}
                  </Can>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Pendaftaran Alat Berat Baru">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama & Tipe Alat Berat <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Bulldozer Caterpillar D6R / Tower Crane 40M"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tarif Sewa Harian (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={formData.daily_cost}
                onChange={(e) => setFormData({ ...formData, daily_cost: e.target.value })}
                placeholder="Contoh: 2500000"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Operator Penanggung Jawab</label>
              <input
                type="text"
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                placeholder="Nama operator"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kondisi Mesin / Servis</label>
            <input
              type="text"
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
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
              {submitting ? 'Menyimpan...' : 'Daftarkan Alat'}
            </button>
          </div>
        </form>
      </Modal>

      {selectedEq && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Penugasan: ${selectedEq.name}`}
        >
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Proyek Penerima Penugasan <span className="text-rose-500">*</span>
              </label>
              <select
                value={assignProjectId}
                onChange={(e) => setAssignProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_code} - {p.name} ({p.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold bg-blue-800 text-white hover:bg-blue-900 rounded-xl shadow-xs disabled:opacity-50"
              >
                {submitting ? 'Menugaskan...' : 'Konfirmasi Penugasan'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!returnTarget}
        onClose={() => setReturnTarget(null)}
        onConfirm={handleConfirmReturnToPool}
        title="Tarik Alat Berat ke Pool"
        message={`Apakah Anda yakin ingin menarik alat berat "${returnTarget?.name}" dari lokasi proyek kembali ke Pool Logistik?`}
        confirmText="Tarik ke Pool"
        confirmVariant="primary"
        loading={returning}
      />
    </div>
  );
};

export default EquipmentsPage;
