import React, { useState, useMemo } from 'react';
import { User, Appointment, AppointmentStatus } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { 
  CalendarRange, 
  Search, 
  Plus, 
  Ban, 
  Calendar, 
  Clock, 
  UserCheck, 
  AlertCircle,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2
} from 'lucide-react';

interface GlobalAgendaProps {
  currentUser: User;
}

export const GlobalAgenda: React.FC<GlobalAgendaProps> = ({ currentUser }) => {
  const doctors = storageService.getDoctors();
  const specialties = storageService.getSpecialties();
  const patients = storageService.getPatients();
  const appointments = storageService.getAppointments();

  const [filterDoctorId, setFilterDoctorId] = useState<string>('');
  const [filterSpecialtyId, setFilterSpecialtyId] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState<boolean>(false);
  const [isBlockSlotModalOpen, setIsBlockSlotModalOpen] = useState<boolean>(false);
  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null);

  // New appointment form state
  const [newAptData, setNewAptData] = useState({
    patientId: '',
    doctorId: '',
    date: filterDate,
    time: '09:00',
    reason: '',
    copayAmount: 3500
  });

  // Block slot form state
  const [blockData, setBlockData] = useState({
    doctorId: doctors[0]?.id || '',
    date: filterDate,
    time: '12:00',
    durationMinutes: 60,
    reason: 'Quirófano programado / Cirugía de guardia'
  });

  // Reschedule state
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: ''
  });

  // Filtered appointment list
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      if (filterDoctorId && apt.doctorId !== filterDoctorId) return false;
      if (filterSpecialtyId && apt.specialtyId !== filterSpecialtyId) return false;
      if (filterDate && apt.date !== filterDate) return false;
      if (filterStatus && apt.status !== filterStatus) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchPatient = apt.patientName.toLowerCase().includes(term) || apt.patientDni.includes(term);
        const matchDoctor = apt.doctorName.toLowerCase().includes(term);
        if (!matchPatient && !matchDoctor) return false;
      }
      return true;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, filterDoctorId, filterSpecialtyId, filterDate, filterStatus, searchTerm]);

  // Handle create appointment from reception
  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find(d => d.id === newAptData.doctorId);
    const pac = patients.find(p => p.id === newAptData.patientId);
    if (!doc || !pac) return;

    storageService.saveAppointment({
      patientId: pac.id,
      patientName: pac.name,
      patientDni: pac.dni,
      patientPhone: pac.phone,
      doctorId: doc.id,
      doctorName: doc.name,
      specialtyId: doc.specialtyId || 'esp-1',
      specialtyName: doc.specialtyName || 'Clínica',
      date: newAptData.date,
      time: newAptData.time,
      durationMinutes: 30,
      status: 'CONFIRMADO',
      reason: newAptData.reason || 'Consulta programada en recepción',
      insuranceName: pac.insuranceName || 'Particular',
      copayAmount: Number(newAptData.copayAmount) || 0,
      isPaid: false
    });

    setIsNewAppointmentModalOpen(false);
    setNewAptData({
      patientId: '',
      doctorId: '',
      date: filterDate,
      time: '09:00',
      reason: '',
      copayAmount: 3500
    });
  };

  // Handle block slot
  const handleBlockSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find(d => d.id === blockData.doctorId);
    if (!doc) return;

    storageService.saveAppointment({
      patientId: 'system-block',
      patientName: 'BLOQUEO DE AGENDA',
      patientDni: '00000000',
      patientPhone: '-',
      doctorId: doc.id,
      doctorName: doc.name,
      specialtyId: doc.specialtyId || '',
      specialtyName: doc.specialtyName || '',
      date: blockData.date,
      time: blockData.time,
      durationMinutes: Number(blockData.durationMinutes),
      status: 'BLOQUEADO',
      reason: blockData.reason,
      copayAmount: 0,
      isPaid: true
    });

    setIsBlockSlotModalOpen(false);
  };

  // Handle Reschedule
  const handleConfirmReschedule = () => {
    if (!reschedulingApt || !rescheduleData.date || !rescheduleData.time) return;

    storageService.saveAppointment({
      ...reschedulingApt,
      date: rescheduleData.date,
      time: rescheduleData.time,
      status: 'CONFIRMADO'
    });

    setReschedulingApt(null);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
            <span>RF-04</span>
            <span>·</span>
            <span className="uppercase">Agenda Global de Profesionales</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Gestión Centralizada de Turnos y Bloqueos de Agenda
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Consulte calendarios médicos, reprograme turnos, asigne citas directas y bloquee franjas horarias por quirófano o licencias.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBlockSlotModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-300 shadow-xs"
          >
            <Ban className="w-3.5 h-3.5 text-rose-600" />
            <span>Bloquear Horario</span>
          </button>

          <button
            onClick={() => setIsNewAppointmentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Turno en Recepción</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        {/* Date */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Fecha de Agenda</label>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden"
          />
        </div>

        {/* Doctor */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Médico</label>
          <select
            value={filterDoctorId}
            onChange={e => setFilterDoctorId(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden bg-white"
          >
            <option value="">Todos los médicos...</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.specialtyName})
              </option>
            ))}
          </select>
        </div>

        {/* Specialty */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Especialidad</label>
          <select
            value={filterSpecialtyId}
            onChange={e => setFilterSpecialtyId(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden bg-white"
          >
            <option value="">Todas las especialidades...</option>
            {specialties.map(esp => (
              <option key={esp.id} value={esp.id}>
                {esp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Estado</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden bg-white"
          >
            <option value="">Todos los estados...</option>
            <option value="RESERVADO">RESERVADO</option>
            <option value="CONFIRMADO">CONFIRMADO</option>
            <option value="EN_ESPERA">EN ESPERA (SALA)</option>
            <option value="EN_CONSULTA">EN CONSULTA</option>
            <option value="FINALIZADO">FINALIZADO</option>
            <option value="CANCELADO">CANCELADO</option>
            <option value="BLOQUEADO">BLOQUEADO</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Búsqueda rápida</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por paciente o DNI..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Appointment Master Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">
            Agenda del día: {filterDate || 'Todas las fechas'} ({filteredAppointments.length} turnos)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {doctors.length} Médicos en plantilla activa
          </span>
        </div>

        {filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Hora</th>
                  <th className="py-3 px-4">Paciente</th>
                  <th className="py-3 px-4">DNI / Contacto</th>
                  <th className="py-3 px-4">Médico / Especialidad</th>
                  <th className="py-3 px-4">Cobertura / Copago</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map(apt => {
                  const isBlocked = apt.status === 'BLOQUEADO';
                  return (
                    <tr
                      key={apt.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isBlocked ? 'bg-rose-50/40 text-rose-900' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{apt.time}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {isBlocked ? (
                          <span className="font-bold text-rose-700 flex items-center gap-1">
                            <Ban className="w-3.5 h-3.5" />
                            <span>{apt.reason}</span>
                          </span>
                        ) : (
                          <div>
                            <span className="font-bold text-slate-900 block">{apt.patientName}</span>
                            <span className="text-slate-500 text-[11px] italic truncate max-w-xs block">
                              {apt.reason}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <div>{apt.patientDni}</div>
                        <div className="text-[11px] text-slate-400">{apt.patientPhone}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900 block">{apt.doctorName}</span>
                        <span className="text-cyan-700 text-[11px]">{apt.specialtyName}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="block text-slate-700 font-medium">{apt.insuranceName || 'Particular'}</span>
                        <span className="tabular-nums font-bold text-slate-900">
                          ${apt.copayAmount.toLocaleString()}
                        </span>
                        {apt.isPaid ? (
                          <span className="text-emerald-700 font-semibold text-[10px] block">Abonado</span>
                        ) : (
                          <span className="text-amber-700 font-semibold text-[10px] block">Pendiente Caja</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          apt.status === 'CONFIRMADO' ? 'bg-blue-100 text-blue-800' :
                          apt.status === 'EN_ESPERA' ? 'bg-amber-100 text-amber-900 font-bold' :
                          apt.status === 'EN_CONSULTA' ? 'bg-purple-100 text-purple-900' :
                          apt.status === 'FINALIZADO' ? 'bg-slate-100 text-slate-700' :
                          apt.status === 'CANCELADO' ? 'bg-rose-100 text-rose-800' :
                          apt.status === 'BLOQUEADO' ? 'bg-rose-200 text-rose-900' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {apt.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {apt.status !== 'CANCELADO' && apt.status !== 'FINALIZADO' && (
                            <>
                              <button
                                onClick={() => {
                                  setReschedulingApt(apt);
                                  setRescheduleData({ date: apt.date, time: apt.time });
                                }}
                                title="Reprogramar fecha/hora"
                                className="p-1 text-slate-600 hover:text-cyan-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`¿Cancelar turno de ${apt.patientName}?`)) {
                                    storageService.cancelAppointment(apt.id, 'Cancelado desde Agenda Global');
                                  }
                                }}
                                title="Cancelar Turno"
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            No se encontraron turnos con los filtros actuales.
          </div>
        )}
      </div>

      {/* MODAL: Nuevo Turno en Recepción */}
      {isNewAppointmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Crear Turno Médico Presencial</h3>
              <button
                onClick={() => setIsNewAppointmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Paciente *</label>
                <select
                  required
                  value={newAptData.patientId}
                  onChange={e => setNewAptData(prev => ({ ...prev, patientId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                >
                  <option value="">Seleccione paciente registrado...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (DNI: {p.dni} - {p.insuranceName || 'Particular'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Médico Destino *</label>
                <select
                  required
                  value={newAptData.doctorId}
                  onChange={e => setNewAptData(prev => ({ ...prev, doctorId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                >
                  <option value="">Seleccione profesional...</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} · {d.specialtyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={newAptData.date}
                    onChange={e => setNewAptData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Hora *</label>
                  <input
                    type="time"
                    required
                    value={newAptData.time}
                    onChange={e => setNewAptData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Copago a Abonar ($)</label>
                <input
                  type="number"
                  value={newAptData.copayAmount}
                  onChange={e => setNewAptData(prev => ({ ...prev, copayAmount: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Motivo / Notas</label>
                <textarea
                  rows={2}
                  value={newAptData.reason}
                  onChange={e => setNewAptData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Motivo de la asignación..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewAppointmentModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-700 text-white font-semibold rounded-lg hover:bg-cyan-800 cursor-pointer"
                >
                  Confirmar Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Bloqueo de Franja Horaria */}
      {isBlockSlotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <Ban className="w-4 h-4" />
                <span>Bloquear Franja Horaria de Médico</span>
              </div>
              <button
                onClick={() => setIsBlockSlotModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBlockSlot} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Médico a Bloquear *</label>
                <select
                  required
                  value={blockData.doctorId}
                  onChange={e => setBlockData(prev => ({ ...prev, doctorId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} · {d.specialtyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={blockData.date}
                    onChange={e => setBlockData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Hora Inicio *</label>
                  <input
                    type="time"
                    required
                    value={blockData.time}
                    onChange={e => setBlockData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Motivo del Bloqueo *</label>
                <select
                  value={blockData.reason}
                  onChange={e => setBlockData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                >
                  <option value="Quirófano programado / Cirugía de guardia">Quirófano programado / Cirugía de guardia</option>
                  <option value="Ateneo médico / Reunión de servicio">Ateneo médico / Reunión de servicio</option>
                  <option value="Urgencia / Derivación asistida">Urgencia / Derivación asistida</option>
                  <option value="Licencia médica / Asunto particular">Licencia médica / Asunto particular</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBlockSlotModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-700 text-white font-semibold rounded-lg hover:bg-rose-800 cursor-pointer"
                >
                  Confirmar Bloqueo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reprogramar Turno */}
      {reschedulingApt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Reprogramar Turno #{reschedulingApt.id}</h3>
            <p className="text-xs text-slate-600">
              Paciente: <b>{reschedulingApt.patientName}</b> con <b>{reschedulingApt.doctorName}</b>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nueva Fecha</label>
                <input
                  type="date"
                  value={rescheduleData.date}
                  onChange={e => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nueva Hora</label>
                <input
                  type="time"
                  value={rescheduleData.time}
                  onChange={e => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => setReschedulingApt(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="px-4 py-1.5 bg-cyan-700 text-white font-semibold rounded-lg hover:bg-cyan-800 cursor-pointer"
              >
                Guardar Reprogramación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
