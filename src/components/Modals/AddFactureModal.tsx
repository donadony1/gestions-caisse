import React, { useState, useEffect } from 'react';
import { X, FileText, User as UserIcon, Phone, MapPin, DollarSign, Calendar, CreditCard, Loader2, AlertCircle, CheckCircle, Sparkles, Crown } from 'lucide-react';
import { User, Facture, FactureQuota } from '@/lib/types';
import { api } from '@/lib/api';

interface AddFactureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  quota?: FactureQuota | null;
  onSuccess?: (createdFacture: Facture) => void;
}

export const AddFactureModal: React.FC<AddFactureModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  quota,
  onSuccess,
}) => {
  const [clientNom, setClientNom] = useState('');
  const [clientTelephone, setClientTelephone] = useState('');
  const [clientLocalisation, setClientLocalisation] = useState('');
  const [serviceRendu, setServiceRendu] = useState('');
  const [montant, setMontant] = useState('');
  const [montantRecu, setMontantRecu] = useState('');
  const [statut, setStatut] = useState<'paye' | 'en_attente'>('en_attente');
  const [modePaiement, setModePaiement] = useState<string>('especes');
  const [dateFacture, setDateFacture] = useState(new Date().toISOString().split('T')[0]);
  const [dateEcheance, setDateEcheance] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setClientNom('');
      setClientTelephone('');
      setClientLocalisation('');
      setServiceRendu('');
      setMontant('');
      setMontantRecu('');
      setStatut('en_attente');
      setModePaiement('especes');
      setDateFacture(new Date().toISOString().split('T')[0]);
      setDateEcheance('');
      setNotes('');
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  const isLimitReached = quota?.is_limit_reached;
  const devise = currentUser?.entreprise?.devise || 'FCFA';

  const numTotal = parseFloat(montant) || 0;
  const numRecu = parseFloat(montantRecu) || 0;
  const reliquat = numRecu > numTotal && numTotal > 0 ? Math.round((numRecu - numTotal) * 100) / 100 : 0;
  const resteAPayer = numTotal > numRecu ? Math.round((numTotal - numRecu) * 100) / 100 : 0;

  const handleMontantChange = (val: string) => {
    setMontant(val);
    const newTotal = parseFloat(val) || 0;
    const recu = parseFloat(montantRecu) || 0;
    if (recu >= newTotal && newTotal > 0) {
      setStatut('paye');
    } else if (recu > 0 && recu < newTotal) {
      setStatut('en_attente');
    }
  };

  const handleMontantRecuChange = (val: string) => {
    setMontantRecu(val);
    const recu = parseFloat(val) || 0;
    const total = parseFloat(montant) || 0;
    if (recu >= total && total > 0) {
      setStatut('paye');
    } else if (recu > 0 && recu < total) {
      setStatut('en_attente');
    }
  };

  const handleSelectPaye = () => {
    setStatut('paye');
    if (!montantRecu || parseFloat(montantRecu) < (parseFloat(montant) || 0)) {
      setMontantRecu(montant);
    }
  };

  const handleSelectEnAttente = () => {
    setStatut('en_attente');
    if (parseFloat(montantRecu) >= (parseFloat(montant) || 0) && parseFloat(montant) > 0) {
      setMontantRecu('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientNom.trim()) {
      setError('Veuillez saisir le nom du client.');
      return;
    }

    if (!serviceRendu.trim()) {
      setError('Veuillez décrire le service rendu.');
      return;
    }

    const numericAmount = parseFloat(montant);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Veuillez saisir un montant valide supérieur à 0.');
      return;
    }

    const numericRecu = parseFloat(montantRecu) || 0;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const created = await api.createFacture({
        client_nom: clientNom.trim(),
        client_telephone: clientTelephone.trim() || undefined,
        client_localisation: clientLocalisation.trim() || undefined,
        service_rendu: serviceRendu.trim(),
        montant: numericAmount,
        montant_recu: numericRecu,
        statut: statut,
        mode_paiement: modePaiement,
        date_facture: dateFacture,
        date_echeance: dateEcheance || undefined,
        notes: notes.trim() || undefined,
      });

      setSuccessMsg(
        statut === 'paye'
          ? 'Facture créée et montant crédité dans la caisse !'
          : numericRecu > 0
          ? `Facture créée : acompte de ${numericRecu} ${devise} crédité en caisse, reste ${numericAmount - numericRecu} ${devise}.`
          : 'Facture émise avec succès (en attente de paiement).'
      );

      if (onSuccess) {
        onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de la facture.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-slate-100 overflow-hidden transform transition-all max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 backdrop-blur-md flex items-center justify-center border border-indigo-400/30">
              <FileText className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Émettre une Facture</h3>
              <p className="text-xs text-indigo-200">Facturation client & encaissement automatique</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-6 flex-1">
          
          {/* Quota Banner */}
          {quota && quota.plan === 'gratuit' && (
            <div className={`mb-5 p-4 rounded-2xl border flex items-center justify-between ${
              isLimitReached
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center space-x-3">
                <Crown className={`w-5 h-5 ${isLimitReached ? 'text-rose-600' : 'text-amber-600'}`} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">
                    Plan Gratuit ({quota.total_factures} / {quota.max_factures} factures utilisées)
                  </p>
                  <p className="text-xs mt-0.5 opacity-90">
                    {isLimitReached
                      ? 'Limite atteinte. Passez en Pro pour débloquer les factures illimitées.'
                      : `Il vous reste ${quota.remaining} facture(s) gratuite(s).`}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-2.5">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start space-x-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            {/* Section Client */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                1. Coordonnées du Client
              </span>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom du client / Raison sociale <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={clientNom}
                    onChange={(e) => setClientNom(e.target.value)}
                    placeholder="Ex : M. Jean Dupont, Entreprise ABC..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Téléphone du client
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={clientTelephone}
                      onChange={(e) => setClientTelephone(e.target.value)}
                      placeholder="+237 6..."
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Localisation / Adresse du client
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={clientLocalisation}
                      onChange={(e) => setClientLocalisation(e.target.value)}
                      placeholder="Ex : Bonanjo, Douala"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section Service & Montant */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                2. Prestation & Facturation
              </span>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service rendu / Désignation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={serviceRendu}
                  onChange={(e) => setServiceRendu(e.target.value)}
                  placeholder="Ex : Développement application web, Audit comptable, Fourniture de savons..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Montant total de la facture ({devise}) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      value={montant}
                      onChange={(e) => handleMontantChange(e.target.value)}
                      placeholder="Ex : 250000"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Montant reçu du client ({devise})
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={montantRecu}
                      onChange={(e) => handleMontantRecuChange(e.target.value)}
                      placeholder={montant ? `Ex : ${montant}` : "Ex : 250000"}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Indicateur dynamique : Reliquat ou Reste à payer */}
              {reliquat > 0 && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Facture soldée :</strong> Montant reçu suffisant.</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Monnaie / Reliquat à rendre</span>
                    <span className="text-sm font-black font-mono text-emerald-800">
                      {new Intl.NumberFormat('fr-FR').format(reliquat)} {devise}
                    </span>
                  </div>
                </div>
              )}

              {resteAPayer > 0 && numRecu > 0 && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>Acompte reçu :</strong> {new Intl.NumberFormat('fr-FR').format(numRecu)} {devise} (entre en caisse)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block">Reste à payer</span>
                    <span className="text-sm font-black font-mono text-amber-800">
                      {new Intl.NumberFormat('fr-FR').format(resteAPayer)} {devise}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mode de règlement
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={modePaiement}
                      onChange={(e) => setModePaiement(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="especes">Espèces / Caisse</option>
                      <option value="virement">Virement Bancaire</option>
                      <option value="cheque">Chèque</option>
                      <option value="mobile_money">Mobile Money (OM/MOMO)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Statut & Dates */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                3. Statut du Paiement
              </span>

              {/* Toggle Mention Payé / En attente */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleSelectEnAttente}
                  className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${
                    statut === 'en_attente'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-sm">⏳ EN ATTENTE</span>
                  <span className="text-[10px] font-normal opacity-90">
                    {numRecu > 0 ? 'Acompte partiel' : 'À régler plus tard'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleSelectPaye}
                  className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${
                    statut === 'paye'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-sm">✅ DÉJÀ PAYÉ</span>
                  <span className="text-[10px] font-normal opacity-90">Soldé en caisse</span>
                </button>
              </div>

              {statut === 'paye' && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Ce montant de <strong>{montant || '0'} {devise}</strong> sera automatiquement crédité dans vos <strong>Entrées de caisse</strong>.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date d'émission
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={dateFacture}
                      onChange={(e) => setDateFacture(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date d'échéance (optionnel)
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={dateEcheance}
                      onChange={(e) => setDateEcheance(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || isLimitReached}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Création...</span>
                  </>
                ) : (
                  <span>Émettre la facture</span>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
