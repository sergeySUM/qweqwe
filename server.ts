import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'hospital-db.json');

const ALLOWED_COLLECTION_KEYS = new Set([
  'medicore_users',
  'medicore_specialties',
  'medicore_appointments',
  'medicore_medical_records',
  'medicore_evolutions',
  'medicore_prescriptions',
  'medicore_lab_orders',
  'medicore_schedules',
  'medicore_payments',
  'medicore_audit_logs',
  'medicore_settings'
]);

interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: 'PACIENTE' | 'RECEPCIONISTA' | 'MEDICO' | 'ADMINISTRADOR';
  dni: string;
  phone: string;
  status: 'ACTIVO' | 'SUSPENDIDO';
  createdAt: string;
  plainPassword?: string;
  passwordHash?: string;
  authProvider?: 'google' | 'local';
  [key: string]: unknown;
}

interface HospitalDbState {
  version: number;
  updatedAt: string;
  data: {
    medicore_users: StoredUser[];
    medicore_specialties: Record<string, unknown>[];
    medicore_appointments: Record<string, unknown>[];
    medicore_medical_records: Record<string, unknown>[];
    medicore_evolutions: Record<string, unknown>[];
    medicore_prescriptions: Record<string, unknown>[];
    medicore_lab_orders: Record<string, unknown>[];
    medicore_schedules: Record<string, unknown>[];
    medicore_payments: Record<string, unknown>[];
    medicore_audit_logs: Record<string, unknown>[];
    medicore_settings: Record<string, unknown>;
  };
}

function hashPasswordNode(password: string): string {
  return crypto
    .createHash('sha256')
    .update(`medicore_salt_v1:${password}`)
    .digest('hex');
}

