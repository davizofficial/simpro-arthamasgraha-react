import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const Can = ({ permission, children, fallback = null }) => {
  const { can } = useAuth();
  if (!permission || can(permission)) {
    return <>{children}</>;
  }
  return fallback;
};

export default Can;
