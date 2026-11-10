import React, { useState } from 'react';
import { formatRupiah, formatRupiahCompact } from '../../utils/formatters';

const CATEGORY_COLORS = [
  {
    key: 'material',
    name: 'Logistik Material',
    color: '#2563eb',
    bg: 'bg-blue-500',
    text: 'text-blue-700',
    bgLight: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    key: 'upah',
    name: 'Upah Tenaga Kerja',
    color: '#10b981',
    bg: 'bg-emerald-500',
    text: 'text-emerald-700',
    bgLight: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  {
    key: 'sewa_alat',
    name: 'Sewa Alat Berat',
    color: '#f59e0b',
    bg: 'bg-amber-500',
    text: 'text-amber-700',
    bgLight: 'bg-amber-50',
    border: 'border-amber-200',
  },
  {
    key: 'operasional',
    name: 'Operasional Lapangan',
    color: '#6366f1',
    bg: 'bg-indigo-500',
    text: 'text-indigo-700',
    bgLight: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  {
    key: 'subkon',
    name: 'Pekerjaan Subkontraktor',
    color: '#06b6d4',
    bg: 'bg-cyan-500',
    text: 'text-cyan-700',
    bgLight: 'bg-cyan-50',
    border: 'border-cyan-200',
  },
];

export const DonutExpenseChart = ({ categoriesData = [], totalExpenses = 0 }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!categoriesData || categoriesData.length === 0 || totalExpenses === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        <i className="fa-solid fa-receipt text-2xl mb-2 text-slate-300 block"></i>
        Belum ada data transaksi pengeluaran tercatat.
      </div>
    );
  }

  const radius = 62;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const segments = categoriesData.map((cat, idx) => {
    const colorDef = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
    const pct = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
    const strokeDash = (pct / 100) * circumference;
    const strokeOffset = -(accumulatedPercent / 100) * circumference;
    accumulatedPercent += pct;

    return {
      ...cat,
      color: colorDef.color,
      colorDef,
      percentage: pct,
      strokeDash,
      strokeOffset,
    };
  });

  const activeSegment = hoveredIndex !== null ? segments[hoveredIndex] : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex items-center justify-center py-2">
        <svg
          viewBox="0 0 170 170"
          className="w-48 h-48 sm:w-52 sm:h-52 transform -rotate-90 transition-transform duration-300"
          aria-label="Grafik Distribusi Biaya Pengeluaran"
        >
          <circle cx="85" cy="85" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth={strokeWidth} />

          {segments.map((seg, idx) => {
            const isHovered = hoveredIndex === idx;

            const gap = segments.length > 1 ? 2.5 : 0;
            const dashLength = Math.max(0, seg.strokeDash - gap);

            return (
              <circle
                key={seg.category}
                cx="85"
                cy="85"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${dashLength} ${circumference}`}
                strokeDashoffset={seg.strokeOffset}
                className="transition-all duration-300 cursor-pointer"
                style={{
                  filter: isHovered ? `drop-shadow(0 0 4px ${seg.color})` : 'none',
                  opacity: hoveredIndex === null || isHovered ? 1 : 0.6,
                }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
          {activeSegment ? (
            <div className="animate-fade-in">
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 border"
                style={{
                  backgroundColor: `${activeSegment.color}15`,
                  color: activeSegment.color,
                  borderColor: `${activeSegment.color}40`,
                }}
              >
                {activeSegment.percentage.toFixed(1)}%
              </span>
              <p className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[120px]">{activeSegment.category}</p>
              <p className="text-sm sm:text-base font-extrabold font-display text-slate-900 mt-0.5">
                {formatRupiahCompact(activeSegment.total)}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Biaya</p>
              <p className="text-base sm:text-lg font-extrabold font-display text-slate-900">
                {formatRupiahCompact(totalExpenses)}
              </p>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5 inline-block border border-emerald-200">
                {segments.length} Pos Alokasi
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2 space-y-1.5">
        {segments.map((seg, idx) => {
          const isHovered = hoveredIndex === idx;
          return (
            <div
              key={seg.category}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`pt-1.5 first:pt-0 flex items-center justify-between text-xs p-1.5 rounded-lg transition cursor-pointer ${
                isHovered ? 'bg-slate-50 ring-1 ring-slate-200' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform"
                  style={{
                    backgroundColor: seg.color,
                    transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
                <span className={`font-bold truncate ${isHovered ? 'text-slate-900' : 'text-slate-700'}`}>
                  {seg.category}
                </span>
                <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                  {seg.percentage.toFixed(1)}%
                </span>
              </div>
              <span className="font-extrabold text-slate-900 shrink-0 font-display text-right ml-2">
                {formatRupiah(seg.total)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Realisasi Kas Masuk ke Pembukuan:</span>
        <strong className="text-slate-900 font-display">{formatRupiah(totalExpenses)}</strong>
      </div>
    </div>
  );
};

export default DonutExpenseChart;
