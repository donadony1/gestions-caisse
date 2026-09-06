import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopHeader } from '@/components/TopHeader';
import { BottomNav } from '@/components/BottomNav';
import { AddSortieModal } from '@/components/Modals/AddSortieModal';
import { ValidationModal } from '@/components/Modals/ValidationModal';
import { MovementsList } from '@/components/MovementsList';
import { ArrowUpRight, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Movement, Category, User } from '@/lib/types';
import { api } from '@/lib/api';

export default function SortiesPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [sorties, setSorties] = useState<Movement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSorties = async () => {
    try {
      setError(null);
      const token = api.getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      setUser(api.getSavedUser());
      const res = await api.getSorties();
      setSorties(res.items || []);
      setCategories(res.categories || []);
      setSummary(res.summary);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des décaissements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSorties();
  }, []);

  const formatMoney = (amount?: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Chargement des dépenses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 pb-24 sm:pb-28">
      <TopHeader user={user} onRefresh={loadSorties} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Erreur de chargement</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
            <button
              onClick={loadSorties}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* En-tête de page & Statistiques Sorties */}
        <div className="bg-gradient-to-r from-slate-900 to-rose-950 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold">Gestion des Décaissements</h1>
              <div className="flex items-center space-x-3 text-xs text-slate-300 mt-1">
                <span>Validé : <b className="text-white">{formatMoney(summary?.total_valide)} FCFA</b></span>
                <span>•</span>
                <span className="text-amber-300">En attente : <b className="text-amber-200">{formatMoney(summary?.total_en_attente)} FCFA</b></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 py-3 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-rose-950/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Demander une Dépense</span>
          </button>
        </div>

        {/* Liste des sorties */}
        <MovementsList
          movements={sorties}
          title="Historique des Dépenses & Décaissements"
          showSearch={true}
          onSelectMovement={(m) => {
            if (m.statut === 'en_attente' && (user?.role === 'admin' || user?.role === 'controleur')) {
              setSelectedMovement(m);
            }
          }}
        />

      </main>

      <BottomNav
        user={user}
        onOpenSortieModal={() => setIsModalOpen(true)}
      />

      <AddSortieModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadSorties}
        user={user}
      />

      <ValidationModal
        isOpen={!!selectedMovement}
        mouvement={selectedMovement}
        onClose={() => setSelectedMovement(null)}
        onSuccess={loadSorties}
      />
    </div>
  );
}
