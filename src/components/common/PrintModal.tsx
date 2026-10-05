import React from 'react';
import { X, Printer, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Prescription, LabOrder, PaymentTransaction, EvolutionNote } from '../../types/hospital';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'PRESCRIPTION' | 'LAB_ORDER' | 'RECEIPT' | 'EVOLUTION';
  data: Prescription | LabOrder | PaymentTransaction | EvolutionNote | null;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  type,
  data
}) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    let content = '';
    let filename = 'documento.txt';

    if (type === 'PRESCRIPTION') {
      const rx = data as Prescription;
      filename = `Receta-${rx.id}.txt`;
      content = `SANATORIO METROPOLITANO MEDICORE\nRECETA MÉDICA DIGITAL #${rx.id}\nFecha: ${rx.date}\nPaciente: ${rx.patientName} (DNI: ${rx.patientDni})\nCobertura: ${rx.patientInsurance || 'Particular'}\nDiagnóstico: ${rx.diagnosis}\n\nMEDICAMENTOS:\n` +
        rx.items.map((it, i) => `${i + 1}. ${it.medication} - ${it.presentation}\n   Dosis: ${it.dosage} | Duración: ${it.duration}\n   Indicaciones: ${it.instructions}\n`).join('\n') +
        `\nMédico: ${rx.doctorName} (Matrícula: ${rx.doctorLicense})\nFirma Digital: ${rx.digitalSignature}\nCódigo de Validación: ${rx.qrValidationCode}`;
    } else if (type === 'RECEIPT') {
      const pay = data as PaymentTransaction;
      filename = `Comprobante-${pay.invoiceNumber}.txt`;
      content = `SANATORIO METROPOLITANO MEDICORE - CUIT 30-71458922-8\nCOMPROBANTE FISCAL: ${pay.invoiceType} N° ${pay.invoiceNumber}\nFecha: ${new Date(pay.date).toLocaleString()}\nPaciente: ${pay.patientName} (DNI: ${pay.patientDni})\nConcepto: ${pay.concept}\nMonto Abonado: $${pay.amount.toLocaleString()}\nMétodo de Pago: ${pay.paymentMethod}\nAtendido por: ${pay.receptionistName}\nEstado: APROBADO`;
    } else if (type === 'LAB_ORDER') {
      const lab = data as LabOrder;
      filename = `OrdenEstudio-${lab.id}.txt`;
      content = `SANATORIO METROPOLITANO MEDICORE\nORDEN DE ESTUDIOS MÉDICOS #${lab.id}\nFecha: ${lab.date}\nPaciente: ${lab.patientName} (DNI: ${lab.patientDni})\nTipo: ${lab.studyType}\nPrioridad: ${lab.priority}\nEstudios Solicitados:\n` +
        lab.requestedStudies.map(s => `- ${s}`).join('\n') +
        `\n\nIndicación Clínica: ${lab.clinicalIndication}\nMédico Solicitante: ${lab.doctorName} (${lab.doctorLicense})`;
    } else if (type === 'EVOLUTION') {
      const evo = data as EvolutionNote;
      filename = `Evolucion-${evo.id}.txt`;
      content = `HISTORIA CLÍNICA - NOTA DE EVOLUCIÓN\nFecha: ${new Date(evo.date).toLocaleString()}\nPaciente: ${evo.patientName}\nMédico: ${evo.doctorName} (${evo.doctorLicense})\nMotivo: ${evo.chiefComplaint}\nSignos Vitales: PA ${evo.vitalSigns.bloodPressureSys}/${evo.vitalSigns.bloodPressureDia} mmHg, FC ${evo.vitalSigns.heartRate} lpm, Temp ${evo.vitalSigns.temperature}°C, SpO2 ${evo.vitalSigns.oxygenSaturation}%\nDiagnóstico: ${evo.diagnosisCode} - ${evo.diagnosisDescription}\nPlan: ${evo.treatmentPlan}`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Modal Controls Header (hidden in print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <span>Vista de Documento Oficial</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-normal">MediCore Health Network</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={handleDownloadText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 text-slate-800 text-sm bg-white">
          {/* Document Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                SANATORIO METROPOLITANO MEDICORE
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Av. Libertador 4890, CABA · Tel: +54 11 4780-5000 · CUIT: 30-71458922-8
              </p>
              <p className="text-xs text-slate-500">
                Habilitación Ministerial de Salud N° 4492-MSAL
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-500 block">
                {type === 'PRESCRIPTION' && 'RECETA DIGITAL'}
                {type === 'LAB_ORDER' && 'ORDEN DE ESTUDIO'}
                {type === 'RECEIPT' && 'COMPROBANTE OFICIAL'}
                {type === 'EVOLUTION' && 'INFORME DE CONSULTA'}
              </span>
              <span className="text-sm font-mono font-semibold text-slate-900">
                {type === 'RECEIPT' ? (data as PaymentTransaction).invoiceNumber : `#${data.id}`}
              </span>
            </div>
          </div>

          {/* PRESCRIPTION VIEW */}
          {type === 'PRESCRIPTION' && (() => {
            const rx = data as Prescription;
            return (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block">Paciente:</span>
                    <span className="font-semibold text-slate-900 text-sm">{rx.patientName}</span>
                    <span className="text-slate-600 block mt-0.5">DNI: {rx.patientDni}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Cobertura Médica:</span>
                    <span className="font-medium text-slate-800">{rx.patientInsurance || 'Particular'}</span>
                    <span className="text-slate-500 block mt-0.5">Fecha emisión: {rx.date}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200">
                    <span className="text-slate-500 block">Diagnóstico Presuntivo / CIE-10:</span>
                    <span className="font-medium text-slate-800">{rx.diagnosis}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-3 border-b border-slate-200 pb-1">
                    Rp / Medicación Prescrita
                  </h4>
                  <div className="space-y-4">
                    {rx.items.map((item, idx) => (
                      <div key={item.id} className="border-l-2 border-cyan-600 pl-3">
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-900">
                            {idx + 1}. {item.medication}
                          </span>
                          <span className="text-xs text-slate-600 font-medium">
                            {item.presentation}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 mt-1">
                          <span className="font-semibold">Posología:</span> {item.dosage} · <span className="font-semibold">Duración:</span> {item.duration}
                        </div>
                        <div className="text-xs text-slate-500 italic mt-0.5">
                          Indicaciones: {item.instructions}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded flex flex-col items-center justify-center p-1 text-center">
                      <span className="text-[8px] font-mono leading-tight text-slate-600">VALIDACIÓN QR</span>
                      <div className="w-10 h-10 border border-slate-400 bg-white flex items-center justify-center text-[7px] font-mono mt-0.5 text-center text-slate-700">
                        QR OK
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 space-y-0.5">
                      <div className="flex items-center gap-1 text-emerald-700 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Firma Digital Verificada</span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">{rx.qrValidationCode}</div>
                      <div>Válido hasta: {rx.validUntil}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="inline-block border-b border-slate-800 pb-1 mb-1 w-44">
                      <span className="font-serif italic text-sm text-slate-700 block">Dr. M. Morales</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900">{rx.doctorName}</div>
                    <div className="text-xs text-slate-600">{rx.doctorLicense}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* LAB ORDER VIEW */}
          {type === 'LAB_ORDER' && (() => {
            const lab = data as LabOrder;
            return (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block">Paciente:</span>
                    <span className="font-semibold text-slate-900 text-sm">{lab.patientName}</span>
                    <span className="text-slate-600 block mt-0.5">DNI: {lab.patientDni}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Médico Solicitante:</span>
                    <span className="font-semibold text-slate-900">{lab.doctorName}</span>
                    <span className="text-slate-600 block mt-0.5">{lab.doctorLicense}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-1">
                    <h4 className="font-semibold text-slate-900 text-sm">
                      Prácticas y Estudios Solicitados ({lab.studyType})
                    </h4>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Prioridad: {lab.priority}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {lab.requestedStudies.map((study, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-800 text-xs font-medium">
                        <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                        <span>{study}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                  <span className="text-slate-500 block font-semibold mb-1">Indicación Diagnóstica / Justificación Clínica:</span>
                  <p className="text-slate-700">{lab.clinicalIndication}</p>
                </div>

                {lab.resultReport && (
                  <div className="bg-emerald-50/60 p-4 rounded-lg border border-emerald-200 text-xs">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-emerald-900">Informe de Resultados Adjunto</span>
                      <span className="text-emerald-700 font-mono text-[11px]">Fecha: {lab.resultDate}</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed font-sans">{lab.resultReport}</p>
                  </div>
                )}

                <div className="pt-8 border-t border-slate-200 flex justify-between items-end">
                  <div className="text-xs text-slate-400">
                    Documento emitido electrónicamente por el Sistema Hospitalario MediCore.
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900 text-xs">{lab.doctorName}</div>
                    <div className="text-xs text-slate-500">{lab.doctorLicense}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* CASH RECEIPT VIEW */}
          {type === 'RECEIPT' && (() => {
            const pay = data as PaymentTransaction;
            return (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block">Comprobante Oficial:</span>
                    <span className="font-bold text-slate-900 text-base">{pay.invoiceType}</span>
                    <span className="text-slate-600 block font-mono">N° {pay.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Fecha y Hora de Emisión:</span>
                    <span className="font-medium text-slate-800">{new Date(pay.date).toLocaleString()}</span>
                    <span className="text-slate-500 block mt-0.5">Operador: {pay.receptionistName}</span>
                  </div>
                </div>

                <div className="text-xs border-b border-slate-200 pb-3">
                  <span className="text-slate-500 block mb-1">Datos del Paciente / Titular:</span>
                  <div className="font-semibold text-slate-900 text-sm">{pay.patientName}</div>
                  <div className="text-slate-600">DNI: {pay.patientDni} · Condición ante IVA: Consumidor Final</div>
                </div>

                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-500 text-left">
                      <th className="pb-2 font-medium">Concepto</th>
                      <th className="pb-2 font-medium text-right">Monto Cobertura</th>
                      <th className="pb-2 font-medium text-right">Copago Abonado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 font-medium text-slate-900">{pay.concept}</td>
                      <td className="py-3 text-right tabular-nums text-slate-600">
                        ${pay.insuranceCoveredAmount ? pay.insuranceCoveredAmount.toLocaleString() : '0'}
                      </td>
                      <td className="py-3 text-right tabular-nums font-bold text-slate-900">
                        ${pay.amount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-900">
                      <td colSpan={2} className="pt-3 font-bold text-slate-900 text-right">
                        TOTAL ABONADO:
                      </td>
                      <td className="pt-3 font-bold text-slate-900 text-right text-base tabular-nums">
                        ${pay.amount.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 block">Forma de Pago:</span>
                    <span className="font-bold text-slate-900">{pay.paymentMethod.replace('_', ' ')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      OPERACIÓN APROBADA
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* EVOLUTION NOTE VIEW */}
          {type === 'EVOLUTION' && (() => {
            const evo = data as EvolutionNote;
            return (
              <div className="space-y-5 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block">Paciente:</span>
                    <span className="font-semibold text-slate-900 text-sm">{evo.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Médico Tratante:</span>
                    <span className="font-semibold text-slate-900">{evo.doctorName}</span>
                    <span className="text-slate-600 block">{evo.doctorLicense}</span>
                  </div>
                  <div className="col-span-2 text-slate-500">
                    Fecha y Hora: {new Date(evo.date).toLocaleString()}
                  </div>
                </div>

                <div className="border border-slate-200 rounded p-3 bg-white">
                  <span className="font-semibold text-slate-900 block mb-1">Signos Vitales Registrados</span>
                  <div className="grid grid-cols-4 gap-2 text-slate-700">
                    <div>PA: <span className="font-semibold">{evo.vitalSigns.bloodPressureSys}/{evo.vitalSigns.bloodPressureDia} mmHg</span></div>
                    <div>FC: <span className="font-semibold">{evo.vitalSigns.heartRate} lpm</span></div>
                    <div>Temp: <span className="font-semibold">{evo.vitalSigns.temperature}°C</span></div>
                    <div>SpO2: <span className="font-semibold">{evo.vitalSigns.oxygenSaturation}%</span></div>
                    <div>Peso: <span className="font-semibold">{evo.vitalSigns.weightKg} kg</span></div>
                    <div>Talla: <span className="font-semibold">{evo.vitalSigns.heightCm} cm</span></div>
                    <div>IMC: <span className="font-semibold">{evo.vitalSigns.bmi}</span></div>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-900 block">Motivo de Consulta y Síntomas:</span>
                  <p className="text-slate-700 mt-1">{evo.chiefComplaint}. {evo.symptoms}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-900 block">Examen Físico:</span>
                  <p className="text-slate-700 mt-1">{evo.physicalExam}</p>
                </div>

                <div className="bg-cyan-50/50 p-3 rounded border border-cyan-200">
                  <span className="font-semibold text-cyan-950 block">Diagnóstico Principal (CIE-10):</span>
                  <p className="font-bold text-cyan-900 mt-0.5">{evo.diagnosisCode} - {evo.diagnosisDescription}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-900 block">Plan Terapéutico y Conducta:</span>
                  <p className="text-slate-700 mt-1">{evo.treatmentPlan}</p>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-slate-400">
                  <span className="font-mono text-[10px]">HASH: {evo.doctorSignatureHash}</span>
                  <span className="text-slate-800 font-semibold">{evo.doctorName}</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
