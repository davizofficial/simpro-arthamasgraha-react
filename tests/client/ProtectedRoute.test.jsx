import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../../src/components/common/ProtectedRoute';
import * as AuthContextModule from '../../src/context/AuthContext';

vi.mock('../../src/pages/ForbiddenPage', () => ({
  default: ({ requiredPermission }) => (
    <div data-testid="forbidden-page">Akses Ditolak: Butuh {requiredPermission}</div>
  ),
}));

describe('ProtectedRoute', () => {
  it('menampilkan status memuat saat sesi masih diinisialisasi', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      initializing: true,
      can: () => false,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Konten Dashboard</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Memverifikasi sesi...')).toBeInTheDocument();
    expect(screen.queryByText('Konten Dashboard')).not.toBeInTheDocument();
  });

  it('mengalihkan ke /login jika pengguna tidak terautentikasi', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      initializing: false,
      can: () => false,
    });

    render(
      <MemoryRouter initialEntries={['/projects']}>
        <Routes>
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <div>Konten Proyek</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div data-testid="login-page">Halaman Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByText('Konten Proyek')).not.toBeInTheDocument();
  });

  it('menampilkan ForbiddenPage jika pengguna terautentikasi namun tidak memiliki izin yang dibutuhkan', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      initializing: false,
      can: (perm) => perm === 'projects.view',
    });

    render(
      <MemoryRouter initialEntries={['/finance']}>
        <ProtectedRoute permission="finance.view">
          <div>Halaman Keuangan Rahasia</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('forbidden-page')).toHaveTextContent('Akses Ditolak: Butuh finance.view');
    expect(screen.queryByText('Halaman Keuangan Rahasia')).not.toBeInTheDocument();
  });

  it('me-render children jika terautentikasi dan memiliki izin yang valid', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      initializing: false,
      can: (perm) => perm === 'finance.view',
    });

    render(
      <MemoryRouter initialEntries={['/finance']}>
        <ProtectedRoute permission="finance.view">
          <div data-testid="secret-content">Halaman Keuangan Terlindungi</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('secret-content')).toBeInTheDocument();
  });
});
