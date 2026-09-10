import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, LogOut, Users, Building2, ShieldAlert, UserCheck, Settings, FileText } from 'lucide-react';
import { User } from '@/lib/types';
import { api } from '@/lib/api';
import { EditProfileModal } from './Modals/EditProfileModal';
import { EditEntrepriseModal } from './Modals/EditEntrepriseModal';

interface TopHeaderProps {
  user: User | null;
  pendingCount?: number;
  onRefresh?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ user, pendingCount = 0, onRefresh }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEntrepriseModalOpen, setIsEntrepriseModalOpen] = useState(false);

  const handleLogout = async () => {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      await api.logout();
      window.location.href = '/login';
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'superadmin':
        return { label: '👑 SuperAdmin', color: 'bg-amber-500/15 text-amber-700 border-amber-300 font-bold' };
      case 'admin':
        return { label: 'Admin', color: 'bg-indigo-500/10 text-indigo-700 border-indigo-200' };
      case 'controleur':
        return { label: 'Contrôleur', color: 'bg-amber-500/10 text-amber-700 border-amber-200' };
      default:
        return { label: 'Caissier', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);
  const initials = user ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() : 'GC';
  const canEditEntreprise = user?.role === 'admin' || user?.role === 'controleur' || user?.role === 'superadmin';

  const todayFormatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  }).format(new Date());

  const handleProfileSuccess = (updatedUser: User) => {
    if (onRefresh) onRefresh();
    else window.location.reload();
  };

  const handleEntrepriseSuccess = () => {
    if (onRefresh) onRefresh();
    else window.location.reload();
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Profil & Salutation (Cliquable pour modifier profil) */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="relative group focus:outline-none"
              title="Modifier mon profil"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.nom}
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-sm group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-semibold flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
                  {initials}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-sm font-bold text-slate-800 leading-tight hover:text-emerald-700 transition flex items-center space-x-1"
                  title="Modifier mon profil"
                >
                  <span>{user ? `${user.prenom} ${user.nom}` : 'Gestionnaire Caisse'}</span>
                </button>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>

                {/* Badge Entreprise cliquable pour Admin & Contrôleur */}
                {user?.entreprise?.nom && (
                  canEditEntreprise ? (
                    <button
                      type="button"
                      onClick={() => setIsEntrepriseModalOpen(true)}
                      className="hidden sm:inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full transition cursor-pointer"
                      title="Modifier les informations de l'entreprise (Admin & Contrôleur)"
                    >
                      <Building2 className="w-3 h-3 text-emerald-600" />
                      <span className="max-w-[140px] truncate">{user.entreprise.nom}</span>
                      <Settings className="w-2.5 h-2.5 text-emerald-500 ml-0.5" />
                    </button>
                  ) : (
                    <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <Building2 className="w-3 h-3 text-emerald-600" />
                      <span className="max-w-[140px] truncate">{user.entreprise.nom}</span>
                    </span>
                  )
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 capitalize">
                <span>{todayFormatted}</span>
                {user?.entreprise?.devise && (
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    • Devise : {user.entreprise.devise}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions : Entreprise, SuperAdmin, Gestion Membres, Notifications & Déconnexion */}
          <div className="flex items-center space-x-2">
            {/* Bouton rapide Mon Profil */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors hidden md:flex items-center space-x-1 text-xs font-semibold"
              title="Modifier mon profil"
            >
              <UserCheck className="w-4 h-4 text-indigo-500" />
              <span>Profil</span>
            </button>

            {/* Bouton Accès Factures */}
            <Link
              to="/factures"
              className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors flex items-center space-x-1 text-xs font-semibold"
              title="Module Facturation"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Factures</span>
            </Link>

            {/* Bouton rapide Paramètres Entreprise (Admin & Contrôleur) */}
            {canEditEntreprise && (
              <button
                type="button"
                onClick={() => setIsEntrepriseModalOpen(true)}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors flex items-center space-x-1 shadow-sm"
                title="Modifier les informations de l'entreprise (Admin & Contrôleur)"
              >
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Entreprise</span>
              </button>
            )}

            {user?.role === 'superadmin' && (
              <Link
                to="/superadmin"
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300/80 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
                title="Portail Super-Admin SaaS"
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Portail SaaS</span>
              </Link>
            )}

            {(user?.role === 'admin' || user?.role === 'superadmin') && (
              <Link
                to="/membres"
                className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors flex items-center space-x-1"
                title="Gestion des membres"
              >
                <Users className="w-5 h-5" />
              </Link>
            )}

            {user?.role !== 'caissier' && (
              <Link
                to="/controle"
                className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Contrôle des décaissements"
              >
                <Bell className="w-5 h-5" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Modales */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={user}
        onSuccess={handleProfileSuccess}
      />

      <EditEntrepriseModal
        isOpen={isEntrepriseModalOpen}
        onClose={() => setIsEntrepriseModalOpen(false)}
        currentUser={user}
        onSuccess={handleEntrepriseSuccess}
      />
    </>
  );
};

