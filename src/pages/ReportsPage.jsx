import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { formatNumber } from '../utils/formatters';

export const ReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('proyek');

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getSummary();
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!reportData || !reportData.projects) return;
    const headers = 'Kode,Nama Proyek,Lokasi,Klien,Pagu RAB,Realisasi Kas,Progres Fisik,Status\n';
    const rows = reportData.projects
      .map(
        (p) =>
          `"${p.project_code}","${p.name}","${p.location}","${p.client_name}",${p.budget},${p.spent},"${p.progress}%","${p.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SIMPRO_Laporan_${reportType}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-slate-200 rounded-2xl animate-pulse"></div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  if (error || !reportData) {
    return <ErrorMessage message={error || 'Gagal memuat rekapitulasi laporan'} onRetry={loadReport} />;
  }

  const { company, rekap_proyek, projects, materials_usage, recent_progress } = reportData;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5 print:hidden">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
            Generate Laporan & Rekapitulasi Proyek
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Cetak rekapitulasi capaian fisik Kurva-S, serapan anggaran RAB, dan distribusi material CV. Arthamas Graha.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <i className="fa-solid fa-file-csv mr-1.5 text-xs text-emerald-700"></i>
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition shadow-xs"
          >
            <i className="fa-solid fa-print mr-1.5 text-xs"></i>
            <span>Cetak Dokumen PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Pilih Jenis Rekapitulasi:</span>
          <div className="flex items-center gap-1.5">
            {[
              { key: 'proyek', label: 'Portofolio Proyek Fisik' },
              { key: 'keuangan', label: 'Keuangan & Serapan RAB' },
              { key: 'logistik', label: 'Logistik Material' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setReportType(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  reportType === tab.key
                    ? 'bg-blue-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Periode: <strong className="text-slate-700">Tahun Anggaran 2026</strong>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
        <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-slate-900 uppercase">
              {company.company_name}
            </h2>
            <p className="text-xs text-slate-500 font-medium">{company.company_tagline}</p>
            <p className="text-xs text-slate-400">
              {company.address} • Telp: {company.phone} • Email: {company.email}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 uppercase">
              LAPORAN RESMI
            </span>
            <p className="text-xs text-slate-400 mt-2">Tanggal Cetak:</p>
            <p className="text-xs font-bold text-slate-800">
              {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Proyek Portofolio</span>
            <strong className="text-slate-900 font-display text-base">{rekap_proyek.total_proyek} Proyek</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Rata-Rata Capaian Fisik</span>
            <strong className="text-blue-800 font-display text-base">{rekap_proyek.rata_progres}%</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Pagu RAB</span>
            <strong className="text-slate-900 font-display text-base">
              Rp {(rekap_proyek.total_rab / 1000000000).toFixed(1)} Miliar
            </strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Realisasi Pengeluaran</span>
            <strong className="text-slate-900 font-display text-base">
              Rp {(rekap_proyek.total_realisasi / 1000000000).toFixed(1)} Miliar
            </strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-[11px] font-bold uppercase text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 border-r border-slate-200">Kode & Proyek</th>
                <th className="px-3 py-3 border-r border-slate-200">Klien / Lokasi</th>
                <th className="px-3 py-3 text-right border-r border-slate-200">Pagu RAB (Rp)</th>
                <th className="px-3 py-3 text-right border-r border-slate-200">Realisasi (Rp)</th>
                <th className="px-3 py-3 text-right border-r border-slate-200">Fisik</th>
                <th className="px-3 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">
                    Belum ada data proyek untuk dicetak dalam rekapitulasi laporan.
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 border-r border-slate-200">
                      <strong className="text-slate-900 block font-bold">{p.name}</strong>
                      <span className="text-[10.5px] text-slate-500">{p.project_code}</span>
                    </td>
                    <td className="px-3 py-3 border-r border-slate-200 text-slate-600">
                      {p.client_name} • {p.location}
                    </td>
                    <td className="px-3 py-3 text-right border-r border-slate-200 font-medium">
                      {formatNumber(p.budget)}
                    </td>
                    <td className="px-3 py-3 text-right border-r border-slate-200 font-medium">
                      {formatNumber(p.spent)}
                    </td>
                    <td className="px-3 py-3 text-right border-r border-slate-200 font-extrabold text-blue-900">
                      {p.progress}%
                    </td>
                    <td className="px-3 py-3 text-center capitalize font-semibold text-slate-700">{p.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center border-t border-slate-200 mt-8">
          <div>
            <p className="text-slate-400">Mengetahui,</p>
            <p className="font-bold text-slate-800 mt-0.5">Project Control & Finance</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-[11px] font-bold text-slate-300 italic">[Tanda Tangan Digital]</span>
            </div>
            <p className="font-bold text-slate-900">Ir. Bambang Trihatmojo</p>
            <p className="text-[10px] text-slate-400">Kepala Bagian Operasional</p>
          </div>

          <div>
            <p className="text-slate-400">Disetujui oleh,</p>
            <p className="font-bold text-slate-800 mt-0.5">Direksi CV. Arthamas Graha</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-[11px] font-bold text-blue-700 italic border border-blue-200 bg-blue-50 px-3 py-1 rounded">
                VERIFIED BY OWNER
              </span>
            </div>
            <p className="font-bold text-slate-900">Direktur Utama</p>
            <p className="text-[10px] text-slate-400">CV. Arthamas Graha</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
