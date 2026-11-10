import { describe, it, expect } from 'vitest';
import { formatNumber, formatRupiah, formatRupiahCompact, formatPercent, percentOf } from '../../src/utils/formatters';

describe('formatters utility', () => {
  describe('formatNumber', () => {
    it('memformat integer standar ke id-ID', () => {
      expect(formatNumber(1000)).toBe('1.000');
      expect(formatNumber(1500000)).toBe('1.500.000');
    });

    it('menangani string angka dengan benar', () => {
      expect(formatNumber('2500000')).toBe('2.500.000');
    });

    it('menangani nilai tidak valid atau kosong sebagai 0', () => {
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
      expect(formatNumber('bukan-angka')).toBe('0');
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatRupiah', () => {
    it('menambahkan prefix "Rp "', () => {
      expect(formatRupiah(1500000)).toBe('Rp 1.500.000');
      expect(formatRupiah(0)).toBe('Rp 0');
    });

    it('menangani string numerik dan null dengan aman', () => {
      expect(formatRupiah('500000')).toBe('Rp 500.000');
      expect(formatRupiah(null)).toBe('Rp 0');
    });
  });

  describe('formatRupiahCompact', () => {
    it('memformat triliun (T)', () => {
      expect(formatRupiahCompact(2_500_000_000_000)).toBe('Rp 2,5 T');
    });

    it('memformat miliaran (M)', () => {
      expect(formatRupiahCompact(12_500_000_000)).toBe('Rp 12,5 M');
      expect(formatRupiahCompact(1_000_000_000)).toBe('Rp 1,0 M');
    });

    it('memformat jutaan (Jt)', () => {
      expect(formatRupiahCompact(48_000_000)).toBe('Rp 48 Jt');
      expect(formatRupiahCompact(1_200_000)).toBe('Rp 1 Jt');
    });

    it('memformat angka di bawah 1 juta secara lengkap', () => {
      expect(formatRupiahCompact(750_000)).toBe('Rp 750.000');
      expect(formatRupiahCompact(0)).toBe('Rp 0');
    });
  });

  describe('formatPercent', () => {
    it('memformat persentase dengan 1 angka desimal default', () => {
      expect(formatPercent(36.9545)).toBe('37.0%');
      expect(formatPercent(50)).toBe('50.0%');
    });

    it('mendukung custom jumlah digit desimal', () => {
      expect(formatPercent(36.9545, 2)).toBe('36.95%');
      expect(formatPercent(36.9545, 0)).toBe('37%');
    });

    it('aman dari nilai non-numerik', () => {
      expect(formatPercent(null)).toBe('0.0%');
      expect(formatPercent('abc')).toBe('0.0%');
    });
  });

  describe('percentOf', () => {
    it('menghitung rasio persentase dengan benar', () => {
      expect(percentOf(25, 100)).toBe(25);
      expect(percentOf(50, 200)).toBe(25);
    });

    it('menangani zero-division secara aman tanpa Infinity atau NaN', () => {
      expect(percentOf(100, 0)).toBe(0);
      expect(percentOf(0, 0)).toBe(0);
      expect(percentOf(null, 0)).toBe(0);
    });
  });
});
