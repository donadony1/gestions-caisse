import React, { useState } from 'react';
import { X, Upload, Check, AlertCircle, ArrowUpRight } from 'lucide-react';
import { User, Category } from '@/lib/types';
import { api } from '@/lib/api';

interface AddSortieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null;
  categories?: Category[];
  devise?: string;
}

export const AddSortieModal: React.FC<AddSortieModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user,
  categories = [],
  devise
}) => {
  const currentDevise = devise || api.getSavedUser()?.entreprise?.devise || 'FCFA';
  const [montant, setMontant] = useState('');
  const [motif, setMotif] = useState('');
  const [beneficiaire, setBeneficiaire] = useState('');
  const [categorieId, setCategorieId] = useState('');
  const [modePaiement, setModePaiement] = useState('especes');
  const [dateMouvement, setDateMouvement] = useState(new Date().toISOString().split('T')[0]);
  const [file, setFile] = useState<File | null>(null);
  const [autoValide, setAutoValide] = useState(user?.role === 'admin');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numMontant = parseFloat(montant);
    if (isNaN(numMontant) || numMontant <= 0) {
      setError('Veuillez saisir un montant valide.');
      return;
    }
    if (!motif.trim()) {
      setError('Le motif du décaissement est obligatoire.');
      return;
    }
    if (!beneficiaire.trim()) {
      setError('Veuillez renseigner un bénéficiaire ou demandeur.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('montant', numMontant.toString());
      formData.append('motif', motif.trim());
      formData.append('beneficiaire', beneficiaire.trim());
      if (categorieId) {
        formData.append('categorie_id', categorieId);
      }
      formData.append('mode_paiement', modePaiement);
      formData.append('date_mouvement', dateMouvement);
      if (user?.role === 'admin' && autoValide) {
        formData.append('auto_valide', '1');
      }
      if (file) {
        formData.append('justificatif', file);
      }

      await api.createSortie(formData);
      onSuccess();
      onClose();
      // Reset
      setMontant('');
      setMotif('');
      setBeneficiaire('');
      setCategorieId('');
      setFile(null);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-200">
        
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-600 text-white">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Demande de Décaissement</h3>
              <p className="text-xs text-slate-500">Dépense ou bon de sortie de caisse</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Montant */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Montant à décaisser ({currentDevise}) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                placeholder="Ex: 25000"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-600">
                {currentDevise}
              </span>
            </div>
          </div>

          {/* Catégorie & Bénéficiaire */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Catégorie */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Catégorie de dépense
              </label>
              <select
                value={categorieId}
                onChange={(e) => setCategorieId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                <option value="">Général / Sans catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Bénéficiaire */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Bénéficiaire / Demandeur *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Fournisseur, Employé..."
                value={beneficiaire}
                onChange={(e) => setBeneficiaire(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Motif */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Motif & Justification de la dépense *
            </label>
            <textarea
              rows={2}
              required
              placeholder="Ex: Facture carburant livraison, achat cartouches d'encre..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
            />
          </div>

          {/* Mode de paiement & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mode de règlement
              </label>
              <select
                value={modePaiement}
                onChange={(e) => setModePaiement(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                <option value="especes">Espèces</option>
                <option value="virement">Virement bancaire</option>
                <option value="cheque">Chèque</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date de sortie
              </label>
              <input
                type="date"
                value={dateMouvement}
                onChange={(e) => setDateMouvement(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Justificatif / Facture */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Facture / Reçu / Pièce jointe (PDF, JPG, PNG)
            </label>
            <div className="relative border-2 border-dashed border-slate-200 hover:border-rose-400 rounded-2xl p-4 text-center transition-colors">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs text-slate-600 font-medium">
                {file ? file.name : "Cliquez ou glissez une facture justificative"}
              </p>
            </div>
          </div>

          {/* Validation automatique pour Admin */}
          {user?.role === 'admin' && (
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="autoValide"
                checked={autoValide}
                onChange={(e) => setAutoValide(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
              />
              <label htmlFor="autoValide" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Valider directement sans passer par le contrôle
              </label>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-rose-600/30 flex items-center space-x-2"
            >
              {loading ? (
                <span>Enregistrement...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Soumettre la dépense</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
