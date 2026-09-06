'use client';

import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { WeeklyFlow } from '@/lib/types';

interface WeeklyChartProps {
  flows: WeeklyFlow[];
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ flows = [] }) => {
  // Trouver le montant maximum pour dimensionner les barres proportionnellement
  const maxAmount = Math.max(
    ...flows.map((f) => Math.max(f.entrees, f.sorties)),
    100000
  );

  const formatShort = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}k`;
    return amount.toString();
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card">
      
      {/* En-tête du graphique */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Flux Hebdomadaires</h3>
            <p className="text-xs text-slate-500">Comparatif Entrées vs Sorties</p>
          </div>
        </div>

        {/* Légende */}
        <div className="flex items-center space-x-3 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600">Entrées</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span className="text-slate-600">Sorties</span>
          </div>
        </div>
      </div>

      {/* Barres du graphique */}
      <div className="grid grid-cols-4 gap-3 sm:gap-6 items-end h-44 sm:h-48 pt-4 pb-2 border-b border-slate-100">
        {flows.map((item, idx) => {
          const entreeHeight = Math.max(8, Math.round((item.entrees / maxAmount) * 100));
          const sortieHeight = Math.max(8, Math.round((item.sorties / maxAmount) * 100));
          const isCurrent = idx === flows.length - 1;

          return (
            <div key={idx} className="flex flex-col items-center h-full justify-end group">
              
              {/* Conteneur des deux barres côte à côte */}
              <div className="flex items-end space-x-1.5 sm:space-x-2 h-full w-full justify-center">
                
                {/* Barre Entrées */}
                <div className="relative w-3.5 sm:w-5 flex flex-col items-center justify-end h-full">
                  <div
                    style={{ height: `${entreeHeight}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isCurrent ? 'bg-emerald-600' : 'bg-emerald-400 group-hover:bg-emerald-500'
                    }`}
                  ></div>
                </div>

                {/* Barre Sorties */}
                <div className="relative w-3.5 sm:w-5 flex flex-col items-center justify-end h-full">
                  <div
                    style={{ height: `${sortieHeight}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isCurrent ? 'bg-rose-500' : 'bg-rose-300 group-hover:bg-rose-400'
                    }`}
                  ></div>
                </div>

              </div>

              {/* Libellé de la semaine */}
              <div className="mt-3 text-center">
                <span
                  className={`text-xs font-bold ${
                    isCurrent ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                  +{formatShort(item.entrees)} / -{formatShort(item.sorties)}
                </p>
              </div>

            </div>
          );
        })}
      </div>

      {/* Résumé bas */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>Évolution sur les 4 dernières semaines</span>
        <span className="font-semibold text-emerald-600">Calcul en temps réel</span>
      </div>

    </div>
  );
};
