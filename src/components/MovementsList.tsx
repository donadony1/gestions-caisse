'use client';

import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ChevronRight,
  Search,
  Receipt
} from 'lucide-react';
import { Movement } from '@/lib/types';

interface MovementsListProps {
  movements: Movement[];
  title?: string;
  showSearch?: boolean;
  onSelectMovement?: (movement: Movement) => void;
}

export const MovementsList: React.FC<MovementsListProps> = ({
  movements = [],
  title = "Derniers Mouvements",
  showSearch = true,
  onSelectMovement
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'entree' | 'sortie'>('all');

  const filtered = movements.filter((m) => {
    const matchesSearch = 
      m.motif.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.payeur && m.payeur.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.beneficiaire && m.beneficiaire.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || m.type === filterType;

    return matchesSearch && matchesType;
  });

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(d);
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valide':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Validé</span>
          </span>
        );
      case 'en_attente':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
            <Clock className="w-3 h-3" />
            <span>En attente</span>
          </span>
        );
      case 'rejete':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>Rejeté</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card">
      
      {/* En-tête & Filtres */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">Historique des transactions enregistrées</p>
        </div>

        {/* Boutons de filtre rapides */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterType('entree')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'entree' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            Entrées
          </button>
          <button
            onClick={() => setFilterType('sortie')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'sortie' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            Sorties
          </button>
        </div>
      </div>

      {/* Barre de recherche optionnelle */}
      {showSearch && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par motif, référence, tiers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      )}

      {/* Liste des mouvements */}
      <div className="divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">Aucun mouvement trouvé</p>
            <p className="text-xs text-slate-400 mt-1">Les opérations enregistrées apparaîtront ici.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const isEntree = item.type === 'entree';
            const tiers = isEntree ? (item.payeur || 'Client') : (item.beneficiaire || 'Bénéficiaire');

            return (
              <div
                key={item.id}
                onClick={() => onSelectMovement && onSelectMovement(item)}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 rounded-2xl px-2 sm:px-3 -mx-2 sm:-mx-3 transition-colors cursor-pointer group"
              >
                {/* Icône & Informations */}
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      isEntree
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                        : 'bg-rose-50 text-rose-600 border border-rose-200/60'
                    }`}
                  >
                    {isEntree ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {item.motif}
                      </p>
                      {item.justificatif_url && (
                        <span title="Justificatif joint" className="text-slate-400 hover:text-emerald-600">
                          <FileText className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-600 truncate">{tiers}</span>
                      <span>•</span>
                      <span>{item.reference}</span>
                      <span>•</span>
                      <span>{formatDate(item.date_mouvement)}</span>
                    </div>
                  </div>
                </div>

                {/* Montant & Statut */}
                <div className="text-right flex flex-col items-end flex-shrink-0 ml-3">
                  <p
                    className={`text-sm sm:text-base font-extrabold ${
                      isEntree ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {isEntree ? '+' : '-'} {formatMoney(item.montant)}{' '}
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-400">FCFA</span>
                  </p>
                  <div className="mt-1">
                    {getStatusBadge(item.statut)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
