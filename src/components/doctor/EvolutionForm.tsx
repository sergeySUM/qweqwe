import React, { useState, useMemo } from 'react';
import { User, EvolutionNote, VitalSigns, Appointment } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { 
  Activity, 
  Save, 
  CheckCircle2, 
  Stethoscope, 
  HeartPulse, 
  Pill, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface EvolutionFormProps {
  currentUser: User;
  initialPatientId?: string;
  onNavigateToPrescription?: (patientId: string) => void;
}

const COMMON_ICD10 = [
  { code: 'I10', desc: 'Hipertensión esencial (primaria)' },
  { code: 'E11', desc: 'Diabetes mellitus tipo 2 no insulinodependiente' },
  { code: 'E78.2', desc: 'Hiperlipidemia mixta' },
  { code: 'J00', desc: 'Rinofaringitis aguda (resfriado común)' },
  { code: 'J02', desc: 'Faringitis aguda' },
  { code: 'J45', desc: 'Asma bronquial' },
  { code: 'M54.5', desc: 'Lumbago no especificado' },
  { code: 'K29.7', desc: 'Gastritis no especificada' },
  { code: 'R51', desc: 'Cefalea' },
  { code: 'Z00.0', desc: 'Examen médico general (chequeo anual)' }
];

export const EvolutionForm: React.FC<EvolutionFormProps> = ({ 
  currentUser,
  initialPatientId,
  onNavigateToPrescription 
}) => {
  const patients = storageService.getPatients();
  const appointments = storageService.getAppointments();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || patients[0]?.id || '');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');

  // Vital signs state
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    bloodPressureSys: 120,
    bloodPressureDia: 80,
    heartRate: 72,
    temperature: 36.5,
    oxygenSaturation: 98,
    weightKg: 70,
    heightCm: 170,
    bmi: 24.2
  });

  // Clinical note state
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [physicalExam, setPhysicalExam] = useState('');
  const [diagnosisCode, setDiagnosisCode] = useState('I10');
  const [diagnosisDescription, setDiagnosisDescription] = useState('Hipertensión esencial (primaria)');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [savedSuccess, setSavedSuccess] = useState<EvolutionNote | null>(null);

  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId);
  }, [patients, selectedPatientId]);

  // Recalculate BMI automatically
  const handleVitalChange = (field: keyof VitalSigns, value: number) => {
    setVitalSigns(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'weightKg' || field === 'heightCm') {
        const heightM = next.heightCm / 100;
        if (heightM > 0) {
          next.bmi = Number((next.weightKg / (heightM * heightM)).toFixed(1));
        }
      }
      return next;
    });
  };

  const handleSelectICD10 = (code: string, desc: string) => {
    setDiagnosisCode(code);
    setDiagnosisDescription(desc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const saved = storageService.saveEvolutionNote({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      doctorLicense: currentUser.medicalLicense || 'MN-MED-REG',
      appointmentId: selectedAppointmentId || undefined,
      chiefComplaint,
      symptoms,
      physicalExam: physicalExam || 'Sin particularidades relevantes al examen físico.',
      diagnosisCode,
      diagnosisDescription,
      treatmentPlan,
      vitalSigns
    });

    setSavedSuccess(saved);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
          <span>RF-08</span>
          <span>·</span>
          <span className="uppercase">Registro de Evolución Médica</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mt-1">
          Registro Clínico, Diagnósticos CIE-10 y Plan Terapéutico
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Confección de la nota de consulta médica, registro de signos vitales, codificación nosológica y cierre de acto médico.
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Evolución médica firmada y guardada correctamente</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-800 font-semibold">
              HASH: {savedSuccess.doctorSignatureHash}
            </span>
          </div>
          <p className="text-xs text-slate-700">
            La nota ha sido anexada a la Historia Clínica Electrónica de <b>{savedSuccess.patientName}</b> con diagnóstico <b>{savedSuccess.diagnosisCode} - {savedSuccess.diagnosisDescription}</b>.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            {onNavigateToPrescription && (
              <button
                onClick={() => onNavigateToPrescription(savedSuccess.patientId)}
                className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Pill className="w-3.5 h-3.5" />
                <span>Emitir Receta Electrónica u Orden</span>
              </button>
            )}
            <button
              onClick={() => {
                setSavedSuccess(null);
                setChiefComplaint('');
                setSymptoms('');
                setTreatmentPlan('');
              }}
              className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              Cargar otra evolución
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex-1 min-w-[240px]">
            <label className="block font-semibold text-slate-700 mb-1">Paciente en Consulta *</label>
            <select
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white focus:ring-2 focus:ring-cyan-600"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (DNI: {p.dni} - {p.insuranceName || 'Particular'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block font-semibold text-slate-700 mb-1">Turno Asociado (Opcional)</label>
            <select
              value={selectedAppointmentId}
              onChange={e => setSelectedAppointmentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
            >
              <option value="">Sin turno previo (Demanda espontánea)</option>
              {appointments
                .filter(a => a.patientId === selectedPatientId && a.status !== 'CANCELADO')
                .map(a => (
                  <option key={a.id} value={a.id}>
                    {a.date} {a.time} hs - {a.reason} ({a.status})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Section 1: Signos Vitales */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <HeartPulse className="w-4 h-4 text-cyan-700" />
            <h2 className="text-sm font-semibold text-slate-900">Signos Vitales y Somatometría</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">PA Sistólica (mmHg)</label>
              <input
                type="number"
                value={vitalSigns.bloodPressureSys}
                onChange={e => handleVitalChange('bloodPressureSys', Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">PA Diastólica (mmHg)</label>
              <input
                type="number"
                value={vitalSigns.bloodPressureDia}
                onChange={e => handleVitalChange('bloodPressureDia', Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Frecuencia Cardíaca (lpm)</label>
              <input
                type="number"
                value={vitalSigns.heartRate}
                onChange={e => handleVitalChange('heartRate', Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Temperatura (°C)</label>
              <input
                type="number"
                step="0.1"
                value={vitalSigns.temperature}
                onChange={e => handleVitalChange('temperature', Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Sat. Oxígeno SpO2 (%)</label>
              <input
                type="number"
                value={vitalSigns.oxygenSaturation}
                onChange={e => handleVitalChange('oxygenSaturation', Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Peso (kg)</label>
              <input
                type="number"
                step="0.5"
                value={vitalSigns.weightKg}
                onChange={e => handleVitalChange('weightKg', Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Talla (cm)</label>
              <input
                type="number"
                value={vitalSigns.heightCm}
                onChange={e => handleVitalChange('heightCm', Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">IMC Calculado</label>
              <div className="w-full px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold">
                {vitalSigns.bmi} {vitalSigns.bmi >= 25 ? '(Sobrepeso)' : '(Normopeso)'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Anamnesis y Examen Físico */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Stethoscope className="w-4 h-4 text-cyan-700" />
            <h2 className="text-sm font-semibold text-slate-900">Anamnesis y Examen Clínico</h2>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Motivo Principal de Consulta *</label>
            <input
              type="text"
              required
              placeholder="Ej. Dolor precordial atípico / Cefalea tensional / Control de rutina"
              value={chiefComplaint}
              onChange={e => setChiefComplaint(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Evolución de Síntomas / Enfermedad Actual *</label>
            <textarea
              rows={3}
              required
              placeholder="Descripción cronológica de los síntomas referidos por el paciente..."
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Examen Físico Detallado</label>
            <textarea
              rows={2}
              placeholder="Hallazgos semiológicos al examen de aparatos y sistemas..."
              value={physicalExam}
              onChange={e => setPhysicalExam(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
        </div>

        {/* Section 3: Diagnóstico CIE-10 & Plan */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="w-4 h-4 text-cyan-700" />
            <h2 className="text-sm font-semibold text-slate-900">Diagnóstico Principal (CIE-10) y Conducta</h2>
          </div>

          <div>
            <span className="block font-medium text-slate-700 mb-1.5">Diagnósticos Frecuentes (Click para seleccionar):</span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_ICD10.map(item => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelectICD10(item.code, item.desc)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                    diagnosisCode === item.code
                      ? 'bg-cyan-700 text-white border-cyan-800'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <b className="font-mono">{item.code}</b>: {item.desc}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Código CIE-10 *</label>
              <input
                type="text"
                required
                value={diagnosisCode}
                onChange={e => setDiagnosisCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Descripción del Diagnóstico *</label>
              <input
                type="text"
                required
                value={diagnosisDescription}
                onChange={e => setDiagnosisDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Plan Diagnóstico y Terapéutico / Conducta *</label>
            <textarea
              rows={3}
              required
              placeholder="Indicaciones farmacológicas, solicitud de estudios complementarios, derivaciones y fecha de próximo control..."
              value={treatmentPlan}
              onChange={e => setTreatmentPlan(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500">
            Firma Electrónica registrada a: <b>{currentUser.name}</b> ({currentUser.medicalLicense || 'MN-MED-REG'})
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Firmar y Guardar Evolución Clínica</span>
          </button>
        </div>
      </form>
    </div>
  );
};
