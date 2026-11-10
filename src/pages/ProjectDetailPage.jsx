import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../services/api';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { formatRupiah } from '../utils/formatters';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('teknis');

  const loadDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectService.getById(id);
      if (res.success) {
        setProject(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-40 bg-slate-200 rounded-3xl animate-pulse"></div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  if (error || !project) {
    return (
      <ErrorMessage
        message={error || 'Data proyek tidak ditemukan.'}
        onRetry={loadDetail}
        title="Gagal Memuat Detail Proyek"
      />
    );
  }

  const name = project.name || project.nama;
  const code = project.project_code || `P${project.id}`;
  const location = project.location || project.lokasi;
  const clientName = project.client_name || project.klien;
  const budget = project.budget || project.pagu_rab || 0;
  const spent = project.spent || project.realisasi_kas || 0;
  const progress = project.progress !== undefined ? project.progress : project.realisasi_progres || 0;
  const targetProgress = project.target_progress || project.rencana_progres || 50;
  const deviasi = project.deviasi || '+0.0%';
  const manager = project.manager || 'Andi Wijaya, ST';
  const description = project.description || 'Pekerjaan konstruksi dan infrastruktur CV. Arthamas Graha.';
  const reports = project.progress_reports || project.riwayat_laporan || [];
  const transactions = project.transactions || [];
  const documents = project.documents || [];
  const requests = project.material_requests || [];

  const progressColor = progress >= 80 ? 'bg-emerald-600' : progress >= 40 ? 'bg-blue-700' : 'bg-amber-500';

  return (
    <div className="space-y-6 animate-fade-in">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-blue-700 transition">
          Beranda
        </Link>
        <span>/</span>
        <Link to="/projects" className="hover:text-blue-700 transition">
          Portofolio Proyek
        </Link>
        <span>/</span>
        <span className="font-bold text-slate-800 truncate">
          {code} - {name}
        </span>
      </nav>

      <section className="bg-blue-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-0.5 rounded-md">
                {code}
              </span>
              <span className="text-xs text-blue-200 capitalize font-medium">• Status: {project.status}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight">{name}</h1>
            <p className="text-blue-100 text-xs flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-location-dot text-blue-300 text-xs mr-0.5"></i>
                {location}
              </span>
              <span>•</span>
              <span>
                Klien: <strong>{clientName}</strong>
              </span>
              <span>•</span>
              <span>
                PM: <strong>{manager}</strong>
              </span>
            </p>
          </div>

          <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 shrink-0">
            <div className="text-left lg:text-right">
              <p className="text-[11px] text-blue-200 uppercase font-bold">Capaian Progres Fisik</p>
              <p className="text-3xl font-display font-extrabold">{progress}%</p>
              <p className="text-xs text-blue-200 font-semibold">Deviasi: {deviasi}</p>
            </div>
            <Link
              to="/progress"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-blue-900 text-xs font-bold rounded-xl hover:bg-blue-50 transition shadow-xs"
            >
              <i className="fa-solid fa-plus text-blue-800 text-xs"></i>
              <span>Lapor Progres</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-blue-200 mb-1.5 font-medium">
            <span>Realisasi Fisik vs Target ({targetProgress}%)</span>
            <span>RAB: {formatRupiah(budget)}</span>
          </div>
          <div className="h-2.5 bg-blue-950/60 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { key: 'teknis', label: 'Ringkasan Teknis & Kurva-S' },
          { key: 'boq', label: 'Rincian BoQ & Anggaran' },
          { key: 'transaksi', label: `Histori Biaya (${transactions.length})` },
          { key: 'dokumen', label: `Dokumen & CAD (${documents.length})` },
          { key: 'laporan', label: `Laporan Mingguan (${reports.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === tab.key ? 'bg-blue-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'teknis' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 font-display">
                Deskripsi & Ruang Lingkup Pekerjaan
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Mulai Pekerjaan</span>
                  <strong className="text-slate-800">{project.start_date || '2026-01-10'}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Selesai</span>
                  <strong className="text-slate-800">{project.end_date || '2026-12-20'}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Nilai Kontrak</span>
                  <strong className="text-slate-800">{formatRupiah(project.contract_value || budget)}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Deviasi Jadwal</span>
                  <strong className={deviasi.startsWith('+') ? 'text-emerald-700' : 'text-rose-700'}>{deviasi}</strong>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 font-display">Grafik Deviasi Kurva-S</h3>
                  <p className="text-xs text-slate-400">
                    Perbandingan kumulatif progres rencana vs realisasi lapangan.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  On Schedule
                </span>
              </div>

              <div className="h-44 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-4 relative overflow-hidden">
                <div className="w-full flex items-end justify-between gap-2 h-32 pt-4">
                  {[10, 20, 32, 45, 58, 68, 75, 85, 95, 100].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-blue-700/80 rounded-t transition-all hover:bg-blue-800"
                        style={{ height: `${(val / 100) * 100}%` }}
                        title={`Minggu ${idx + 1}: ${val}%`}
                      />
                      <span className="text-[9px] text-slate-400 font-bold">W{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 font-display">Status Keuangan Proyek</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-medium">Alokasi Pagu RAB</span>
                  <strong className="text-slate-900">{formatRupiah(budget)}</strong>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-medium">Realisasi Biaya Kas</span>
                  <strong className="text-slate-900">{formatRupiah(spent)}</strong>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                  <span className="text-blue-900 font-bold">Sisa Pagu Kas</span>
                  <strong className="text-blue-950 font-display text-sm">{formatRupiah(budget - spent)}</strong>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">Pengadaan Material</h3>
              <p className="text-xs text-slate-500">{requests.length} pengajuan material terkait proyek ini.</p>
              <Link
                to="/material-requests"
                className="w-full py-2 px-3 text-xs font-bold text-center text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl block transition"
              >
                Lihat Pengajuan Material →
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'boq' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-slate-900 font-display">Rincian Bill of Quantities (BoQ)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar item pekerjaan utama dan alokasi biaya satuan pekerjaan.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Uraian Pekerjaan</th>
                  <th className="px-4 py-3">Volume</th>
                  <th className="px-4 py-3 text-right">Harga Satuan (Rp)</th>
                  <th className="px-4 py-3 text-right">Subtotal (Rp)</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-bold text-slate-900">Pekerjaan Persiapan & Bowplank</td>
                  <td className="px-4 py-3.5 text-slate-600">1 Ls</td>
                  <td className="px-4 py-3.5 text-right text-slate-700">45.000.000</td>
                  <td className="px-4 py-3.5 text-right font-bold text-slate-900">45.000.000</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Selesai 100%
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-bold text-slate-900">Pekerjaan Pondasi Bore Pile & Pile Cap</td>
                  <td className="px-4 py-3.5 text-slate-600">320 m'</td>
                  <td className="px-4 py-3.5 text-right text-slate-700">1.850.000</td>
                  <td className="px-4 py-3.5 text-right font-bold text-slate-900">592.000.000</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Selesai 100%
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-bold text-slate-900">Struktur Kolom, Balok & Plat Beton Bertulang</td>
                  <td className="px-4 py-3.5 text-slate-600">450 m³</td>
                  <td className="px-4 py-3.5 text-right text-slate-700">4.200.000</td>
                  <td className="px-4 py-3.5 text-right font-bold text-slate-900">1.890.000.000</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      On Progress (65%)
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-bold text-slate-900">Pekerjaan Dinding Bata Ringan & Plester Aci</td>
                  <td className="px-4 py-3.5 text-slate-600">1.200 m²</td>
                  <td className="px-4 py-3.5 text-right text-slate-700">165.000</td>
                  <td className="px-4 py-3.5 text-right font-bold text-slate-900">198.000.000</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      Pending
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'transaksi' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 font-display">Histori Pengeluaran Kas Proyek</h3>
              <p className="text-xs text-slate-400 mt-0.5">Catatan transaksi operasional dan pengadaan material.</p>
            </div>
            <Link to="/finance" className="text-xs font-bold text-blue-800 hover:text-blue-900">
              Lihat di Buku Kas →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Uraian Transaksi</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length > 0 ? (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 text-slate-500">{t.date}</td>
                      <td className="px-4 py-3.5 font-bold capitalize text-slate-800">{t.category}</td>
                      <td className="px-4 py-3.5 text-slate-700">{t.description}</td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900">{formatRupiah(t.amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                      Belum ada transaksi pengeluaran khusus untuk proyek ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'dokumen' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 font-display">Berkas & Gambar DED CAD Proyek</h3>
            <Link to="/documents" className="text-xs font-bold text-blue-800 hover:text-blue-900">
              Kelola di Manajemen Dokumen →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.length > 0 ? (
              documents.map((d) => (
                <div
                  key={d.id}
                  className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <i className="fa-solid fa-file-lines text-xl text-blue-700 shrink-0"></i>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate">{d.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {d.category.toUpperCase()} • {d.size}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 shrink-0 flex items-center gap-1">
                    <i className="fa-solid fa-download text-[10px]"></i>
                    Unduh
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-2 p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Belum ada dokumen yang diunggah untuk proyek ini.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'laporan' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 font-display">Laporan Progres Mingguan</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Catatan fisik mingguan dan kendala lapangan yang dilaporkan pengawas.
              </p>
            </div>
            <Link to="/progress" className="text-xs font-bold text-blue-800 hover:text-blue-900">
              Input Laporan Baru →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {reports.length > 0 ? (
              reports.map((r) => (
                <div key={r.id} className="p-5 hover:bg-slate-50 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs">
                      Minggu Ke-{r.week_number || 1} • {r.date}
                    </span>
                    <span className="text-xs font-black text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                      Capaian: {r.progress}% (+{r.progress_gain || 2.5}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{r.notes}</p>
                  <p className="text-[11px] text-slate-400">
                    Kendala: <span className="text-slate-600">{r.issues || 'Tidak ada kendala'}</span> • Pelapor:{' '}
                    <strong>{r.reporter}</strong>
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">Belum ada laporan mingguan yang dicatat.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
