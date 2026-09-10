'use client';

import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { WeeklyFlow } from '@/lib/types';

interface WeeklyChartProps {
  flows: WeeklyFlow[];
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ flows = [] }) => {
  // Garantir toujours 4 semaines affichées
  const displayFlows = (flows && Array.isArray(flows) && flows.length >= 4) ? flows : [
    { label: 'S-3', entrees: 0, sorties: 0, net: 0 },
    { label: 'S-2', entrees: 0, sorties: 0, net: 0 },
    { label: 'S-1', entrees: 0, sorties: 0, net: 0 },
    { label: 'En cours', entrees: 0, sorties: 0, net: 0 },
  ];

  // Trouver le montant maximum pour dimensionner les barres proportionnellement
  const rawMax = Math.max(
    ...displayFlows.map((f) => Math.max(Number(f.entrees) || 0, Number(f.sorties) || 0)),
    0
  );
  const maxAmount = rawMax > 0 ? rawMax : 1000;

  const formatShort = (amount: number) => {
    const num = Number(amount) || 0;
    if (num === 0) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toString();
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('fr-FR').format(Number(val) || 0);

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card">
      
      {/* En-tête du graphique */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
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
        {displayFlows.map((item, idx) => {
          const eVal = Number(item.entrees) || 0;
          const sVal = Number(item.sorties) || 0;
          const hasEntrees = eVal > 0;
          const hasSorties = sVal > 0;

          const entreeHeight = hasEntrees ? Math.max(12, Math.round((eVal / maxAmount) * 100)) : 4;
          const sortieHeight = hasSorties ? Math.max(12, Math.round((sVal / maxAmount) * 100)) : 4;
          const isCurrent = idx === displayFlows.length - 1;

          return (
            <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
              
              {/* Tooltip flottant au hover */}
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap shadow-lg">
                +{formatMoney(eVal)} / -{formatMoney(sVal)}
              </div>

              {/* Conteneur des deux barres côte à côte */}
              <div className="flex items-end space-x-1.5 sm:space-x-2 h-full w-full justify-center">
                
                {/* Barre Entrées */}
                <div className="relative w-3.5 sm:w-5 flex flex-col items-center justify-end h-full">
                  <div
                    style={{ height: `${entreeHeight}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      hasEntrees
                        ? isCurrent
                          ? 'bg-emerald-600'
                          : 'bg-emerald-400 group-hover:bg-emerald-500'
                        : 'bg-slate-100'
                    }`}
                  ></div>
                </div>

                {/* Barre Sorties */}
                <div className="relative w-3.5 sm:w-5 flex flex-col items-center justify-end h-full">
                  <div
                    style={{ height: `${sortieHeight}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      hasSorties
                        ? isCurrent
                          ? 'bg-rose-500'
                          : 'bg-rose-300 group-hover:bg-rose-400'
                        : 'bg-slate-100'
                    }`}
                  ></div>
                </div>

              </div>

              {/* Libellé de la semaine & Montants */}
              <div className="mt-3 text-center w-full">
                <span
                  className={`text-xs font-bold block ${
                    isCurrent ? 'text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </span>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">
                  <span className="text-emerald-600 font-semibold">+{formatShort(eVal)}</span>
                  <span className="text-slate-300 mx-0.5">/</span>
                  <span className="text-rose-500 font-semibold">-{formatShort(sVal)}</span>
                </p>
              </div>

            </div>
          );
        })}
      </div>

      {/* Résumé bas */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>Évolution des 4 dernières semaines</span>
        <span className="font-semibold text-emerald-600 flex items-center space-x-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Temps Réel</span>
        </span>
      </div>

    </div>
  );
};