function createInitialDbState(): HospitalDbState {
  const initialUsers: StoredUser[] = [
    {
      id: 'user-admin-seter',
      email: 'seter7712@gmail.com',
      name: 'Seter (Administrador Principal)',
      role: 'ADMINISTRADOR',
      dni: '28771200',
      phone: '+54 11 9988-7712',
      status: 'ACTIVO',
      authProvider: 'google',
      plainPassword: 'AdminSeter#2026',
      passwordHash: hashPasswordNode('AdminSeter#2026'),
      createdAt: '2025-01-01T08:00:00.000Z'
    },
    {
      id: 'user-recep-1',
      email: 'recepcion@medicore.com',
      name: 'Ana Beltrán',
      role: 'RECEPCIONISTA',
      dni: '35210984',
      phone: '+54 11 5123-7744',
      status: 'ACTIVO',
      authProvider: 'local',
      plainPassword: 'Recep1#2026',
      passwordHash: hashPasswordNode('Recep1#2026'),
      createdAt: '2025-02-01T08:30:00.000Z'
    },
    {
      id: 'user-recep-2',
      email: 'carlos.recep@medicore.com',
      name: 'Carlos Gómez',
      role: 'RECEPCIONISTA',
      dni: '38192340',
      phone: '+54 11 6789-1122',
      status: 'ACTIVO',
      authProvider: 'local',
      plainPassword: 'Recep2#2026',
      passwordHash: hashPasswordNode('Recep2#2026'),
      createdAt: '2025-03-15T09:00:00.000Z'
    },
    {
      id: 'user-doc-1',
      email: 'dr.morales@medicore.com',
      name: 'Dr. Martín Morales',
      role: 'MEDICO',
      dni: '26458912',
      phone: '+54 11 4782-9011',
      status: 'ACTIVO',
      authProvider: 'local',
      plainPassword: 'Medico1#2026',
      passwordHash: hashPasswordNode('Medico1#2026'),
      createdAt: '2025-01-15T09:00:00.000Z',
      specialtyId: 'esp-1',
      specialtyName: 'Cardiología',
      medicalLicense: 'MN 142.890',
      consultationFee: 25000
    },
    {
      id: 'user-doc-2',
      email: 'dra.solis@medicore.com',
      name: 'Dra. Valentina Solís',
      role: 'MEDICO',
      dni: '31298450',
      phone: '+54 11 5543-9821',
      status: 'ACTIVO',
      authProvider: 'local',
      plainPassword: 'Medico2#2026',
      passwordHash: hashPasswordNode('Medico2#2026'),
      createdAt: '2025-01-20T10:00:00.000Z',
      specialtyId: 'esp-2',
      specialtyName: 'Pediatría',
      medicalLicense: 'MN 165.432',
      consultationFee: 20000
    },
    {
      id: 'user-pac-1',
      email: 'lucia.fernandez@gmail.com',
      name: 'Lucía Fernández',
      role: 'PACIENTE',
      dni: '36987412',
      phone: '+54 11 5987-1234',
      status: 'ACTIVO',
      authProvider: 'local',
      plainPassword: 'Paciente1#2026',
      passwordHash: hashPasswordNode('Paciente1#2026'),
      createdAt: '2025-03-01T14:20:00.000Z',
      birthDate: '1992-06-14',
      address: 'Av. Corrientes 3450, Piso 4B, CABA',
      insuranceName: 'OSDE 310',
      insuranceNumber: 'OS-984123-01',
      billingCuit: '27-36987412-4'
    },
    {
      id: 'user-pac-2',
      email: 'roberto.mendez@hotmail.com',
      name: 'Roberto Méndez',
      role: 'PACIENTE',
      dni: '24158930',
      phone: '+54 11 6321-9988',
      status: 'ACTIVO',
      authProvider: 'local',
      plainPassword: 'Paciente2#2026',
      passwordHash: hashPasswordNode('Paciente2#2026'),
      createdAt: '2025-03-05T11:15:00.000Z',
      birthDate: '1974-11-28',
      address: 'Calle Juncal 1820, CABA',
      insuranceName: 'Swiss Medical SMG20',
      insuranceNumber: 'SW-458190-02',
      billingCuit: '20-24158930-9'
    }
  ];

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    data: {
      medicore_users: initialUsers,
      medicore_specialties: [
        { id: 'esp-1', name: 'Cardiología', description: 'Prevención, diagnóstico y tratamiento de enfermedades cardiovasculares', baseFee: 25000 },
        { id: 'esp-2', name: 'Pediatría', description: 'Atención médica integral de bebés, niños y adolescentes', baseFee: 20000 },
        { id: 'esp-3', name: 'Traumatología y Ortopedia', description: 'Tratamiento de lesiones musculoesqueléticas y articulares', baseFee: 24000 },
        { id: 'esp-4', name: 'Clínica Médica', description: 'Atención primaria y diagnóstico integral para adultos', baseFee: 18000 },
        { id: 'esp-5', name: 'Dermatología', description: 'Diagnóstico y tratamiento de afecciones de la piel y mucosas', baseFee: 22000 },
        { id: 'esp-6', name: 'Neurología', description: 'Estudio y tratamiento del sistema nervioso central y periférico', baseFee: 28000 },
        { id: 'esp-7', name: 'Oftalmología', description: 'Salud visual, cirugía refractiva y patologías oculares', baseFee: 23000 }
      ],
      medicore_appointments: [],
      medicore_medical_records: [
        {
          id: 'rec-001',
          patientId: 'user-pac-1',
          bloodType: 'A+',
          allergies: [
            { id: 'al-1', substance: 'Penicilina', severity: 'SEVERA', reaction: 'Edema de glotis y erupción dérmica generalizada' },
            { id: 'al-2', substance: 'Ibuprofeno', severity: 'MODERADA', reaction: 'Gastralgia intensa y prurito' }
          ],
          chronicDiseases: ['Hipertensión arterial primaria (Estadio I)', 'Asma leve intermitente'],
          familyHistory: 'Padre con antecedentes de infarto de miocardio a los 58 años. Madre con hipotiroidismo.',
          surgicalHistory: 'Apendicectomía laparoscópica en 2018 sin complicaciones.',
          emergencyContact: { name: 'Mariano Fernández (Hermano)', phone: '+54 11 4455-6677', relationship: 'Hermano' },
          lastUpdated: '2026-10-02T16:00:00.000Z'
        },
        {
          id: 'rec-002',
          patientId: 'user-pac-2',
          bloodType: '0+',
          allergies: [
            { id: 'al-3', substance: 'Mariscos', severity: 'MODERADA', reaction: 'Urticaria facial' }
          ],
          chronicDiseases: ['Dislipidemia mixta', 'Hiperuricemia asintomática'],
          familyHistory: 'Madre diabética tipo 2. Padre con ACV isquémico a los 72 años.',
          surgicalHistory: 'Colecistectomía convencional (2012).',
          emergencyContact: { name: 'Laura Rossi (Esposa)', phone: '+54 11 5566-7788', relationship: 'Cónyuge' },
          lastUpdated: '2026-09-15T11:00:00.000Z'
        }
      ],
      medicore_evolutions: [
        {
          id: 'evo-001',
          patientId: 'user-pac-1',
          patientName: 'Lucía Fernández',
          doctorId: 'user-doc-1',
          doctorName: 'Dr. Martín Morales',
          doctorLicense: 'MN 142.890',
          appointmentId: 'apt-005',
          date: '2026-09-15T11:00:00.000Z',
          chiefComplaint: 'Control evolutivo de presión arterial y fatiga vespertina',
          symptoms: 'Refiere cifras tensionales domiciliarias matutinas de 135/85 mmHg. Sin disnea de esfuerzo ni edemas periféricos.',
          physicalExam: 'Paciente vigil, orientada en tiempo y espacio. R1 y R2 normofonéticos en 4 focos. Silencios libres. Murmullo vesicular conservado bilateralmente.',
          diagnosisCode: 'I10',
          diagnosisDescription: 'Hipertensión esencial (primaria)',
          treatmentPlan: 'Se continúa con Enalapril 10mg diario. Se solicita ecocardiograma transtorácico y perfil lipídico completo. Dieta hiposódica y actividad aeróbica regular.',
          vitalSigns: {
            bloodPressureSys: 132,
            bloodPressureDia: 84,
            heartRate: 72,
            temperature: 36.5,
            oxygenSaturation: 98,
            weightKg: 64,
            heightCm: 165,
            bmi: 23.5
          },
          doctorSignatureHash: 'SIG-DOC1-9F8A21BD7C'
        },
        {
          id: 'evo-002',
          patientId: 'user-pac-2',
          patientName: 'Roberto Méndez',
          doctorId: 'user-doc-1',
          doctorName: 'Dr. Martín Morales',
          doctorLicense: 'MN 142.890',
          date: '2026-08-10T10:15:00.000Z',
          chiefComplaint: 'Revisión de valores de colesterol y triglicéridos elevados',
          symptoms: 'Asintomático desde el punto de vista cardiovascular. Refiere transgresión alimentaria frecuente.',
          physicalExam: 'Buen estado general. Abdomen blando, indoloro. Pulsos periféricos presentes y simétricos.',
          diagnosisCode: 'E78.2',
          diagnosisDescription: 'Hiperlipidemia mixta',
          treatmentPlan: 'Se prescribe Rosuvastatina 10mg cada noche. Pautas higiénico-dietéticas con derivación a nutrición.',
          vitalSigns: {
            bloodPressureSys: 125,
            bloodPressureDia: 80,
            heartRate: 68,
            temperature: 36.4,
            oxygenSaturation: 99,
            weightKg: 82,
            heightCm: 176,
            bmi: 26.5
          },
          doctorSignatureHash: 'SIG-DOC1-44B1C08AE2'
        }
      ],
      medicore_prescriptions: [
        {
          id: 'rx-2026-091',
          patientId: 'user-pac-1',
          patientName: 'Lucía Fernández',
          patientDni: '36987412',
          patientInsurance: 'OSDE 310',
          doctorId: 'user-doc-1',
          doctorName: 'Dr. Martín Morales',
          doctorLicense: 'MN 142.890',
          date: '2026-09-15',
          validUntil: '2026-10-15',
          diagnosis: 'I10 - Hipertensión Esencial',
          items: [
            { id: 'rxi-1', medication: 'Enalapril', presentation: '10 mg comprimidos x 30', dosage: '1 comprimido cada 24 hs', duration: '30 días', instructions: 'Tomar por la mañana en ayunas con vaso de agua' },
            { id: 'rxi-2', medication: 'Aspirina Prevent', presentation: '100 mg comprimidos x 30', dosage: '1 comprimido por día', duration: '30 días', instructions: 'Tomar junto al almuerzo' }
          ],
          qrValidationCode: 'MED-RX-2026-99120-VAL-OK',
          digitalSignature: 'Firma Digital Certificada - Dr. Martín Morales - MN 142.890'
        },
        {
          id: 'rx-2026-084',
          patientId: 'user-pac-2',
          patientName: 'Roberto Méndez',
          patientDni: '24158930',
          patientInsurance: 'Swiss Medical SMG20',
          doctorId: 'user-doc-1',
          doctorName: 'Dr. Martín Morales',
          doctorLicense: 'MN 142.890',
          date: '2026-08-10',
          validUntil: '2026-09-10',
          diagnosis: 'E78.2 - Hiperlipidemia mixta',
          items: [
            { id: 'rxi-3', medication: 'Rosuvastatina', presentation: '10 mg comprimidos recubiertos x 28', dosage: '1 comprimido diario', duration: '60 días', instructions: 'Tomar antes de acostarse' }
          ],
          qrValidationCode: 'MED-RX-2026-88410-VAL-OK',
          digitalSignature: 'Firma Digital Certificada - Dr. Martín Morales - MN 142.890'
        }
      ],
      medicore_lab_orders: [
        {
          id: 'lab-001',
          patientId: 'user-pac-1',
          patientName: 'Lucía Fernández',
          patientDni: '36987412',
          doctorId: 'user-doc-1',
          doctorName: 'Dr. Martín Morales',
          doctorLicense: 'MN 142.890',
          date: '2026-09-15',
          studyType: 'LABORATORIO',
          requestedStudies: ['Hemograma completo', 'Uremia y Creatininemia', 'Ionograma plasmático', 'Perfil lipídico completo (Col total, HDL, LDL, Triglicéridos)'],
          clinicalIndication: 'Control tensional e inicio de nueva posología',
          priority: 'RUTINA',
          status: 'CON_RESULTADO',
          resultDate: '2026-09-18',
          resultReport: 'Hemograma normal. Creatinina 0.85 mg/dL. K+ 4.2 mEq/L, Na+ 140 mEq/L. Colesterol Total: 198 mg/dL, HDL: 52 mg/dL, LDL: 122 mg/dL, Triglicéridos: 120 mg/dL. Parámetros estables dentro del rango esperado.'
        },
        {
          id: 'lab-002',
          patientId: 'user-pac-1',
          patientName: 'Lucía Fernández',
          patientDni: '36987412',
          doctorId: 'user-doc-1',
          doctorName: 'Dr. Martín Morales',
          doctorLicense: 'MN 142.890',
          date: '2026-09-15',
          studyType: 'CARDIOLOGIA',
          requestedStudies: ['Ecocardiograma Doppler Color Transtorácico'],
          clinicalIndication: 'Evaluación de grosor parietal ventricular y función sistólica',
          priority: 'RUTINA',
          status: 'CON_RESULTADO',
          resultDate: '2026-09-22',
          resultReport: 'Ventrículo izquierdo de dimensiones normales con fracción de eyección (FEy) del 64%. Sin hipertrofia ventricular concéntrica. Patrón de relajación transmitral conservado. Válvulas cardíacas sin estenosis ni insuficiencias significativas.'
        },
        {
          id: 'lab-003',
          patientId: 'user-pac-2',
          patientName: 'Roberto Méndez',
          patientDni: '24158930',
          doctorId: 'user-doc-1',
          doctorName: 'Dr. Martín Morales',
          doctorLicense: 'MN 142.890',
          date: '2026-10-02',
          studyType: 'IMAGENES',
          requestedStudies: ['Ergometría computarizada de 12 derivaciones'],
          clinicalIndication: 'Prueba de esfuerzo para descarte de isquemia miocárdica inducible',
          priority: 'RUTINA',
          status: 'PENDIENTE'
        }
      ],
      medicore_schedules: [
        {
          doctorId: 'user-doc-1',
          workingDays: [1, 2, 3, 4, 5],
          startHour: '08:30',
          endHour: '16:00',
          consultationDuration: 30,
          vacationRanges: [{ startDate: '2026-11-15', endDate: '2026-11-25', reason: 'Congreso Internacional de Cardiología' }],
          breakRanges: [{ start: '12:30', end: '13:30' }]
        },
        {
          doctorId: 'user-doc-2',
          workingDays: [1, 3, 5],
          startHour: '09:00',
          endHour: '15:00',
          consultationDuration: 20,
          vacationRanges: [],
          breakRanges: [{ start: '12:00', end: '12:40' }]
        }
      ],
      medicore_payments: [],
      medicore_audit_logs: [
        {
          id: 'aud-001',
          timestamp: '2026-10-05T08:30:12.000Z',
          userId: 'user-recep-1',
          userName: 'Ana Beltrán',
          userRole: 'RECEPCIONISTA',
          action: 'LOGIN',
          resourceType: 'SISTEMA',
          resourceId: 'ses-recep-01',
          details: 'Inicio de sesión exitoso en Terminal Recepción Central',
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0'
        },
        {
          id: 'aud-005',
          timestamp: '2026-10-04T15:20:00.000Z',
          userId: 'user-admin-seter',
          userName: 'Seter (Administrador Principal)',
          userRole: 'ADMINISTRADOR',
          action: 'CAMBIO_CONFIGURACION',
          resourceType: 'SISTEMA',
          resourceId: 'cfg-main',
          details: 'Actualización de aranceles base de especialidades cardiovasculares',
          ipAddress: '192.168.1.5',
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/131.0'
        }
      ],
      medicore_settings: {
        clinicName: 'Sanatorio & Policlínico Metropolitano MediCore',
        taxId: '30-71458922-8',
        address: 'Av. Libertador 4890, Ciudad Autónoma de Buenos Aires',
        phone: '+54 11 4780-5000',
        email: 'contacto@medicore.com',
        emergencyPhone: '+54 11 4780-5911',
        baseGeneralConsultFee: 18000,
        baseSpecialistConsultFee: 25000,
        allowOnlineCancellationHours: 24,
        insurances: [
          { id: 'ins-1', name: 'OSDE (210/310/410/510)', copayPercentage: 15, active: true },
          { id: 'ins-2', name: 'Swiss Medical (SMG20/30/50)', copayPercentage: 18, active: true },
          { id: 'ins-3', name: 'Galeno (Azul/Blanco/Oro)', copayPercentage: 20, active: true },
          { id: 'ins-4', name: 'PAMI Prestacional', copayPercentage: 0, active: true },
          { id: 'ins-5', name: 'Particular / Privado', copayPercentage: 100, active: true }
        ]
      }
    }
  };
}

