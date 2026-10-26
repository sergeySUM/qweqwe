import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { 
  Users2, 
  Search, 
  Plus, 
  Edit, 
  UserX, 
  UserCheck, 
  Shield, 
  Stethoscope, 
  HeartPulse, 
  Building2,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

interface UserManagementProps {
  onNavigateToRightsMatrix?: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onNavigateToRightsMatrix }) => {
  const users = storageService.getUsers();
  const specialties = storageService.getSpecialties();

  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    dni: string;
    phone: string;
    role: UserRole;
    status: 'ACTIVO' | 'SUSPENDIDO';
    specialtyId?: string;
    medicalLicense?: string;
    consultationFee?: number;
    insuranceName?: string;
    billingCuit?: string;
  }>({
    name: '',
    email: '',
    dni: '',
    phone: '',
    role: 'MEDICO',
    status: 'ACTIVO',
    specialtyId: specialties[0]?.id || '',
    medicalLicense: 'MN 100.000',
    consultationFee: 25000,
    insuranceName: 'OSDE 310',
    billingCuit: ''
  });

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (statusFilter && u.status !== statusFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const match = u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.dni.includes(term);
        if (!match) return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, searchTerm]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      dni: '',
      phone: '',
      role: 'MEDICO',
      status: 'ACTIVO',
      specialtyId: specialties[0]?.id || '',
      medicalLicense: 'MN 150.000',
      consultationFee: 25000,
      insuranceName: '',
      billingCuit: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      dni: user.dni,
      phone: user.phone,
      role: user.role,
      status: user.status,
      specialtyId: user.specialtyId || specialties[0]?.id || '',
      medicalLicense: user.medicalLicense || '',
      consultationFee: user.consultationFee || 20000,
      insuranceName: user.insuranceName || '',
      billingCuit: user.billingCuit || ''
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = (userId: string) => {
    storageService.toggleUserStatus(userId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let specialtyName = undefined;
    if (formData.role === 'MEDICO' && formData.specialtyId) {
      const match = specialties.find(s => s.id === formData.specialtyId);
      if (match) specialtyName = match.name;
    }

    storageService.saveUser({
      ...(editingUser ? { id: editingUser.id } : {}),
      name: formData.name,
      email: formData.email,
      dni: formData.dni,
      phone: formData.phone,
      role: formData.role,
      status: formData.status,
      specialtyId: formData.role === 'MEDICO' ? formData.specialtyId : undefined,
      specialtyName: formData.role === 'MEDICO' ? specialtyName : undefined,
      medicalLicense: formData.role === 'MEDICO' ? formData.medicalLicense : undefined,
      consultationFee: formData.role === 'MEDICO' ? Number(formData.consultationFee) : undefined,
      insuranceName: formData.role === 'PACIENTE' ? formData.insuranceName : undefined,
      billingCuit: formData.billingCuit
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
            <span>RF-11</span>
            <span>·</span>
            <span className="uppercase">ABM y Control de Cuentas de Usuarios</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Gestión Integral de Usuarios, Roles y Permisos Hospitalarios
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Alta, baja lógica, modificación de roles (Paciente, Recepcionista, Médico, Administrador) y asignación de credenciales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToRightsMatrix && (
            <button
              onClick={onNavigateToRightsMatrix}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <KeyRound className="w-4 h-4 text-cyan-200" />
              <span>Matriz de Derechos (RF-11B)</span>
            </button>
          )}
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-medium text-slate-700 mb-1">Filtrar por Rol</label>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
          >
            <option value="">Todos los roles...</option>
            <option value="PACIENTE">Pacientes</option>
            <option value="RECEPCIONISTA">Recepcionistas</option>
            <option value="MEDICO">Médicos Especialistas</option>
            <option value="ADMINISTRADOR">Administradores</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Estado de Cuenta</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
          >
            <option value="">Todos los estados...</option>
            <option value="ACTIVO">Activo</option>
            <option value="SUSPENDIDO">Suspendido</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Búsqueda rápida</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, email o DNI..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <span className="font-semibold text-slate-800">
            Padrón de Usuarios del Sistema ({filteredUsers.length} registros)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Control de Acceso Basado en Roles (RBAC)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 uppercase text-[10px] font-semibold">
                <th className="py-3 px-4">Usuario / Nombre</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4">DNI / Contacto</th>
                <th className="py-3 px-4">Detalle Específico</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const isSuspended = user.status === 'SUSPENDIDO';
                return (
                  <tr key={user.id} className={`hover:bg-slate-50/80 transition-colors ${isSuspended ? 'opacity-60 bg-slate-50' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        user.role === 'ADMINISTRADOR' ? 'bg-purple-100 text-purple-900' :
                        user.role === 'MEDICO' ? 'bg-cyan-100 text-cyan-900' :
                        user.role === 'RECEPCIONISTA' ? 'bg-blue-100 text-blue-900' :
                        'bg-emerald-100 text-emerald-900'
                      }`}>
                        {user.role === 'ADMINISTRADOR' && <Shield className="w-3 h-3" />}
                        {user.role === 'MEDICO' && <Stethoscope className="w-3 h-3" />}
                        {user.role === 'PACIENTE' && <HeartPulse className="w-3 h-3" />}
                        {user.role === 'RECEPCIONISTA' && <Building2 className="w-3 h-3" />}
                        <span>{user.role}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>DNI: <span className="font-mono">{user.dni}</span></div>
                      <div className="text-[11px] text-slate-400">{user.phone}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {user.role === 'MEDICO' && (
                        <div>
                          <span className="font-medium text-slate-900">{user.specialtyName}</span>
                          <span className="text-[11px] text-slate-500 block">{user.medicalLicense}</span>
                        </div>
                      )}
                      {user.role === 'PACIENTE' && (
                        <div>
                          <span>{user.insuranceName || 'Particular'}</span>
                          {user.insuranceNumber && <span className="text-[11px] text-slate-400 block font-mono">{user.insuranceNumber}</span>}
                        </div>
                      )}
                      {(user.role === 'RECEPCIONISTA' || user.role === 'ADMINISTRADOR') && (
                        <span className="text-slate-400 italic">Personal Sanatorial Central</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.status === 'ACTIVO' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-slate-600 hover:text-cyan-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Editar Usuario"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`p-1.5 rounded transition-colors cursor-pointer ${
                            user.status === 'ACTIVO' 
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' 
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={user.status === 'ACTIVO' ? 'Suspender Cuenta' : 'Activar Cuenta'}
                        >
                          {user.status === 'ACTIVO' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingUser ? `Editar Usuario: ${editingUser.name}` : 'Crear Nuevo Usuario en Sistema'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">DNI / Documento *</label>
                  <input
                    type="text"
                    required
                    value={formData.dni}
                    onChange={e => setFormData(prev => ({ ...prev, dni: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Teléfono Móvil *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Rol en el Sistema *</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white font-semibold"
                  >
                    <option value="PACIENTE">Paciente</option>
                    <option value="RECEPCIONISTA">Recepcionista</option>
                    <option value="MEDICO">Médico Especialista</option>
                    <option value="ADMINISTRADOR">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Estado Inicial</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="SUSPENDIDO">Suspendido</option>
                  </select>
                </div>
              </div>

              {/* Conditional fields for MEDICO */}
              {formData.role === 'MEDICO' && (
                <div className="p-3 bg-cyan-50/60 rounded-lg border border-cyan-200 space-y-3">
                  <span className="font-semibold text-cyan-900 block">Atributos del Profesional Médico:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Especialidad</label>
                      <select
                        value={formData.specialtyId}
                        onChange={e => setFormData(prev => ({ ...prev, specialtyId: e.target.value }))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                      >
                        {specialties.map(esp => (
                          <option key={esp.id} value={esp.id}>{esp.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Matrícula (MN / MP)</label>
                      <input
                        type="text"
                        value={formData.medicalLicense}
                        onChange={e => setFormData(prev => ({ ...prev, medicalLicense: e.target.value }))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional fields for PACIENTE */}
              {formData.role === 'PACIENTE' && (
                <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 space-y-3">
                  <span className="font-semibold text-emerald-900 block">Datos de Cobertura y Facturación:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Obra Social / Prepaga</label>
                      <input
                        type="text"
                        value={formData.insuranceName}
                        onChange={e => setFormData(prev => ({ ...prev, insuranceName: e.target.value }))}
                        placeholder="Ej. OSDE 310"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">CUIT / CUIL</label>
                      <input
                        type="text"
                        value={formData.billingCuit}
                        onChange={e => setFormData(prev => ({ ...prev, billingCuit: e.target.value }))}
                        placeholder="20-xxxxxxxx-x"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  {editingUser ? 'Guardar Cambios' : 'Dar de Alta Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
