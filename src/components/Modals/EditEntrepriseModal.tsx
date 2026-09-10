import React, { useState, useEffect, useRef } from 'react';
import { X, Building2, Phone, DollarSign, Upload, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, ShieldCheck, MapPin } from 'lucide-react';
import { Entreprise, User } from '@/lib/types';
import { api } from '@/lib/api';

interface EditEntrepriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSuccess?: (updatedEntreprise: Entreprise) => void;
}

const COMMON_CURRENCIES = [
  { code: 'FCFA', label: 'FCFA - Franc CFA (XAF / XOF)' },
  { code: 'EUR', label: 'EUR (€) - Euro' },
  { code: 'USD', label: 'USD ($) - Dollar américain' },
  { code: 'CAD', label: 'CAD ($) - Dollar canadien' },
  { code: 'GBP', label: 'GBP (£) - Livre Sterling' },
  { code: 'CHF', label: 'CHF - Franc suisse' },
  { code: 'GNF', label: 'GNF - Franc guinéen' },
  { code: 'CDF', label: 'CDF - Franc congolais' },
  { code: 'MAD', label: 'MAD - Dirham marocain' },
];

export const EditEntrepriseModal: React.FC<EditEntrepriseModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}) => {
  const [nom, setNom] = useState('');
  const [devise, setDevise] = useState('FCFA');
  const [telephone, setTelephone] = useState('');
  const [localisation, setLocalisation] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthorized = currentUser?.role === 'admin' || currentUser?.role === 'controleur' || currentUser?.role === 'superadmin';

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMsg(null);
      loadEntrepriseData();
    }
  }, [isOpen]);

  const loadEntrepriseData = async () => {
    setFetching(true);
    try {
      if (currentUser?.entreprise) {
        setNom(currentUser.entreprise.nom || '');
        setDevise(currentUser.entreprise.devise || 'FCFA');
        setTelephone(currentUser.entreprise.telephone || '');
        setLocalisation(currentUser.entreprise.localisation || '');
        setLogoUrl(currentUser.entreprise.logo_url || '');
        setPreviewUrl(currentUser.entreprise.logo_url || null);
      }

      const data = await api.getEntreprise();
      if (data) {
        setNom(data.nom || '');
        setDevise(data.devise || 'FCFA');
        setTelephone(data.telephone || '');
        setLocalisation(data.localisation || '');
        setLogoUrl(data.logo_url || '');
        setPreviewUrl(data.logo_url || null);
      }
    } catch (err: any) {
      console.warn("Récupération entreprise :", err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setError('Le logo ne doit pas dépasser 3 Mo.');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) {
      setError("Le nom de l'entreprise est obligatoire.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('nom', nom.trim());
      formData.append('devise', devise.trim());
      formData.append('telephone', telephone.trim());
      formData.append('localisation', localisation.trim());

      if (logoFile) {
        formData.append('logo', logoFile);
      } else if (logoUrl.trim()) {
        formData.append('logo_url', logoUrl.trim());
      }

      const updated = await api.updateEntreprise(formData);
      setSuccessMsg("Informations de l'entreprise mises à jour avec succès !");

      if (onSuccess) {
        onSuccess(updated);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la modification de l'entreprise.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden transform transition-all max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Paramètres Entreprise</h3>
              <div className="flex items-center space-x-2 text-xs text-emerald-100">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Autorisé pour Admin & Contrôleur</span>
              </div>
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

        {/* Content */}
        {!isAuthorized ? (
          <div className="p-8 text-center overflow-y-auto">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">Accès restreint</h4>
            <p className="text-sm text-slate-500 mt-1">
              Seuls les administrateurs et contrôleurs ont le droit de modifier les informations de l'entreprise.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
            >
              Fermer
            </button>
          </div>
        ) : fetching ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm font-medium text-slate-500">Chargement des données...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
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

            {/* Logo Entreprise avec Preview */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Logo de l'entreprise
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Logo preview" className="w-full h-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="w-7 h-7 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 border border-slate-200"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Téléverser une image</span>
                  </button>
                  <p className="text-[11px] text-slate-400">PNG, JPG, WEBP ou SVG (Max 3 Mo)</p>
                </div>
              </div>
            </div>

            {/* Nom de l'entreprise */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Nom de l'entreprise <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex : Honda SARL, Ndolo Cosmetics..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Localisation / Adresse */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Localisation / Adresse physique
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={localisation}
                  onChange={(e) => setLocalisation(e.target.value)}
                  placeholder="Ex : Douala, Akwa - Boulevard de la Liberté"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Devise & Téléphone (2 colonnes) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Devise */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Devise monétaire <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={devise}
                    onChange={(e) => setDevise(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition appearance-none cursor-pointer"
                  >
                    {COMMON_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Téléphone de contact
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+237 6..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
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
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <span>Enregistrer les modifications</span>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
