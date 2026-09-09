import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Building2, 
  Users, 
  Activity, 
  DollarSign, 
  Search, 
  Filter, 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ArrowLeft, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  TrendingUp,
  Layers,
  ChevronRight,
  UserCheck,
  UserX,
  Zap,
  Globe
} from 'lucide-react';
import { api } from '@/lib/api';
import { SuperAdminData, EntrepriseItem, SaaSAuditLog, User } from '@/lib/types';

export default function SuperAdminPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [data, setData] = useState<SuperAdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'entreprises' | 'audit'>('entreprises');

  // Action en cours
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const loadData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      setError(null);

      const user = api.getSavedUser();
      if (!user || user.role !== 'superadmin') {
        navigate('/');
        return;
      }
      setCurrentUser(user);

      const res = await api.getSuperAdminData();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données Super-Admin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePlanChange = async (entrepriseId: number, newPlan: 'gratuit' | 'pro' | 'enterprise') => {
    try {
      setActionLoadingId(entrepriseId);
      await api.updateEntreprisePlan(entrepriseId, newPlan);
      setSuccessMsg(`Plan mis à jour avec succès vers "${newPlan.toUpperCase()}"`);
      setTimeout(() => setSuccessMsg(null), 3500);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de plan.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = async (entreprise: EntrepriseItem) => {
    const actionLabel = entreprise.actif ? 'suspendre' : 'réactiver';
    if (!window.confirm(`Êtes-vous sûr de vouloir ${actionLabel} l'entreprise "${entreprise.nom}" ?`)) {
      return;
    }

    try {
      setActionLoadingId(entreprise.id);
      await api.toggleEntrepriseStatus(entreprise.id);
      setSuccessMsg(`Entreprise "${entreprise.nom}" ${entreprise.actif ? 'suspendue' : 'activée'}.`);
      setTimeout(() => setSuccessMsg(null), 3500);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Erreur lors du changement de statut de l'entreprise.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtrage des entreprises
  const filteredEntreprises = data?.entreprises.filter(ent => {
    const matchesSearch = 
      ent.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ent.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ent.admin_email && ent.admin_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ent.telephone && ent.telephone.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPlan = selectedPlan === 'all' || ent.plan === selectedPlan;
    const matchesStatus = 
      selectedStatus === 'all' || 
      (selectedStatus === 'active' && Number(ent.actif) === 1) ||
      (selectedStatus === 'inactive' && Number(ent.actif) === 0);

    return matchesSearch && matchesPlan && matchesStatus;
  }) || [];

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Crown className="w-3.5 h-3.5" /> Enterprise
          </span>
        );
      case 'pro':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Zap className="w-3.5 h-3.5" /> Pro
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            Gratuit
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium tracking-wide">Chargement du portail Super-Admin SaaS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top SuperAdmin Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 border border-amber-400/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-amber-200 via-white to-amber-400 bg-clip-text text-transparent">
                  SaaS Control Center
                </h1>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full">
                  Super-Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">Gestion globale des entreprises, abonnements & sécurité</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
              title="Actualiser les données"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              Retour à ma Caisse
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 space-y-6">
        
        {/* Notifications & Alertes */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Grille des KPI SaaS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Entreprises</span>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {data?.stats.total_entreprises || 0}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-medium">{data?.entreprises.filter(e => Number(e.actif) === 1).length || 0} actives</span>
              <span>•</span>
              <span className="text-rose-400 font-medium">{data?.entreprises.filter(e => Number(e.actif) === 0).length || 0} suspendues</span>
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Utilisateurs</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {data?.stats.total_users || 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">Sur l'ensemble des tenants SaaS</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Mouvements Enregistrés</span>
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {data?.stats.total_mouvements || 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">Entrées & sorties comptabilisées</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Volume Global Traité</span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight truncate">
              {new Intl.NumberFormat('fr-FR').format(data?.stats.volume_total || 0)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Cumul multi-devises converti</p>
          </div>

        </div>

        {/* Répartition des abonnements SaaS */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Abonnements SaaS actifs :</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {data?.stats.plans && data.stats.plans.length > 0 ? (
              data.stats.plans.map(p => (
                <div key={p.plan} className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
                  <span className="capitalize font-semibold text-slate-300">{p.plan} :</span>
                  <span className="font-black text-white bg-slate-700 px-2 py-0.5 rounded-md">{p.count}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-500">Aucun abonnement enregistré</span>
            )}
          </div>
        </div>

        {/* Navigation Onglets */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('entreprises')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'entreprises'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Entreprises & Tenants ({filteredEntreprises.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'audit'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Journal d'Audit SaaS ({data?.recent_logs.length || 0})
          </button>
        </div>

        {/* Contenu Onglet : Entreprises */}
        {activeTab === 'entreprises' && (
          <div className="space-y-4">
            
            {/* Barre de recherche et filtres */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, téléphone..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <select
                  value={selectedPlan}
                  onChange={e => setSelectedPlan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Tous les Plans SaaS</option>
                  <option value="gratuit">Plan Gratuit</option>
                  <option value="pro">Plan Pro</option>
                  <option value="enterprise">Plan Enterprise</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actives uniquement</option>
                  <option value="inactive">Suspendues uniquement</option>
                </select>
              </div>
            </div>

            {/* Tableau des Entreprises */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800/80 text-slate-400 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-5 py-3.5">Entreprise / Tenant</th>
                      <th className="px-4 py-3.5">Admin & Contact</th>
                      <th className="px-4 py-3.5">Plan Actuel</th>
                      <th className="px-4 py-3.5 text-center">Utilisateurs</th>
                      <th className="px-4 py-3.5 text-right">Mouvements / Volume</th>
                      <th className="px-4 py-3.5 text-center">Statut</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredEntreprises.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-500 font-medium">
                          Aucune entreprise ne correspond à votre recherche.
                        </td>
                      </tr>
                    ) : (
                      filteredEntreprises.map(ent => (
                        <tr key={ent.id} className="hover:bg-slate-800/40 transition-colors">
                          
                          {/* Entreprise info */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center font-black text-white text-sm shadow-inner">
                                {ent.nom.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white text-sm flex items-center gap-2">
                                  {ent.nom}
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                    ID: {ent.id}
                                  </span>
                                </div>
                                <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-emerald-400">@{ent.slug}</span>
                                  <span>•</span>
                                  <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded text-[10px] font-bold">
                                    {ent.devise}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Admin & Contact */}
                          <td className="px-4 py-4">
                            <div className="font-medium text-slate-200">{ent.admin_email || '—'}</div>
                            <div className="text-slate-400 text-[11px] mt-0.5">{ent.telephone || 'Non renseigné'}</div>
                          </td>

                          {/* Plan selector */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <select
                                value={ent.plan}
                                disabled={actionLoadingId === ent.id}
                                onChange={e => handlePlanChange(ent.id, e.target.value as any)}
                                className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-amber-500 cursor-pointer disabled:opacity-50"
                              >
                                <option value="gratuit">Gratuit</option>
                                <option value="pro">⭐ Pro</option>
                                <option value="enterprise">👑 Enterprise</option>
                              </select>
                            </div>
                          </td>

                          {/* Utilisateurs */}
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 font-bold border border-slate-700">
                              <Users className="w-3 h-3 text-blue-400" />
                              {ent.nb_users}
                            </span>
                          </td>

                          {/* Mouvements & Volume */}
                          <td className="px-4 py-4 text-right">
                            <div className="font-bold text-slate-200">
                              {new Intl.NumberFormat('fr-FR').format(ent.volume_mouvements)} {ent.devise}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {ent.nb_mouvements} opération(s)
                            </div>
                          </td>

                          {/* Statut */}
                          <td className="px-4 py-4 text-center">
                            {Number(ent.actif) === 1 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Actif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <XCircle className="w-3.5 h-3.5" /> Suspendu
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => handleToggleStatus(ent)}
                              disabled={actionLoadingId === ent.id}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                Number(ent.actif) === 1
                                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              } disabled:opacity-50`}
                            >
                              {Number(ent.actif) === 1 ? 'Suspendre' : 'Activer'}
                            </button>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Contenu Onglet : Journal d'Audit SaaS */}
        {activeTab === 'audit' && (
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">Dernières Activités SaaS & Événements Système</h3>
                <p className="text-xs text-slate-400">Traces d'audit horodatées pour la sécurité et la conformité</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                50 derniers événements
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800/80 text-slate-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-5 py-3">Date & Heure</th>
                    <th className="px-4 py-3">Entreprise</th>
                    <th className="px-4 py-3">Auteur</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-5 py-3">Détails de l'événement</th>
                    <th className="px-4 py-3 text-right">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {data?.recent_logs && data.recent_logs.length > 0 ? (
                    data.recent_logs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3 text-slate-400 whitespace-nowrap">
                          {log.created_at}
                        </td>
                        <td className="px-4 py-3 font-sans font-bold text-white">
                          {log.entreprise_nom || <span className="text-slate-500 font-mono">Système/Global</span>}
                        </td>
                        <td className="px-4 py-3 font-sans">
                          <span className="text-slate-200">{log.user_nom || 'Anonyme'}</span>
                          {log.user_email && <div className="text-[10px] text-slate-500">{log.user_email}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700 text-[11px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-sans text-slate-300 max-w-md truncate" title={log.details || ''}>
                          {log.details || '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500 text-[11px]">
                          {log.ip_address || '::1'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-500 font-sans">
                        Aucun log d'audit disponible pour l'instant.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
