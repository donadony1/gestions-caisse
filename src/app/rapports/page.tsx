import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopHeader } from '@/components/TopHeader';
import { BottomNav } from '@/components/BottomNav';
import { 
  FileSpreadsheet, 
  Download, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { ReportData, User } from '@/lib/types';
import { api } from '@/lib/api';

export default function RapportsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [dateDebut, setDateDebut] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [dateFin, setDateFin] = useState(new Date().toISOString().split('T')[0]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'entree' | 'sortie'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = api.getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      setUser(api.getSavedUser());
      const data = await api.getRapport({
        date_debut: dateDebut,
        date_fin: dateFin,
        type: typeFilter
      });
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du calcul du journal de caisse');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [dateDebut, dateFin, typeFilter]);

  const handleExportCsv = () => {
    const url = api.getExportCsvUrl({
      date_debut: dateDebut,
      date_fin: dateFin,
      type: typeFilter
    });
    window.open(url, '_blank');
  };

  const formatMoney = (amount?: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-slate-100/60 pb-24 sm:pb-28">
      <TopHeader user={user} onRefresh={loadReport} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Erreur de chargement</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
            <button
              onClick={loadReport}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* En-tête */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold">Journal Général de Caisse</h1>
              <p className="text-xs text-indigo-200 mt-0.5">
                Livre de trésorerie avec solde progressif et export comptable
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center justify-center space-x-2 py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-indigo-950/40 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Exporter en CSV</span>
          </button>
        </div>

        {/* Barre des filtres de date et type */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-card flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-semibold">Du :</span>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-semibold">Au :</span>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none"
            >
              <option value="all">Tous les flux</option>
              <option value="entree">Uniquement Entrées</option>
              <option value="sortie">Uniquement Sorties</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            {report?.count || 0} lignes enregistrées
          </div>
        </div>

        {/* Cartes de synthèse de la période */}
        {report && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
              <span className="text-xs text-slate-400 font-semibold">Solde Initial</span>
              <p className="text-base sm:text-lg font-bold text-slate-800 mt-1">
                {formatMoney(report.periode.solde_initial)} <span className="text-xs font-normal">FCFA</span>
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
              <span className="text-xs text-emerald-600 font-semibold">+ Total Entrées</span>
              <p className="text-base sm:text-lg font-extrabold text-emerald-600 mt-1">
                +{formatMoney(report.periode.total_entrees)} <span className="text-xs font-normal">FCFA</span>
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
              <span className="text-xs text-rose-600 font-semibold">- Total Sorties</span>
              <p className="text-base sm:text-lg font-extrabold text-rose-600 mt-1">
                -{formatMoney(report.periode.total_sorties)} <span className="text-xs font-normal">FCFA</span>
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card bg-gradient-to-tr from-slate-900 to-slate-800 text-white">
              <span className="text-xs text-slate-300 font-semibold">= Solde de Clôture</span>
              <p className="text-base sm:text-lg font-extrabold text-emerald-400 mt-1">
                {formatMoney(report.periode.solde_cloture)} <span className="text-xs font-normal text-white">FCFA</span>
              </p>
            </div>
          </div>
        )}

        {/* Tableau du Journal de Caisse */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Calcul du solde progressif...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Réf.</th>
                    <th className="py-3 px-4">Libellé / Motif</th>
                    <th className="py-3 px-4">Tiers</th>
                    <th className="py-3 px-4">Catégorie</th>
                    <th className="py-3 px-4 text-right text-emerald-700">Débit (Entrée)</th>
                    <th className="py-3 px-4 text-right text-rose-700">Crédit (Sortie)</th>
                    <th className="py-3 px-4 text-right font-extrabold">Solde Progressif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report?.lignes.map((line) => (
                    <tr key={line.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">{line.date}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">{line.reference}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">{line.libelle}</td>
                      <td className="py-3 px-4 text-slate-600 truncate">{line.tiers}</td>
                      <td className="py-3 px-4 text-slate-500 truncate">{line.categorie}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                        {line.debit > 0 ? `+${formatMoney(line.debit)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-600 whitespace-nowrap">
                        {line.credit > 0 ? `-${formatMoney(line.credit)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900 whitespace-nowrap">
                        {formatMoney(line.solde_progressif)} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      <BottomNav user={user} />
    </div>
  );
}
