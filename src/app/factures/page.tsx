import React, { useState, useEffect } from 'react';
import { TopHeader } from '@/components/TopHeader';
import { BottomNav } from '@/components/BottomNav';
import { AddFactureModal } from '@/components/Modals/AddFactureModal';
import { ViewFactureModal, downloadSingleFacture } from '@/components/Modals/ViewFactureModal';
import { User, Facture, FacturesResponse, FactureQuota } from '@/lib/types';
import { api } from '@/lib/api';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Printer, 
  Download,
  Eye, 
  Crown, 
  ArrowUpRight, 
  Loader2, 
  AlertCircle,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function FacturesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [facturesData, setFacturesData] = useState<FacturesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paye' | 'en_attente'>('all');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  // Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [autoPrint, setAutoPrint] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const [currentUser, facturesRes] = await Promise.all([
        api.getMe().catch(() => api.getSavedUser()),
        api.getFactures({
          search: searchTerm || undefined,
          statut: statusFilter !== 'all' ? statusFilter : undefined,
          date_debut: dateDebut || undefined,
          date_fin: dateFin || undefined,
        })
      ]);

      if (currentUser) setUser(currentUser);
      setFacturesData(facturesRes);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des factures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, dateDebut, dateFin]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenView = (facture: Facture) => {
    setAutoPrint(false);
    setSelectedFacture(facture);
    setIsViewModalOpen(true);
  };

  const handleDownloadPdf = async (facture: Facture) => {
    if (downloadingId) return;
    setDownloadingId(facture.id);
    try {
      await downloadSingleFacture(facture);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleFactureCreated = (created: Facture) => {
    loadData();
    setSelectedFacture(created);
    setAutoPrint(true);
    setIsViewModalOpen(true);
  };

  const handleFactureUpdated = (updated: Facture) => {
    loadData();
  };

  const devise = user?.entreprise?.devise || 'FCFA';
  const formatMoney = (val: number) => new Intl.NumberFormat('fr-FR').format(val);

  const quota = facturesData?.quota;
  const summary = facturesData?.summary;

  return (
    <div className="min-h-screen bg-slate-100/60 pb-24 sm:pb-28">
      
      {/* En-tête */}
      <TopHeader user={user} onRefresh={loadData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Titre & Bouton d'action principal */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">Module Facturation</h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Émission de factures clients & encaissements automatiques
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-800 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Facture</span>
          </button>
        </div>

        {/* Message d'erreur éventuel */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Cartes Récapitulatives des Factures */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Facturé */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Émis</span>
              <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {formatMoney(summary?.total_facture || 0)} <span className="text-xs font-bold text-slate-400">{devise}</span>
            </div>
            <p className="text-xs text-slate-500">{summary?.count || 0} facture(s) au total</p>
          </div>

          {/* Total Encaissé (Payé) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Encaissé (Payé)</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
              {formatMoney(summary?.total_paye || 0)} <span className="text-xs font-bold text-emerald-400">{devise}</span>
            </div>
            <p className="text-xs text-emerald-700 font-medium">Crédité en caisse</p>
          </div>

          {/* En attente de paiement */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">En Attente</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
              {formatMoney(summary?.total_en_attente || 0)} <span className="text-xs font-bold text-amber-400">{devise}</span>
            </div>
            <p className="text-xs text-amber-700 font-medium">Créances clients à recouvrer</p>
          </div>

          {/* Quota Abonnement SaaS */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-5 text-white shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Formule SaaS</span>
              <div className="p-2 rounded-xl bg-white/10 text-amber-300">
                <Crown className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black uppercase tracking-wider text-white">
                Plan {quota?.plan || 'Gratuit'}
              </span>
              <p className="text-xs text-indigo-200 mt-0.5">
                {quota?.plan === 'gratuit' ? (
                  <span>{quota.total_factures} / {quota.max_factures} factures (Gratuit)</span>
                ) : (
                  <span className="text-emerald-400 font-bold">Factures Illimitées 🚀</span>
                )}
              </p>
            </div>
          </div>

        </div>

        {/* Barre de Recherche & Filtres */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Onglets Statut */}
            <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Toutes
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('paye')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${
                  statusFilter === 'paye'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Payées</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('en_attente')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${
                  statusFilter === 'en_attente'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>En attente</span>
              </button>
            </div>

            {/* Formulaire de Recherche */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Client, n° facture..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </form>

          </div>
        </div>

        {/* Liste / Tableau des Factures */}
        {loading ? (
          <div className="p-16 bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Chargement des factures...</p>
          </div>
        ) : !facturesData?.items || facturesData.items.length === 0 ? (
          <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Aucune facture trouvée</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchTerm || statusFilter !== 'all'
                  ? "Aucun résultat ne correspond à vos critères de recherche."
                  : "Vous n'avez pas encore émis de facture client. Commencez dès maintenant !"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Créer une facture</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Version Cartes pour Mobile (< md) */}
            <div className="grid grid-cols-1 gap-3.5 md:hidden">
              {facturesData.items.map((facture) => (
                <div
                  key={facture.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-black text-slate-900 text-sm">
                        {facture.numero_facture}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        📅 {new Date(facture.date_facture).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    {facture.statut === 'paye' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Payée</span>
                      </span>
                    ) : Number(facture.montant_recu || 0) > 0 ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Acompte reçu</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>En attente</span>
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-slate-900">
                      👤 {facture.client_nom}
                    </p>
                    {facture.client_telephone && (
                      <p className="text-[11px] text-slate-500">
                        📞 {facture.client_telephone}
                      </p>
                    )}
                    <p className="text-xs text-slate-600 pt-1 line-clamp-2">
                      {facture.service_rendu}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Montant</span>
                      <span className="text-base font-black font-mono text-slate-900">
                        {formatMoney(facture.montant)} <span className="text-xs text-slate-500">{devise}</span>
                      </span>
                      {Number(facture.montant_recu || 0) > 0 && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 space-y-0.5">
                          <div>Reçu: <span className="font-semibold text-slate-700">{formatMoney(Number(facture.montant_recu))} {devise}</span></div>
                          {facture.statut === 'en_attente' && Number(facture.montant) > Number(facture.montant_recu) && (
                            <div className="text-amber-600 font-bold">Reste: {formatMoney(Number(facture.montant) - Number(facture.montant_recu))} {devise}</div>
                          )}
                          {Number(facture.reliquat || 0) > 0 && (
                            <div className="text-emerald-600 font-semibold">Rendu: {formatMoney(Number(facture.reliquat))} {devise}</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenView(facture)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1"
                        title="Imprimer ou consulter la facture"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        <span>Imprimer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(facture)}
                        disabled={downloadingId === facture.id}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-1 shadow-sm shadow-indigo-600/20 active:scale-95 disabled:opacity-60"
                        title="Télécharger la facture au format PDF"
                      >
                        {downloadingId === facture.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>{downloadingId === facture.id ? 'PDF...' : 'PDF'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Version Tableau pour Tablettes & Ordinateurs (>= md) */}
            <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                    <tr>
                      <th className="p-4">N° Facture & Date</th>
                      <th className="p-4">Client & Coordonnées</th>
                      <th className="p-4">Service Rendu</th>
                      <th className="p-4 text-right">Montant</th>
                      <th className="p-4 text-center">Statut</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {facturesData.items.map((facture) => (
                      <tr key={facture.id} className="hover:bg-slate-50/70 transition">
                        
                        {/* N° & Date */}
                        <td className="p-4 align-top">
                          <span className="font-mono font-bold text-slate-900 block text-xs">
                            {facture.numero_facture}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">
                            {new Date(facture.date_facture).toLocaleDateString('fr-FR')}
                          </span>
                        </td>

                        {/* Client */}
                        <td className="p-4 align-top">
                          <span className="font-bold text-slate-800 block text-xs">
                            {facture.client_nom}
                          </span>
                          {facture.client_telephone && (
                            <span className="text-[11px] text-slate-500 block">
                              📞 {facture.client_telephone}
                            </span>
                          )}
                          {facture.client_localisation && (
                            <span className="text-[10px] text-slate-400 block">
                              📍 {facture.client_localisation}
                            </span>
                          )}
                        </td>

                        {/* Service */}
                        <td className="p-4 align-top max-w-xs">
                          <p className="text-xs text-slate-700 line-clamp-2">
                            {facture.service_rendu}
                          </p>
                        </td>

                        {/* Montant */}
                        <td className="p-4 align-top text-right font-mono font-bold text-xs text-slate-900">
                          <div>{formatMoney(facture.montant)} {devise}</div>
                          {Number(facture.montant_recu || 0) > 0 && (
                            <div className="text-[10px] text-slate-500 font-normal mt-0.5 space-y-0.5">
                              <div>Reçu: <span className="font-semibold text-slate-700">{formatMoney(Number(facture.montant_recu))} {devise}</span></div>
                              {facture.statut === 'en_attente' && Number(facture.montant) > Number(facture.montant_recu) && (
                                <div className="text-amber-600 font-bold">Reste: {formatMoney(Number(facture.montant) - Number(facture.montant_recu))} {devise}</div>
                              )}
                              {Number(facture.reliquat || 0) > 0 && (
                                <div className="text-emerald-600 font-semibold">Rendu: {formatMoney(Number(facture.reliquat))} {devise}</div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Statut */}
                        <td className="p-4 align-top text-center">
                          {facture.statut === 'paye' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Payée</span>
                            </span>
                          ) : Number(facture.montant_recu || 0) > 0 ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Acompte reçu</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>En attente</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 align-top text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenView(facture)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition flex items-center space-x-1 font-semibold"
                              title="Voir et Imprimer la facture"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-600" />
                              <span className="hidden lg:inline">Imprimer</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(facture)}
                              disabled={downloadingId === facture.id}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center space-x-1 border border-indigo-200/80 shadow-2xs active:scale-95 disabled:opacity-60"
                              title="Télécharger la facture au format PDF"
                            >
                              {downloadingId === facture.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                              ) : (
                                <Download className="w-3.5 h-3.5 text-indigo-600" />
                              )}
                              <span className="hidden sm:inline">
                                {downloadingId === facture.id ? 'PDF...' : 'PDF'}
                              </span>
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Barre de navigation basse */}
      <BottomNav user={user} />

      {/* Modale de création */}
      <AddFactureModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentUser={user}
        quota={quota}
        onSuccess={handleFactureCreated}
      />

      {/* Modale de visualisation & impression */}
      <ViewFactureModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setAutoPrint(false);
        }}
        facture={selectedFacture}
        autoPrint={autoPrint}
        onFactureUpdated={handleFactureUpdated}
      />

    </div>
  );
}
