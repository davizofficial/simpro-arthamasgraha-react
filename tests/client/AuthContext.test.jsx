import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import { authService, UNAUTHORIZED_EVENT } from '../../src/services/api';

vi.mock('../../src/services/api', () => ({
  authService: {
    me: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
  UNAUTHORIZED_EVENT: 'simpro:unauthorized',
}));

const TestConsumer = () => {
  const { user, isAuthenticated, initializing, login, logout, can } = useAuth();

  if (initializing) return <div data-testid="initializing">Memuat Sesi...</div>;

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'AUTHENTICATED' : 'ANONYMOUS'}</div>
      {user && <div data-testid="user-name">{user.name}</div>}
      <button onClick={() => login({ username: 'direktur', password: 'Password123!' })} data-testid="login-btn">
        Login
      </button>
      <button onClick={() => logout()} data-testid="logout-btn">
        Logout
      </button>
      <div data-testid="can-finance">{can('finance.view') ? 'YES_FINANCE' : 'NO_FINANCE'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mengecek sesi me() saat pertama kali dimuat; menjadi ANONYMOUS jika gagal', async () => {
    authService.me.mockRejectedValueOnce(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('initializing')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('initializing')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('ANONYMOUS');
  });

  it('memulihkan user saat authService.me() mengembalikan sesi valid', async () => {
    authService.me.mockResolvedValueOnce({
      success: true,
      user: {
        id: 1,
        username: 'direktur',
        name: 'Ir. H. Hendra Arthamas',
        role: 'direktur',
        permissions: ['finance.view', 'projects.view'],
      },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('initializing')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('AUTHENTICATED');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Ir. H. Hendra Arthamas');
    expect(screen.getByTestId('can-finance')).toHaveTextContent('YES_FINANCE');
  });

  it('mengupdate state saat login berhasil dan logout dipanggil', async () => {
    authService.me.mockRejectedValueOnce(new Error('No session'));
    authService.login.mockResolvedValueOnce({
      success: true,
      user: {
        id: 2,
        username: 'direktur',
        name: 'Pak Hendra',
        role: 'direktur',
        permissions: ['finance.view'],
      },
    });
    authService.logout.mockResolvedValueOnce({ success: true });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('ANONYMOUS');
    });

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('AUTHENTICATED');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Pak Hendra');

    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('ANONYMOUS');
    expect(authService.logout).toHaveBeenCalledTimes(1);
  });

  it('mereset user ke null saat UNAUTHORIZED_EVENT diterima', async () => {
    authService.me.mockResolvedValueOnce({
      success: true,
      user: { id: 1, name: 'Staf Lapangan', permissions: [] },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('AUTHENTICATED');
    });

    act(() => {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('ANONYMOUS');
  });

  it('melemparkan error jika useAuth dipakai di luar AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow('useAuth harus dipakai di dalam <AuthProvider>');

    spy.mockRestore();
  });
});
