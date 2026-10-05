export type UserRole = 'PACIENTE' | 'RECEPCIONISTA' | 'MEDICO' | 'ADMINISTRADOR';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  dni: string;
  phone: string;
  status: 'ACTIVO' | 'SUSPENDIDO';
  createdAt: string;
  // Campos específicos de Paciente
  address?: string;
  birthDate?: string;
  insuranceName?: string; // Obra Social / Prepaga
  insuranceNumber?: string; // Número de afiliado
  billingCuit?: string; // CUIT/CUIL para facturación
  // Campos específicos de Médico
  specialtyId?: string;
  specialtyName?: string;
  medicalLicense?: string; // Matrícula profesional
  consultationFee?: number;
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
  icon?: string;
  baseFee: number;
}

export type AppointmentStatus = 
  | 'RESERVADO' 
  | 'CONFIRMADO' 
  | 'EN_ESPERA' 
  | 'EN_CONSULTA' 
  | 'FINALIZADO' 
  | 'CANCELADO'
  | 'BLOQUEADO';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientDni: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  specialtyId: string;
  specialtyName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  status: AppointmentStatus;
  reason: string;
  insuranceName?: string;
  copayAmount: number;
  isPaid: boolean;
  paymentId?: string;
  notes?: string;
  createdAt: string;
}

export interface VitalSigns {
  bloodPressureSys: number; // mmHg
  bloodPressureDia: number; // mmHg
  heartRate: number; // lpm
  temperature: number; // °C
  oxygenSaturation: number; // %
  weightKg: number;
  heightCm: number;
  bmi: number;
}

export interface Allergy {
  id: string;
  substance: string;
  severity: 'LEVE' | 'MODERADA' | 'SEVERA';
  reaction: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  bloodType: string;
  allergies: Allergy[];
  chronicDiseases: string[];
  familyHistory: string;
  surgicalHistory: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  lastUpdated: string;
}

export interface EvolutionNote {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorLicense: string;
  appointmentId?: string;
  date: string; // ISO
  chiefComplaint: string; // Motivo de consulta
  symptoms: string;
  physicalExam: string;
  diagnosisCode: string; // CIE-10 / ICD-10
  diagnosisDescription: string;
  treatmentPlan: string;
  vitalSigns: VitalSigns;
  doctorSignatureHash: string;
}

export interface PrescriptionItem {
  id: string;
  medication: string;
  presentation: string; // ej. 500mg comprimidos
  dosage: string; // ej. 1 cada 8 horas
  duration: string; // ej. 7 días
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientDni: string;
  patientInsurance?: string;
  doctorId: string;
  doctorName: string;
  doctorLicense: string;
  date: string; // ISO
  validUntil: string;
  diagnosis: string;
  items: PrescriptionItem[];
  qrValidationCode: string;
  digitalSignature: string;
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  patientDni: string;
  doctorId: string;
  doctorName: string;
  doctorLicense: string;
  date: string;
  studyType: 'LABORATORIO' | 'IMAGENES' | 'CARDIOLOGIA' | 'OTROS';
  requestedStudies: string[];
  clinicalIndication: string;
  priority: 'RUTINA' | 'URGENTE';
  status: 'PENDIENTE' | 'REALIZADO' | 'CON_RESULTADO';
  resultReport?: string;
  resultDate?: string;
}

export interface DoctorSchedule {
  doctorId: string;
  workingDays: number[]; // 1=Lunes, 2=Martes... 5=Viernes
  startHour: string; // "08:00"
  endHour: string; // "18:00"
  consultationDuration: number; // minutos (ej. 20)
  vacationRanges: {
    startDate: string;
    endDate: string;
    reason: string;
  }[];
  breakRanges: {
    start: string;
    end: string;
  }[];
}

export type PaymentMethod = 'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'TRANSFERENCIA' | 'COBERTURA_100';

export interface PaymentTransaction {
  id: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  patientDni: string;
  receptionistId: string;
  receptionistName: string;
  concept: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  invoiceType: 'FACTURA_B' | 'FACTURA_C' | 'RECIBO_OFICIAL';
  invoiceNumber: string;
  insuranceCoveredAmount: number;
  status: 'PAGADO' | 'ANULADO';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 
    | 'LOGIN'
    | 'LECTURA_FICHA'
    | 'REGISTRO_EVOLUCION'
    | 'EMISION_RECETA'
    | 'ORDEN_ESTUDIO'
    | 'COBRO_CAJA'
    | 'MODIFICACION_TURNO'
    | 'CANCELACION_TURNO'
    | 'ALTA_PACIENTE'
    | 'ALTA_USUARIO'
    | 'MODIFICACION_USUARIO'
    | 'CAMBIO_ESTADO_USUARIO'
    | 'CAMBIO_CONFIGURACION';
  resourceType: 'PACIENTE' | 'TURNO' | 'FICHA_CLINICA' | 'RECETA' | 'USUARIO' | 'CAJA' | 'SISTEMA';
  resourceId: string;
  patientName?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
}

export interface ClinicSettings {
  clinicName: string;
  taxId: string; // CUIT
  address: string;
  phone: string;
  email: string;
  emergencyPhone: string;
  baseGeneralConsultFee: number;
  baseSpecialistConsultFee: number;
  allowOnlineCancellationHours: number; // Límite previo de horas para cancelar
  insurances: {
    id: string;
    name: string;
    copayPercentage: number;
    active: boolean;
  }[];
}
