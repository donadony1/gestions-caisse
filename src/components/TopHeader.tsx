import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  LogOut, 
  Users, 
  Building2, 
  ShieldAlert, 
  UserCheck, 
  Settings, 
  FileText, 
  ChevronDown, 
  Check, 
  Building, 
  Loader2, 
  Sparkles, 
  Crown,
  Menu,
  X,
  ArrowRight,
  Clock,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Globe,
  ExternalLink
} from 'lucide-react';
import { User, UserEntrepriseAccess, Movement } from '@/lib/types';
import { api } from '@/lib/api';
import { EditProfileModal } from './Modals/EditProfileModal';
import { EditEntrepriseModal } from './Modals/EditEntrepriseModal';

interface TopHeaderProps {
  user: User | null;
  pendingCount?: number;
  onRefresh?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ user, pendingCount = 0, onRefresh }) => {
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEntrepriseModalOpen, setIsEntrepriseModalOpen] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [switchingOrgId, setSwitchingOrgId] = useState<number | null>(null);

  // Live notifications count & items
  const [livePendingCount, setLivePendingCount] = useState<number>(pendingCount);
  const [pendingMovements, setPendingMovements] = useState<Movement[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const orgDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Synchroniser le livePendingCount quand la prop change
  useEffect(() => {
    if (pendingCount > 0) {
      setLivePendingCount(pendingCount);
    }
  }, [pendingCount]);

  // Charger automatiquement les notifications si l'utilisateur est admin ou controleur
  const fetchNotifications = async () => {
    if (!user || user.role === 'caissier') return;
    try {
      setLoadingNotifs(true);
      const res = await api.getValidations('pending');
      const items = res.pending || [];
      setPendingMovements(items);
      setLivePendingCount(items.length);
    } catch {
      // Ignorer silencieusement si hors-ligne ou pas les droits
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.entreprise?.id]);

  // Fermer les dropdowns au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(event.target as Node)) {
        setIsOrgDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        return { label: 'Admin', color: 'bg-indigo-500/10 text-indigo-700 border-indigo-200 font-bold' };
      case 'controleur':
        return { label: 'Contrôleur', color: 'bg-amber-500/10 text-amber-700 border-amber-200 font-bold' };
      default:
        return { label: 'Caissier', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200 font-bold' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);
  const initials = user ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() : 'GC';
  const canEditEntreprise = user?.role === 'admin' || user?.role === 'controleur' || user?.role === 'superadmin';
  const canManageMembers = user?.role === 'admin' || user?.role === 'superadmin';

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

  const handleSwitchOrg = async (orgId: number) => {
    if (user?.entreprise?.id === orgId || switchingOrgId) return;
    try {
      setSwitchingOrgId(orgId);
      await api.switchEntreprise(orgId);
      setIsOrgDropdownOpen(false);
      setIsMobileMenuOpen(false);
      if (onRefresh) {
        onRefresh();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || "Erreur lors du changement d'entreprise.");
    } finally {
      setSwitchingOrgId(null);
    }
  };

  const userEntreprises: UserEntrepriseAccess[] = user?.entreprises || [];
  const currentOrgId = user?.entreprise?.id;

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 py-2.5 sm:px-6 sm:py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Section Profil, Salutation & Sélecteur d'Organisation (Desktop + Mobile) */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 mr-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="relative group focus:outline-hidden shrink-0 cursor-pointer"
              title="Modifier mon profil"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.nom}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-emerald-500 shadow-sm group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-semibold flex items-center justify-center text-xs sm:text-sm shadow-sm group-hover:scale-105 transition-transform">
                  {initials}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-xs sm:text-sm font-bold text-slate-800 leading-tight hover:text-emerald-700 transition flex items-center space-x-1 truncate cursor-pointer"
                  title="Modifier mon profil"
                >
                  <span className="truncate max-w-[120px] sm:max-w-none">{user ? `${user.prenom} ${user.nom}` : 'Gestionnaire Caisse'}</span>
                </button>
                <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full border shrink-0 ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>

                {/* SÉLECTEUR D'ORGANISATION (Desktop) */}
                {user?.entreprise?.nom && (
                  <div className="relative hidden md:inline-block" ref={orgDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                      className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 px-2.5 py-1 rounded-full transition-all shadow-2xs cursor-pointer group"
                      title="Changer d'entreprise ou gérer les paramètres"
                    >
                      {user.entreprise.logo_url ? (
                        <img
                          src={user.entreprise.logo_url}
                          alt={user.entreprise.nom}
                          className="w-3.5 h-3.5 rounded-full object-cover shrink-0 border border-emerald-300"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      <span className="max-w-[130px] truncate font-bold">{user.entreprise.nom}</span>
                      <ChevronDown className={`w-3 h-3 text-emerald-600 transition-transform duration-200 ${isOrgDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Menu déroulant des organisations */}
                    {isOrgDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-3.5 py-2 border-b border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mes Entreprises ({userEntreprises.length || 1})</span>
                          <p className="text-xs text-slate-500 mt-0.5">Basculez entre vos organisations actives</p>
                        </div>

                        <div className="max-h-60 overflow-y-auto py-1">
                          {userEntreprises.length > 0 ? (
                            userEntreprises.map((org) => {
                              const isCurrent = org.id === currentOrgId;
                              const orgRoleBadge = getRoleBadge(org.role);
                              const isSwitchingThis = switchingOrgId === org.id;

                              return (
                                <button
                                  key={org.id}
                                  type="button"
                                  disabled={isCurrent || isSwitchingThis}
                                  onClick={() => handleSwitchOrg(org.id)}
                                  className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                                    isCurrent ? 'bg-emerald-50/70 text-emerald-950 font-bold' : 'hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2.5 min-w-0">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-100/80 flex items-center justify-center shrink-0 border border-emerald-200">
                                      {org.logo_url ? (
                                        <img
                                          src={org.logo_url}
                                          alt={org.nom}
                                          className="w-full h-full object-cover rounded-lg"
                                          onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      ) : (
                                        <Building className="w-3.5 h-3.5 text-emerald-700" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold truncate">{org.nom}</p>
                                      <div className="flex items-center space-x-1.5 mt-0.5">
                                        <span className={`text-[9px] uppercase px-1 rounded ${orgRoleBadge.color}`}>
                                          {orgRoleBadge.label}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">{org.devise || 'FCFA'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    {isSwitchingThis ? (
                                      <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                                    ) : isCurrent ? (
                                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                        <Check className="w-3 h-3" />
                                      </div>
                                    ) : null}
                                  </div>
                                </button>
                              );
                            })
                          ) : (
                            <div className="px-3.5 py-2 text-xs text-slate-600 flex items-center justify-between">
                              <span className="font-semibold truncate">{user.entreprise.nom}</span>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                          )}
                        </div>

                        {canEditEntreprise && (
                          <div className="pt-2 mt-1 border-t border-slate-100 px-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsOrgDropdownOpen(false);
                                setIsEntrepriseModalOpen(true);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-xl hover:bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <span>Gérer cette entreprise</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 text-[11px] sm:text-xs text-slate-500 capitalize truncate">
                <span className="truncate">{todayFormatted}</span>
                {user?.entreprise?.devise && (
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase shrink-0">
                    • {user.entreprise.devise}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions : Navigation Desktop & Accès Mobile */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            
            {/* Bouton Site Officiel (Desktop) */}
            <a
              href="https://gestion-caise.hondap.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-transparent hover:border-emerald-200/60 transition-all hidden md:flex items-center space-x-1.5 text-xs font-semibold shadow-2xs group"
              title="Accéder au site officiel (gestion-caise.hondap.com)"
            >
              <Globe className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="hidden xl:inline">Site Officiel</span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
            </a>

            {/* Bouton rapide Mon Profil (Desktop) */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors hidden md:flex items-center space-x-1 text-xs font-semibold cursor-pointer"
              title="Modifier mon profil"
            >
              <UserCheck className="w-4 h-4 text-indigo-500" />
              <span>Profil</span>
            </button>

            {/* Bouton Accès Factures (Desktop) */}
            <Link
              to="/factures"
              className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors hidden md:flex items-center space-x-1 text-xs font-semibold"
              title="Module Facturation"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Factures</span>
            </Link>

            {/* Bouton Accès Abonnement (Desktop) */}
            <Link
              to="/abonnement"
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 text-xs font-bold transition-all hidden md:flex items-center space-x-1.5 shadow-2xs"
              title="Gérer l'abonnement et les forfaits"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Abonnement</span>
              {user?.entreprise?.plan && user.entreprise.plan !== 'gratuit' && (
                <span className="text-[10px] uppercase font-extrabold bg-emerald-600 text-white px-1.5 py-0.5 rounded-md ml-0.5">
                  {user.entreprise.plan}
                </span>
              )}
            </Link>

            {/* Bouton rapide Paramètres Entreprise (Desktop) */}
            {canEditEntreprise && (
              <button
                type="button"
                onClick={() => setIsEntrepriseModalOpen(true)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors hidden md:flex items-center space-x-1 shadow-2xs cursor-pointer"
                title="Modifier les informations de l'entreprise"
              >
                <Building2 className="w-4 h-4 text-slate-600" />
                <span>Entreprise</span>
              </button>
            )}

            {/* Bouton Portail SuperAdmin (Desktop) */}
            {user?.role === 'superadmin' && (
              <Link
                to="/superadmin"
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300/80 text-xs font-bold transition-all hidden md:flex items-center space-x-1.5 shadow-2xs"
                title="Portail Super-Admin SaaS"
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Portail SaaS</span>
              </Link>
            )}

            {/* Bouton Membres (Desktop) */}
            {canManageMembers && (
              <Link
                to="/membres"
                className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors hidden md:flex items-center space-x-1"
                title="Gestion des membres"
              >
                <Users className="w-5 h-5" />
              </Link>
            )}

            {/* NOTIFICATIONS & CLOCHE DE VALIDATION (Desktop & Mobile) */}
            {user?.role !== 'caissier' && (
              <div className="relative" ref={notifDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifDropdownOpen(!isNotifDropdownOpen);
                    fetchNotifications();
                  }}
                  className={`relative p-2 rounded-xl transition-all cursor-pointer ${
                    livePendingCount > 0
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title="Notifications & validations en attente"
                >
                  <Bell className="w-5 h-5" />
                  {livePendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs animate-pulse">
                      {livePendingCount > 99 ? '99+' : livePendingCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Popover des Notifications */}
                {isNotifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-rose-500" />
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Validations de Caisse
                        </span>
                      </div>
                      {livePendingCount > 0 ? (
                        <span className="text-[10px] font-extrabold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                          {livePendingCount} en attente
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400">À jour</span>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {loadingNotifs ? (
                        <div className="py-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                          <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                          <span>Vérification des notifications...</span>
                        </div>
                      ) : pendingMovements.length > 0 ? (
                        pendingMovements.slice(0, 5).map((mvt) => (
                          <div key={mvt.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                  {mvt.reference}
                                </span>
                                <span className="text-xs font-bold text-rose-600 font-mono">
                                  -{new Intl.NumberFormat('fr-FR').format(mvt.montant)} {user?.entreprise?.devise || 'FCFA'}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-800 truncate">
                                {mvt.motif || mvt.categorie_nom || 'Demande de décaissement'}
                              </p>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                                <span>Par {mvt.createur_prenom || mvt.createur_nom || 'Agent'}</span>
                                <span>•</span>
                                <span>{new Date(mvt.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                            <Link
                              to="/controle"
                              onClick={() => setIsNotifDropdownOpen(false)}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 shrink-0 transition-colors"
                            >
                              Traiter
                            </Link>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 px-4 text-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">Toutes les opérations sont validées</p>
                          <p className="text-[11px] text-slate-500">Aucune demande de décaissement en attente d'approbation.</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 px-3 border-t border-slate-100">
                      <Link
                        to="/controle"
                        onClick={() => setIsNotifDropdownOpen(false)}
                        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ouvrir le centre de contrôle</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BOUTON MENU MOBILE HAMBURGER (Visible uniquement sur mobile < md) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors flex md:hidden items-center justify-center cursor-pointer shadow-2xs"
              title="Ouvrir le menu principal"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Déconnexion Desktop */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer hidden md:inline-flex"
              title="Se déconnecter"
            >
              <LogOut className="w-5 h-5" />
            </button>

          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* TIROIR / MENU MOBILE (MOBILE DRAWER / BOTTOM SHEET SPECIAL SMARTPHONE)     */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto p-5 pb-8 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Poignée supérieure & En-tête mobile */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-2" />
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.nom}
                    className="w-11 h-11 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {initials}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    {user ? `${user.prenom} ${user.nom}` : 'Utilisateur'}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{user?.email}</p>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded-md ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                    {user?.entreprise?.nom && (
                      <span className="text-[10px] font-bold text-slate-600 truncate max-w-[110px]">
                        • {user.entreprise.nom}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SÉLECTEUR MULTI-ENTREPRISES (Mobile) */}
            {userEntreprises.length > 1 && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Mes Organisations ({userEntreprises.length})
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {userEntreprises.map((org) => {
                    const isCurrent = org.id === currentOrgId;
                    return (
                      <button
                        key={org.id}
                        type="button"
                        disabled={isCurrent || switchingOrgId === org.id}
                        onClick={() => handleSwitchOrg(org.id)}
                        className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <Building className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{org.nom}</span>
                        </div>
                        {isCurrent && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LISTE DES LIENS & FONCTIONNALITÉS DEMANDÉES (Mobile) */}
            <div className="grid grid-cols-1 gap-2 pt-1">
              
              {/* 1. MON PROFIL */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full p-3.5 rounded-2xl bg-indigo-50/60 hover:bg-indigo-100/80 border border-indigo-100 flex items-center justify-between text-indigo-950 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold">Mon Profil</p>
                    <p className="text-[10px] text-indigo-600">Nom, avatar, mot de passe & coordonnées</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* 2. FACTURES */}
              <Link
                to="/factures"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full p-3.5 rounded-2xl bg-blue-50/60 hover:bg-blue-100/80 border border-blue-100 flex items-center justify-between text-blue-950 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold">Module Factures & Reçus</p>
                    <p className="text-[10px] text-blue-600">Émettre, suivre et encaisser des factures</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* 3. ENTREPRISE */}
              {canEditEntreprise && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsEntrepriseModalOpen(true);
                  }}
                  className="w-full p-3.5 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/80 border border-emerald-100 flex items-center justify-between text-emerald-950 transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold">Paramètres de l'Entreprise</p>
                      <p className="text-[10px] text-emerald-600">Logo, devise ({user?.entreprise?.devise || 'FCFA'}), coordonnées</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* 4. GESTION DES MEMBRES */}
              {canManageMembers && (
                <Link
                  to="/membres"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full p-3.5 rounded-2xl bg-purple-50/60 hover:bg-purple-100/80 border border-purple-100 flex items-center justify-between text-purple-950 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold">Gestion des Membres</p>
                      <p className="text-[10px] text-purple-600">Ajouter des caissiers, contrôleurs & admins</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}

              {/* 5. ABONNEMENT SAAS */}
              <Link
                to="/abonnement"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full p-3.5 rounded-2xl bg-teal-50/60 hover:bg-teal-100/80 border border-teal-100 flex items-center justify-between text-teal-950 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-1.5">
                      <p className="text-xs font-bold">Abonnement & Forfaits</p>
                      {user?.entreprise?.plan && (
                        <span className="text-[9px] uppercase font-black bg-teal-600 text-white px-1.5 py-0.2 rounded">
                          {user.entreprise.plan}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-teal-600">Changer de plan, quotas et reçus de paiement</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* 6. CONTRÔLE & NOTIFICATIONS */}
              {user?.role !== 'caissier' && (
                <Link
                  to="/controle"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full p-3.5 rounded-2xl bg-amber-50/60 hover:bg-amber-100/80 border border-amber-100 flex items-center justify-between text-amber-950 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center space-x-1.5">
                        <p className="text-xs font-bold">Contrôle des Décaissements</p>
                        {livePendingCount > 0 && (
                          <span className="text-[9px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded-full animate-pulse">
                            {livePendingCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-amber-600">Valider ou rejeter les dépenses de caisse</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}

              {/* 7. PORTAIL SUPERADMIN */}
              {user?.role === 'superadmin' && (
                <Link
                  to="/superadmin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-between transition-all group shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-xs">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold">Portail Super-Admin SaaS</p>
                      <p className="text-[10px] text-slate-400">Gestion globale des organisations & abonnements</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}

              {/* 8. LIEN VERS LE SITE OFFICIEL (Mobile) */}
              <a
                href="https://gestion-caise.hondap.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/60 hover:from-emerald-50 hover:to-emerald-100/80 border border-emerald-200/60 flex items-center justify-between text-slate-900 transition-all group shadow-2xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-1.5">
                      <p className="text-xs font-bold text-slate-900">Site Officiel</p>
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">Hondap</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">gestion-caise.hondap.com</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </a>

            </div>

            {/* Bouton de Déconnexion (Mobile) */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer border border-rose-200/80"
              >
                <LogOut className="w-4 h-4" />
                <span>Se Déconnecter</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modale d'édition de profil */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={user}
        onSuccess={handleProfileSuccess}
      />

      {/* Modale d'édition d'entreprise */}
      <EditEntrepriseModal
        isOpen={isEntrepriseModalOpen}
        onClose={() => setIsEntrepriseModalOpen(false)}
        currentUser={user}
        onSuccess={handleEntrepriseSuccess}
      />
    </>
  );
};
