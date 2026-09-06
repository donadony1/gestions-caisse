import React, { useState } from 'react';
import { X, UserPlus, Check, AlertCircle, Upload, Shield, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { api } from '@/lib/api';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('caissier');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nom.trim() || !prenom.trim()) {
      setError('Le nom et le prénom sont obligatoires.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Veuillez renseigner une adresse email valide.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('nom', nom.trim());
      formData.append('prenom', prenom.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('password', password);
      formData.append('role', role);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await api.createUser(formData);
      onSuccess();
      onClose();

      // Reset
      setNom('');
      setPrenom('');
      setEmail('');
      setPassword('');
      setRole('caissier');
      setAvatarFile(null);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du membre");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-200">
        
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-indigo-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Ajouter un Nouveau Membre</h3>
              <p className="text-xs text-slate-500">Création d'un accès utilisateur au système</p>
            </div>
          </div>
          <button
            type="button"
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

          {/* Nom & Prénom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nom *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Dupont"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Prénom *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Jean"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Adresse Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Adresse Email (Identifiant) *
            </label>
            <input
              type="email"
              required
              placeholder="jean.dupont@caisse.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Mot de Passe */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mot de passe initial *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Minimum 6 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Rôle attribué */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Rôle et autorisations *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('caissier')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  role === 'caissier'
                    ? 'bg-emerald-50/80 border-emerald-500 text-emerald-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs font-bold block">Caissier</span>
                <span className="text-[10px] text-slate-500">Saisie des opérations</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('controleur')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  role === 'controleur'
                    ? 'bg-amber-50/80 border-amber-500 text-amber-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs font-bold block">Contrôleur</span>
                <span className="text-[10px] text-slate-500">Validation dépenses</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  role === 'admin'
                    ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs font-bold block">Admin</span>
                <span className="text-[10px] text-slate-500">Accès intégral</span>
              </button>
            </div>
          </div>

          {/* Photo de profil / Avatar (optionnel) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Photo de profil (Optionnel)
            </label>
            <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-3 text-center transition-colors">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <p className="text-xs text-slate-600 font-medium">
                {avatarFile ? avatarFile.name : "Sélectionner une photo"}
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
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
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
            >
              {loading ? (
                <span>Création en cours...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Créer le membre</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
