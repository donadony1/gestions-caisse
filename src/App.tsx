import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './app/page';
import EntreesPage from './app/entrees/page';
import SortiesPage from './app/sorties/page';
import ControlePage from './app/controle/page';
import RapportsPage from './app/rapports/page';
import MembresPage from './app/membres/page';
import LoginPage from './app/login/page';
import RegisterPage from './app/register/page';
import SuperAdminPage from './app/superadmin/page';
import VerifyEmailPage from './app/verify-email/page';
import ForgotPasswordPage from './app/forgot-password/page';
import ResetPasswordPage from './app/reset-password/page';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/entrees" element={<EntreesPage />} />
      <Route path="/sorties" element={<SortiesPage />} />
      <Route path="/controle" element={<ControlePage />} />
      <Route path="/rapports" element={<RapportsPage />} />
      <Route path="/membres" element={<MembresPage />} />
      <Route path="/superadmin" element={<SuperAdminPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
