import React, { useState } from 'react';
import { authService, GoogleAuthResult } from '../../services/authService';
import { User, UserRole } from '../../types/hospital';
import { 
  X, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  LogOut, 
  Copy, 
  ExternalLink,
  User as UserIcon,
  Sparkles,
  HeartPulse,
  Stethoscope,
  Users,
  Shield
} from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role || 'PACIENTE');
  const [authError, setAuthError] = useState<{ message: string; isDomainError?: boolean } | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  if (!isOpen) return null;

  const isGoogleAuthenticated = currentUser.authProvider === 'google' || Boolean(currentUser.googleUid);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);

    const result: GoogleAuthResult = await authService.loginWithGoogle(selectedRole);
    setLoading(false);

    if (result.success) {
      onClose();
    } else {
      setAuthError({
        message: result.error || 'Error al iniciar sesión con Google.',
        isDomainError: result.isDomainError
      });
    }
  };

  const handleSimulatedGoogleSignIn = (emailOverride?: string) => {
    const userEmail = emailOverride || 'seter7712@gmail.com';
    const userName = userEmail.split('@')[0];
    const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);

    authService.loginWithSimulatedGoogleAccount(userEmail, formattedName, selectedRole);
    onClose();
  };

  const handleCopyHostname = () => {
    if (navigator?.clipboard && currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 3000);
    }
  };

  const handleSignOut = async () => {
    await authService.logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="font-bold text-slate-900 text-sm">
              Autenticación con Google
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {isGoogleAuthenticated ? (
            /* Logged in state with Google */
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full border border-emerald-300 object-cover shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-base">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">{currentUser.name}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-slate-600 block text-[11px] font-mono">{currentUser.email}</span>
                  <span className="inline-block text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full mt-0.5">
                    Cuenta Google Vinculada
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-800 block text-xs">Rol Hospitalario Activo:</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{currentUser.role}</span>
                  <span className="text-slate-500 font-mono text-[11px]">ID: {currentUser.id}</span>
                </div>
                {currentUser.role === 'MEDICO' && (
                  <div className="text-[11px] text-slate-600">
                    Especialidad: <b>{currentUser.specialtyName || 'Clínica'}</b> · Matrícula: <b>{currentUser.medicalLicense}</b>
                  </div>
                )}
                {currentUser.role === 'PACIENTE' && (
                  <div className="text-[11px] text-slate-600">
                    Cobertura: <b>{currentUser.insuranceName || 'Particular'}</b> · DNI: <b>{currentUser.dni}</b>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg cursor-pointer"
                >
                  Continuar en la Aplicación
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg border border-rose-200 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          ) : (
            /* Not logged in with Google: sign in flow */
            <div className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                Inicie sesión o regístrese automáticamente en el Sistema Hospitalario MediCore utilizando su cuenta de Google.
              </p>



              {/* Error presentation */}
              {authError && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-amber-900">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold block">{authError.message}</span>
                      {authError.isDomainError && (
                        <div className="text-[11px] text-amber-800 space-y-2 pt-1">
                          <p>
                            Firebase requiere registrar el dominio de esta vista previa en la lista de dominios autorizados del proyecto <b>ssss-42b23</b>:
                          </p>
                          <div className="flex items-center gap-1.5 p-1.5 bg-white rounded border border-amber-300 font-mono text-[10px] text-slate-800">
                            <span className="truncate flex-1">{currentHostname}</span>
                            <button
                              type="button"
                              onClick={handleCopyHostname}
                              className="px-1.5 py-0.5 bg-amber-100 hover:bg-amber-200 rounded text-amber-900 font-sans text-[10px] font-semibold cursor-pointer"
                            >
                              {copiedDomain ? 'Copiado' : 'Copiar'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fallback instant continue */}
                  <div className="pt-2 border-t border-amber-200/80">
                    <button
                      type="button"
                      onClick={() => handleSimulatedGoogleSignIn('seter7712@gmail.com')}
                      className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ingresar con seter7712@gmail.com (Modo Asistido)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Real Google popup button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-300 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-3 disabled:opacity-60"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loading ? 'Conectando con Google...' : 'Continuar con Google'}</span>
              </button>

              <div className="text-[11px] text-slate-400 text-center">
                Autenticación segura respaldada por Firebase Auth & Google Identity.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
