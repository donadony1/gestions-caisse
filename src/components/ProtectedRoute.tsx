import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '@/lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = api.getToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const user = api.getSavedUser();

  if (allowedRoles && user) {
    if (user.role !== 'superadmin' && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = api.getToken();
  if (token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
