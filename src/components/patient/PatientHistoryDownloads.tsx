import React, { useState } from 'react';
import { User, Prescription, LabOrder, EvolutionNote } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { PrintModal } from '../common/PrintModal';
import { 
  FileText, 
  Pill, 
  FlaskConical, 
  Download, 
  Eye, 
  Printer, 
  ShieldCheck, 
  Calendar,
  Activity,
  FileCheck2
} from 'lucide-react';

interface PatientHistoryDownloadsProps {
  patient: User;
}

export const PatientHistoryDownloads: React.FC<PatientHistoryDownloadsProps> = ({ patient }) => {
  const [activeSubTab, setActiveSubTab] = useState<'prescriptions' | 'lab_orders' | 'evolutions'>('prescriptions');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'PRESCRIPTION' | 'LAB_ORDER' | 'RECEIPT' | 'EVOLUTION';
    data: Prescription | LabOrder | EvolutionNote | null;
  }>({
    isOpen: false,
    type: 'PRESCRIPTION',
    data: null
  });

  const prescriptions = storageService.getPrescriptionsByPatient(patient.id);
  const labOrders = storageService.getLabOrdersByPatient(patient.id);
  const evolutions = storageService.getEvolutionsByPatient(patient.id);

  const openDocument = (type: 'PRESCRIPTION' | 'LAB_ORDER' | 'EVOLUTION', data: Prescription | LabOrder | EvolutionNote) => {
    setModalState({
      isOpen: true,
      type,
      data
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
          <span>RF-03</span>
          <span>·</span>
          <span className="uppercase">Descarga de Historial Clínico, Recetas y Órdenes</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mt-1">
          Mi Historial Médico, Recetas Electrónicas y Estudios
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Consulte y descargue en formato oficial sus recetas digitales firmadas, órdenes médicas para laboratorios y resultados diagnósticos.
        </p>
      </div>

      {/* Sub-tab segmented control */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('prescriptions')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'prescriptions'
              ? 'border-cyan-700 text-cyan-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Recetas Electrónicas ({prescriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('lab_orders')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'lab_orders'
              ? 'border-cyan-700 text-cyan-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Órdenes y Resultados ({labOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('evolutions')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'evolutions'
              ? 'border-cyan-700 text-cyan-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Evoluciones Clínicas ({evolutions.length})</span>
        </button>
      </div>

      {/* Content Area */}
      {/* 1. Recetas Digitales */}
      {activeSubTab === 'prescriptions' && (
        <div className="space-y-4">
          {prescriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map(rx => (
                <div
                  key={rx.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 hover:border-cyan-300 transition-colors"
                >
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Fecha: {rx.date}</span>
                        <span className="text-slate-300">·</span>
                        <span className="font-mono text-cyan-700">#{rx.id}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{rx.doctorName}</h3>
                      <p className="text-[11px] text-slate-500">{rx.doctorLicense}</p>
                    </div>

                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Firma Válida</span>
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="text-slate-600 font-medium">
                      Diagnóstico: <span className="text-slate-900 font-semibold">{rx.diagnosis}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-2">
                      {rx.items.map((it, idx) => (
                        <div key={it.id} className="text-xs">
                          <span className="font-bold text-slate-800">{idx + 1}. {it.medication}</span> ({it.presentation})
                          <div className="text-slate-600 text-[11px]">{it.dosage} · {it.duration}</div>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      Vencimiento: {rx.validUntil}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 font-mono truncate max-w-[150px]">
                      {rx.qrValidationCode}
                    </span>

                    <button
                      onClick={() => openDocument('PRESCRIPTION', rx)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Ver / Descargar Receta</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500 text-xs">
              No posee recetas electrónicas activas o emitidas en su cuenta.
            </div>
          )}
        </div>
      )}

      {/* 2. Órdenes y Estudios */}
      {activeSubTab === 'lab_orders' && (
        <div className="space-y-4">
          {labOrders.length > 0 ? (
            <div className="space-y-3">
              {labOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900 text-sm">
                          Orden #{order.id} · {order.studyType}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">{order.date}</span>
                      </div>
                      <span className="text-xs text-slate-600 block mt-0.5">
                        Solicitado por: <span className="font-semibold">{order.doctorName}</span> ({order.doctorLicense})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        order.status === 'CON_RESULTADO'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {order.status === 'CON_RESULTADO' ? 'Resultado Disponible' : 'Pendiente de Realización'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs space-y-2">
                    <div>
                      <span className="text-slate-500 block mb-1">Prácticas solicitadas:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {order.requestedStudies.map((s, i) => (
                          <span key={i} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {order.resultReport && (
                      <div className="bg-emerald-50/70 p-3.5 rounded-lg border border-emerald-200 text-xs mt-2">
                        <span className="font-bold text-emerald-950 block mb-1">
                          Informe Diagnóstico ({order.resultDate}):
                        </span>
                        <p className="text-slate-800 font-sans leading-relaxed">
                          {order.resultReport}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => openDocument('LAB_ORDER', order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{order.resultReport ? 'Descargar Informe Completo' : 'Imprimir Orden Médica'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500 text-xs">
              No posee órdenes médicas o informes diagnósticos registrados.
            </div>
          )}
        </div>
      )}

      {/* 3. Evoluciones Médicas */}
      {activeSubTab === 'evolutions' && (
        <div className="space-y-4">
          {evolutions.length > 0 ? (
            <div className="space-y-3">
              {evolutions.map(evo => (
                <div
                  key={evo.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <div className="text-xs text-slate-500">
                        {new Date(evo.date).toLocaleString()} · Nota Clínica #{evo.id}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5">{evo.doctorName}</h3>
                      <p className="text-[11px] text-slate-500">{evo.doctorLicense}</p>
                    </div>

                    <div className="bg-cyan-50 px-2.5 py-1 rounded text-cyan-900 font-mono text-xs font-bold border border-cyan-200">
                      {evo.diagnosisCode}
                    </div>
                  </div>

                  <div className="text-xs space-y-2 text-slate-700">
                    <div>
                      <span className="font-semibold text-slate-900">Diagnóstico: </span>
                      {evo.diagnosisDescription}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Motivo: </span>
                      {evo.chiefComplaint}
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px] grid grid-cols-4 gap-2">
                      <span>PA: <b>{evo.vitalSigns.bloodPressureSys}/{evo.vitalSigns.bloodPressureDia}</b></span>
                      <span>FC: <b>{evo.vitalSigns.heartRate} lpm</b></span>
                      <span>SpO2: <b>{evo.vitalSigns.oxygenSaturation}%</b></span>
                      <span>IMC: <b>{evo.vitalSigns.bmi}</b></span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Indicaciones: </span>
                      {evo.treatmentPlan}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      onClick={() => openDocument('EVOLUTION', evo)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Ver Resumen de Consulta</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500 text-xs">
              No posee evoluciones médicas asentadas.
            </div>
          )}
        </div>
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
