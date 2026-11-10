import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../../src/components/common/Modal';

describe('Modal component', () => {
  it('tidak me-render apapun ketika isOpen bernilai false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Uji Modal">
        <p>Konten rahasia</p>
      </Modal>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('me-render dialog yang dapat diakses ketika isOpen bernilai true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Tambah Klien Baru">
        <p>Formulir Klien</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('heading', { level: 2, name: 'Tambah Klien Baru' })).toBeInTheDocument();
    expect(screen.getByText('Formulir Klien')).toBeInTheDocument();
  });

  it('memanggil onClose saat tombol silang (close) diklik', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Tutup Saya">
        <div>Isi</div>
      </Modal>
    );

    const closeBtn = screen.getByRole('button', { name: /tutup jendela modal/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('memanggil onClose saat backdrop gelap di luar modal diklik', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Backdrop Test">
        <div data-testid="modal-content">Isi Dalam Modal</div>
      </Modal>
    );

    fireEvent.click(screen.getByTestId('modal-content'));
    expect(handleClose).not.toHaveBeenCalled();

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('memanggil onClose saat tombol keyboard Escape ditekan', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Escape Test">
        <div>Isi Modal</div>
      </Modal>
    );

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('mengunci scroll body saat modal terbuka dan mengembalikannya saat unmount', () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={() => {}} title="Scroll Test">
        <div>Isi Modal</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('unset');
  });
});
