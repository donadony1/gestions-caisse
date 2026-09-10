import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './app/page';
import EntreesPage from './app/entrees/page';
import SortiesPage from './app/sorties/page';
import ControlePage from './app/controle/page';
import RapportsPage from './app/rapports/page';
import MembresPage from './app/membres/page';
import FacturesPage from './app/factures/page';
import LoginPage from './app/login/page';
import RegisterPage from './app/register/page';
import SuperAdminPage from './app/superadmin/page';
import VerifyEmailPage from './app/verify-email/page';
import ForgotPasswordPage from './app/forgot-password/page';
import ResetPasswordPage from './app/reset-password/page';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Routes protégées */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/entrees"
        element={
          <ProtectedRoute>
            <EntreesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sorties"
        element={
          <ProtectedRoute>
            <SortiesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/controle"
        element={
          <ProtectedRoute allowedRoles={['admin', 'controleur']}>
            <ControlePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rapports"
        element={
          <ProtectedRoute>
            <RapportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/factures"
        element={
          <ProtectedRoute>
            <FacturesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/membres"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MembresPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <SuperAdminPage />
          </ProtectedRoute>
        }
      />

      {/* Routes d'authentification publiques */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicOnlyRoute>
            <ResetPasswordPage />
          </PublicOnlyRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
