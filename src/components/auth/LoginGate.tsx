import React, { useState, useEffect } from 'react';
import { User } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { authService, AuthResult } from '../../services/authService';
import { SelectedServiceAd } from '../landing/MedicalLandingPage';
import {
  Building2,
  Lock,
  CheckCircle2,
  UserPlus,
  Ban,
  ArrowLeft,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  LogIn
} from 'lucide-react';

interface LoginGateProps {
  onLoginSuccess: (user: User) => void;
  initialTab?: 'login' | 'register';
  selectedServiceAd?: SelectedServiceAd | null;
  onBackToLanding?: () => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({
  onLoginSuccess,
  initialTab = 'register',
  selectedServiceAd = null,
  onBackToLanding
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDomainError, setIsDomainError] = useState(false);

  // Email & Password Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // New patient registration form state
  const [regForm, setRegForm] = useState({
    name: '',
    dni: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    insuranceName: 'Particular / Privado',
    insuranceNumber: ''
  });
  const [showRegPassword, setShowRegPassword] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
    setErrorMessage(null);
  }, [initialTab, selectedServiceAd]);

  const settings = storageService.getSettings();
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  // Email + Password Sign-In Handler
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setIsDomainError(false);

    const result: AuthResult = await authService.loginWithEmailPassword(loginEmail, loginPassword);
    setLoading(false);

    if (result.success && result.user) {
      onLoginSuccess(result.user);
    } else {
      setErrorMessage(result.error || 'No se pudo iniciar sesión con correo y contraseña.');
    }
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    setIsDomainError(false);

    const result: AuthResult = await authService.loginWithGoogle('PACIENTE');
    setLoading(false);

    if (result.success && result.user) {
      if (result.user.status === 'SUSPENDIDO') {
        setErrorMessage('ACCESO DENEGADO: Su cuenta Google está asociada a un usuario SUSPENDIDO por la dirección médica.');
        storageService.logout();
      } else {
        onLoginSuccess(result.user);
      }
    } else {
      setErrorMessage(result.error || 'Error al autenticar con Google.');
      setIsDomainError(Boolean(result.isDomainError));
    }
  };

  // New Patient Register Handler
  const handlePatientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsDomainError(false);

    if (!regForm.name || !regForm.dni || !regForm.email || !regForm.phone || !regForm.password) {
      setErrorMessage('Por favor complete todos los campos obligatorios.');
      return;
    }

    if (regForm.password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (regForm.password !== regForm.confirmPassword) {
      setErrorMessage('Las contraseñas ingresadas no coinciden.');
      return;
    }

    setLoading(true);
    const result = await authService.registerWithEmailPassword({
      name: regForm.name,
      dni: regForm.dni,
      email: regForm.email,
      phone: regForm.phone,
      password: regForm.password,
      insuranceName: regForm.insuranceName,
      insuranceNumber: regForm.insuranceNumber
    });
    setLoading(false);

    if (result.success && result.user) {
      onLoginSuccess(result.user);
    } else {
      setErrorMessage(result.error || 'No se pudo completar el registro.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans">
      {onBackToLanding && (
        <div className="max-w-md w-full mb-3">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Servicios Médicos</span>
          </button>
        </div>
      )}

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Institutional Header Banner */}
        <div className="bg-slate-900 text-white p-6 text-center space-y-2 relative overflow-hidden">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-700 text-white font-bold shadow-md mb-1">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            MediCore Sanatorio Metropolitano
          </h1>
          <p className="text-xs text-slate-300 font-medium">
            Portal Clínico y Hospitalario · Acceso Restringido
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-full text-[10px] text-cyan-300 font-mono tracking-wide mt-1">
            <Lock className="w-3 h-3 text-cyan-400" />
            <span>SISTEMA CERRADO: SÓLO USUARIOS AUTORIZADOS</span>
          </div>
        </div>

        {/* Access Pathways Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMessage(null); setIsDomainError(false); }}
            className={`flex-1 py-3 px-2 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'login'
                ? 'border-cyan-700 text-cyan-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMessage(null); setIsDomainError(false); }}
            className={`flex-1 py-3 px-2 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'register'
                ? 'border-cyan-700 text-cyan-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Registrarse</span>
          </button>
        </div>

        {/* Content Box */}
        <div className="p-6 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-900">
              <Ban className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">{errorMessage}</span>
                {isDomainError && (
                  <p className="text-[11px] text-rose-800">
                    El dominio de previsualización (<code>{currentHostname}</code>) no está añadido en Firebase Console &gt; Authentication &gt; Authorized Domains.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: LOGIN (EMAIL & PASSWORD + GOOGLE) */}
          {activeTab === 'login' && (
            <div className="space-y-4 text-xs">
              <form onSubmit={handleEmailPasswordLogin} className="space-y-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="nombre@correo.com"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(prev => !prev)}
                      aria-label={showLoginPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Verificando credenciales...' : 'Ingresar con Correo y Contraseña'}</span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-200" />
                <span className="shrink mx-3 text-[11px] font-medium text-slate-400">
                  o continúe con
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              {/* Real Google popup trigger */}
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-300 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-3 disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{loading ? 'Validando con Google...' : 'Ingresar con Cuenta de Google'}</span>
              </button>
            </div>
          )}

          {/* TAB 2: REGISTER NEW PATIENT */}
          {activeTab === 'register' && (
            <form onSubmit={handlePatientRegister} className="space-y-3 text-xs">
              {selectedServiceAd && (
                <div className="p-3 bg-cyan-50/80 border border-cyan-200 rounded-xl space-y-1">
                  <div className="text-[11px] font-medium text-cyan-800">
                    Servicio seleccionado · Registro requerido
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {selectedServiceAd.title}
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono tabular-nums">
                    {selectedServiceAd.category} · {selectedServiceAd.priceLabel}
                  </div>
                </div>
              )}

              <p className="text-slate-600 leading-relaxed text-[11px]">
                Cree su cuenta de paciente con correo electrónico y contraseña para reservar turnos online y descargar recetas o estudios.
              </p>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={regForm.name}
                  onChange={e => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">DNI / Documento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Sin puntos"
                    value={regForm.dni}
                    onChange={e => setRegForm(prev => ({ ...prev, dni: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Teléfono Móvil *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+54 11 ..."
                    value={regForm.phone}
                    onChange={e => setRegForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nombre@correo.com"
                  value={regForm.email}
                  onChange={e => setRegForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Contraseña *</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Mín. 6 caracteres"
                      value={regForm.password}
                      onChange={e => setRegForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-3 pr-8 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(prev => !prev)}
                      aria-label={showRegPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Confirmar Clave *</label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Repita la clave"
                    value={regForm.confirmPassword}
                    onChange={e => setRegForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Obra Social / Cobertura</label>
                <select
                  value={regForm.insuranceName}
                  onChange={e => setRegForm(prev => ({ ...prev, insuranceName: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                >
                  <option value="Particular / Privado">Particular / Privado</option>
                  {settings.insurances.map(ins => (
                    <option key={ins.id} value={ins.name}>
                      {ins.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Creando cuenta...' : 'Registrarme e Ingresar al Sistema'}</span>
              </button>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                  className="w-full py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>O registrarme con Google</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500">
          Protección de Datos Médicos Ley 25.326 · Conexión Cifrada SSL/TLS
        </div>
      </div>
    </div>
  );
};
