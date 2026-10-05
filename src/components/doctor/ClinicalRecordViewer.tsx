import React, { useState, useEffect, useMemo } from 'react';
import { User, MedicalRecord, Allergy, EvolutionNote } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { 
  ClipboardList, 
  AlertTriangle, 
  Heart, 
  ShieldAlert, 
  User as UserIcon, 
  Activity, 
  Phone, 
  Plus, 
  Trash2,
  Calendar,
  FileText,
  Search
} from 'lucide-react';

interface ClinicalRecordViewerProps {
  currentUser: User;
  onNavigateToEvolution?: (patientId: string) => void;
}

export const ClinicalRecordViewer: React.FC<ClinicalRecordViewerProps> = ({ 
  currentUser,
  onNavigateToEvolution 
}) => {
  const patients = storageService.getPatients();
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId);
  }, [patients, selectedPatientId]);

  const medicalRecord = useMemo(() => {
    if (!selectedPatientId) return null;
    return storageService.getMedicalRecord(selectedPatientId);
  }, [selectedPatientId]);

  const patientEvolutions = useMemo(() => {
    if (!selectedPatientId) return [];
    return storageService.getEvolutionsByPatient(selectedPatientId);
  }, [selectedPatientId]);

  // Log reading of medical record for RF-12 compliance
  useEffect(() => {
    if (selectedPatientId) {
      storageService.logMedicalRecordRead(selectedPatientId);
    }
  }, [selectedPatientId]);

  // New allergy form
  const [isAddingAllergy, setIsAddingAllergy] = useState(false);
  const [newAllergy, setNewAllergy] = useState<Omit<Allergy, 'id'>>({
    substance: '',
    severity: 'MODERADA',
    reaction: ''
  });

  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicalRecord || !newAllergy.substance.trim()) return;

    const updatedAllergies = [
      ...medicalRecord.allergies,
      {
        ...newAllergy,
        id: `al-${Date.now()}`
      }
    ];

    storageService.updateMedicalRecord({
      ...medicalRecord,
      allergies: updatedAllergies
    });

    setIsAddingAllergy(false);
    setNewAllergy({ substance: '', severity: 'MODERADA', reaction: '' });
  };

  const handleRemoveAllergy = (allergyId: string) => {
    if (!medicalRecord) return;
    const updated = medicalRecord.allergies.filter(a => a.id !== allergyId);
    storageService.updateMedicalRecord({
      ...medicalRecord,
      allergies: updated
    });
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
            <span>RF-07</span>
            <span>·</span>
            <span className="uppercase">Lectura de Ficha e Historia Clínica Electrónica</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Ficha Clínica Digital y Registro de Antecedentes
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Acceso estricto a antecedentes médicos, alergias, enfermedades crónicas y árbol cronológico de consultas.
          </p>
        </div>

        {/* Patient quick selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600">Paciente:</label>
          <select
            value={selectedPatientId}
            onChange={e => setSelectedPatientId(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-cyan-600"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} (DNI: {p.dni} - {p.insuranceName || 'Particular'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPatient && medicalRecord && (
        <div className="space-y-6">
          {/* Patient Master Info Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-base">
                {selectedPatient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedPatient.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-0.5">
                  <span>DNI: <b className="font-mono">{selectedPatient.dni}</b></span>
                  <span>·</span>
                  <span>F. Nac: <b>{selectedPatient.birthDate || 'No consignada'}</b></span>
                  <span>·</span>
                  <span>Grupo Sanguíneo: <b className="text-rose-700">{medicalRecord.bloodType}</b></span>
                  <span>·</span>
                  <span>Cobertura: <b>{selectedPatient.insuranceName || 'Particular'}</b> ({selectedPatient.insuranceNumber || 'S/N'})</span>
                </div>
              </div>
            </div>

            {onNavigateToEvolution && (
              <button
                onClick={() => onNavigateToEvolution(selectedPatient.id)}
                className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Activity className="w-4 h-4" />
                <span>Registrar Nueva Evolución</span>
              </button>
            )}
          </div>

          {/* CRITICAL ALERT: Allergies Box */}
          <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>ALERTA CLÍNICA: Alergias Medicamentosas y Sustancias</span>
              </div>
              <button
                onClick={() => setIsAddingAllergy(!isAddingAllergy)}
                className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingAllergy ? 'Cancelar' : 'Agregar Alergia'}</span>
              </button>
            </div>

            {medicalRecord.allergies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {medicalRecord.allergies.map(al => (
                  <div
                    key={al.id}
                    className="p-3 bg-white rounded-lg border border-rose-200 text-xs shadow-xs flex justify-between items-start"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{al.substance}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          al.severity === 'SEVERA' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {al.severity}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1">{al.reaction}</p>
                    </div>

                    <button
                      onClick={() => handleRemoveAllergy(al.id)}
                      className="text-slate-300 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-rose-700 italic">
                El paciente no tiene alergias medicamentosas o alimentarias consignadas en su ficha médica.
              </div>
            )}

            {/* Add Allergy Inline Form */}
            {isAddingAllergy && (
              <form onSubmit={handleAddAllergy} className="bg-white p-4 rounded-lg border border-rose-200 space-y-3 text-xs mt-2">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Sustancia / Fármaco *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Penicilina, AINES, Látex..."
                      value={newAllergy.substance}
                      onChange={e => setNewAllergy(prev => ({ ...prev, substance: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Severidad</label>
                    <select
                      value={newAllergy.severity}
                      onChange={e => setNewAllergy(prev => ({ ...prev, severity: e.target.value as any }))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                    >
                      <option value="LEVE">Leve</option>
                      <option value="MODERADA">Moderada</option>
                      <option value="SEVERA">Severa (Riesgo anafiláctico)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Reacción Observada</label>
                    <input
                      type="text"
                      placeholder="Ej. Edema, eritema, hipotensión..."
                      value={newAllergy.reaction}
                      onChange={e => setNewAllergy(prev => ({ ...prev, reaction: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-rose-700 text-white font-semibold rounded-lg hover:bg-rose-800"
                  >
                    Guardar Alergia
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Grid: Backgrounds & Chronic Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chronic Diseases */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
                <Heart className="w-4 h-4 text-cyan-700" />
                <span>Enfermedades Crónicas y Patologías Previas</span>
              </h3>
              {medicalRecord.chronicDiseases.length > 0 ? (
                <ul className="space-y-1.5">
                  {medicalRecord.chronicDiseases.map((dis, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-800 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-600"></span>
                      <span>{dis}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 italic">Sin patologías crónicas declaradas.</p>
              )}
            </div>

            {/* Family & Surgical History */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
                <ClipboardList className="w-4 h-4 text-cyan-700" />
                <span>Antecedentes Quirúrgicos y Heredofamiliares</span>
              </h3>
              <div className="space-y-2 text-slate-700">
                <div>
                  <span className="font-semibold text-slate-900 block">Quirúrgicos:</span>
                  <p>{medicalRecord.surgicalHistory || 'Sin cirugías reportadas'}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">Heredofamiliares:</span>
                  <p>{medicalRecord.familyHistory || 'Sin antecedentes relevantes'}</p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-900 block flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Contacto de Emergencia:</span>
                  </span>
                  <p className="text-slate-600 mt-0.5">
                    {medicalRecord.emergencyContact.name} ({medicalRecord.emergencyContact.relationship}) - Tel: {medicalRecord.emergencyContact.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Evolutions Timeline */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
              <Activity className="w-4 h-4 text-cyan-700" />
              <span>Línea de Tiempo de Evoluciones y Consultas Anteriores ({patientEvolutions.length})</span>
            </h3>

            {patientEvolutions.length > 0 ? (
              <div className="space-y-4">
                {patientEvolutions.map(evo => (
                  <div
                    key={evo.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{evo.doctorName}</span>
                        <span className="text-slate-500 text-[11px] block">{evo.doctorLicense} · {new Date(evo.date).toLocaleString()}</span>
                      </div>
                      <div className="px-2.5 py-1 bg-cyan-100 text-cyan-900 font-mono font-bold rounded">
                        {evo.diagnosisCode}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 p-2 bg-white rounded border border-slate-200 text-[11px] text-slate-700">
                      <span>PA: <b>{evo.vitalSigns.bloodPressureSys}/{evo.vitalSigns.bloodPressureDia} mmHg</b></span>
                      <span>FC: <b>{evo.vitalSigns.heartRate} lpm</b></span>
                      <span>SpO2: <b>{evo.vitalSigns.oxygenSaturation}%</b></span>
                      <span>IMC: <b>{evo.vitalSigns.bmi}</b></span>
                    </div>

                    <div className="space-y-1">
                      <div>
                        <span className="font-semibold text-slate-900">Diagnóstico: </span>
                        <span className="text-slate-800">{evo.diagnosisDescription}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">Motivo: </span>
                        <span className="text-slate-700">{evo.chiefComplaint}. {evo.symptoms}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">Plan: </span>
                        <span className="text-slate-700">{evo.treatmentPlan}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No hay notas de evolución registradas para este paciente.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
