import React, { useState } from 'react';
import { User, Prescription, LabOrder, PrescriptionItem } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { PrintModal } from '../common/PrintModal';
import { 
  Pill, 
  FlaskConical, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Printer, 
  ShieldCheck, 
  FileText,
  Search
} from 'lucide-react';

interface PrescriptionsOrdersProps {
  currentUser: User;
  initialPatientId?: string;
}

const COMMON_MEDS = [
  { med: 'Enalapril', pres: '10 mg comprimidos x 30', dose: '1 comp. cada 24 hs', dur: '30 días' },
  { med: 'Losartán', pres: '50 mg comprimidos x 30', dose: '1 comp. cada 12 hs', dur: '30 días' },
  { med: 'Amoxicilina', pres: '500 mg comprimidos x 16', dose: '1 comp. cada 8 hs', dur: '7 días' },
  { med: 'Ibuprofeno', pres: '600 mg comprimidos x 20', dose: '1 comp. cada 8 hs', dur: '5 días' },
  { med: 'Paracetamol', pres: '1 g comprimidos x 20', dose: '1 comp. cada 8 hs s/dolor', dur: '4 días' },
  { med: 'Omeprazol', pres: '20 mg cápsulas x 28', dose: '1 comp. diario en ayunas', dur: '28 días' },
  { med: 'Rosuvastatina', pres: '10 mg comprimidos x 28', dose: '1 comp. noche', dur: '60 días' }
];

const COMMON_STUDIES = [
  'Hemograma completo con plaquetas',
  'Uremia, Creatininemia e Ionograma',
  'Glucemia basal y Hemoglobina glicosilada (HbA1c)',
  'Perfil lipídico (Colesterol total, HDL, LDL, Triglicéridos)',
  'Hepatograma y Enzimas hepáticas',
  'Ecocardiograma Doppler Color Transtorácico',
  'Ergometría computarizada de 12 derivaciones',
  'Radiografía de Tórax frente y perfil',
  'Ecografía Abdominal completa'
];

