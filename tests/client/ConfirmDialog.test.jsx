import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '../../src/components/common/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('tidak muncul saat isOpen false', () => {
    const { container } = render(
      <ConfirmDialog isOpen={false} onClose={() => {}} onConfirm={() => {}} message="Hapus data?" />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('menampilkan judul, pesan konfirmasi, dan tombol saat terbuka', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Hapus Klien"
        message="Apakah Anda yakin ingin menghapus data PT Adhi?"
        confirmText="Hapus Permanen"
        cancelText="Jangan Hapus"
      />
    );

    expect(screen.getByText('Hapus Klien')).toBeInTheDocument();
    expect(screen.getByText('Apakah Anda yakin ingin menghapus data PT Adhi?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hapus Permanen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jangan Hapus' })).toBeInTheDocument();
  });

  it('memanggil onConfirm saat tombol konfirmasi diklik', () => {
    const handleConfirm = vi.fn();
    render(<ConfirmDialog isOpen={true} onClose={() => {}} onConfirm={handleConfirm} message="Konfirmasi aksi" />);

    fireEvent.click(screen.getByRole('button', { name: 'Ya, Lanjutkan' }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('memanggil onClose saat tombol batal diklik', () => {
    const handleClose = vi.fn();
    render(<ConfirmDialog isOpen={true} onClose={handleClose} onConfirm={() => {}} message="Konfirmasi aksi" />);

    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
