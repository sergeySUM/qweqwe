import React from 'react';
import { User, UserRole } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { 
  Building2, 
  UserCheck, 
  RotateCcw, 
  ChevronDown,
  Stethoscope,
  Users,
  Shield,
  HeartPulse
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSelectRole: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onSelectRole }) => {
  const users = storageService.getUsers();

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    PACIENTE: { label: 'Paciente', icon: <HeartPulse className="w-3.5 h-3.5" />, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    RECEPCIONISTA: { label: 'Recepcionista', icon: <Users className="w-3.5 h-3.5" />, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    MEDICO: { label: 'Médico', icon: <Stethoscope className="w-3.5 h-3.5" />, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
    ADMINISTRADOR: { label: 'Administrador', icon: <Shield className="w-3.5 h-3.5" />, color: 'text-purple-700 bg-purple-50 border-purple-200' }
  };

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    storageService.setActiveUserId(selectedId);
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

          {/* Zone 2: Role Switcher Segmented Control */}
          <div className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {(['PACIENTE', 'RECEPCIONISTA', 'MEDICO', 'ADMINISTRADOR'] as UserRole[]).map(role => {
              const isActive = currentUser.role === role;
              return (
                <button
                  key={role}
                  onClick={() => onSelectRole(role)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {roleLabels[role].icon}
                  <span>{roleLabels[role].label}</span>
                </button>
              );
            })}
          </div>

          {/* Zone 3: Active User Selector & Actions */}
          <div className="flex items-center gap-3">
            {/* Quick user dropdown within role or cross-user */}
            <div className="relative flex items-center">
              <select
                aria-label="Seleccionar usuario activo"
                value={currentUser.id}
                onChange={handleUserSelect}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 pl-3 pr-8 py-1.5 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
              >
                <optgroup label="Médicos">
                  {users.filter(u => u.role === 'MEDICO').map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.specialtyName || 'Médico'})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Recepcionistas">
                  {users.filter(u => u.role === 'RECEPCIONISTA').map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} (Recepción)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Pacientes">
                  {users.filter(u => u.role === 'PACIENTE').map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} (DNI: {u.dni})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Administradores">
                  {users.filter(u => u.role === 'ADMINISTRADOR').map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} (Admin)
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
            </div>

            {/* Role indicator tag */}
            <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border ${roleLabels[currentUser.role].color}`}>
              <UserCheck className="w-3.5 h-3.5" />
              <span>{roleLabels[currentUser.role].label}</span>
            </span>

            {/* Reset data helper */}
            <button
              onClick={() => {
                if (window.confirm('¿Desea restaurar los datos iniciales de prueba?')) {
                  storageService.resetToFactoryMockData();
                }
              }}
              title="Restaurar datos de prueba iniciales"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
