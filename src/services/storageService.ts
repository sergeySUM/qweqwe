import {
  User,
  Specialty,
  Appointment,
  MedicalRecord,
  EvolutionNote,
  Prescription,
  LabOrder,
  DoctorSchedule,
  PaymentTransaction,
  AuditLog,
  ClinicSettings,
  UserRole
} from '../types/hospital';
import {
  INITIAL_USERS,
  INITIAL_SPECIALTIES,
  INITIAL_APPOINTMENTS,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_EVOLUTIONS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_LAB_ORDERS,
  INITIAL_SCHEDULES,
  INITIAL_PAYMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CLINIC_SETTINGS
} from '../data/mockData';
import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

const STORAGE_KEYS = {
  USERS: 'medicore_users',
  SPECIALTIES: 'medicore_specialties',
  APPOINTMENTS: 'medicore_appointments',
  RECORDS: 'medicore_medical_records',
  EVOLUTIONS: 'medicore_evolutions',
  PRESCRIPTIONS: 'medicore_prescriptions',
  LAB_ORDERS: 'medicore_lab_orders',
  SCHEDULES: 'medicore_schedules',
  PAYMENTS: 'medicore_payments',
  AUDIT_LOGS: 'medicore_audit_logs',
  SETTINGS: 'medicore_settings',
  ACTIVE_USER: 'medicore_active_user_id'
};