function ensureMasterAdmin(users: StoredUser[]): StoredUser[] {
  const cleaned = users.filter(
    u => u && u.id !== 'user-admin-1' && String(u.email || '').toLowerCase() !== 'admin@medicore.com'
  );
  const seterIdx = cleaned.findIndex(u => String(u.email || '').toLowerCase() === 'seter7712@gmail.com');
  if (seterIdx === -1) {
    cleaned.unshift({
      id: 'user-admin-seter',
      email: 'seter7712@gmail.com',
      name: 'Seter (Administrador Principal)',
      role: 'ADMINISTRADOR',
      dni: '28771200',
      phone: '+54 11 9988-7712',
      status: 'ACTIVO',
      authProvider: 'google',
      plainPassword: 'AdminSeter#2026',
      passwordHash: hashPasswordNode('AdminSeter#2026'),
      createdAt: new Date().toISOString()
    });
  } else {
    cleaned[seterIdx] = {
      ...cleaned[seterIdx],
      role: 'ADMINISTRADOR',
      status: 'ACTIVO'
    };
  }
  return cleaned;
}

function loadDbState(): HospitalDbState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw) as HospitalDbState;
      if (parsed && parsed.data && Array.isArray(parsed.data.medicore_users)) {
        parsed.data.medicore_users = ensureMasterAdmin(parsed.data.medicore_users);
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error loading hospital-db.json, initializing fresh DB:', err);
  }
  const initial = createInitialDbState();
  saveDbStateToDisk(initial);
  return initial;
}

