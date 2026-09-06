import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopHeader } from '@/components/TopHeader';
import { BottomNav } from '@/components/BottomNav';
import { AddUserModal } from '@/components/Modals/AddUserModal';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Loader2, 
  AlertCircle,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { User } from '@/lib/types';
import { api } from '@/lib/api';

export default function MembresPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setError(null);
      const token = api.getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const user = api.getSavedUser();
      setCurrentUser(user);

      const list = await api.getUsers();
      setUsersList(list);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des membres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      alert("Vous ne pouvez pas désactiver votre propre compte.");
      return;
    }

    const nextState = !targetUser.actif;
    const actionLabel = nextState ? 'activer' : 'désactiver';

    if (confirm(`Voulez-vous vraiment ${actionLabel} le compte de ${targetUser.prenom} ${targetUser.nom} ?`)) {
      try {
        await api.toggleUserStatus(targetUser.id, nextState);
        loadUsers();
      } catch (err: any) {
        alert(err.message || "Erreur lors du changement de statut");
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrateur', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'controleur':
        return { label: 'Contrôleur', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'Caissier', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Chargement de l'équipe...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 pb-24 sm:pb-28">
      <TopHeader user={currentUser} onRefresh={loadUsers} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Erreur</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
            <button
              onClick={loadUsers}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* En-tête */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold">Gestion des Membres & Rôles</h1>
              <p className="text-xs text-indigo-200 mt-0.5">
                {usersList.length} utilisateur{usersList.length > 1 ? 's' : ''} enregistré{usersList.length > 1 ? 's' : ''} dans le système
              </p>
            </div>
          </div>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center space-x-2 py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-indigo-950/40 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Ajouter un Membre</span>
            </button>
          )}
        </div>

        {/* Liste des membres sous forme de cartes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usersList.map((m) => {
            const roleBadge = getRoleBadge(m.role);
            const isSelf = m.id === currentUser?.id;
            const initials = `${m.prenom?.[0] || ''}${m.nom?.[0] || ''}`.toUpperCase();

            return (
              <div
                key={m.id}
                className={`bg-white rounded-3xl p-5 border shadow-card transition-all flex flex-col justify-between ${
                  !m.actif ? 'opacity-60 border-slate-200 bg-slate-50/50' : 'border-slate-200 hover:shadow-lg'
                }`}
              >
                <div>
                  
                  {/* En-tête de carte */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {m.avatar_url ? (
                        <img
                          src={m.avatar_url}
                          alt={m.nom}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-400 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                          {initials}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h3 className="text-sm font-bold text-slate-900 leading-tight">
                            {m.prenom} {m.nom}
                          </h3>
                          {isSelf && (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                              (Vous)
                            </span>
                          )}
                        </div>
                        <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleBadge.color}`}>
                          {roleBadge.label}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.actif ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {m.actif ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Actif</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Désactivé</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Coordonnées */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{m.email}</span>
                    </div>
                  </div>

                </div>

                {/* Actions Administrateur */}
                {currentUser?.role === 'admin' && !isSelf && (
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(m)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        m.actif
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {m.actif ? 'Désactiver le compte' : 'Activer le compte'}
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </main>

      <BottomNav user={currentUser} />

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadUsers}
      />
    </div>
  );
}