class HospitalStorageService {
  private users: User[] = [];
  private specialties: Specialty[] = [];
  private appointments: Appointment[] = [];
  private records: MedicalRecord[] = [];
  private evolutions: EvolutionNote[] = [];
  private prescriptions: Prescription[] = [];
  private labOrders: LabOrder[] = [];
  private schedules: DoctorSchedule[] = [];
  private payments: PaymentTransaction[] = [];
  private auditLogs: AuditLog[] = [];
  private settings: ClinicSettings = INITIAL_CLINIC_SETTINGS;
  private activeUserId: string | null = null; // Requiere autenticación
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    this.users = this.load(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.specialties = this.load(STORAGE_KEYS.SPECIALTIES, INITIAL_SPECIALTIES);
    this.appointments = this.load(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    this.records = this.load(STORAGE_KEYS.RECORDS, INITIAL_MEDICAL_RECORDS);
    this.evolutions = this.load(STORAGE_KEYS.EVOLUTIONS, INITIAL_EVOLUTIONS);
    this.prescriptions = this.load(STORAGE_KEYS.PRESCRIPTIONS, INITIAL_PRESCRIPTIONS);
    this.labOrders = this.load(STORAGE_KEYS.LAB_ORDERS, INITIAL_LAB_ORDERS);
    this.schedules = this.load(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
    this.payments = this.load(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    this.auditLogs = this.load(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    this.settings = this.load(STORAGE_KEYS.SETTINGS, INITIAL_CLINIC_SETTINGS);
    
    const storedActiveUser = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (storedActiveUser) {
      const user = this.users.find(u => u.id === storedActiveUser);
      if (user && user.status === 'ACTIVO') {
        this.activeUserId = storedActiveUser;
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
        this.activeUserId = null;
      }
    } else {
      this.activeUserId = null;
    }
  }

  private load<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private persist(key: string, data: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      // Intentar sincronización en Firestore de fondo de forma no bloqueante
      this.syncToFirestore(key, data);
    } catch (e) {
      console.warn('Storage persist error:', e);
    }
  }

  private async syncToFirestore(collectionKey: string, data: unknown) {
    try {
      if (db) {
        const docRef = doc(db, 'hospital_data', collectionKey);
        await setDoc(docRef, { payload: JSON.stringify(data), updatedAt: new Date().toISOString() }, { merge: true });
      }
    } catch {
      // Ignorar errores de Firestore si reglas no lo permiten aún
    }
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // --- Active Session Management & Access Control ---
  public getActiveUser(): User | null {
    if (!this.activeUserId) return null;
    return this.users.find(u => u.id === this.activeUserId) || null;
  }

  public isAuthenticated(): boolean {
    const user = this.getActiveUser();
    return Boolean(user && user.status === 'ACTIVO');
  }

  public setActiveUserId(userId: string): { success: boolean; error?: string; user?: User } {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'Usuario no registrado en el sistema.' };
    }
    if (user.status === 'SUSPENDIDO') {
      return { 
        success: false, 
        error: 'ACCESO DENEGADO: Su cuenta se encuentra suspendida por la Dirección Médica.' 
      };
    }

    this.activeUserId = userId;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, userId);
    this.addAuditLog({
      action: 'LOGIN',
      resourceType: 'SISTEMA',
      resourceId: `session-${Date.now()}`,
      details: `Inicio de sesión autorizado: ${user.name} [Rol: ${user.role}]`
    });
    this.notify();
    return { success: true, user };
  }

  public logout() {
    if (this.activeUserId) {
      const user = this.getActiveUser();
      this.addAuditLog({
        action: 'LOGIN',
        resourceType: 'SISTEMA',
        resourceId: `logout-${Date.now()}`,
        details: `Cierre de sesión de ${user?.name || 'Usuario'}`
      });
    }
    this.activeUserId = null;
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    this.notify();
  }

  // --- RF-12: Auditoría Centralizada ---
  public addAuditLog(params: {
    action: AuditLog['action'];
    resourceType: AuditLog['resourceType'];
    resourceId: string;
    patientName?: string;
    details: string;
  }) {
    const currentUser = this.getActiveUser();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser ? currentUser.id : 'anon',
      userName: currentUser ? currentUser.name : 'Usuario no autenticado',
      userRole: currentUser ? currentUser.role : 'PACIENTE',
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      patientName: params.patientName,
      details: params.details,
      ipAddress: '192.168.1.100',
      userAgent: navigator.userAgent
    };
    this.auditLogs.unshift(newLog);
    this.persist(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
    this.notify();
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  // --- RF-01 & RF-11: Usuarios ---
  public getUsers(): User[] {
    return [...this.users];
  }

  public getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  public getDoctors(): User[] {
    return this.users.filter(u => u.role === 'MEDICO' && u.status === 'ACTIVO');
  }

  public getPatients(): User[] {
    return this.users.filter(u => u.role === 'PACIENTE');
  }

  public saveUser(user: Partial<User> & { name: string; role: UserRole; email: string }): User {
    const isEdit = Boolean(user.id);
    let updatedUser: User;

    if (isEdit && user.id) {
      this.users = this.users.map(u => {
        if (u.id === user.id) {
          updatedUser = { ...u, ...user } as User;
          return updatedUser;
        }
        return u;
      });
      updatedUser = this.users.find(u => u.id === user.id)!;
      this.addAuditLog({
        action: 'MODIFICACION_USUARIO',
        resourceType: 'USUARIO',
        resourceId: updatedUser.id,
        details: `Actualización de datos de ${updatedUser.name} (${updatedUser.role})`
      });
    } else {
      updatedUser = {
        id: `user-${Date.now()}`,
        email: user.email,
        name: user.name,
        role: user.role,
        dni: user.dni || 'Sin DNI',
        phone: user.phone || 'Sin teléfono',
        status: user.status || 'ACTIVO',
        createdAt: new Date().toISOString(),
        address: user.address,
        birthDate: user.birthDate,
        insuranceName: user.insuranceName,
        insuranceNumber: user.insuranceNumber,
        billingCuit: user.billingCuit,
        specialtyId: user.specialtyId,
        specialtyName: user.specialtyName,
        medicalLicense: user.medicalLicense,
        consultationFee: user.consultationFee
      };
      this.users.push(updatedUser);

      // Si es paciente, inicializar su ficha médica
      if (updatedUser.role === 'PACIENTE') {
        this.initPatientMedicalRecord(updatedUser.id);
      }

      // Si es médico, inicializar su agenda
      if (updatedUser.role === 'MEDICO') {
        this.initDoctorSchedule(updatedUser.id);
      }

      this.addAuditLog({
        action: updatedUser.role === 'PACIENTE' ? 'ALTA_PACIENTE' : 'ALTA_USUARIO',
        resourceType: 'USUARIO',
        resourceId: updatedUser.id,
        patientName: updatedUser.role === 'PACIENTE' ? updatedUser.name : undefined,
        details: `Alta en sistema de nuevo usuario: ${updatedUser.name} [Rol: ${updatedUser.role}]`
      });
    }

    this.persist(STORAGE_KEYS.USERS, this.users);
    this.notify();
    return updatedUser;
  }

  public toggleUserStatus(userId: string): User | undefined {
    let updated: User | undefined;
    this.users = this.users.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO';
        updated = { ...u, status: nextStatus };
        return updated;
      }
      return u;
    });
    if (updated) {
      this.addAuditLog({
        action: 'CAMBIO_ESTADO_USUARIO',
        resourceType: 'USUARIO',
        resourceId: userId,
        details: `Estado de cuenta de ${updated.name} cambiado a ${updated.status}`
      });
      this.persist(STORAGE_KEYS.USERS, this.users);
      this.notify();
    }
    return updated;
  }

  // --- RF-02 & RF-04: Turnos & Agenda ---
  public getAppointments(): Appointment[] {
    return [...this.appointments];
  }

  public getAppointmentsByDoctor(doctorId: string): Appointment[] {
    return this.appointments.filter(a => a.doctorId === doctorId);
  }

  public getAppointmentsByPatient(patientId: string): Appointment[] {
    return this.appointments.filter(a => a.patientId === patientId);
  }

  public saveAppointment(data: Omit<Appointment, 'id' | 'createdAt'> & { id?: string }): Appointment {
    const isEdit = Boolean(data.id);
    let apt: Appointment;

    if (isEdit && data.id) {
      this.appointments = this.appointments.map(a => {
        if (a.id === data.id) {
          apt = { ...a, ...data };
          return apt;
        }
        return a;
      });
      apt = this.appointments.find(a => a.id === data.id)!;
      this.addAuditLog({
        action: 'MODIFICACION_TURNO',
        resourceType: 'TURNO',
        resourceId: apt.id,
        patientName: apt.patientName,
        details: `Turno ${apt.id} reprogramado/actualizado para ${apt.date} ${apt.time} con ${apt.doctorName}. Estado: ${apt.status}`
      });
    } else {
      apt = {
        ...data,
        id: `apt-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      this.appointments.push(apt);
      this.addAuditLog({
        action: 'MODIFICACION_TURNO',
        resourceType: 'TURNO',
        resourceId: apt.id,
        patientName: apt.patientName,
        details: `Nuevo turno reservado: ${apt.patientName} con ${apt.doctorName} (${apt.specialtyName}) el ${apt.date} a las ${apt.time}`
      });
    }

    this.persist(STORAGE_KEYS.APPOINTMENTS, this.appointments);
    this.notify();
    return apt;
  }

  public cancelAppointment(appointmentId: string, reason?: string) {
    const apt = this.appointments.find(a => a.id === appointmentId);
    if (apt) {
      apt.status = 'CANCELADO';
      if (reason) apt.notes = `${apt.notes || ''} [Cancelación: ${reason}]`.trim();
      this.addAuditLog({
        action: 'CANCELACION_TURNO',
        resourceType: 'TURNO',
        resourceId: appointmentId,
        patientName: apt.patientName,
        details: `Turno cancelado para ${apt.patientName} (${apt.date} ${apt.time}). Motivo: ${reason || 'Solicitado por usuario'}`
      });
      this.persist(STORAGE_KEYS.APPOINTMENTS, this.appointments);
      this.notify();
    }
  }

  public updateAppointmentStatus(appointmentId: string, status: Appointment['status'], notes?: string) {
    const apt = this.appointments.find(a => a.id === appointmentId);
    if (apt) {
      apt.status = status;
      if (notes) apt.notes = notes;
      this.addAuditLog({
        action: 'MODIFICACION_TURNO',
        resourceType: 'TURNO',
        resourceId: appointmentId,
        patientName: apt.patientName,
        details: `Estado de turno ${appointmentId} modificado a ${status}`
      });
      this.persist(STORAGE_KEYS.APPOINTMENTS, this.appointments);
      this.notify();
    }
  }

  // --- RF-07: Ficha Clínica ---
  public getMedicalRecord(patientId: string): MedicalRecord | undefined {
    let rec = this.records.find(r => r.patientId === patientId);
    if (!rec) {
      rec = this.initPatientMedicalRecord(patientId);
    }
    return rec;
  }

  public logMedicalRecordRead(patientId: string) {
    const patient = this.getUserById(patientId);
    this.addAuditLog({
      action: 'LECTURA_FICHA',
      resourceType: 'FICHA_CLINICA',
      resourceId: `rec-${patientId}`,
      patientName: patient ? patient.name : undefined,
      details: `Lectura de antecedentes y ficha clínica de ${patient ? patient.name : patientId}`
    });
  }

  public updateMedicalRecord(record: MedicalRecord): MedicalRecord {
    record.lastUpdated = new Date().toISOString();
    const idx = this.records.findIndex(r => r.id === record.id || r.patientId === record.patientId);
    if (idx >= 0) {
      this.records[idx] = record;
    } else {
      this.records.push(record);
    }
    const patient = this.getUserById(record.patientId);
    this.addAuditLog({
      action: 'REGISTRO_EVOLUCION',
      resourceType: 'FICHA_CLINICA',
      resourceId: record.id,
      patientName: patient ? patient.name : undefined,
      details: `Actualización de antecedentes, alergias o datos clínicos del paciente ${patient?.name}`
    });
    this.persist(STORAGE_KEYS.RECORDS, this.records);
    this.notify();
    return record;
  }

  private initPatientMedicalRecord(patientId: string): MedicalRecord {
    const newRecord: MedicalRecord = {
      id: `rec-${Date.now()}`,
      patientId,
      bloodType: 'Sin registrar',
      allergies: [],
      chronicDiseases: [],
      familyHistory: 'Sin antecedentes relevantes consignados.',
      surgicalHistory: 'Sin cirugías previas reportadas.',
      emergencyContact: {
        name: 'Sin contacto',
        phone: 'Sin teléfono',
        relationship: 'Familiar'
      },
      lastUpdated: new Date().toISOString()
    };
    this.records.push(newRecord);
    this.persist(STORAGE_KEYS.RECORDS, this.records);
    return newRecord;
  }

  // --- RF-08: Registro de Evolución ---
  public getEvolutionsByPatient(patientId: string): EvolutionNote[] {
    return this.evolutions.filter(e => e.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public saveEvolutionNote(evolution: Omit<EvolutionNote, 'id' | 'date' | 'doctorSignatureHash'> & { id?: string }): EvolutionNote {
    const newEvo: EvolutionNote = {
      ...evolution,
      id: evolution.id || `evo-${Date.now()}`,
      date: new Date().toISOString(),
      doctorSignatureHash: `SIG-${evolution.doctorId.toUpperCase().slice(-5)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    };

    this.evolutions.unshift(newEvo);
    this.persist(STORAGE_KEYS.EVOLUTIONS, this.evolutions);

    // Si tiene appointmentId asociado, actualizar estado del turno a FINALIZADO
    if (newEvo.appointmentId) {
      this.updateAppointmentStatus(newEvo.appointmentId, 'FINALIZADO', `Consulta finalizada con diagnóstico: ${newEvo.diagnosisDescription}`);
    }

    this.addAuditLog({
      action: 'REGISTRO_EVOLUCION',
      resourceType: 'FICHA_CLINICA',
      resourceId: newEvo.id,
      patientName: newEvo.patientName,
      details: `Registro de evolución médica firmado por ${newEvo.doctorName} (Dx: ${newEvo.diagnosisCode} - ${newEvo.diagnosisDescription})`
    });

    this.notify();
    return newEvo;
  }

  // --- RF-03 & RF-09: Recetas y Órdenes de Estudios ---
  public getPrescriptionsByPatient(patientId: string): Prescription[] {
    return this.prescriptions.filter(p => p.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getAllPrescriptions(): Prescription[] {
    return [...this.prescriptions];
  }

  public savePrescription(data: Omit<Prescription, 'id' | 'qrValidationCode' | 'digitalSignature'>): Prescription {
    const rx: Prescription = {
      ...data,
      id: `rx-${Date.now()}`,
      qrValidationCode: `MED-RX-${Math.random().toString(36).substring(2, 8).toUpperCase()}-VAL`,
      digitalSignature: `Firma Digital Oficial - ${data.doctorName} - ${data.doctorLicense}`
    };
    this.prescriptions.unshift(rx);
    this.persist(STORAGE_KEYS.PRESCRIPTIONS, this.prescriptions);

    this.addAuditLog({
      action: 'EMISION_RECETA',
      resourceType: 'RECETA',
      resourceId: rx.id,
      patientName: rx.patientName,
      details: `Emisión de receta electrónica #${rx.id} para ${rx.patientName} (${rx.items.length} medicamentos)`
    });

    this.notify();
    return rx;
  }

  public getLabOrdersByPatient(patientId: string): LabOrder[] {
    return this.labOrders.filter(l => l.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getAllLabOrders(): LabOrder[] {
    return [...this.labOrders];
  }

  public saveLabOrder(data: Omit<LabOrder, 'id'>): LabOrder {
    const order: LabOrder = {
      ...data,
      id: `lab-${Date.now()}`
    };
    this.labOrders.unshift(order);
    this.persist(STORAGE_KEYS.LAB_ORDERS, this.labOrders);

    this.addAuditLog({
      action: 'ORDEN_ESTUDIO',
      resourceType: 'FICHA_CLINICA',
      resourceId: order.id,
      patientName: order.patientName,
      details: `Nueva orden de estudio (${order.studyType}) emitida por ${order.doctorName} para ${order.patientName}`
    });

    this.notify();
    return order;
  }

  // --- RF-10: Configuración de Horario del Médico ---
  public getDoctorSchedule(doctorId: string): DoctorSchedule {
    let sch = this.schedules.find(s => s.doctorId === doctorId);
    if (!sch) {
      sch = this.initDoctorSchedule(doctorId);
    }
    return sch;
  }

  private initDoctorSchedule(doctorId: string): DoctorSchedule {
    const sch: DoctorSchedule = {
      doctorId,
      workingDays: [1, 2, 3, 4, 5],
      startHour: '08:00',
      endHour: '16:00',
      consultationDuration: 30,
      vacationRanges: [],
      breakRanges: [{ start: '12:00', end: '13:00' }]
    };
    this.schedules.push(sch);
    this.persist(STORAGE_KEYS.SCHEDULES, this.schedules);
    return sch;
  }

  public saveDoctorSchedule(schedule: DoctorSchedule): DoctorSchedule {
    const idx = this.schedules.findIndex(s => s.doctorId === schedule.doctorId);
    if (idx >= 0) {
      this.schedules[idx] = schedule;
    } else {
      this.schedules.push(schedule);
    }
    const doc = this.getUserById(schedule.doctorId);
    this.addAuditLog({
      action: 'CAMBIO_CONFIGURACION',
      resourceType: 'SISTEMA',
      resourceId: `sch-${schedule.doctorId}`,
      details: `Configuración de horarios de atención modificada para el médico ${doc?.name || schedule.doctorId}`
    });
    this.persist(STORAGE_KEYS.SCHEDULES, this.schedules);
    this.notify();
    return schedule;
  }

  // --- RF-06: Control de Caja & Facturación ---
  public getPayments(): PaymentTransaction[] {
    return [...this.payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public registerPayment(data: Omit<PaymentTransaction, 'id' | 'date' | 'invoiceNumber' | 'status'> & { invoiceNumber?: string }): PaymentTransaction {
    const num = data.invoiceNumber || `B0001-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const payment: PaymentTransaction = {
      ...data,
      id: `pay-${Date.now()}`,
      date: new Date().toISOString(),
      invoiceNumber: num,
      status: 'PAGADO'
    };

    this.payments.unshift(payment);
    this.persist(STORAGE_KEYS.PAYMENTS, this.payments);

    // Marcar turno como pagado si corresponde
    if (payment.appointmentId) {
      const apt = this.appointments.find(a => a.id === payment.appointmentId);
      if (apt) {
        apt.isPaid = true;
        apt.paymentId = payment.id;
        this.persist(STORAGE_KEYS.APPOINTMENTS, this.appointments);
      }
    }

    this.addAuditLog({
      action: 'COBRO_CAJA',
      resourceType: 'CAJA',
      resourceId: payment.id,
      patientName: payment.patientName,
      details: `Cobro en caja registrado: $${payment.amount.toLocaleString()} (${payment.paymentMethod}) - Comprobante ${payment.invoiceNumber}`
    });

    this.notify();
    return payment;
  }

  // --- RF-13: Configuración General y Especialidades ---
  public getSpecialties(): Specialty[] {
    return [...this.specialties];
  }

  public saveSpecialty(specialty: Omit<Specialty, 'id'> & { id?: string }): Specialty {
    let saved: Specialty;
    if (specialty.id) {
      this.specialties = this.specialties.map(s => {
        if (s.id === specialty.id) {
          saved = { ...s, ...specialty } as Specialty;
          return saved;
        }
        return s;
      });
      saved = this.specialties.find(s => s.id === specialty.id)!;
    } else {
      saved = {
        ...specialty,
        id: `esp-${Date.now()}`
      };
      this.specialties.push(saved);
    }

    this.addAuditLog({
      action: 'CAMBIO_CONFIGURACION',
      resourceType: 'SISTEMA',
      resourceId: saved.id,
      details: `Especialidad ${saved.name} guardada con arancel base $${saved.baseFee.toLocaleString()}`
    });

    this.persist(STORAGE_KEYS.SPECIALTIES, this.specialties);
    this.notify();
    return saved;
  }

  public getSettings(): ClinicSettings {
    return { ...this.settings };
  }

  public saveSettings(newSettings: ClinicSettings) {
    this.settings = newSettings;
    this.persist(STORAGE_KEYS.SETTINGS, this.settings);
    this.addAuditLog({
      action: 'CAMBIO_CONFIGURACION',
      resourceType: 'SISTEMA',
      resourceId: 'clinic-settings',
      details: 'Parámetros institucionales y tarifario general actualizados por Administración'
    });
    this.notify();
  }

  // Backup & Restore (RF-13)
  public exportFullBackup(): string {
    const fullBackup = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      users: this.users,
      specialties: this.specialties,
      appointments: this.appointments,
      records: this.records,
      evolutions: this.evolutions,
      prescriptions: this.prescriptions,
      labOrders: this.labOrders,
      schedules: this.schedules,
      payments: this.payments,
      auditLogs: this.auditLogs,
      settings: this.settings
    };
    return JSON.stringify(fullBackup, null, 2);
  }

  public importFullBackup(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.users && data.specialties && data.appointments) {
        this.users = data.users;
        this.specialties = data.specialties;
        this.appointments = data.appointments;
        this.records = data.records || [];
        this.evolutions = data.evolutions || [];
        this.prescriptions = data.prescriptions || [];
        this.labOrders = data.labOrders || [];
        this.schedules = data.schedules || [];
        this.payments = data.payments || [];
        this.auditLogs = data.auditLogs || [];
        this.settings = data.settings || INITIAL_CLINIC_SETTINGS;

        this.persist(STORAGE_KEYS.USERS, this.users);
        this.persist(STORAGE_KEYS.SPECIALTIES, this.specialties);
        this.persist(STORAGE_KEYS.APPOINTMENTS, this.appointments);
        this.persist(STORAGE_KEYS.RECORDS, this.records);
        this.persist(STORAGE_KEYS.EVOLUTIONS, this.evolutions);
        this.persist(STORAGE_KEYS.PRESCRIPTIONS, this.prescriptions);
        this.persist(STORAGE_KEYS.LAB_ORDERS, this.labOrders);
        this.persist(STORAGE_KEYS.SCHEDULES, this.schedules);
        this.persist(STORAGE_KEYS.PAYMENTS, this.payments);
        this.persist(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
        this.persist(STORAGE_KEYS.SETTINGS, this.settings);

        this.addAuditLog({
          action: 'CAMBIO_CONFIGURACION',
          resourceType: 'SISTEMA',
          resourceId: 'backup-restore',
          details: 'Restauración completa de base de datos desde archivo de respaldo JSON'
        });

        this.notify();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public resetToFactoryMockData() {
    localStorage.clear();
    this.init();
    this.notify();
  }
}

export const storageService = new HospitalStorageService();