function saveDbStateToDisk(state: HospitalDbState) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), 'utf8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.error('Failed to persist hospital-db.json:', err);
  }
}

let dbState: HospitalDbState = loadDbState();
const sseClients = new Set<Response>();

function broadcastStateChange(updatedKeys: string[]) {
  dbState.version += 1;
  dbState.updatedAt = new Date().toISOString();
  saveDbStateToDisk(dbState);

  const payload = JSON.stringify({
    version: dbState.version,
    updatedAt: dbState.updatedAt,
    updatedKeys
  });

  for (const client of sseClients) {
    try {
      client.write(`event: sync\ndata: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // SSE stream for real-time cross-tab / incognito synchronization
  app.get('/api/hospital/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    sseClients.add(res);
    res.write(
      `event: connected\ndata: ${JSON.stringify({
        version: dbState.version,
        updatedAt: dbState.updatedAt
      })}\n\n`
    );

    const keepAlive = setInterval(() => {
      try {
        res.write(`: ping\n\n`);
      } catch {
        clearInterval(keepAlive);
        sseClients.delete(res);
      }
    }, 20000);

    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients.delete(res);
    });
  });

  // Return authoritative hospital state
  app.get('/api/hospital/state', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      version: dbState.version,
      updatedAt: dbState.updatedAt,
      data: dbState.data
    });
  });

  // Atomically upsert a single user so concurrent sessions never overwrite each other's registrations
  app.post('/api/hospital/users/upsert', (req: Request, res: Response) => {
    const incomingUser = req.body?.user as StoredUser | undefined;
    if (!incomingUser || !incomingUser.email || !incomingUser.name) {
      res.status(400).json({ error: 'Invalid user payload' });
      return;
    }

    const emailLower = String(incomingUser.email).toLowerCase();
    const isMasterAdmin = emailLower === 'seter7712@gmail.com';
    const users = [...dbState.data.medicore_users];
    const existingIdx = users.findIndex(
      u => u.id === incomingUser.id || String(u.email || '').toLowerCase() === emailLower
    );

    let savedUser: StoredUser;
    if (existingIdx >= 0) {
      savedUser = {
        ...users[existingIdx],
        ...incomingUser,
        id: users[existingIdx].id,
        role: isMasterAdmin ? 'ADMINISTRADOR' : incomingUser.role || users[existingIdx].role,
        status: isMasterAdmin ? 'ACTIVO' : incomingUser.status || users[existingIdx].status
      };
      users[existingIdx] = savedUser;
    } else {
      savedUser = {
        ...incomingUser,
        id: incomingUser.id || `user-${Date.now()}`,
        role: isMasterAdmin ? 'ADMINISTRADOR' : incomingUser.role || 'PACIENTE',
        status: isMasterAdmin ? 'ACTIVO' : incomingUser.status || 'ACTIVO',
        createdAt: incomingUser.createdAt || new Date().toISOString()
      };
      users.push(savedUser);
    }

    dbState.data.medicore_users = ensureMasterAdmin(users);
    const updatedKeys = ['medicore_users'];

    // Ensure medical record exists for patients
    if (savedUser.role === 'PACIENTE') {
      const hasRecord = dbState.data.medicore_medical_records.some(
        r => r.patientId === savedUser.id
      );
      if (!hasRecord) {
        dbState.data.medicore_medical_records.push({
          id: `rec-${Date.now()}`,
          patientId: savedUser.id,
          bloodType: 'Sin registrar',
          allergies: [],
          chronicDiseases: [],
          familyHistory: 'Sin antecedentes relevantes consignados.',
          surgicalHistory: 'Sin cirugías previas reportadas.',
          emergencyContact: { name: 'Sin contacto', phone: 'Sin teléfono', relationship: 'Familiar' },
          lastUpdated: new Date().toISOString()
        });
        updatedKeys.push('medicore_medical_records');
      }
    }

    // Ensure schedule exists for doctors
    if (savedUser.role === 'MEDICO') {
      const hasSchedule = dbState.data.medicore_schedules.some(
        s => s.doctorId === savedUser.id
      );
      if (!hasSchedule) {
        dbState.data.medicore_schedules.push({
          doctorId: savedUser.id,
          workingDays: [1, 2, 3, 4, 5],
          startHour: '08:00',
          endHour: '16:00',
          consultationDuration: 30,
          vacationRanges: [],
          breakRanges: [{ start: '12:00', end: '13:00' }]
        });
        updatedKeys.push('medicore_schedules');
      }
    }

    broadcastStateChange(updatedKeys);
    res.json({ version: dbState.version, updatedAt: dbState.updatedAt, user: savedUser });
  });

  // Atomically delete a user
  app.delete('/api/hospital/users/:id', (req: Request, res: Response) => {
    const userId = req.params.id;
    const target = dbState.data.medicore_users.find(u => u.id === userId);
    if (!target) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    if (String(target.email || '').toLowerCase() === 'seter7712@gmail.com') {
      res.status(403).json({ error: 'No se puede eliminar al Administrador Principal' });
      return;
    }

    dbState.data.medicore_users = dbState.data.medicore_users.filter(u => u.id !== userId);
    dbState.data.medicore_appointments = dbState.data.medicore_appointments.filter(
      a => a.patientId !== userId && a.doctorId !== userId
    );
    dbState.data.medicore_medical_records = dbState.data.medicore_medical_records.filter(
      r => r.patientId !== userId
    );
    dbState.data.medicore_schedules = dbState.data.medicore_schedules.filter(
      s => s.doctorId !== userId
    );

    broadcastStateChange([
      'medicore_users',
      'medicore_appointments',
      'medicore_medical_records',
      'medicore_schedules'
    ]);
    res.json({ success: true, version: dbState.version, updatedAt: dbState.updatedAt });
  });

  // Atomically append an audit log entry
  app.post('/api/hospital/audit', (req: Request, res: Response) => {
    const log = req.body?.log as Record<string, unknown> | undefined;
    if (!log || !log.id) {
      res.status(400).json({ error: 'Invalid audit log payload' });
      return;
    }
    const existing = dbState.data.medicore_audit_logs;
    if (!existing.some(entry => entry.id === log.id)) {
      dbState.data.medicore_audit_logs = [log, ...existing].slice(0, 500);
      broadcastStateChange(['medicore_audit_logs']);
    }
    res.json({ version: dbState.version, updatedAt: dbState.updatedAt });
  });

  // Update a specific collection key
  app.put('/api/hospital/collection/:key', (req: Request, res: Response) => {
    const key = String(req.params.key || '');
    if (!ALLOWED_COLLECTION_KEYS.has(key)) {
      res.status(400).json({ error: `Unsupported collection key: ${key}` });
      return;
    }

    const value = req.body?.value;
    if (value === undefined) {
      res.status(400).json({ error: 'Missing collection value' });
      return;
    }

    if (key === 'medicore_users' && Array.isArray(value)) {
      dbState.data.medicore_users = ensureMasterAdmin(value as StoredUser[]);
    } else {
      (dbState.data as Record<string, unknown>)[key] = value;
    }

    broadcastStateChange([key]);
    res.json({ version: dbState.version, updatedAt: dbState.updatedAt });
  });

  // Full backup restore
  app.post('/api/hospital/restore', (req: Request, res: Response) => {
    const payload = req.body as Partial<HospitalDbState['data']>;
    if (!payload || !Array.isArray(payload.medicore_users)) {
      res.status(400).json({ error: 'Invalid backup payload' });
      return;
    }

    for (const key of ALLOWED_COLLECTION_KEYS) {
      const nextVal = (payload as Record<string, unknown>)[key];
      if (nextVal !== undefined) {
        if (key === 'medicore_users' && Array.isArray(nextVal)) {
          dbState.data.medicore_users = ensureMasterAdmin(nextVal as StoredUser[]);
        } else {
          (dbState.data as Record<string, unknown>)[key] = nextVal;
        }
      }
    }

    broadcastStateChange(Array.from(ALLOWED_COLLECTION_KEYS));
    res.json({ version: dbState.version, updatedAt: dbState.updatedAt });
  });

  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.npm_lifecycle_event === 'start';

  if (isProduction) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediCore server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
