import React from 'react';

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse"
      aria-busy="true"
      aria-label="Memuat data kartu"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
          </div>
          <div className="h-6 bg-slate-200 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex justify-between">
              <div className="h-3 bg-slate-200 rounded w-24"></div>
              <div className="h-3 bg-slate-200 rounded w-12"></div>
            </div>
            <div className="h-2.5 bg-slate-200 rounded-full w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div
      className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse"
      aria-busy="true"
      aria-label="Memuat data tabel"
    >
      <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0 space-x-4"
          >
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/5"></div>
            <div className="h-4 bg-slate-200 rounded w-1/6"></div>
            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const KPISkeleton = () => {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse"
      aria-busy="true"
      aria-label="Memuat statistik KPI"
    >
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
          </div>
          <div className="h-8 bg-slate-200 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
};
