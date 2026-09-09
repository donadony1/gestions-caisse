'use client';

import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Eye, EyeOff, Plus, Minus, Wallet, TrendingUp, Sparkles } from 'lucide-react';
import { Financials } from '@/lib/types';

interface HeroBalanceProps {
  financials: Financials | null;
  devise?: string;
  onOpenEntreeModal: () => void;
  onOpenSortieModal: () => void;
}

export const HeroBalance: React.FC<HeroBalanceProps> = ({
  financials,
  devise = 'FCFA',
  onOpenEntreeModal,
  onOpenSortieModal
}) => {
  const [showAmount, setShowAmount] = useState<boolean>(true);

  const formatMoney = (amount?: number) => {
    if (amount === undefined || amount === null) return '0';
    if (!showAmount) return '••••••••';
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount);
  };

  const solde = financials?.solde_net ?? 0;
  const entrees = financials?.total_entrees ?? 0;
  const sorties = financials?.total_sorties ?? 0;

  return (
    <div className="w-full">
      {/* Carte Principale : Solde Net */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-800">
        
        {/* Effets lumineux d'arrière-plan */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          
          {/* Ligne haute : Libellé & Visibilité */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Solde Net Disponible
              </span>
            </div>

            <button
              onClick={() => setShowAmount(!showAmount)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={showAmount ? "Masquer le montant" : "Afficher le montant"}
            >
              {showAmount ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Montant principal */}
          <div className="mt-4 flex items-baseline space-x-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              {formatMoney(solde)}
            </h1>
            <span className="text-sm sm:text-lg font-bold text-emerald-400">
              {devise}
            </span>
          </div>

          {/* Badge de santé de trésorerie */}
          <div className="mt-3 flex items-center space-x-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Couverture {financials?.taux_couverture ?? 100}%</span>
            </div>
            <span className="text-xs text-slate-400">
              Mois : +{formatMoney(financials?.flux_net_mois)} {devise}
            </span>
          </div>

          {/* Boutons d'action rapide */}
          <div className="mt-6 grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={onOpenEntreeModal}
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-sm font-bold shadow-lg shadow-emerald-900/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Encaissement</span>
            </button>

            <button
              onClick={onOpenSortieModal}
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-rose-300 border border-rose-500/20 text-sm font-bold shadow-md transition-all"
            >
              <Minus className="w-4 h-4" />
              <span>Décaissement</span>
            </button>
          </div>

        </div>
      </div>

      {/* Sous-cartes : Total Entrées et Total Sorties */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
        
        {/* Sous-carte Entrées */}
        <div className="relative overflow-hidden bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Entrées</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-base sm:text-xl font-bold text-slate-900">
              +{formatMoney(entrees)} <span className="text-xs font-semibold text-emerald-600">{devise}</span>
            </p>
            <p className="text-[11px] text-emerald-600 mt-0.5">
              Mois : +{formatMoney(financials?.entrees_mois)} {devise}
            </p>
          </div>
        </div>

        {/* Sous-carte Sorties */}
        <div className="relative overflow-hidden bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Sorties</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-base sm:text-xl font-bold text-slate-900">
              -{formatMoney(sorties)} <span className="text-xs font-semibold text-rose-600">{devise}</span>
            </p>
            <p className="text-[11px] text-rose-600 mt-0.5">
              Mois : -{formatMoney(financials?.sorties_mois)} {devise}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
