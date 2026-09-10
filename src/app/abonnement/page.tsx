import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Crown, 
  Zap, 
  Check, 
  ShieldCheck, 
  ArrowLeft, 
  RefreshCw, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Users, 
  Layers, 
  CheckCircle,
  HelpCircle,
  Loader2,
  TrendingUp,
  X,
  FileText
} from 'lucide-react';
import { api } from '@/lib/api';
import { SubscriptionInfo, SubscriptionPlan, AbonnementItem, User } from '@/lib/types';
import { TopHeader } from '@/components/TopHeader';

export default function AbonnementPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Toggle annuel / mensuel
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Modal de paiement
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<SubscriptionPlan | null>(null);
  const [paymentProvider, setPaymentProvider] = useState<string>('orange_money');
  const [paymentPhone, setPaymentPhone] = useState<string>('');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const loadData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      setError(null);

      const user = api.getSavedUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUser(user);

      const info = await api.getSubscriptionInfo();
      setSubInfo(info);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des informations d'abonnement.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCheckout = (plan: SubscriptionPlan) => {
    setSelectedPlanToBuy(plan);
    setPaymentPhone(currentUser?.entreprise?.telephone || '');
    setPaymentRef(`PAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  };

  const handleCloseCheckout = () => {
    setSelectedPlanToBuy(null);
    setPaymentPhone('');
    setPaymentRef('');
  };

  const handleConfirmSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanToBuy) return;

    try {
      setSubmittingPayment(true);
      setError(null);

      const dureeMois = billingCycle === 'yearly' ? 12 : 1;

      const res = await api.requestSubscription({
        plan: selectedPlanToBuy.id,
        duree_mois: dureeMois,
        mode_paiement: selectedPlanToBuy.id === 'gratuit' ? 'gratuit' : paymentProvider,
        reference_paiement: selectedPlanToBuy.id === 'gratuit' ? 'OFFRE_GRATUITE' : (paymentRef || `REF-${Date.now()}`),
      });

      setSuccessMsg(res.message || "Demande d'abonnement enregistrée avec succès !");
      handleCloseCheckout();
      await loadData();

      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la souscription.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const formatMoney = (amount: number, currency = 'FCFA') => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' ' + currency;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valide':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Actif & Validé</span>
          </span>
        );
      case 'en_attente':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>En attente de validation</span>
          </span>
        );
      case 'rejete':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Rejeté</span>
          </span>
        );
      case 'expire':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Expiré</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <TopHeader user={currentUser} onRefresh={loadData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* En-tête de la page */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Link 
                to="/" 
                className="inline-flex items-center space-x-1 text-xs font-medium text-slate-500 hover:text-emerald-700 bg-white border border-slate-200 hover:border-emerald-300 px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour Tableau de bord</span>
              </Link>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Offres & Abonnements SaaS</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              Gestion de votre Abonnement
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Choisissez l'offre adaptée à la taille et aux ambitions de votre structure.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 self-start md:self-auto">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Notifications & Alertes */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start space-x-3 text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMsg}</div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* État de chargement initial */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            <p className="text-sm font-medium text-slate-500">Chargement des forfaits et de votre statut...</p>
          </div>
        ) : subInfo ? (
          <>
            {/* CARTE PLAN ACTUEL & QUOTAS */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
              {/* Fond décoratif */}
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                {/* Colonne 1 : Statut du plan */}
                <div className="lg:col-span-1 space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1.5">
                      <Crown className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Formule en vigueur</span>
                    </span>
                  </div>

                  <h2 className="text-3xl font-extrabold text-white tracking-tight">
                    {subInfo.plan_actuel.nom}
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {subInfo.plan_actuel.description}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    {subInfo.plan_expires_at ? (
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs bg-white/10 text-slate-200 border border-white/10">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Expire le : <strong>{new Date(subInfo.plan_expires_at).toLocaleDateString('fr-FR')}</strong></span>
                        {subInfo.days_remaining !== null && (
                          <span className="text-[11px] font-bold text-emerald-300 ml-1">
                            ({subInfo.days_remaining} jours restants)
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Durée illimitée / Sans expiration</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Colonne 2 : Utilisation des Quotas */}
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Quota Utilisateurs */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 flex items-center space-x-1.5 font-medium">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span>Utilisateurs</span>
                      </span>
                      <span className="font-bold text-white font-mono">
                        {subInfo.quotas.users.current} / {subInfo.quotas.users.max ?? '∞'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          subInfo.quotas.users.pct > 90 ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${subInfo.quotas.users.max ? Math.min(100, subInfo.quotas.users.pct) : 10}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {subInfo.quotas.users.max 
                        ? `${Math.max(0, subInfo.quotas.users.max - subInfo.quotas.users.current)} place(s) dispo.` 
                        : 'Membres illimités'}
                    </p>
                  </div>

                  {/* Quota Mouvements ce mois */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 flex items-center space-x-1.5 font-medium">
                        <TrendingUp className="w-4 h-4 text-teal-400" />
                        <span>Opérations / mois</span>
                      </span>
                      <span className="font-bold text-white font-mono">
                        {subInfo.quotas.movements_month.current} / {subInfo.quotas.movements_month.max ?? '∞'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          subInfo.quotas.movements_month.pct > 90 ? 'bg-rose-500' : 'bg-teal-400'
                        }`}
                        style={{ width: `${subInfo.quotas.movements_month.max ? Math.min(100, subInfo.quotas.movements_month.pct) : 10}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {subInfo.quotas.movements_month.max 
                        ? `${Math.max(0, subInfo.quotas.movements_month.max - subInfo.quotas.movements_month.current)} restante(s)` 
                        : 'Écritures illimitées'}
                    </p>
                  </div>

                  {/* Quota Factures & Reçus */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 flex items-center space-x-1.5 font-medium">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span>Factures & Reçus</span>
                      </span>
                      <span className="font-bold text-white font-mono">
                        {subInfo.quotas.factures?.current ?? 0} / {subInfo.quotas.factures?.max ?? '∞'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          (subInfo.quotas.factures?.pct ?? 0) > 90 ? 'bg-rose-500' : 'bg-indigo-400'
                        }`}
                        style={{ width: `${subInfo.quotas.factures?.max ? Math.min(100, subInfo.quotas.factures.pct) : 10}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {subInfo.quotas.factures?.max 
                        ? `${Math.max(0, subInfo.quotas.factures.max - (subInfo.quotas.factures?.current ?? 0))} facture(s) restante(s)` 
                        : 'Factures illimitées'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SÉLECTEUR DE CYCLE DE FACTURATION */}
            <div className="flex flex-col items-center justify-center space-y-4 pt-4">
              <div className="text-center space-y-1">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Comparez nos formules d'abonnement</h3>
                <p className="text-xs sm:text-sm text-slate-500">Tarification claire, en Francs CFA, sans frais cachés.</p>
              </div>

              <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/70 items-center">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Facturation Mensuelle
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                    billingCycle === 'yearly'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Facturation Annuelle</span>
                  <span className="text-[10px] uppercase font-extrabold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full shadow-2xs">
                    2 Mois Offerts 🎉
                  </span>
                </button>
              </div>
            </div>

            {/* GRILLE DES 3 PLANS (GRATUIT, PRO, ENTERPRISE) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-2">
              {subInfo.plans_disponibles.map((plan) => {
                const isCurrent = subInfo.plan_actuel.id === plan.id;
                const isPro = plan.id === 'pro';
                const isEnterprise = plan.id === 'enterprise';
                const price = billingCycle === 'yearly' ? plan.prix_annuel : plan.prix_mensuel;

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 ${
                      isPro
                        ? 'bg-white border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-4 ring-emerald-500/10'
                        : 'bg-white border border-slate-200/90 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isPro && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Recommandé pour les PME</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xl font-bold text-slate-900">{plan.nom}</h4>
                          <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          isPro ? 'bg-emerald-100 text-emerald-700' : isEnterprise ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isPro ? <Zap className="w-5 h-5" /> : isEnterprise ? <Crown className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                        </div>
                      </div>

                      {/* Prix */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                            {price === 0 ? '0' : new Intl.NumberFormat('fr-FR').format(price)}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 uppercase">
                            FCFA {price > 0 ? (billingCycle === 'yearly' ? '/ an' : '/ mois') : ''}
                          </span>
                        </div>
                        {billingCycle === 'yearly' && price > 0 && (
                          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                            Soit {(price / 12).toLocaleString('fr-FR')} FCFA / mois
                          </p>
                        )}
                      </div>

                      {/* Liste des fonctionnalités */}
                      <div className="pt-4 space-y-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Inclus dans ce forfait :</span>
                        <ul className="space-y-2.5">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700">
                              <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isPro ? 'text-emerald-600' : 'text-slate-400'}`} />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bouton d'action */}
                    <div className="pt-8">
                      {isCurrent ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-3 rounded-2xl bg-slate-100 text-slate-500 font-bold text-xs sm:text-sm border border-slate-200 flex items-center justify-center space-x-2 cursor-not-allowed"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Votre Plan Actuel</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenCheckout(plan)}
                          className={`w-full py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center space-x-2 shadow-sm cursor-pointer ${
                            isPro
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:shadow-md'
                              : isEnterprise
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:shadow-md'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>{plan.id === 'gratuit' ? 'Revenir au Gratuit' : `Passer à ${plan.nom}`}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* HISTORIQUE DES DEMANDES ET PAIEMENTS */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mt-12">
              <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Historique des Souscriptions & Paiements</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Toutes les demandes d'activation et reçus d'abonnement</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/60">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Offre / Plan</th>
                      <th className="py-3 px-4">Durée</th>
                      <th className="py-3 px-4">Montant</th>
                      <th className="py-3 px-4">Mode / Réf</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4">Période de Validité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {subInfo.historique && subInfo.historique.length > 0 ? (
                      subInfo.historique.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-500">
                            {new Date(item.created_at).toLocaleDateString('fr-FR')} {new Date(item.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 capitalize">
                            Plan {item.plan}
                          </td>
                          <td className="py-3.5 px-4">
                            {item.duree_mois ? `${item.duree_mois} mois` : 'Illimité'}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            {formatMoney(item.montant, item.devise)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="capitalize font-semibold text-slate-800">
                                {item.mode_paiement?.replace('_', ' ') || 'N/A'}
                              </span>
                              {item.reference_paiement && (
                                <span className="text-[10px] font-mono text-slate-400">
                                  {item.reference_paiement}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {getStatusBadge(item.statut)}
                            {item.motif_rejet && (
                              <p className="text-[10px] text-rose-500 mt-1">{item.motif_rejet}</p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {item.date_debut && item.date_fin ? (
                              <span>Du {new Date(item.date_debut).toLocaleDateString('fr-FR')} au {new Date(item.date_fin).toLocaleDateString('fr-FR')}</span>
                            ) : (
                              <span className="text-slate-400">En cours de traitement</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                          Aucun historique d'abonnement enregistré pour le moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}

        {/* MODALE DE PAIEMENT / CHECKOUT SIMULATION */}
        {selectedPlanToBuy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6 animate-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Souscrire au Plan {selectedPlanToBuy.nom}</h3>
                    <p className="text-xs text-slate-500">Facturation {billingCycle === 'yearly' ? 'Annuelle (12 mois)' : 'Mensuelle (1 mois)'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseCheckout}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Récapitulatif du montant */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Montant à régler :</span>
                  <p className="text-2xl font-extrabold text-emerald-800 font-mono">
                    {formatMoney(billingCycle === 'yearly' ? selectedPlanToBuy.prix_annuel : selectedPlanToBuy.prix_mensuel)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Organisation</span>
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{currentUser?.entreprise?.nom}</p>
                </div>
              </div>

              <form onSubmit={handleConfirmSubscription} className="space-y-4">
                {selectedPlanToBuy.id !== 'gratuit' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">Choisissez votre mode de paiement :</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setPaymentProvider('orange_money')}
                          className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all cursor-pointer ${
                            paymentProvider === 'orange_money'
                              ? 'border-orange-500 bg-orange-50/50 text-orange-950 ring-2 ring-orange-500/20'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <Smartphone className="w-4 h-4 text-orange-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">Orange Money</p>
                            <p className="text-[10px] text-slate-500 truncate">OM Cameroun / CI</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentProvider('mtn_momo')}
                          className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all cursor-pointer ${
                            paymentProvider === 'mtn_momo'
                              ? 'border-amber-500 bg-amber-50/50 text-amber-950 ring-2 ring-amber-500/20'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">MTN MoMo</p>
                            <p className="text-[10px] text-slate-500 truncate">Mobile Money</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentProvider('virement')}
                          className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all cursor-pointer ${
                            paymentProvider === 'virement'
                              ? 'border-indigo-500 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/20'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">Virement Bancaire</p>
                            <p className="text-[10px] text-slate-500 truncate">RIB / Facture proforma</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentProvider('carte')}
                          className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all cursor-pointer ${
                            paymentProvider === 'carte'
                              ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-500/20'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">Carte Bancaire</p>
                            <p className="text-[10px] text-slate-500 truncate">Visa / Mastercard</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">Numéro Mobile Money / Téléphone :</label>
                      <input
                        type="text"
                        value={paymentPhone}
                        onChange={(e) => setPaymentPhone(e.target.value)}
                        placeholder="Ex: +237 699 00 00 00"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">Référence de Transaction :</label>
                      <input
                        type="text"
                        value={paymentRef}
                        onChange={(e) => setPaymentRef(e.target.value)}
                        placeholder="Code reçu par SMS ou numéro de virement"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden uppercase"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-900 text-xs space-y-1">
                    <p className="font-bold">Activation immédiate du plan Starter Gratuit</p>
                    <p className="text-emerald-700">Aucun paiement requis. Votre organisation sera basculée instantanément.</p>
                  </div>
                )}

                <div className="pt-3 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseCheckout}
                    disabled={submittingPayment}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPayment}
                    className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Validation...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirmer la souscription</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
