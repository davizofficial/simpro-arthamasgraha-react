import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService, UNAUTHORIZED_EVENT } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    authService
      .me()
      .then((res) => {
        if (!cancelled && res.success) setUser(res.user);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, error: res.error || 'Autentikasi gagal' };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Gagal mengakhiri sesi di server:', err.message);
    }
    setUser(null);
  }, []);

  const can = useCallback(
    (permissionName) => Array.isArray(user?.permissions) && user.permissions.includes(permissionName),
    [user]
  );

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, initializing, login, logout, can, loading }),
    [user, initializing, login, logout, can, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return ctx;
};