export const PrescriptionsOrders: React.FC<PrescriptionsOrdersProps> = ({ 
  currentUser,
  initialPatientId 
}) => {
  const patients = storageService.getPatients();
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || patients[0]?.id || '');
  const [mode, setMode] = useState<'RECETA' | 'ORDEN'>('RECETA');

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  // Prescription State
  const [rxDiagnosis, setRxDiagnosis] = useState('Tratamiento ambulatorio');
  const [rxItems, setRxItems] = useState<PrescriptionItem[]>([
    {
      id: 'it-1',
      medication: 'Enalapril',
      presentation: '10 mg comprimidos x 30',
      dosage: '1 comprimido cada 24 hs',
      duration: '30 días',
      instructions: 'Tomar por la mañana en ayunas'
    }
  ]);

  // Lab Order State
  const [studyType, setStudyType] = useState<LabOrder['studyType']>('LABORATORIO');
  const [priority, setPriority] = useState<'RUTINA' | 'URGENTE'>('RUTINA');
  const [requestedStudies, setRequestedStudies] = useState<string[]>(['Hemograma completo con plaquetas']);
  const [clinicalIndication, setClinicalIndication] = useState('Control clínico periódico y reevaluación tensional');

  // Print modal
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'PRESCRIPTION' | 'LAB_ORDER';
    data: Prescription | LabOrder | null;
  }>({
    isOpen: false,
    type: 'PRESCRIPTION',
    data: null
  });

  // Handle Add Rx Item
  const handleAddRxItem = (prefill?: typeof COMMON_MEDS[0]) => {
    setRxItems(prev => [
      ...prev,
      {
        id: `it-${Date.now()}`,
        medication: prefill ? prefill.med : '',
        presentation: prefill ? prefill.pres : '',
        dosage: prefill ? prefill.dose : '',
        duration: prefill ? prefill.dur : '',
        instructions: ''
      }
    ]);
  };

  const handleRemoveRxItem = (id: string) => {
    if (rxItems.length <= 1) return;
    setRxItems(prev => prev.filter(it => it.id !== id));
  };

  const handleUpdateRxItem = (id: string, field: keyof PrescriptionItem, val: string) => {
    setRxItems(prev => prev.map(it => it.id === id ? { ...it, [field]: val } : it));
  };

  // Submit Prescription
  const handleEmitPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const rx = storageService.savePrescription({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientDni: selectedPatient.dni,
      patientInsurance: selectedPatient.insuranceName,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      doctorLicense: currentUser.medicalLicense || 'MN 142.890',
      date: new Date().toISOString().split('T')[0],
      validUntil,
      diagnosis: rxDiagnosis,
      items: rxItems
    });

    setModalState({
      isOpen: true,
      type: 'PRESCRIPTION',
      data: rx
    });
  };

  // Submit Lab Order
  const handleEmitLabOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const order = storageService.saveLabOrder({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientDni: selectedPatient.dni,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      doctorLicense: currentUser.medicalLicense || 'MN 142.890',
      date: new Date().toISOString().split('T')[0],
      studyType,
      priority,
      requestedStudies,
      clinicalIndication,
      status: 'PENDIENTE'
    });

    setModalState({
      isOpen: true,
      type: 'LAB_ORDER',
      data: order
    });
  };

  // Toggle study selection
  const toggleStudy = (studyName: string) => {
    setRequestedStudies(prev => {
      if (prev.includes(studyName)) {
        return prev.filter(s => s !== studyName);
      }
      return [...prev, studyName];
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
          <span>RF-09</span>
          <span>·</span>
          <span className="uppercase">Emisión de Recetas y Órdenes Médicas</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mt-1">
          Generador de Recetas Digitales y Solicitudes de Estudios
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Emita prescripciones farmacológicas con firma digital y código QR, u órdenes de prácticas diagnósticas con validez institucional.
        </p>
      </div>

      {/* Patient Picker & Mode Toggle */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 min-w-[280px]">
          <label className="font-semibold text-slate-700">Paciente:</label>
          <select
            value={selectedPatientId}
            onChange={e => setSelectedPatientId(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} (DNI: {p.dni} - {p.insuranceName || 'Particular'})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setMode('RECETA')}
            className={`px-4 py-1.5 rounded-md font-semibold cursor-pointer transition-colors ${
              mode === 'RECETA' ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Receta Farmacológica
          </button>
          <button
            onClick={() => setMode('ORDEN')}
            className={`px-4 py-1.5 rounded-md font-semibold cursor-pointer transition-colors ${
              mode === 'ORDEN' ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Orden de Estudios / Lab
          </button>
        </div>
      </div>

      {/* MODE 1: RECETA ELECTRÓNICA */}
      {mode === 'RECETA' && (
        <form onSubmit={handleEmitPrescription} className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-cyan-700" />
                <h2 className="text-sm font-semibold text-slate-900">Rp / Medicamentos Prescritos</h2>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-500 mr-1">Rápidos:</span>
                {COMMON_MEDS.slice(0, 3).map((m, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddRxItem(m)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold cursor-pointer"
                  >
                    + {m.med}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Diagnóstico Clínico / Justificación *</label>
              <input
                type="text"
                required
                value={rxDiagnosis}
                onChange={e => setRxDiagnosis(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-semibold"
              />
            </div>

            <div className="space-y-3 pt-2">
              {rxItems.map((item, idx) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">Fármaco #{idx + 1}</span>
                    {rxItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRxItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Nombre Comercial / Genérico *</label>
                      <input
                        type="text"
                        required
                        value={item.medication}
                        onChange={e => handleUpdateRxItem(item.id, 'medication', e.target.value)}
                        placeholder="Ej. Enalapril"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Presentación *</label>
                      <input
                        type="text"
                        required
                        value={item.presentation}
                        onChange={e => handleUpdateRxItem(item.id, 'presentation', e.target.value)}
                        placeholder="Ej. 10 mg comp. x 30"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Posología / Dosis *</label>
                      <input
                        type="text"
                        required
                        value={item.dosage}
                        onChange={e => handleUpdateRxItem(item.id, 'dosage', e.target.value)}
                        placeholder="Ej. 1 comp cada 24 hs"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Duración Tratamiento *</label>
                      <input
                        type="text"
                        required
                        value={item.duration}
                        onChange={e => handleUpdateRxItem(item.id, 'duration', e.target.value)}
                        placeholder="Ej. 30 días"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Indicaciones al paciente</label>
                    <input
                      type="text"
                      value={item.instructions}
                      onChange={e => handleUpdateRxItem(item.id, 'instructions', e.target.value)}
                      placeholder="Ej. Tomar en ayunas con vaso completo de agua..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => handleAddRxItem()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Otro Medicamento</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer shadow-xs flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Firmar Electrónicamente y Emitir Receta</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* MODE 2: ORDEN DE ESTUDIOS */}
      {mode === 'ORDEN' && (
        <form onSubmit={handleEmitLabOrder} className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FlaskConical className="w-4 h-4 text-cyan-700" />
              <h2 className="text-sm font-semibold text-slate-900">Solicitud de Estudios Diagnósticos</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Servicio / Tipo de Estudio *</label>
                <select
                  value={studyType}
                  onChange={e => setStudyType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                >
                  <option value="LABORATORIO">Laboratorio Bioquímico Clínico</option>
                  <option value="IMAGENES">Diagnóstico por Imágenes (Rx, TAC, RMN, Eco)</option>
                  <option value="CARDIOLOGIA">Estudios Funcionales Cardiológicos</option>
                  <option value="OTROS">Otras Prácticas Especiales</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Prioridad Clínica</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                >
                  <option value="RUTINA">Rutina (Ambulatorio)</option>
                  <option value="URGENTE">Urgente (Prioridad diagnóstica)</option>
                </select>
              </div>
            </div>

            {/* Common tests selector */}
            <div>
              <span className="block font-medium text-slate-700 mb-1.5">Selección Rápida de Estudios:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {COMMON_STUDIES.map(st => {
                  const isSelected = requestedStudies.includes(st);
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => toggleStudy(st)}
                      className={`p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-50 border-cyan-400 text-cyan-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate pr-1">{st}</span>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        isSelected ? 'bg-cyan-700 text-white' : 'border border-slate-400'
                      }`}>
                        {isSelected ? '✓' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Indicación Diagnóstica / Justificación Médica *</label>
              <textarea
                rows={3}
                required
                value={clinicalIndication}
                onChange={e => setClinicalIndication(e.target.value)}
                placeholder="Explicación clínica de la necesidad del estudio para la obra social / auditoría..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={requestedStudies.length === 0}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold rounded-lg cursor-pointer shadow-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Emitir Orden de Estudio</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Print Document Modal */}
      <PrintModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        data={modalState.data}
      />
    </div>
  );
};
