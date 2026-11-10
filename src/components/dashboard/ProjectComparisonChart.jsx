import React from 'react';
import { Link } from 'react-router-dom';
import { formatRupiah, percentOf } from '../../utils/formatters';

export const ProjectComparisonChart = ({ projects = [], isExecutive = true }) => {
  if (!projects || projects.length === 0) {
    return <div className="p-8 text-center text-slate-400 text-xs">Belum ada proyek aktif yang tercatat.</div>;
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-gradient-to-r from-blue-600 to-indigo-600"></span>
            <span>Capaian Progres Fisik (%)</span>
          </div>
          {isExecutive && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-gradient-to-r from-violet-500 to-purple-600"></span>
              <span>Serapan Biaya RAB (%)</span>
            </div>
          )}
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Dihitung otomatis dari laporan mingguan & kas</span>
      </div>

      <div className="space-y-4">
        {projects.map((p) => {
          const spendingPct = percentOf(p.spent, p.budget);
          const variance = p.progress - spendingPct;
          const isEfficient = variance >= 0;

          const physicalColor =
            p.progress >= 75
              ? 'from-emerald-500 to-teal-600'
              : p.progress >= 40
                ? 'from-blue-600 to-indigo-600'
                : 'from-amber-500 to-orange-500';

          return (
            <div
              key={p.id}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-slate-50 hover:border-blue-300 transition group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-blue-100/70 text-blue-800 font-mono">
                      {p.project_code}
                    </span>
                    <Link
                      to={`/projects/${p.id}`}
                      className="font-extrabold text-sm text-slate-900 group-hover:text-blue-800 transition truncate"
                    >
                      {p.name}
                    </Link>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <i className="fa-solid fa-location-dot text-[10px]"></i>
                    <span>{p.location}</span>
                    <span className="text-slate-300">•</span>
                    <span>Klien: {p.client_name || 'Mitra Arthamas'}</span>
                  </p>
                </div>

                {isExecutive && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${
                        isEfficient
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      <i
                        className={`fa-solid ${isEfficient ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} text-[10px]`}
                      ></i>
                      <span>
                        {isEfficient ? '+' : ''}
                        {variance.toFixed(1)}% {isEfficient ? 'Efisiensi Biaya' : 'Over-Cost'}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <i className="fa-solid fa-person-digging text-blue-700 text-xs"></i>
                      <span>Progres Fisik Lapangan</span>
                    </span>
                    <span className="font-extrabold font-display text-slate-900">{p.progress}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${physicalColor} transition-all duration-500`}
                      style={{ width: `${Math.min(p.progress, 100)}%` }}
                    />
                  </div>
                </div>

                {isExecutive && (
                  <div>
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span className="text-slate-600 flex items-center gap-1.5">
                        <i className="fa-solid fa-coins text-purple-600 text-xs"></i>
                        <span>Serapan Anggaran Kas</span>
                      </span>
                      <span className="font-extrabold font-display text-slate-900">{spendingPct.toFixed(1)}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-200/80 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${Math.min(spendingPct, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {isExecutive && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-wrap items-center justify-between text-[11px] font-semibold text-slate-500">
                  <div className="flex items-center gap-4">
                    <span>
                      Pagu RAB: <strong className="text-slate-800">{formatRupiah(p.budget)}</strong>
                    </span>
                    <span>
                      Realisasi: <strong className="text-slate-800">{formatRupiah(p.spent)}</strong>
                    </span>
                  </div>
                  <Link
                    to={`/projects/${p.id}`}
                    className="text-blue-800 hover:text-blue-900 font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Detail Lapangan</span>
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectComparisonChart;
