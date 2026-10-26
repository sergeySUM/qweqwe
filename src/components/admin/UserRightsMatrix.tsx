import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { 
  KeyRound, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  ShieldAlert, 
  UserX, 
  UserCheck, 
  Stethoscope, 
  Users, 
  Shield, 
  HeartPulse, 
  AlertCircle,
  FileCheck2,
  Calendar,
  Receipt,
  ClipboardList,
  Sparkles,
  Info
} from 'lucide-react';

interface UserRightsMatrixProps {
  currentUser: User;
}

interface RolePermissions {
  readRecords: boolean;
  writeEvolution: boolean;
  emitPrescriptions: boolean;
  globalAgenda: boolean;
  admissionCheckIn: boolean;
  cashRegister: boolean;
  manageUsers: boolean;
  auditLogs: boolean;
  clinicSettings: boolean;
}

const ROLE_PERMISSIONS_MAP: Record<UserRole, RolePermissions> = {
  ADMINISTRADOR: {
    readRecords: true,
    writeEvolution: true,
    emitPrescriptions: true,
    globalAgenda: true,
    admissionCheckIn: true,
    cashRegister: true,
    manageUsers: true,
    auditLogs: true,
    clinicSettings: true
  },
  MEDICO: {
    readRecords: true,
    writeEvolution: true,
    emitPrescriptions: true,
    globalAgenda: true,
    admissionCheckIn: false,
    cashRegister: false,
    manageUsers: false,
    auditLogs: false,
    clinicSettings: false
  },
  RECEPCIONISTA: {
    readRecords: false,
    writeEvolution: false,
    emitPrescriptions: false,
    globalAgenda: true,
    admissionCheckIn: true,
    cashRegister: true,
    manageUsers: false,
    auditLogs: false,
    clinicSettings: false
  },
  PACIENTE: {
    readRecords: false, // Solo su propia ficha personal
    writeEvolution: false,
    emitPrescriptions: false,
    globalAgenda: false,
    admissionCheckIn: false,
    cashRegister: false,
    manageUsers: false,
    auditLogs: false,
    clinicSettings: false
  }
};

