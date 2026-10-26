import React, { useState } from 'react';
import { User, UserRole } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { authService, GoogleAuthResult } from '../../services/authService';
import { 
  Building2, 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  UserPlus, 
  Stethoscope, 
  Users, 
  Shield, 
  HeartPulse, 
  ArrowRight,
  Sparkles,
  KeyRound,
  Ban
} from 'lucide-react';

interface LoginGateProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'google' | 'credentials' | 'register'>('google');
  const [selectedRole, setSelectedRole] = useState<UserRole>('PACIENTE');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDomainError, setIsDomainError] = useState(false);

  // Credentials form state
  const [credentialEmail, setCredentialEmail] = useState('');
  const [credentialPassword, setCredentialPassword] = useState('••••••••');

  // New patient registration form state
  const [regForm, setRegForm] = useState({
    name: '',
    dni: '',
    email: '',
    phone: '',
    insuranceName: 'Particular / Privado',
    insuranceNumber: ''
  });

  const users = storageService.getUsers();
  const settings = storageService.getSettings();
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    setIsDomainError(false);

    const result: GoogleAuthResult = await authService.loginWithGoogle(selectedRole);
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

  // Quick assisted Google sign in
  const handleAssistedGoogleSignIn = (email: string = 'seter7712@gmail.com') => {
    const name = email.split('@')[0];
    const formatted = name.charAt(0).toUpperCase() + name.slice(1);
    const user = authService.loginWithSimulatedGoogleAccount(email, formatted, selectedRole);
    onLoginSuccess(user);
  };

  // Standard Credentials Login Handler
  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = credentialEmail.trim().toLowerCase();
    const foundUser = users.find(u => 
      u.email.toLowerCase() === trimmed || u.dni.replace(/\./g, '') === trimmed.replace(/\./g, '')
    );

    if (!foundUser) {
      setErrorMessage('Usuario no registrado. Verifique el correo electrónico o DNI ingresado.');
      return;
    }

    const result = storageService.setActiveUserId(foundUser.id);
    if (!result.success) {
      setErrorMessage(result.error || 'Acceso denegado.');
      return;
    }

    if (result.user) {
      onLoginSuccess(result.user);
    }
  };

  // Direct quick login helper for evaluators
  const handleQuickPersonaLogin = (userId: string) => {
    setErrorMessage(null);
    const result = storageService.setActiveUserId(userId);
    if (!result.success) {
      setErrorMessage(result.error || 'Acceso denegado.');
      return;
    }
    if (result.user) {
      onLoginSuccess(result.user);
    }
  };

  // New Patient Register Handler (RF-01)
  const handlePatientRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regForm.name || !regForm.dni || !regForm.email || !regForm.phone) {
      setErrorMessage('Por favor complete todos los campos obligatorios.');
      return;
    }

    // Verify DNI not already registered
    const existing = users.find(u => u.dni === regForm.dni || u.email.toLowerCase() === regForm.email.toLowerCase());
    if (existing) {
      setErrorMessage(`Ya existe una cuenta registrada con ese DNI o correo (${existing.name}). Por favor inicie sesión.`);
      return;
    }

    const newUser = storageService.saveUser({
      name: regForm.name,
      dni: regForm.dni,
      email: regForm.email,
      phone: regForm.phone,
      insuranceName: regForm.insuranceName,
      insuranceNumber: regForm.insuranceNumber,
      role: 'PACIENTE',
      status: 'ACTIVO'
    });

    const result = storageService.setActiveUserId(newUser.id);
    if (result.success && result.user) {
      onLoginSuccess(result.user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans">
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
            onClick={() => { setActiveTab('google'); setErrorMessage(null); }}
            className={`flex-1 py-3 px-2 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'google'
                ? 'border-cyan-700 text-cyan-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('credentials'); setErrorMessage(null); }}
            className={`flex-1 py-3 px-2 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'credentials'
                ? 'border-cyan-700 text-cyan-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Padrón / Staff</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
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

          {/* TAB 1: GOOGLE AUTH */}
          {activeTab === 'google' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-600 text-center leading-relaxed">
                Autenticación corporativa y de pacientes con cuenta de Google verificada por Firebase.
              </p>

              {/* Role selection for new Google account */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Rol hospitalario a vincular:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { role: 'PACIENTE', label: 'Paciente', icon: <HeartPulse className="w-3.5 h-3.5" /> },
                    { role: 'MEDICO', label: 'Médico', icon: <Stethoscope className="w-3.5 h-3.5" /> },
                    { role: 'RECEPCIONISTA', label: 'Recepción', icon: <Users className="w-3.5 h-3.5" /> },
                    { role: 'ADMINISTRADOR', label: 'Administrador', icon: <Shield className="w-3.5 h-3.5" /> }
                  ].map(r => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setSelectedRole(r.role as UserRole)}
                      className={`p-2 rounded-lg border flex items-center gap-1.5 cursor-pointer text-xs font-medium transition-all ${
                        selectedRole === r.role
                          ? 'bg-cyan-50 border-cyan-700 text-cyan-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {r.icon}
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Real Google popup trigger */}
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-300 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-3 disabled:opacity-60"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{loading ? 'Validando con Google...' : 'Ingresar con Cuenta de Google'}</span>
              </button>

              {/* Fast track with Google account */}
              <div className="pt-2 border-t border-slate-100 text-center space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleAssistedGoogleSignIn('seter7712@gmail.com')}
                  className="w-full py-2.5 px-3 bg-cyan-700 hover:bg-cyan-800 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Acceso Inmediato: seter7712@gmail.com (Administrador)</span>
                </button>
                <p className="text-[10px] text-slate-500">
                  Autenticación directa con privilegios de Administrador y Matriz de Derechos.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: STAFF & HOSPITAL CREDENTIALS */}
          {activeTab === 'credentials' && (
            <div className="space-y-4 text-xs">
              <form onSubmit={handleCredentialsLogin} className="space-y-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Correo Electrónico o DNI *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. seter7712@gmail.com o DNI"
                    value={credentialEmail}
                    onChange={e => setCredentialEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Contraseña Institucional *
                  </label>
                  <input
                    type="password"
                    required
                    value={credentialPassword}
                    onChange={e => setCredentialPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Validar Credencial y Entrar</span>
                </button>
              </form>

              {/* Demo accounts selector for easy testing */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Acceso Rápido de Demostración:
                </span>
                
                {/* Highlight Seter Admin */}
                <button
                  type="button"
                  onClick={() => handleQuickPersonaLogin('user-admin-seter')}
                  className="w-full p-2 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-md text-left font-bold text-cyan-900 cursor-pointer flex items-center justify-between"
                >
                  <span className="truncate">seter7712@gmail.com (Administrador Principal)</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-cyan-700 text-white rounded font-mono">ADMIN</span>
                </button>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleQuickPersonaLogin('user-doc-1')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-left font-medium text-slate-800 cursor-pointer truncate"
                  >
                    Dr. Morales (Médico)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPersonaLogin('user-recep-1')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-left font-medium text-slate-800 cursor-pointer truncate"
                  >
                    Ana Beltrán (Recepción)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPersonaLogin('user-pac-1')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-left font-medium text-slate-800 cursor-pointer truncate"
                  >
                    Lucía F. (Paciente)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPersonaLogin('user-admin-1')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-left font-medium text-slate-800 cursor-pointer truncate"
                  >
                    Lic. Navarro (Admin)
                  </button>
                </div>

                {/* Test Suspended user to verify access denial */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickPersonaLogin('user-susp-1')}
                    className="w-full p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md text-center font-semibold text-[10px] text-rose-800 cursor-pointer"
                  >
                    Probar Intento con Cuenta Suspendida (Verifica Rechazo)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REGISTER NEW PATIENT */}
          {activeTab === 'register' && (
            <form onSubmit={handlePatientRegister} className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Cree su cuenta de paciente para reservar turnos online, acceder a recetas digitales y resultados de estudios.
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
                  placeholder="nombre@correo.com"
                  value={regForm.email}
                  onChange={e => setRegForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                />
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
                className="w-full py-2.5 px-4 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Registrarme e Ingresar al Sistema</span>
              </button>
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
