const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const formatNumber = (value) => toNumber(value).toLocaleString('id-ID');

export const formatRupiah = (value) => `Rp ${formatNumber(value)}`;

export const formatRupiahCompact = (value) => {
  const n = toNumber(value);
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000_000) return `Rp ${(n / 1_000_000_000_000).toFixed(1).replace('.', ',')} T`;
  if (abs >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
  if (abs >= 1_000_000) return `Rp ${Math.round(n / 1_000_000)} Jt`;
  return formatRupiah(n);
};

export const formatPercent = (value, digits = 1) => `${toNumber(value).toFixed(digits)}%`;

export const percentOf = (part, total) => {
  const t = toNumber(total);
  return t > 0 ? (toNumber(part) / t) * 100 : 0;
};
