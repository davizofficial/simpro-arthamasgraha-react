import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ForbiddenPage from '../../pages/ForbiddenPage';

export const ProtectedRoute = ({ children, permission }) => {
  const { isAuthenticated, can, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50" role="status" aria-live="polite">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
          <i className="fa-solid fa-spinner fa-spin text-blue-800" aria-hidden="true"></i>
          <span>Memverifikasi sesi...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && !can(permission)) {
    return <ForbiddenPage requiredPermission={permission} />;
  }

  return children;
};

export default ProtectedRoute;
