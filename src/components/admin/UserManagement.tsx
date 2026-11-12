import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { hashPassword } from '../../services/authService';
import { 
  Search, 
  Plus, 
  Edit, 
  UserX, 
  UserCheck, 
  Shield, 
  Stethoscope, 
  HeartPulse, 
  Building2,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  AlertTriangle
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

  // Modal & Password Visibility State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAllPasswords, setShowAllPasswords] = useState(true);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    password?: string;
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
    billingCuit: '',
    password: ''
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
      billingCuit: '',
      password: ''
    });
    setShowModalPassword(false);
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
      billingCuit: user.billingCuit || '',
      password: user.plainPassword || ''
    });
    setShowModalPassword(false);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (userId: string) => {
    storageService.toggleUserStatus(userId);
  };

  const toggleRowPassword = (userId: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleCopyPassword = async (userId: string, password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedUserId(userId);
      setTimeout(() => setCopiedUserId(prev => (prev === userId ? null : prev)), 2000);
    } catch {
      // Clipboard API fallback ignored
    }
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    const result = storageService.deleteUser(userToDelete.id);
    if (result.success) {
      setUserToDelete(null);
      setDeleteError(null);
    } else {
      setDeleteError(result.error || 'No se pudo eliminar el usuario.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let specialtyName = undefined;
    if (formData.role === 'MEDICO' && formData.specialtyId) {
      const match = specialties.find(s => s.id === formData.specialtyId);
      if (match) specialtyName = match.name;
    }

    const trimmedPassword = formData.password?.trim();
    const passwordHash = trimmedPassword ? await hashPassword(trimmedPassword) : undefined;

    storageService.saveUser({
      ...(editingUser ? { id: editingUser.id } : {}),
      name: formData.name,
      email: formData.email,
      dni: formData.dni,
      phone: formData.phone,
      role: formData.role,
      status: formData.status,
      ...(passwordHash ? { passwordHash, plainPassword: trimmedPassword, authProvider: 'local' as const } : {}),
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
              <span>Matriz de Derechos</span>
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
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-2">
          <span className="font-semibold text-slate-800">
            Padrón de Usuarios del Sistema ({filteredUsers.length} registros)
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAllPasswords(prev => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              {showAllPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showAllPasswords ? 'Ocultar Contraseñas' : 'Ver Todas las Contraseñas'}</span>
            </button>
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              Control de Acceso Basado en Roles (RBAC)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 uppercase text-[10px] font-semibold">
                <th className="py-3 px-4">Usuario / Nombre</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4">DNI / Contacto</th>
                <th className="py-3 px-4">Contraseña</th>
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

                    <td className="py-3 px-4">
                      {user.plainPassword ? (
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                          <span className="font-mono text-[11px] text-slate-900 select-all">
                            {showAllPasswords || revealedPasswords[user.id] ? user.plainPassword : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleRowPassword(user.id)}
                            title={showAllPasswords || revealedPasswords[user.id] ? 'Ocultar' : 'Mostrar'}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                          >
                            {showAllPasswords || revealedPasswords[user.id] ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(user.id, user.plainPassword!)}
                            title="Copiar contraseña"
                            className="text-slate-400 hover:text-cyan-700 cursor-pointer p-0.5"
                          >
                            {copiedUserId === user.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(user)}
                          className="text-[11px] text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded font-medium cursor-pointer"
                        >
                          Google / Asignar clave
                        </button>
                      )}
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
                      <div className="flex items-center justify-end gap-1.5">
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
                        {user.email.toLowerCase() !== 'seter7712@gmail.com' && (
                          <button
                            onClick={() => { setDeleteError(null); setUserToDelete(user); }}
                            className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Eliminar Usuario de la Base de Datos"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {editingUser ? 'Contraseña de Acceso (ver o modificar)' : 'Contraseña de Acceso (Opcional)'}
                </label>
                <div className="relative">
                  <input
                    type={showModalPassword ? 'text' : 'password'}
                    minLength={6}
                    placeholder={editingUser ? 'Sin contraseña asignada' : 'Mín. 6 caracteres para ingreso con correo'}
                    value={formData.password || ''}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-3 pr-9 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(prev => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showModalPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
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

      {/* DELETE USER CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm">
                  Eliminar Usuario de la Base de Datos
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  ¿Confirma que desea eliminar definitivamente a <b>{userToDelete.name}</b> ({userToDelete.email})? También se quitarán sus turnos, agenda y registros asociados.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg font-medium">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setUserToDelete(null); setDeleteError(null); }}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 cursor-pointer"
              >
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
