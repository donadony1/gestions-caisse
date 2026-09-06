import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopHeader } from '@/components/TopHeader';
import { BottomNav } from '@/components/BottomNav';
import { AddEntreeModal } from '@/components/Modals/AddEntreeModal';
import { MovementsList } from '@/components/MovementsList';
import { ArrowDownLeft, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Movement, Category, User } from '@/lib/types';
import { api } from '@/lib/api';

export default function EntreesPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [entrees, setEntrees] = useState<Movement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntrees = async () => {
    try {
      setError(null);
      const token = api.getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      setUser(api.getSavedUser());
      const res = await api.getEntrees();
      setEntrees(res.items || []);
      setCategories(res.categories || []);
      setSummary(res.summary);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des encaissements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntrees();
  }, []);

  const formatMoney = (amount?: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Chargement des encaissements...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 pb-24 sm:pb-28">
      <TopHeader user={user} onRefresh={loadEntrees} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Erreur de chargement</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
            <button
              onClick={loadEntrees}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* En-tête de page & Statistiques Entrées */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold">Gestion des Encaissements</h1>
              <p className="text-xs text-emerald-200 mt-0.5">
                Total encaissé : <span className="font-bold text-white">{formatMoney(summary?.total_montant)} FCFA</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 py-3 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-extrabold text-sm shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Encaissement</span>
          </button>
        </div>

        {/* Liste des entrées */}
        <MovementsList
          movements={entrees}
          title="Historique des Entrées de Caisse"
          showSearch={true}
        />

      </main>

      <BottomNav
        user={user}
        onOpenEntreeModal={() => setIsModalOpen(true)}
      />

      <AddEntreeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadEntrees}
        categories={categories}
      />
    </div>
  );
}