export const UserRightsMatrix: React.FC<UserRightsMatrixProps> = ({ currentUser }) => {
  const users = storageService.getUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [statusNotice, setStatusNotice] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (statusFilter && u.status !== statusFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchName = u.name.toLowerCase().includes(term);
        const matchEmail = u.email.toLowerCase().includes(term);
        const matchDni = u.dni.toLowerCase().includes(term);
        if (!matchName && !matchEmail && !matchDni) return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, searchTerm]);

  // Handle Role Change by Admin
  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    if (targetUser.email === 'seter7712@gmail.com' && newRole !== 'ADMINISTRADOR') {
      setStatusNotice({
        message: 'La cuenta raíz de seter7712@gmail.com debe mantener privilegios de Administrador del Sistema.',
        type: 'info'
      });
      setTimeout(() => setStatusNotice(null), 5000);
      return;
    }

    const updated = storageService.updateUserRole(
      userId, 
      newRole, 
      `Modificado desde Matriz de Permisos por ${currentUser.name} (${currentUser.email})`
    );

    if (updated) {
      setStatusNotice({
        message: `Derechos actualizados: ${updated.name} ahora tiene rol de [${newRole}] con permisos correspondientes.`,
        type: 'success'
      });
      setTimeout(() => setStatusNotice(null), 4000);
    }
  };

  // Handle Account Suspension / Activation
  const handleToggleStatus = (userId: string) => {
    const updated = storageService.toggleUserStatus(userId);
    if (updated) {
      setStatusNotice({
        message: `Estado de acceso de ${updated.name} cambiado a [${updated.status}].`,
        type: updated.status === 'ACTIVO' ? 'success' : 'info'
      });
      setTimeout(() => setStatusNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
            <span>ADMINISTRACIÓN CENTRAL</span>
            <span>·</span>
            <span className="uppercase">Control de Derechos y Permisos de Usuarios</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Matriz de Derechos de Acceso y Gestión de Permisos
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Vista exclusiva para el Administrador <b>{currentUser.email}</b>. Modifique roles, asigne facultades operativas y active o revoque accesos al sistema hospitalario.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-lg text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            <span>Facultad de Super Administrador</span>
          </span>
        </div>
      </div>

      {/* Real-time Notice */}
      {statusNotice && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs transition-all ${
          statusNotice.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{statusNotice.message}</span>
          </div>
          <button
            onClick={() => setStatusNotice(null)}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Role Privileges Legend / Explanatory Bar */}
      <div className="bg-slate-900 text-slate-200 p-4 rounded-xl shadow-xs text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-cyan-400" />
            <span>Niveles de Derechos y Facultades por Rol</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Los cambios se aplican en tiempo real y quedan registrados en auditoría (RF-12)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-[11px]">
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
            <div className="font-bold text-purple-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>ADMINISTRADOR</span>
            </div>
            <p className="text-slate-300">
              Control total: ABM de usuarios, cambio de derechos, configuración, auditoría completa y acceso a todos los módulos.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
            <div className="font-bold text-cyan-400 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>MÉDICO</span>
            </div>
            <p className="text-slate-300">
              Ficha clínica completa, firma de evoluciones, CIE-10, emisión de recetas y órdenes, y configuración de horarios.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
            <div className="font-bold text-blue-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>RECEPCIONISTA</span>
            </div>
            <p className="text-slate-300">
              Agenda global, asignación de turnos, admisión presencial, validación de cobertura médica y control de caja.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
            <div className="font-bold text-emerald-400 flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>PACIENTE</span>
            </div>
            <p className="text-slate-300">
              Reserva de turnos online, actualización de datos de contacto y facturación, y descarga de recetas/estudios personales.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-medium text-slate-700 mb-1">Filtrar por Rol Actual</label>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
          >
            <option value="">Todos los roles ({users.length})</option>
            <option value="ADMINISTRADOR">Administradores</option>
            <option value="MEDICO">Médicos</option>
            <option value="RECEPCIONISTA">Recepcionistas</option>
            <option value="PACIENTE">Pacientes</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Estado de Habilitación</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Habilitados / Activos</option>
            <option value="SUSPENDIDO">Suspendidos / Bloqueados</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Buscar Usuario</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, correo o DNI..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Master Permissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
        <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">
              Padrón de Usuarios y Matriz de Derechos ({filteredUsers.length} usuarios)
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-[11px] text-slate-500">
              Seleccione el menú desplegable en cada fila para cambiar derechos instantáneamente
            </span>
          </div>

          <span className="text-[11px] font-mono text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200 font-semibold">
            Admin Activo: {currentUser.email}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-4">Usuario Registrado</th>
                <th className="py-3 px-4">Cambiar Rol / Derechos</th>
                <th className="py-3 px-4">Facultades Asignadas en el Sistema</th>
                <th className="py-3 px-4 text-center">Estado Acceso</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const perms = ROLE_PERMISSIONS_MAP[user.role];
                const isCurrentLoggedIn = user.id === currentUser.id;
                const isSuspended = user.status === 'SUSPENDIDO';

                return (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSuspended ? 'bg-rose-50/30' : isCurrentLoggedIn ? 'bg-cyan-50/30' : ''
                    }`}
                  >
                    {/* User Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-300"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            user.role === 'ADMINISTRADOR' ? 'bg-purple-700 text-white' :
                            user.role === 'MEDICO' ? 'bg-cyan-700 text-white' :
                            user.role === 'RECEPCIONISTA' ? 'bg-blue-700 text-white' :
                            'bg-emerald-700 text-white'
                          }`}>
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{user.name}</span>
                            {isCurrentLoggedIn && (
                              <span className="text-[9px] font-bold bg-cyan-700 text-white px-1.5 py-0.2 rounded">
                                USTED
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono block">
                            {user.email} · DNI: {user.dni}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Interactive Role Switcher */}
                    <td className="py-3.5 px-4">
                      <select
                        aria-label={`Cambiar rol de ${user.name}`}
                        value={user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer focus:ring-2 focus:ring-cyan-600 focus:outline-hidden ${
                          user.role === 'ADMINISTRADOR' ? 'bg-purple-50 border-purple-300 text-purple-900' :
                          user.role === 'MEDICO' ? 'bg-cyan-50 border-cyan-300 text-cyan-900' :
                          user.role === 'RECEPCIONISTA' ? 'bg-blue-50 border-blue-300 text-blue-900' :
                          'bg-emerald-50 border-emerald-300 text-emerald-900'
                        }`}
                      >
                        <option value="ADMINISTRADOR">🛡️ Administrador (Total)</option>
                        <option value="MEDICO">🩺 Médico Especialista</option>
                        <option value="RECEPCIONISTA">🏢 Recepcionista</option>
                        <option value="PACIENTE">👤 Paciente</option>
                      </select>
                    </td>

                    {/* Rights Chips Matrix */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {perms.manageUsers && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">
                            ABM Usuarios
                          </span>
                        )}
                        {perms.auditLogs && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">
                            Auditoría Legal
                          </span>
                        )}
                        {perms.readRecords && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-100 text-cyan-800">
                            Lectura HCE
                          </span>
                        )}
                        {perms.writeEvolution && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-100 text-cyan-800">
                            Notas Clínicas
                          </span>
                        )}
                        {perms.emitPrescriptions && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-100 text-cyan-800">
                            Recetas QR
                          </span>
                        )}
                        {perms.globalAgenda && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                            Agenda Médica
                          </span>
                        )}
                        {perms.admissionCheckIn && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                            Admisión/Triage
                          </span>
                        )}
                        {perms.cashRegister && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                            Caja/Cobros
                          </span>
                        )}
                        {user.role === 'PACIENTE' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            Portal Autogestión Paciente
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.status === 'ACTIVO' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {user.status === 'ACTIVO' ? 'Habilitado' : 'Suspendido'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(user.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                          user.status === 'ACTIVO'
                            ? 'text-rose-700 hover:bg-rose-50 border border-rose-200'
                            : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                        }`}
                        title={user.status === 'ACTIVO' ? 'Suspender acceso a la cuenta' : 'Reactivar acceso a la cuenta'}
                      >
                        {user.status === 'ACTIVO' ? (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Suspender</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Habilitar</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
