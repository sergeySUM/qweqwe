import React from 'react';
import { User, UserRole } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { authService } from '../../services/authService';
import { 
  Building2, 
  UserCheck, 
  Stethoscope,
  Users,
  Shield,
  HeartPulse,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSelectRole?: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser }) => {

  const handleLogout = async () => {
    await authService.logout();
    storageService.logout();
  };

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    PACIENTE: { label: 'Paciente', icon: <HeartPulse className="w-3.5 h-3.5" />, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    RECEPCIONISTA: { label: 'Recepcionista', icon: <Users className="w-3.5 h-3.5" />, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    MEDICO: { label: 'Médico', icon: <Stethoscope className="w-3.5 h-3.5" />, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
    ADMINISTRADOR: { label: 'Administrador', icon: <Shield className="w-3.5 h-3.5" />, color: 'text-purple-700 bg-purple-50 border-purple-200' }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark with logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-700 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 leading-tight">
                MediCore Hospitalario
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Gestión Clínica Integral
              </span>
            </div>
          </div>

          {/* Zone 3: Active User Profile & Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-slate-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-cyan-700 text-white flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                {currentUser.name}
              </span>
            </div>

            {/* Role indicator tag */}
            <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border ${roleLabels[currentUser.role].color}`}>
              <UserCheck className="w-3.5 h-3.5" />
              <span>{roleLabels[currentUser.role].label}</span>
            </span>

            {/* Logout button (Salida del sistema seguro) */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 border border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Cerrar Sesión y bloquear acceso"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

