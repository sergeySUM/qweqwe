import React, { useState, useEffect } from 'react';
import { User, DoctorSchedule } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { 
  Clock, 
  Calendar, 
  Save, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Palmtree, 
  Coffee,
  Check
} from 'lucide-react';

interface DoctorScheduleConfigProps {
  currentUser: User;
}

const DAYS_OF_WEEK = [
  { day: 1, name: 'Lunes' },
  { day: 2, name: 'Martes' },
  { day: 3, name: 'Miércoles' },
  { day: 4, name: 'Jueves' },
  { day: 5, name: 'Viernes' },
  { day: 6, name: 'Sábado' }
];

export const DoctorScheduleConfig: React.FC<DoctorScheduleConfigProps> = ({ currentUser }) => {
  const [schedule, setSchedule] = useState<DoctorSchedule>(() => {
    return storageService.getDoctorSchedule(currentUser.id);
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // New vacation form
  const [isAddingVacation, setIsAddingVacation] = useState(false);
  const [vacationForm, setVacationForm] = useState({
    startDate: '',
    endDate: '',
    reason: 'Vacaciones anuales reglamentarias'
  });

  useEffect(() => {
    setSchedule(storageService.getDoctorSchedule(currentUser.id));
  }, [currentUser.id]);

  const toggleDay = (dayNum: number) => {
    setSchedule(prev => {
      const exists = prev.workingDays.includes(dayNum);
      const nextDays = exists 
        ? prev.workingDays.filter(d => d !== dayNum) 
        : [...prev.workingDays, dayNum].sort();
      return { ...prev, workingDays: nextDays };
    });
  };

  const handleAddVacation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacationForm.startDate || !vacationForm.endDate) return;

    setSchedule(prev => ({
      ...prev,
      vacationRanges: [
        ...prev.vacationRanges,
        { ...vacationForm }
      ]
    }));

    setIsAddingVacation(false);
    setVacationForm({
      startDate: '',
      endDate: '',
      reason: 'Vacaciones anuales reglamentarias'
    });
  };

  const handleRemoveVacation = (index: number) => {
    setSchedule(prev => ({
      ...prev,
      vacationRanges: prev.vacationRanges.filter((_, idx) => idx !== index)
    }));
  };

  const handleSave = () => {
    storageService.saveDoctorSchedule(schedule);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
            <span>RF-10</span>
            <span>·</span>
            <span className="uppercase">Configuración de Horario y Disponibilidad</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Mi Agenda Habitual, Duración de Turnos y Vacaciones
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Defina sus días de atención semanal, horarios habituales de consultorio y bloquee períodos por congresos o vacaciones.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Horarios actualizados</span>
          </div>
        )}
      </div>

      {/* Días y Horarios Habituales */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5 text-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Clock className="w-4 h-4 text-cyan-700" />
          <h2 className="text-sm font-semibold text-slate-900">Días y Franjas de Atención Semanal</h2>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-2">Días de Atención Activos</label>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {DAYS_OF_WEEK.map(({ day, name }) => {
              const isActive = schedule.workingDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`py-2 px-3 rounded-lg border font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-cyan-700 text-white border-cyan-800'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <span>{name}</span>
                  {isActive && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Hora Inicio de Jornada</label>
            <input
              type="time"
              value={schedule.startHour}
              onChange={e => setSchedule(prev => ({ ...prev, startHour: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Hora Cierre de Jornada</label>
            <input
              type="time"
              value={schedule.endHour}
              onChange={e => setSchedule(prev => ({ ...prev, endHour: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Duración por Consulta (Minutos)</label>
            <select
              value={schedule.consultationDuration}
              onChange={e => setSchedule(prev => ({ ...prev, consultationDuration: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white font-semibold"
            >
              <option value={15}>15 minutos (Control rápido)</option>
              <option value={20}>20 minutos (Estándar ambulatorio)</option>
              <option value={30}>30 minutos (Recomendado especialistas)</option>
              <option value={45}>45 minutos (Primera consulta / Extensa)</option>
              <option value={60}>60 minutos (Evaluación compleja)</option>
            </select>
          </div>
        </div>

        {/* Break time */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-2">
            <Coffee className="w-3.5 h-3.5 text-slate-500" />
            <span>Pausa de Almuerzo / Intervalo</span>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block font-medium text-slate-500 mb-1">Inicio pausa</label>
              <input
                type="time"
                value={schedule.breakRanges[0]?.start || '12:30'}
                onChange={e => setSchedule(prev => ({
                  ...prev,
                  breakRanges: [{ start: e.target.value, end: prev.breakRanges[0]?.end || '13:30' }]
                }))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-500 mb-1">Fin pausa</label>
              <input
                type="time"
                value={schedule.breakRanges[0]?.end || '13:30'}
                onChange={e => setSchedule(prev => ({
                  ...prev,
                  breakRanges: [{ start: prev.breakRanges[0]?.start || '12:30', end: e.target.value }]
                }))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Períodos de Vacaciones y Licencias */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Palmtree className="w-4 h-4 text-cyan-700" />
            <h2 className="text-sm font-semibold text-slate-900">Bloqueo de Fechas por Vacaciones o Congresos</h2>
          </div>
          <button
            onClick={() => setIsAddingVacation(!isAddingVacation)}
            className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingVacation ? 'Cancelar' : 'Agregar Período de Licencia'}</span>
          </button>
        </div>

        {/* Form add vacation */}
        {isAddingVacation && (
          <form onSubmit={handleAddVacation} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Fecha Inicio *</label>
                <input
                  type="date"
                  required
                  value={vacationForm.startDate}
                  onChange={e => setVacationForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Fecha Fin *</label>
                <input
                  type="date"
                  required
                  value={vacationForm.endDate}
                  onChange={e => setVacationForm(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Motivo / Descripción *</label>
                <input
                  type="text"
                  required
                  value={vacationForm.reason}
                  onChange={e => setVacationForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Ej. Congreso Anual de Especialidad"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 bg-cyan-700 text-white font-semibold rounded-lg hover:bg-cyan-800 cursor-pointer"
              >
                Bloquear Período en Calendario
              </button>
            </div>
          </form>
        )}

        {/* Active blocked ranges */}
        {schedule.vacationRanges.length > 0 ? (
          <div className="space-y-2">
            {schedule.vacationRanges.map((vac, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{vac.reason}</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Desde {vac.startDate} hasta {vac.endDate}
                  </span>
                </div>

                <button
                  onClick={() => handleRemoveVacation(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                  title="Eliminar bloqueo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-xs italic">
            No posee licencias o períodos vacacionales programados. Su agenda se encuentra abierta según los días habituales.
          </p>
        )}
      </div>

      {/* Save Action */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Configuración de Horario</span>
        </button>
      </div>
    </div>
  );
};
