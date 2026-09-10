import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileSpreadsheet, 
  ShieldCheck, 
  Plus, 
  X,
  LucideIcon
} from 'lucide-react';
import { User } from '@/lib/types';

interface BottomNavProps {
  user: User | null;
  pendingCount?: number;
  onOpenEntreeModal?: () => void;
  onOpenSortieModal?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  user,
  pendingCount = 0,
  onOpenEntreeModal,
  onOpenSortieModal
}) => {
  const location = useLocation();
  const pathname = location.pathname;
  const [showFabMenu, setShowFabMenu] = useState(false);

  const isControleurOrAdmin = user?.role === 'admin' || user?.role === 'controleur';

  const navItem1: NavItem = { label: 'Accueil', href: '/', icon: LayoutDashboard };
  const navItem2: NavItem = { label: 'Entrées', href: '/entrees', icon: ArrowDownLeft };
  const navItem3: NavItem = { label: 'Sorties', href: '/sorties', icon: ArrowUpRight };
  const navItem4: NavItem = isControleurOrAdmin
    ? { label: 'Contrôle', href: '/controle', icon: ShieldCheck, badge: pendingCount }
    : { label: 'Rapports', href: '/rapports', icon: FileSpreadsheet };

  const Icon1 = navItem1.icon;
  const Icon2 = navItem2.icon;
  const Icon3 = navItem3.icon;
  const Icon4 = navItem4.icon;

  return (
    <>
      {/* Menu surgissant du bouton central FAB */}
      {showFabMenu && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end p-4 pb-24 sm:pb-28"
          onClick={() => setShowFabMenu(false)}
        >
          <div 
            className="max-w-sm mx-auto w-full bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-3 animate-in fade-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Nouvelle Opération</span>
              <button
                type="button"
                onClick={() => setShowFabMenu(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowFabMenu(false);
                if (onOpenEntreeModal) onOpenEntreeModal();
              }}
              className="w-full flex items-center space-x-3 p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Encaisser de l'argent</p>
                <p className="text-xs text-emerald-600">Ventes, règlements client, approvisionnement</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowFabMenu(false);
                if (onOpenSortieModal) onOpenSortieModal();
              }}
              className="w-full flex items-center space-x-3 p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/30">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Demander un décaissement</p>
                <p className="text-xs text-rose-600">Dépenses, factures fournisseurs, achats</p>
              </div>
            </button>

            <Link
              to="/factures"
              onClick={() => setShowFabMenu(false)}
              className="w-full flex items-center space-x-3 p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Gérer les Factures Clients</p>
                <p className="text-xs text-blue-600">Émettre, imprimer & encaisser des factures</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Barre de navigation fixe en bas */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-4 py-2 pb-safe sm:pb-3 shadow-lg">
        <div className="max-w-md mx-auto relative flex items-center justify-around">
          
          {/* Item 1 - Accueil */}
          <Link
            to={navItem1.href}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-colors ${
              pathname === navItem1.href ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon1 className="w-5 h-5" />
            <span className="text-[10px] mt-1">{navItem1.label}</span>
          </Link>

          {/* Item 2 - Entrées */}
          <Link
            to={navItem2.href}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-colors ${
              pathname === navItem2.href ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon2 className="w-5 h-5" />
            <span className="text-[10px] mt-1">{navItem2.label}</span>
          </Link>

          {/* Bouton Central FAB (+) */}
          <div className="relative -top-5">
            <button
              type="button"
              onClick={() => setShowFabMenu(!showFabMenu)}
              className="w-13 h-13 p-3.5 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-4 border-slate-50"
              title="Ajouter une opération"
            >
              <Plus className={`w-6 h-6 transition-transform ${showFabMenu ? 'rotate-45' : ''}`} />
            </button>
          </div>

          {/* Item 3 - Sorties */}
          <Link
            to={navItem3.href}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-colors ${
              pathname === navItem3.href ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon3 className="w-5 h-5" />
            <span className="text-[10px] mt-1">{navItem3.label}</span>
          </Link>

          {/* Item 4 - Contrôle ou Rapports */}
          <Link
            to={navItem4.href}
            className={`relative flex flex-col items-center py-1 px-3 rounded-2xl transition-colors ${
              pathname === navItem4.href ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon4 className="w-5 h-5" />
            <span className="text-[10px] mt-1">{navItem4.label}</span>
            {navItem4.badge && navItem4.badge > 0 ? (
              <span className="absolute top-0 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {navItem4.badge}
              </span>
            ) : null}
          </Link>

        </div>
      </nav>
    </>
  );
};
