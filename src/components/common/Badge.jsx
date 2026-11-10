import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'md' }) => {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-bold tracking-tight rounded-lg border ${variants[variant] || variants.neutral} ${sizes[size]}`}
    >
      {children}
    </span>
  );
};

export const ProgressBar = ({ value = 0, target = 100, label = 'Progres Fisik', showDetails = true }) => {
  const percentage = Math.min(Math.max(value, 0), 100);
  const isAhead = value >= target;

  return (
    <div className="w-full">
      {showDetails && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          <span className="text-slate-600">{label}</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{percentage}%</span>
            {target !== undefined && (
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded ${isAhead ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}
              >
                Target: {target}%
              </span>
            )}
          </div>
        </div>
      )}
      <div
        className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={label}
      >
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${
            percentage >= 100 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-blue-600' : 'bg-amber-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
