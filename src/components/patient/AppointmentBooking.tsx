import React, { useState, useMemo } from 'react';
import { User, Appointment } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { 
  CalendarDays, 
  Search, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  ChevronRight,
  Filter
} from 'lucide-react';

interface AppointmentBookingProps {
  patient: User;
}

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ patient }) => {
  const specialties = storageService.getSpecialties();
  const doctors = storageService.getDoctors();
  const appointments = storageService.getAppointmentsByPatient(patient.id);

  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);
  const [filterUpcoming, setFilterUpcoming] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  // Filter doctors by specialty
  const availableDoctors = useMemo(() => {
    if (!selectedSpecialtyId) return doctors;
    return doctors.filter(d => d.specialtyId === selectedSpecialtyId);
  }, [doctors, selectedSpecialtyId]);

  // Selected doctor object
  const activeDoctor = useMemo(() => {
    return doctors.find(d => d.id === selectedDoctorId);
  }, [doctors, selectedDoctorId]);

  // Selected specialty object
  const activeSpecialty = useMemo(() => {
    if (activeDoctor && activeDoctor.specialtyId) {
      return specialties.find(s => s.id === activeDoctor.specialtyId);
    }
    return specialties.find(s => s.id === selectedSpecialtyId);
  }, [activeDoctor, selectedSpecialtyId, specialties]);

  // Calculate available time slots for selected doctor and date
  const availableSlots = useMemo(() => {
    if (!selectedDoctorId || !selectedDate) return [];

    const schedule = storageService.getDoctorSchedule(selectedDoctorId);
    const dateObj = new Date(`${selectedDate}T00:00:00`);
    const dayOfWeek = dateObj.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab

    // Check if doctor works on this day of week
    if (!schedule.workingDays.includes(dayOfWeek)) {
      return [];
    }

    // Check if within vacation range
    const isVacation = schedule.vacationRanges.some(vac => {
      return selectedDate >= vac.startDate && selectedDate <= vac.endDate;
    });
    if (isVacation) return [];

    // Generate slots
    const [startH, startM] = schedule.startHour.split(':').map(Number);
    const [endH, endM] = schedule.endHour.split(':').map(Number);
    const duration = schedule.consultationDuration || 30;

    const slots: string[] = [];
    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // Existing appointments for this doctor on this day
    const allDoctorApts = storageService.getAppointmentsByDoctor(selectedDoctorId);
    const bookedTimes = allDoctorApts
      .filter(a => a.date === selectedDate && a.status !== 'CANCELADO')
      .map(a => a.time);

    while (currentMinutes + duration <= endMinutes) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      // Check break
      const isBreak = schedule.breakRanges.some(brk => {
        return timeStr >= brk.start && timeStr < brk.end;
      });

      if (!isBreak && !bookedTimes.includes(timeStr)) {
        slots.push(timeStr);
      }
      currentMinutes += duration;
    }

    return slots;
  }, [selectedDoctorId, selectedDate]);

  // Calculate copay estimate
  const estimatedCopay = useMemo(() => {
    const baseFee = activeDoctor?.consultationFee || activeSpecialty?.baseFee || 20000;
    const insuranceName = patient.insuranceName || '';
    const settings = storageService.getSettings();
    const matchedIns = settings.insurances.find(ins => ins.name.toLowerCase() === insuranceName.toLowerCase());

    if (!insuranceName || !matchedIns) {
      return baseFee; // Particular 100%
    }
    return Math.round((baseFee * matchedIns.copayPercentage) / 100);
  }, [activeDoctor, activeSpecialty, patient.insuranceName]);

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoctor || !selectedDate || !selectedTime || !reason) return;

    const newApt = storageService.saveAppointment({
      patientId: patient.id,
      patientName: patient.name,
      patientDni: patient.dni,
      patientPhone: patient.phone,
      doctorId: activeDoctor.id,
      doctorName: activeDoctor.name,
      specialtyId: activeDoctor.specialtyId || 'esp-1',
      specialtyName: activeDoctor.specialtyName || 'Clínica Médica',
      date: selectedDate,
      time: selectedTime,
      durationMinutes: 30,
      status: 'RESERVADO',
      reason,
      insuranceName: patient.insuranceName || 'Particular',
      copayAmount: estimatedCopay,
      isPaid: false
    });

    setBookingSuccess(newApt);
    setSelectedTime('');
    setReason('');
  };

  const handleCancelAppointment = (aptId: string) => {
    if (window.confirm('¿Está seguro de que desea cancelar este turno médico?')) {
      storageService.cancelAppointment(aptId, 'Cancelado por el paciente desde portal autogestión');
    }
  };

  const filteredAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    if (filterUpcoming === 'upcoming') {
      return appointments.filter(a => a.date >= today && a.status !== 'CANCELADO');
    }
    if (filterUpcoming === 'past') {
      return appointments.filter(a => a.date < today || a.status === 'FINALIZADO' || a.status === 'CANCELADO');
    }
    return appointments;
  }, [appointments, filterUpcoming]);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
          <span>RF-02</span>
          <span>·</span>
          <span className="uppercase">Reserva de Turnos y Autogestión</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mt-1">
          Reserva de Consultas Médicas y Especialidades
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Busque profesionales médicos por especialidad, consulte disponibilidades en tiempo real y reserve su cita.
        </p>
      </div>

      {bookingSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>¡Turno Reservado con Éxito!</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-800 bg-white p-4 rounded-lg border border-emerald-200">
            <div>
              <span className="text-slate-500 block">Profesional:</span>
              <span className="font-semibold text-slate-900">{bookingSuccess.doctorName}</span>
              <span className="text-cyan-700 block">{bookingSuccess.specialtyName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Fecha y Hora:</span>
              <span className="font-bold text-slate-900">{bookingSuccess.date} · {bookingSuccess.time} hs</span>
              <span className="text-slate-500 block">Código: #{bookingSuccess.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Copago Estimado:</span>
              <span className="font-bold text-emerald-800 text-sm tabular-nums">${bookingSuccess.copayAmount.toLocaleString()}</span>
              <span className="text-slate-500 block">{bookingSuccess.insuranceName}</span>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setBookingSuccess(null)}
              className="px-4 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              Reservar otro turno
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Booking Engine & Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Step-by-Step Booking Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Search className="w-4 h-4 text-cyan-700" />
            <h2 className="text-sm font-semibold text-slate-900">1. Seleccionar Especialidad y Médico</h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Specialty select */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Especialidad Médica</label>
              <select
                value={selectedSpecialtyId}
                onChange={e => {
                  setSelectedSpecialtyId(e.target.value);
                  setSelectedDoctorId('');
                  setSelectedTime('');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden bg-white"
              >
                <option value="">Todas las especialidades...</option>
                {specialties.map(esp => (
                  <option key={esp.id} value={esp.id}>
                    {esp.name} (Arancel base: ${esp.baseFee.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor select */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Profesional Médico *</label>
              <select
                value={selectedDoctorId}
                onChange={e => {
                  setSelectedDoctorId(e.target.value);
                  setSelectedTime('');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden bg-white"
              >
                <option value="">Seleccione médico disponible...</option>
                {availableDoctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} · {doc.specialtyName} ({doc.medicalLicense})
                  </option>
                ))}
              </select>
            </div>

            {/* Date picker */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Fecha de la Consulta *</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={e => {
                  setSelectedDate(e.target.value);
                  setSelectedTime('');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden"
              />
            </div>

            {/* Time Slot Picker */}
            {selectedDoctorId && (
              <div className="pt-2">
                <label className="block font-medium text-slate-700 mb-2">
                  Horarios Disponibles para el {selectedDate} *
                </label>

                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {availableSlots.map(time => (
                      <button
                        type="button"
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-1 text-center font-mono text-xs rounded-md transition-all cursor-pointer border ${
                          selectedTime === time
                            ? 'bg-cyan-700 text-white border-cyan-800 font-bold shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>No hay turnos disponibles para este profesional en la fecha seleccionada. Intente con otro día o especialista.</span>
                  </div>
                )}
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Motivo de la Consulta *</label>
              <textarea
                rows={2}
                required
                placeholder="Describa brevemente síntomas, chequeo de rutina o motivo..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden"
              />
            </div>

            {/* Summary & Copay banner */}
            {activeDoctor && selectedTime && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Cobertura registrada:</span>
                  <span className="font-semibold text-slate-900">{patient.insuranceName || 'Particular (Sin obra social)'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Estimación de Copago en Recepción:</span>
                  <span className="font-bold text-slate-900 tabular-nums text-sm">
                    ${estimatedCopay.toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  El pago del copago se realiza de manera presencial en la caja al momento del ingreso.
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={!selectedDoctorId || !selectedDate || !selectedTime || !reason.trim()}
              onClick={handleBookAppointment}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Confirmar Reserva de Cita</span>
            </button>
          </div>
        </div>

        {/* Right: Mis Turnos Programados (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Mis Turnos Médicos</h2>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-[11px]">
                <button
                  onClick={() => setFilterUpcoming('upcoming')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${filterUpcoming === 'upcoming' ? 'bg-white shadow-xs font-semibold text-slate-900' : 'text-slate-500'}`}
                >
                  Próximos
                </button>
                <button
                  onClick={() => setFilterUpcoming('past')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${filterUpcoming === 'past' ? 'bg-white shadow-xs font-semibold text-slate-900' : 'text-slate-500'}`}
                >
                  Pasados
                </button>
              </div>
            </div>

            {filteredAppointments.length > 0 ? (
              <div className="space-y-3">
                {filteredAppointments.map(apt => {
                  const isCancelable = apt.status === 'RESERVADO' || apt.status === 'CONFIRMADO';
                  return (
                    <div
                      key={apt.id}
                      className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-semibold text-slate-900 block">{apt.doctorName}</span>
                          <span className="text-cyan-700 text-[11px] block">{apt.specialtyName}</span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          apt.status === 'FINALIZADO' ? 'bg-slate-100 text-slate-700' :
                          apt.status === 'EN_ESPERA' ? 'bg-blue-100 text-blue-800' :
                          apt.status === 'CANCELADO' ? 'bg-rose-100 text-rose-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {apt.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-600 text-[11px]">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                          <span>{apt.date}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{apt.time} hs</span>
                        </span>
                        <span className="tabular-nums font-semibold text-slate-800">
                          ${apt.copayAmount.toLocaleString()}
                        </span>
                      </div>

                      <p className="text-slate-500 text-[11px] italic truncate">
                        "{apt.reason}"
                      </p>

                      {isCancelable && (
                        <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                          <button
                            onClick={() => handleCancelAppointment(apt.id)}
                            className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancelar Turno</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No tiene turnos registrados en este criterio.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
