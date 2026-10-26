import React from 'react';
import { User, UserRole } from '../../types/hospital';
import {
  UserCircle2,
  CalendarDays,
  FileText,
  CalendarRange,
  UserPlus,
  Receipt,
  ClipboardList,
  Activity,
  Pill,
  Clock,
  ShieldAlert,
  Sliders,
  Users2,
  KeyRound
} from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  rfCode: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeTab, onSelectTab }) => {
  const getNavItems = (role: UserRole): NavItem[] => {
    switch (role) {
      case 'PACIENTE':
        return [
          { id: 'rf01', label: 'Mi Perfil y Facturación', rfCode: 'RF-01', icon: <UserCircle2 className="w-4 h-4" /> },
          { id: 'rf02', label: 'Reserva de Turnos', rfCode: 'RF-02', icon: <CalendarDays className="w-4 h-4" /> },
          { id: 'rf03', label: 'Historial, Recetas y Órdenes', rfCode: 'RF-03', icon: <FileText className="w-4 h-4" /> }
        ];
      case 'RECEPCIONISTA':
        return [
          { id: 'rf04', label: 'Agenda Global de Médicos', rfCode: 'RF-04', icon: <CalendarRange className="w-4 h-4" /> },
          { id: 'rf05', label: 'Admisión y Sala de Espera', rfCode: 'RF-05', icon: <UserPlus className="w-4 h-4" /> },
          { id: 'rf06', label: 'Control de Caja y Pagos', rfCode: 'RF-06', icon: <Receipt className="w-4 h-4" /> }
        ];
      case 'MEDICO':
        return [
          { id: 'rf07', label: 'Ficha Clínica de Pacientes', rfCode: 'RF-07', icon: <ClipboardList className="w-4 h-4" /> },
          { id: 'rf08', label: 'Registro de Evolución', rfCode: 'RF-08', icon: <Activity className="w-4 h-4" /> },
          { id: 'rf09', label: 'Emisión de Recetas y Órdenes', rfCode: 'RF-09', icon: <Pill className="w-4 h-4" /> },
          { id: 'rf10', label: 'Mi Horario y Disponibilidad', rfCode: 'RF-10', icon: <Clock className="w-4 h-4" /> }
        ];
      case 'ADMINISTRADOR':
        return [
          { id: 'rf11', label: 'ABM de Usuarios y Cuentas', rfCode: 'RF-11', icon: <Users2 className="w-4 h-4" /> },
          { id: 'rf11_rights', label: 'Matriz de Derechos y Permisos', rfCode: 'RF-11B', icon: <KeyRound className="w-4 h-4" /> },
          { id: 'rf12', label: 'Auditoría de Accesos (Logs)', rfCode: 'RF-12', icon: <ShieldAlert className="w-4 h-4" /> },
          { id: 'rf13', label: 'Configuración y Tarifas', rfCode: 'RF-13', icon: <Sliders className="w-4 h-4" /> }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems(currentUser.role);

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Role banner */}
      <div className="p-4 border-b border-slate-800">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Panel de Trabajo
        </div>
        <div className="font-medium text-slate-100 mt-1 flex items-center justify-between text-sm">
          <span className="truncate">{currentUser.name}</span>
        </div>
        <div className="text-xs text-cyan-400 font-mono mt-0.5">
          {currentUser.specialtyName || currentUser.role}
        </div>
      </div>

      {/* Navigation list */}
      <nav className="p-3 space-y-1 flex-1">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-cyan-700 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isActive ? 'bg-cyan-800 text-cyan-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {item.rfCode}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer institutional summary */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span>Servidor HCE</span>
          <span className="text-emerald-400 font-mono">Conectado</span>
        </div>
        <div className="flex justify-between">
          <span>Seguridad HCE</span>
          <span className="font-mono">Auditada v1.4</span>
        </div>
        <div className="text-[10px] text-slate-500 pt-1">
          Sanatorio MediCore © 2026
        </div>
      </div>
    </aside>
  );
};
