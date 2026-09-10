import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopHeader } from '@/components/TopHeader';
import { HeroBalance } from '@/components/HeroBalance';
import { WeeklyChart } from '@/components/WeeklyChart';
import { MovementsList } from '@/components/MovementsList';
import { BottomNav } from '@/components/BottomNav';
import { AddEntreeModal } from '@/components/Modals/AddEntreeModal';
import { AddSortieModal } from '@/components/Modals/AddSortieModal';
import { AddFactureModal } from '@/components/Modals/AddFactureModal';
import { ViewFactureModal } from '@/components/Modals/ViewFactureModal';
import { ValidationModal } from '@/components/Modals/ValidationModal';
import { DashboardData, Movement, User, Category, Facture, FactureQuota } from '@/lib/types';
import { api } from '@/lib/api';
import { Loader2, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modales
  const [isEntreeModalOpen, setIsEntreeModalOpen] = useState(false);
  const [isSortieModalOpen, setIsSortieModalOpen] = useState(false);
  const [isFactureModalOpen, setIsFactureModalOpen] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [isViewFactureOpen, setIsViewFactureOpen] = useState(false);
  const [autoPrintFacture, setAutoPrintFacture] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      
      const token = api.getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const [currentUser, dashboardData, entreesRes] = await Promise.all([
        api.getMe().catch(() => api.getSavedUser()),
        api.getDashboard(),
        api.getEntrees({ page: 1 }).catch(() => ({ categories: [] }))
      ]);

      if (currentUser) {
        setUser(currentUser);
      }
      setData(dashboardData);
      if (entreesRes && entreesRes.categories) {
        setCategories(entreesRes.categories);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement des données depuis le serveur.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Chargement des données de trésorerie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 pb-24 sm:pb-28">
      
      {/* En-tête Supérieur */}
      <TopHeader
        user={user}
        pendingCount={data?.pending?.count ?? 0}
        onRefresh={loadData}
      />

      {/* Contenu Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        
        {/* Message d'erreur éventuel */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Erreur de connexion au backend</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Grille Principale */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Colonne Gauche : Solde Net & Flux Hebdomadaires */}
          <div className="lg:col-span-7 space-y-6">
            <HeroBalance
              financials={data?.financials ?? null}
              devise={user?.entreprise?.devise || 'FCFA'}
              onOpenEntreeModal={() => setIsEntreeModalOpen(true)}
              onOpenSortieModal={() => setIsSortieModalOpen(true)}
              onOpenFactureModal={() => setIsFactureModalOpen(true)}
            />

            <WeeklyChart flows={data?.weekly_flows || data?.weekly_flow || []} />
          </div>

          {/* Colonne Droite : Mouvements Récents */}
          <div className="lg:col-span-5">
            <MovementsList
              movements={data?.recent_movements || []}
              title="Derniers Mouvements de Caisse"
              devise={user?.entreprise?.devise || 'FCFA'}
              onSelectMovement={(m) => {
                if (m.statut === 'en_attente' && (user?.role === 'admin' || user?.role === 'controleur')) {
                  setSelectedMovement(m);
                }
              }}
            />
          </div>

        </div>

      </main>

      {/* Barre de navigation basse */}
      <BottomNav
        user={user}
        pendingCount={data?.pending?.count ?? 0}
        onOpenEntreeModal={() => setIsEntreeModalOpen(true)}
        onOpenSortieModal={() => setIsSortieModalOpen(true)}
      />

      {/* Modales */}
      <AddEntreeModal
        isOpen={isEntreeModalOpen}
        onClose={() => setIsEntreeModalOpen(false)}
        onSuccess={loadData}
        categories={categories}
        devise={user?.entreprise?.devise || 'FCFA'}
      />

      <AddSortieModal
        isOpen={isSortieModalOpen}
        onClose={() => setIsSortieModalOpen(false)}
        onSuccess={loadData}
        user={user}
        categories={categories}
        devise={user?.entreprise?.devise || 'FCFA'}
      />

      <AddFactureModal
        isOpen={isFactureModalOpen}
        onClose={() => setIsFactureModalOpen(false)}
        currentUser={user}
        onSuccess={(created) => {
          loadData();
          setSelectedFacture(created);
          setAutoPrintFacture(true);
          setIsViewFactureOpen(true);
        }}
      />

      <ViewFactureModal
        isOpen={isViewFactureOpen}
        onClose={() => {
          setIsViewFactureOpen(false);
          setAutoPrintFacture(false);
        }}
        facture={selectedFacture}
        autoPrint={autoPrintFacture}
        onFactureUpdated={() => loadData()}
      />

      <ValidationModal
        isOpen={!!selectedMovement}
        mouvement={selectedMovement}
        onClose={() => setSelectedMovement(null)}
        onSuccess={loadData}
        devise={user?.entreprise?.devise || 'FCFA'}
      />

    </div>
  );
}
