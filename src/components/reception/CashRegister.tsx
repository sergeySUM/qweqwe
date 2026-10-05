import React, { useState, useMemo } from 'react';
import { User, PaymentTransaction, PaymentMethod, Appointment } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { PrintModal } from '../common/PrintModal';
import { 
  Receipt, 
  CreditCard, 
  DollarSign, 
  CheckCircle2, 
  Printer, 
  FileSpreadsheet, 
  ArrowUpRight,
  Wallet,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface CashRegisterProps {
  currentUser: User;
}

export const CashRegister: React.FC<CashRegisterProps> = ({ currentUser }) => {
  const appointments = storageService.getAppointments();
  const patients = storageService.getPatients();
  const payments = storageService.getPayments();

  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TARJETA_DEBITO');
  const [invoiceType, setInvoiceType] = useState<'FACTURA_B' | 'FACTURA_C' | 'RECIBO_OFICIAL'>('FACTURA_B');
  const [customConcept, setCustomConcept] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<number>(3500);

  // Print modal
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    data: PaymentTransaction | null;
  }>({
    isOpen: false,
    data: null
  });

  // Pending payments from appointments
  const pendingAppointments = useMemo(() => {
    return appointments.filter(a => !a.isPaid && a.status !== 'CANCELADO');
  }, [appointments]);

  // Selected appointment details
  const selectedAppointment = useMemo(() => {
    return appointments.find(a => a.id === selectedAppointmentId);
  }, [appointments, selectedAppointmentId]);

  // Daily cash calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayPayments = useMemo(() => {
    return payments.filter(p => p.date.startsWith(todayStr));
  }, [payments, todayStr]);

  const dailyTotals = useMemo(() => {
    let total = 0;
    const byMethod: Record<PaymentMethod, number> = {
      EFECTIVO: 0,
      TARJETA_DEBITO: 0,
      TARJETA_CREDITO: 0,
      TRANSFERENCIA: 0,
      COBERTURA_100: 0
    };

    todayPayments.forEach(p => {
      total += p.amount;
      byMethod[p.paymentMethod] = (byMethod[p.paymentMethod] || 0) + p.amount;
    });

    return { total, byMethod };
  }, [todayPayments]);

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();

    let patientId = '';
    let patientName = '';
    let patientDni = '';
    let concept = customConcept;
    let amount = customAmount;
    let appointmentId: string | undefined = undefined;

    if (selectedAppointment) {
      patientId = selectedAppointment.patientId;
      patientName = selectedAppointment.patientName;
      patientDni = selectedAppointment.patientDni;
      concept = `Copago Consulta ${selectedAppointment.specialtyName} - ${selectedAppointment.doctorName}`;
      amount = selectedAppointment.copayAmount;
      appointmentId = selectedAppointment.id;
    } else {
      patientName = 'Paciente Mostrador';
      patientDni = 'Sin DNI';
      if (!concept) concept = 'Práctica médica ambulatoria';
    }

    const newPayment = storageService.registerPayment({
      appointmentId,
      patientId,
      patientName,
      patientDni,
      receptionistId: currentUser.id,
      receptionistName: currentUser.name,
      concept,
      amount,
      paymentMethod,
      invoiceType,
      insuranceCoveredAmount: 18000
    });

    setSelectedAppointmentId('');
    setCustomConcept('');
    setModalState({ isOpen: true, data: newPayment });
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
          <span>RF-06</span>
          <span>·</span>
          <span className="uppercase">Control de Caja y Facturación Oficial</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mt-1">
          Caja Central, Cobro de Copagos y Emisión de Comprobantes
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Procese cobros de consultas médicas presenciales, gestione métodos de pago y emita comprobantes fiscales con cierre de caja diario.
        </p>
      </div>

      {/* Daily Cash Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Recaudación Total del Día</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            ${dailyTotals.total.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {todayPayments.length} transacciones registradas
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Efectivo en Caja</span>
          <div className="text-xl font-bold text-emerald-700 mt-1 font-mono tabular-nums">
            ${dailyTotals.byMethod.EFECTIVO.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Fondo de caja disponible</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Tarjetas y Débito</span>
          <div className="text-xl font-bold text-blue-700 mt-1 font-mono tabular-nums">
            ${(dailyTotals.byMethod.TARJETA_DEBITO + dailyTotals.byMethod.TARJETA_CREDITO).toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Liquidación automática POS</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Transferencias Bancarias</span>
          <div className="text-xl font-bold text-purple-700 mt-1 font-mono tabular-nums">
            ${dailyTotals.byMethod.TRANSFERENCIA.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Alias: MEDICORE.SALUD</span>
        </div>
      </div>

      {/* Main Grid: Point of Sale vs Transaction Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Register Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Receipt className="w-4 h-4 text-cyan-700" />
            <h2 className="text-sm font-semibold text-slate-900">Procesar Cobro en Caja</h2>
          </div>

          <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
            {/* Select pending appointment */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Turno pendiente de pago (Opcional)
              </label>
              <select
                value={selectedAppointmentId}
                onChange={e => {
                  setSelectedAppointmentId(e.target.value);
                  const apt = appointments.find(a => a.id === e.target.value);
                  if (apt) {
                    setCustomAmount(apt.copayAmount);
                    setCustomConcept(`Copago Consulta ${apt.specialtyName}`);
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
              >
                <option value="">Seleccione turno pendiente o ingrese cobro manual...</option>
                {pendingAppointments.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.patientName} · {a.doctorName} (${a.copayAmount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Concept */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Concepto del Cobro *</label>
              <input
                type="text"
                required
                value={customConcept}
                onChange={e => setCustomConcept(e.target.value)}
                placeholder="Ej. Copago Consulta Cardiología / Certificado"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Monto a Cobrar ($) *</label>
              <input
                type="number"
                required
                min={0}
                value={customAmount}
                onChange={e => setCustomAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold text-sm"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Método de Pago *</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'TARJETA_DEBITO', label: 'Débito' },
                  { id: 'EFECTIVO', label: 'Efectivo' },
                  { id: 'TARJETA_CREDITO', label: 'Crédito' },
                  { id: 'TRANSFERENCIA', label: 'Transferencia' }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`py-2 px-3 text-center rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                      paymentMethod === m.id
                        ? 'bg-cyan-700 text-white border-cyan-800'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Invoice Type */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tipo de Comprobante Fiscal</label>
              <select
                value={invoiceType}
                onChange={e => setInvoiceType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
              >
                <option value="FACTURA_B">Factura B (Consumidor Final)</option>
                <option value="FACTURA_C">Factura C (Exento / Convenio)</option>
                <option value="RECIBO_OFICIAL">Recibo Oficial Sanatorial</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-4"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Registrar Cobro y Emitir Comprobante</span>
            </button>
          </form>
        </div>

        {/* Right Column: Ledger & Receipts (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Historial de Comprobantes Emitidos</h2>
            <span className="text-xs text-slate-500 font-mono">
              Operador: {currentUser.name}
            </span>
          </div>

          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                    <th className="pb-2">N° Comprobante</th>
                    <th className="pb-2">Paciente</th>
                    <th className="pb-2">Método</th>
                    <th className="pb-2 text-right">Monto</th>
                    <th className="pb-2 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map(pay => (
                    <tr key={pay.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 font-mono text-slate-900 font-semibold">
                        <div>{pay.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-400">{pay.invoiceType}</div>
                      </td>
                      <td className="py-2.5">
                        <div className="font-semibold text-slate-900">{pay.patientName}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{pay.concept}</div>
                      </td>
                      <td className="py-2.5">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {pay.paymentMethod.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold tabular-nums text-slate-900">
                        ${pay.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => setModalState({ isOpen: true, data: pay })}
                          className="p-1.5 text-slate-600 hover:text-cyan-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Imprimir Comprobante"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No hay cobros registrados en el sistema todavía.
            </div>
          )}
        </div>
      </div>

      {/* Print Document Modal */}
      <PrintModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, data: null })}
        type="RECEIPT"
        data={modalState.data}
      />
    </div>
  );
};
