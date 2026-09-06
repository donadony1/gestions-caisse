'use client';

import React, { useState } from 'react';
import { X, Check, XCircle, FileText, AlertCircle, ShieldAlert } from 'lucide-react';
import { Movement } from '@/lib/types';
import { api } from '@/lib/api';

interface ValidationModalProps {
  isOpen: boolean;
  mouvement: Movement | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  mouvement,
  onClose,
  onSuccess
}) => {
  const [action, setAction] = useState<'approuver' | 'rejeter' | null>(null);
  const [motifRejet, setMotifRejet] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !mouvement) return null;

  const handleProcess = async () => {
    if (!action) return;
    if (action === 'rejeter' && !motifRejet.trim()) {
      setError('Le motif du rejet est obligatoire.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.processValidation(mouvement.id, action, motifRejet.trim());
      onSuccess();
      onClose();
      setAction(null);
      setMotifRejet('');
    } catch (err: any) {
      setError(err.message || "Erreur lors du traitement");
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-200">
        
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Validation de Décaissement</h3>
              <p className="text-xs text-slate-500">Réf : {mouvement.reference}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Détails du mouvement */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Carte récapitulative */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Montant demandé</span>
              <span className="text-xl font-extrabold text-rose-600">
                {formatMoney(mouvement.montant)} FCFA
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block">Bénéficiaire</span>
                <span className="font-bold text-slate-800">{mouvement.beneficiaire || 'Non spécifié'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Demandeur</span>
                <span className="font-bold text-slate-800">{mouvement.createur_prenom || 'Caissier'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Catégorie</span>
                <span className="font-bold text-slate-800">{mouvement.categorie_nom || 'Général'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Mode</span>
                <span className="font-bold text-slate-800 capitalize">{mouvement.mode_paiement}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-400 block">Motif & Justification</span>
              <p className="text-xs font-medium text-slate-800 mt-0.5">{mouvement.motif}</p>
            </div>

            {mouvement.justificatif_url && (
              <div className="pt-2 border-t border-slate-200">
                <a
                  href={mouvement.justificatif_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl"
                >
                  <FileText className="w-4 h-4" />
                  <span>Voir la pièce justificative</span>
                </a>
              </div>
            )}
          </div>

          {/* Formulaire de Rejet si sélectionné */}
          {action === 'rejeter' && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-rose-800 uppercase tracking-wider">
                Motif du refus / rejet *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Précisez pourquoi cette dépense est refusée (pièce manquante, dépassement, etc.)..."
                value={motifRejet}
                onChange={(e) => setMotifRejet(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
              />
            </div>
          )}

          {/* Boutons d'action */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            {action === null ? (
              <>
                <button
                  type="button"
                  onClick={() => setAction('rejeter')}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center space-x-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Rejeter la demande</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAction('approuver')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Approuver & Valider</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setAction(null);
                    setMotifRejet('');
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleProcess}
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center space-x-1.5 ${
                    action === 'approuver'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                  }`}
                >
                  {loading ? (
                    <span>Traitement...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>
                        Confirmer {action === 'approuver' ? "l'approbation" : 'le rejet'}
                      </span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
