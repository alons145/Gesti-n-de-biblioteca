import React from 'react';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return null; // Redirigido por AppRouter
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <div style={{ padding: '20px', color: 'red' }}>Acceso denegado. Se requiere rol {requiredRole}.</div>;
  }

  return <>{children}</>;
};
