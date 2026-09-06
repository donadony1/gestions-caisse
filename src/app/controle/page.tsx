import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopHeader } from '@/components/TopHeader';
import { BottomNav } from '@/components/BottomNav';
import { ValidationModal } from '@/components/Modals/ValidationModal';
import { 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Movement, User } from '@/lib/types';
import { api } from '@/lib/api';

export default function ControlePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<'pending' | 'history'>('pending');
  const [pendingItems, setPendingItems] = useState<Movement[]>([]);
  const [historyItems, setHistoryItems] = useState<Movement[]>([]);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadValidations = async () => {
    try {
      setError(null);
      const token = api.getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      setUser(api.getSavedUser());
      const resPending = await api.getValidations('pending');
      setPendingItems(resPending.pending || []);

      const resHistory = await api.getValidations('history');
      setHistoryItems(resHistory.history || []);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des validations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadValidations();
  }, []);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Chargement de l'espace de contrôle...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 pb-24 sm:pb-28">
      <TopHeader user={user} pendingCount={pendingItems.length} onRefresh={loadValidations} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Erreur de chargement</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
            <button
              onClick={loadValidations}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* En-tête */}
        <div className="bg-gradient-to-r from-amber-700 via-orange-800 to-amber-950 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold">Espace de Contrôle & Approbation</h1>
              <p className="text-xs text-amber-200 mt-0.5">
                {pendingItems.length} demande{pendingItems.length > 1 ? 's' : ''} en attente de vérification
              </p>
            </div>
          </div>

          {/* Onglets */}
          <div className="flex items-center p-1 bg-black/20 rounded-2xl self-start sm:self-auto text-xs font-bold">
            <button
              onClick={() => setTab('pending')}
              className={`px-4 py-2 rounded-xl transition-all ${
                tab === 'pending' ? 'bg-white text-slate-900 shadow-md' : 'text-amber-100 hover:text-white'
              }`}
            >
              En attente ({pendingItems.length})
            </button>
            <button
              onClick={() => setTab('history')}
              className={`px-4 py-2 rounded-xl transition-all ${
                tab === 'history' ? 'bg-white text-slate-900 shadow-md' : 'text-amber-100 hover:text-white'
              }`}
            >
              Historique des décisions
            </button>
          </div>
        </div>

        {/* Contenu de l'onglet actif */}
        {tab === 'pending' ? (
          <div className="space-y-4">
            {pendingItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-card">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">Toutes les demandes ont été traitées !</h3>
                <p className="text-xs text-slate-500 mt-1">Aucun bon de décaissement n'est actuellement en attente.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl p-5 border border-amber-200 shadow-card hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-500">{item.reference}</span>
                        <span className="text-lg font-extrabold text-rose-600">
                          {formatMoney(item.montant)} FCFA
                        </span>
                      </div>

                      <div className="mt-3 space-y-2 text-xs">
                        <div className="flex items-center space-x-2 text-slate-700">
                          <span className="font-bold text-slate-900">Motif :</span>
                          <span className="truncate">{item.motif}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-600">
                          <span className="text-slate-400">Bénéficiaire :</span>
                          <span className="font-semibold">{item.beneficiaire}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-600">
                          <span className="text-slate-400">Demandé par :</span>
                          <span className="font-semibold">{item.createur_prenom} ({item.createur_email})</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-600">
                          <span className="text-slate-400">Date :</span>
                          <span>{item.date_mouvement}</span>
                        </div>
                      </div>

                      {item.justificatif_url && (
                        <div className="mt-3 pt-2 border-t border-slate-100">
                          <a
                            href={item.justificatif_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Voir le justificatif joint</span>
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedMovement(item)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition-all flex items-center justify-center space-x-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Examiner & Décider</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Onglet Historique des décisions */
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-card">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Décisions de Contrôle Récentes</h3>
            <div className="divide-y divide-slate-100">
              {historyItems.map((h) => (
                <div key={h.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">{h.motif}</span>
                      <span className="text-slate-400">({h.reference})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Bénéficiaire : <b>{h.beneficiaire}</b> • Traité par : <b>{h.validateur_prenom || 'Admin'}</b>
                    </p>
                    {h.motif_rejet && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1">
                        Motif du refus : {h.motif_rejet}
                      </p>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="font-extrabold text-slate-900">{formatMoney(h.montant)} FCFA</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        h.statut === 'valide'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {h.statut === 'valide' ? 'Approuvé' : 'Rejeté'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <BottomNav user={user} />

      <ValidationModal
        isOpen={!!selectedMovement}
        mouvement={selectedMovement}
        onClose={() => setSelectedMovement(null)}
        onSuccess={loadValidations}
      />
    </div>
  );
}
