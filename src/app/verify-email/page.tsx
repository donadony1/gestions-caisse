import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { MailCheck, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 1. Si un token est présent dans l'URL, vérification automatique
  useEffect(() => {
    if (tokenParam && emailParam) {
      setAutoVerifying(true);
      api.verifyEmail(emailParam, undefined, tokenParam)
        .then(() => {
          setSuccess("Adresse email confirmée avec succès ! Redirection...");
          setTimeout(() => navigate('/'), 1800);
        })
        .catch((err) => {
          setError(err.message || "Lien de vérification invalide ou expiré.");
        })
        .finally(() => {
          setAutoVerifying(false);
        });
    }
  }, [tokenParam, emailParam, navigate]);

  // 2. Gestion du compte à rebours de renvoi
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // 3. Gestion des saisies dans les cases OTP
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Cas du copier-coller d'un code complet
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) {
          newOtp[i] = pasted[i] || '';
        }
        setOtp(newOtp);
        const nextIdx = Math.min(pasted.length, 5);
        inputRefs.current[nextIdx]?.focus();
      }
      return;
    }

    const cleanVal = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Passer au champ suivant
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length !== 6) {
      setError("Veuillez saisir le code complet à 6 chiffres.");
      return;
    }
    if (!email) {
      setError("Adresse email manquante.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.verifyEmail(email, fullCode);
      setSuccess("Adresse email confirmée avec succès ! Redirection...");
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setError(err.message || "Code de vérification incorrect ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    try {
      setError(null);
      await api.resendVerification(email);
      setSuccess(`Un nouveau code a été envoyé à ${email}.`);
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || "Erreur lors du renvoi du code.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 relative overflow-hidden text-slate-100">
      
      {/* Halos d'ambiance */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-2xl shadow-emerald-500/30 mb-4 border border-emerald-400/30">
          <MailCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Vérification d'Email
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Un code à 6 chiffres a été envoyé à <br />
          <span className="font-semibold text-emerald-400">{email || 'votre adresse email'}</span>
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-8 shadow-2xl rounded-3xl border border-slate-800 relative">
          
          {/* Alerte Erreur */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center space-x-2.5 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Alerte Succès */}
          {success && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center space-x-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {autoVerifying ? (
            <div className="py-8 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-medium">Vérification de votre lien en cours...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Champ Email modifiable si non fourni */}
              {!emailParam && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@exemple.com"
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Cases de code OTP */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
                  Saisissez le code à 6 chiffres
                </label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-black bg-slate-950/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all shadow-inner"
                    />
                  ))}
                </div>
              </div>

              {/* Bouton de confirmation */}
              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.98] text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirmer et Activer mon Compte</span>
                  </>
                )}
              </button>

              {/* Bouton Renvoyer le code */}
              <div className="text-center pt-2 border-t border-slate-800/80 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? `Renvoyer un nouveau code (${resendCooldown}s)`
                    : "Vous n'avez rien reçu ? Renvoyer un code"}
                </button>
              </div>

            </form>
          )}

          {/* Lien retour connexion */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour à la page de connexion
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
