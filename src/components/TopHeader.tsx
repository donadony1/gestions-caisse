import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, LogOut, Users, Building2, ShieldAlert } from 'lucide-react';
import { User } from '@/lib/types';
import { api } from '@/lib/api';

interface TopHeaderProps {
  user: User | null;
  pendingCount?: number;
  onRefresh?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ user, pendingCount = 0 }) => {
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

  const todayFormatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Profil & Salutation */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.nom}
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-semibold flex items-center justify-center text-sm shadow-sm">
                {initials}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-800 leading-tight">
                {user ? `${user.prenom} ${user.nom}` : 'Gestionnaire Caisse'}
              </h2>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
              {user?.entreprise?.nom && (
                <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <Building2 className="w-3 h-3 text-emerald-600" />
                  <span className="max-w-[140px] truncate">{user.entreprise.nom}</span>
                </span>
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

        {/* Actions : SuperAdmin, Gestion Membres, Notifications & Déconnexion */}
        <div className="flex items-center space-x-2">
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
  );
};
