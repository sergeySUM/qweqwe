import React, { useState, useMemo } from 'react';
import { User, Appointment } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  ArrowRight,
  Sparkles,
  Users
} from 'lucide-react';

interface PatientAdmissionProps {
  currentUser: User;
}

export const PatientAdmission: React.FC<PatientAdmissionProps> = ({ currentUser }) => {
  const patients = storageService.getPatients();
  const doctors = storageService.getDoctors();
  const appointments = storageService.getAppointments();
  const settings = storageService.getSettings();

  const [searchDni, setSearchDni] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);

  // New in-person patient registration state
  const [isRegisteringNew, setIsRegisteringNew] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    dni: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    insuranceName: 'OSDE (210/310/410/510)',
    insuranceNumber: '',
    billingCuit: ''
  });

  // Coverage validation state
  const [coverageValidationResult, setCoverageValidationResult] = useState<{
    status: 'VALIDO' | 'REQUIERE_AUTORIZACION' | 'INACTIVO';
    message: string;
    copayPercentage: number;
  } | null>(null);

  // Today's appointments for admission
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = useMemo(() => {
    return appointments.filter(a => a.date === todayStr && a.status !== 'CANCELADO');
  }, [appointments, todayStr]);

  // Patients currently in waiting room
  const waitingRoomPatients = useMemo(() => {
    return appointments.filter(a => a.status === 'EN_ESPERA' || a.status === 'EN_CONSULTA');
  }, [appointments]);

  // Search existing patient
  const handleSearchPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchDni.trim()) return;
    const found = patients.find(p => p.dni.includes(searchDni.trim()) || p.name.toLowerCase().includes(searchDni.toLowerCase()));
    if (found) {
      setSelectedPatient(found);
      validateCoverage(found.insuranceName);
    } else {
      setSelectedPatient(null);
      setCoverageValidationResult(null);
      alert('No se encontró paciente con ese DNI. Puede darlo de alta presencialmente a continuación.');
      setIsRegisteringNew(true);
      setNewPatientForm(prev => ({ ...prev, dni: searchDni }));
    }
  };

  const validateCoverage = (insuranceName?: string) => {
    if (!insuranceName || insuranceName === 'Particular / Privado') {
      setCoverageValidationResult({
        status: 'VALIDO',
        message: 'Atención Particular / Privada (Copago 100% Arancel Institucional)',
        copayPercentage: 100
      });
      return;
    }

    const matched = settings.insurances.find(ins => ins.name.toLowerCase() === insuranceName.toLowerCase() || insuranceName.includes(ins.name));
    if (matched && matched.active) {
      setCoverageValidationResult({
        status: 'VALIDO',
        message: `Convenio Activo con ${matched.name}. Credencial Habilitada en Padrón Central.`,
        copayPercentage: matched.copayPercentage
      });
    } else {
      setCoverageValidationResult({
        status: 'REQUIERE_AUTORIZACION',
        message: `Plan o cobertura ${insuranceName} requiere token de autorización o validación online.`,
        copayPercentage: 30
      });
    }
  };

  // Register in-person patient
  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const created = storageService.saveUser({
      name: newPatientForm.name,
      dni: newPatientForm.dni,
      email: newPatientForm.email || `${newPatientForm.dni}@paciente.medicore.com`,
      phone: newPatientForm.phone,
      birthDate: newPatientForm.birthDate,
      address: newPatientForm.address,
      insuranceName: newPatientForm.insuranceName,
      insuranceNumber: newPatientForm.insuranceNumber,
      billingCuit: newPatientForm.billingCuit,
      role: 'PACIENTE'
    });

    setSelectedPatient(created);
    validateCoverage(created.insuranceName);
    setIsRegisteringNew(false);
  };

  // Check-in patient to waiting room
  const handleCheckInToWaitingRoom = (aptId: string) => {
    storageService.updateAppointmentStatus(aptId, 'EN_ESPERA', 'Paciente admitido en recepción, aguardando en sala');
  };

  // Call patient to consult room
  const handleCallToConsult = (aptId: string) => {
    storageService.updateAppointmentStatus(aptId, 'EN_CONSULTA', 'Paciente llamado e ingresando a consultorio médico');
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
          <span>RF-05</span>
          <span>·</span>
          <span className="uppercase">Admisión de Pacientes y Sala de Espera</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mt-1">
          Admisión Presencial, Triage y Validación de Coberturas Médicas
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Registre nuevos pacientes presenciales, valide convenios con obras sociales y controle el flujo de sala de espera en tiempo real.
        </p>
      </div>

      {/* Grid: Triage / Admission & Sala de Espera en vivo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Intake Desk & Coverage Verification (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Search patient desk */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-700" />
                <span>Mesa de Entrada: Búsqueda de Paciente</span>
              </h2>

              <button
                type="button"
                onClick={() => setIsRegisteringNew(!isRegisteringNew)}
                className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 cursor-pointer flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isRegisteringNew ? 'Cancelar Alta' : '+ Nuevo Paciente Presencial'}</span>
              </button>
            </div>

            {!isRegisteringNew ? (
              <form onSubmit={handleSearchPatient} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ingrese DNI o Apellido del paciente..."
                  value={searchDni}
                  onChange={e => setSearchDni(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Buscar
                </button>
              </form>
            ) : (
              /* New patient form */
              <form onSubmit={handleRegisterPatient} className="space-y-3 text-xs pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={newPatientForm.name}
                      onChange={e => setNewPatientForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">DNI *</label>
                    <input
                      type="text"
                      required
                      value={newPatientForm.dni}
                      onChange={e => setNewPatientForm(prev => ({ ...prev, dni: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Teléfono Móvil *</label>
                    <input
                      type="tel"
                      required
                      value={newPatientForm.phone}
                      onChange={e => setNewPatientForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newPatientForm.email}
                      onChange={e => setNewPatientForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Obra Social / Prepaga</label>
                    <select
                      value={newPatientForm.insuranceName}
                      onChange={e => setNewPatientForm(prev => ({ ...prev, insuranceName: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                    >
                      {settings.insurances.map(ins => (
                        <option key={ins.id} value={ins.name}>
                          {ins.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">N° de Credencial / Afiliado</label>
                    <input
                      type="text"
                      placeholder="Ej: OS-123456"
                      value={newPatientForm.insuranceNumber}
                      onChange={e => setNewPatientForm(prev => ({ ...prev, insuranceNumber: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRegisteringNew(false)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-cyan-700 text-white font-semibold rounded-lg hover:bg-cyan-800"
                  >
                    Registrar y Validar Admisión
                  </button>
                </div>
              </form>
            )}

            {/* Selected patient coverage validator card */}
            {selectedPatient && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs mt-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{selectedPatient.name}</span>
                    <span className="text-slate-600 block text-xs">
                      DNI: {selectedPatient.dni} · Tel: {selectedPatient.phone}
                    </span>
                    <span className="text-slate-500 block text-[11px]">
                      Domicilio: {selectedPatient.address || 'Sin especificar'}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-100 text-cyan-800 font-mono">
                    ID: {selectedPatient.id}
                  </span>
                </div>

                {/* Live Coverage Validation Result */}
                {coverageValidationResult && (
                  <div className={`p-3 rounded-lg border text-xs space-y-1 ${
                    coverageValidationResult.status === 'VALIDO'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Validación de Obra Social: {selectedPatient.insuranceName || 'Particular'}</span>
                    </div>
                    <p className="text-[11px]">{coverageValidationResult.message}</p>
                    <div className="text-[11px] font-semibold pt-1">
                      N° Credencial: <span className="font-mono">{selectedPatient.insuranceNumber || 'Particular sin credencial'}</span> · Copago asignado: {coverageValidationResult.copayPercentage}%
                    </div>
                  </div>
                )}

                {/* Patient's appointments for today */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-800 block mb-1.5">Turno del día asignado:</span>
                  {todayAppointments.filter(a => a.patientId === selectedPatient.id).length > 0 ? (
                    todayAppointments.filter(a => a.patientId === selectedPatient.id).map(apt => (
                      <div key={apt.id} className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-900">{apt.time} hs · {apt.doctorName}</div>
                          <div className="text-slate-500 text-[11px]">{apt.specialtyName} · Copago: ${apt.copayAmount.toLocaleString()}</div>
                        </div>

                        {apt.status === 'RESERVADO' || apt.status === 'CONFIRMADO' ? (
                          <button
                            onClick={() => handleCheckInToWaitingRoom(apt.id)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                          >
                            Ingresar a Sala de Espera
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                            {apt.status}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-[11px] italic">
                      Este paciente no tiene turnos programados para hoy ({todayStr}).
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sala de Espera en Vivo (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-700" />
                <h2 className="text-sm font-semibold text-slate-900">Sala de Espera (En Vivo)</h2>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {waitingRoomPatients.length} en espera / atención
              </span>
            </div>

            {waitingRoomPatients.length > 0 ? (
              <div className="space-y-3">
                {waitingRoomPatients.map((apt, index) => {
                  const isInConsult = apt.status === 'EN_CONSULTA';
                  return (
                    <div
                      key={apt.id}
                      className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                        isInConsult
                          ? 'bg-purple-50/60 border-purple-200'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                            {index + 1}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block">{apt.patientName}</span>
                            <span className="text-[11px] text-slate-500">DNI: {apt.patientDni}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isInConsult ? 'bg-purple-100 text-purple-900' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {isInConsult ? 'EN CONSULTA' : 'EN ESPERA'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded">
                        <div>Médico: <span className="font-semibold text-slate-900">{apt.doctorName}</span></div>
                        <div>Hora turno: <span className="font-mono">{apt.time} hs</span> · {apt.specialtyName}</div>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[10px] text-slate-400">
                          {apt.isPaid ? '✓ Copago Cobrado' : '⚠️ Copago Pendiente'}
                        </span>

                        {!isInConsult && (
                          <button
                            onClick={() => handleCallToConsult(apt.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-700 hover:bg-cyan-800 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <span>Llamar al Consultorio</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No hay pacientes esperando en sala en este momento.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
