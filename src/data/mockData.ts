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
  ClinicSettings
} from '../types/hospital';

export const INITIAL_SPECIALTIES: Specialty[] = [
  { id: 'esp-1', name: 'Cardiología', description: 'Prevención, diagnóstico y tratamiento de enfermedades cardiovasculares', baseFee: 25000 },
  { id: 'esp-2', name: 'Pediatría', description: 'Atención médica integral de bebés, niños y adolescentes', baseFee: 20000 },
  { id: 'esp-3', name: 'Traumatología y Ortopedia', description: 'Tratamiento de lesiones musculoesqueléticas y articulares', baseFee: 24000 },
  { id: 'esp-4', name: 'Clínica Médica', description: 'Atención primaria y diagnóstico integral para adultos', baseFee: 18000 },
  { id: 'esp-5', name: 'Dermatología', description: 'Diagnóstico y tratamiento de afecciones de la piel y mucosas', baseFee: 22000 },
  { id: 'esp-6', name: 'Neurología', description: 'Estudio y tratamiento del sistema nervioso central y periférico', baseFee: 28000 },
  { id: 'esp-7', name: 'Oftalmología', description: 'Salud visual, cirugía refractiva y patologías oculares', baseFee: 23000 },
];

export const INITIAL_USERS: User[] = [
  // Administrador
  {
    id: 'user-admin-1',
    email: 'admin@medicore.com',
    name: 'Lic. Diego Navarro',
    role: 'ADMINISTRADOR',
    dni: '29845120',
    phone: '+54 11 4589-2231',
    status: 'ACTIVO',
    createdAt: '2025-01-10T08:00:00.000Z'
  },
  // Recepcionistas
  {
    id: 'user-recep-1',
    email: 'recepcion@medicore.com',
    name: 'Ana Beltrán',
    role: 'RECEPCIONISTA',
    dni: '35210984',
    phone: '+54 11 5123-7744',
    status: 'ACTIVO',
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
    createdAt: '2025-03-15T09:00:00.000Z'
  },
  // Médicos
  {
    id: 'user-doc-1',
    email: 'dr.morales@medicore.com',
    name: 'Dr. Martín Morales',
    role: 'MEDICO',
    dni: '26458912',
    phone: '+54 11 4782-9011',
    status: 'ACTIVO',
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
    createdAt: '2025-01-20T10:00:00.000Z',
    specialtyId: 'esp-2',
    specialtyName: 'Pediatría',
    medicalLicense: 'MN 165.432',
    consultationFee: 20000
  },
  {
    id: 'user-doc-3',
    email: 'dr.rossi@medicore.com',
    name: 'Dr. Esteban Rossi',
    role: 'MEDICO',
    dni: '27891234',
    phone: '+54 11 4980-1200',
    status: 'ACTIVO',
    createdAt: '2025-02-10T11:00:00.000Z',
    specialtyId: 'esp-3',
    specialtyName: 'Traumatología y Ortopedia',
    medicalLicense: 'MN 138.712',
    consultationFee: 24000
  },
  {
    id: 'user-doc-4',
    email: 'dr.castro@medicore.com',
    name: 'Dr. Hernán Castro',
    role: 'MEDICO',
    dni: '28456123',
    phone: '+54 11 4321-8765',
    status: 'ACTIVO',
    createdAt: '2025-02-18T10:30:00.000Z',
    specialtyId: 'esp-4',
    specialtyName: 'Clínica Médica',
    medicalLicense: 'MN 129.540',
    consultationFee: 18000
  },
  // Pacientes
  {
    id: 'user-pac-1',
    email: 'lucia.fernandez@gmail.com',
    name: 'Lucía Fernández',
    role: 'PACIENTE',
    dni: '36987412',
    phone: '+54 11 5987-1234',
    status: 'ACTIVO',
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
    createdAt: '2025-03-05T11:15:00.000Z',
    birthDate: '1974-11-28',
    address: 'Calle Juncal 1820, CABA',
    insuranceName: 'Swiss Medical SMG20',
    insuranceNumber: 'SW-458190-02',
    billingCuit: '20-24158930-9'
  },
  {
    id: 'user-pac-3',
    email: 'sofia.alvarez@gmail.com',
    name: 'Sofía Álvarez',
    role: 'PACIENTE',
    dni: '42567890',
    phone: '+54 11 4111-2233',
    status: 'ACTIVO',
    createdAt: '2025-03-12T16:40:00.000Z',
    birthDate: '2000-03-22',
    address: 'Av. Santa Fe 2100, CABA',
    insuranceName: 'Galeno Azul',
    insuranceNumber: 'GA-771239-01',
    billingCuit: '27-42567890-3'
  }
];

export const INITIAL_SCHEDULES: DoctorSchedule[] = [
  {
    doctorId: 'user-doc-1',
    workingDays: [1, 2, 3, 4, 5], // Lun-Vie
    startHour: '08:30',
    endHour: '16:00',
    consultationDuration: 30,
    vacationRanges: [
      { startDate: '2026-11-15', endDate: '2026-11-25', reason: 'Congreso Internacional de Cardiología' }
    ],
    breakRanges: [
      { start: '12:30', end: '13:30' }
    ]
  },
  {
    doctorId: 'user-doc-2',
    workingDays: [1, 3, 5], // Lun, Mie, Vie
    startHour: '09:00',
    endHour: '15:00',
    consultationDuration: 20,
    vacationRanges: [],
    breakRanges: [
      { start: '12:00', end: '12:40' }
    ]
  },
  {
    doctorId: 'user-doc-3',
    workingDays: [2, 4], // Mar, Jue
    startHour: '10:00',
    endHour: '18:00',
    consultationDuration: 30,
    vacationRanges: [],
    breakRanges: [
      { start: '13:30', end: '14:30' }
    ]
  },
  {
    doctorId: 'user-doc-4',
    workingDays: [1, 2, 3, 4, 5],
    startHour: '08:00',
    endHour: '14:00',
    consultationDuration: 20,
    vacationRanges: [],
    breakRanges: []
  }
];

const todayStr = '2026-10-05';

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-001',
    patientId: 'user-pac-1',
    patientName: 'Lucía Fernández',
    patientDni: '36987412',
    patientPhone: '+54 11 5987-1234',
    doctorId: 'user-doc-1',
    doctorName: 'Dr. Martín Morales',
    specialtyId: 'esp-1',
    specialtyName: 'Cardiología',
    date: todayStr,
    time: '09:00',
    durationMinutes: 30,
    status: 'EN_ESPERA',
    reason: 'Control rutinario de hipertensión y palpitaciones leves',
    insuranceName: 'OSDE 310',
    copayAmount: 3500,
    isPaid: true,
    paymentId: 'pay-001',
    notes: 'Paciente ya ingresó a la sala de espera (Triage realizado)',
    createdAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'apt-002',
    patientId: 'user-pac-2',
    patientName: 'Roberto Méndez',
    patientDni: '24158930',
    patientPhone: '+54 11 6321-9988',
    doctorId: 'user-doc-1',
    doctorName: 'Dr. Martín Morales',
    specialtyId: 'esp-1',
    specialtyName: 'Cardiología',
    date: todayStr,
    time: '10:00',
    durationMinutes: 30,
    status: 'CONFIRMADO',
    reason: 'Evaluación de prueba de esfuerzo y ajuste de medicación',
    insuranceName: 'Swiss Medical SMG20',
    copayAmount: 4200,
    isPaid: false,
    createdAt: '2026-10-02T11:20:00.000Z'
  },
  {
    id: 'apt-003',
    patientId: 'user-pac-3',
    patientName: 'Sofía Álvarez',
    patientDni: '42567890',
    patientPhone: '+54 11 4111-2233',
    doctorId: 'user-doc-4',
    doctorName: 'Dr. Hernán Castro',
    specialtyId: 'esp-4',
    specialtyName: 'Clínica Médica',
    date: todayStr,
    time: '11:00',
    durationMinutes: 20,
    status: 'RESERVADO',
    reason: 'Certificado de aptitud física para natación universitaria',
    insuranceName: 'Galeno Azul',
    copayAmount: 2000,
    isPaid: false,
    createdAt: '2026-10-03T15:00:00.000Z'
  },
  {
    id: 'apt-004',
    patientId: 'user-pac-1',
    patientName: 'Lucía Fernández',
    patientDni: '36987412',
    patientPhone: '+54 11 5987-1234',
    doctorId: 'user-doc-3',
    doctorName: 'Dr. Esteban Rossi',
    specialtyId: 'esp-3',
    specialtyName: 'Traumatología y Ortopedia',
    date: '2026-10-08',
    time: '14:30',
    durationMinutes: 30,
    status: 'RESERVADO',
    reason: 'Dolor en rodilla derecha posterior a actividad física',
    insuranceName: 'OSDE 310',
    copayAmount: 4000,
    isPaid: false,
    createdAt: '2026-10-04T09:30:00.000Z'
  },
  {
    id: 'apt-005',
    patientId: 'user-pac-2',
    patientName: 'Roberto Méndez',
    patientDni: '24158930',
    patientPhone: '+54 11 6321-9988',
    doctorId: 'user-doc-1',
    doctorName: 'Dr. Martín Morales',
    specialtyId: 'esp-1',
    specialtyName: 'Cardiología',
    date: '2026-09-15',
    time: '10:30',
    durationMinutes: 30,
    status: 'FINALIZADO',
    reason: 'Chequeo anual y laboratorio cardiovascular',
    insuranceName: 'Swiss Medical SMG20',
    copayAmount: 4200,
    isPaid: true,
    paymentId: 'pay-002',
    createdAt: '2026-09-01T14:00:00.000Z'
  }
];

export const INITIAL_MEDICAL_RECORDS: MedicalRecord[] = [
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
    emergencyContact: {
      name: 'Mariano Fernández (Hermano)',
      phone: '+54 11 4455-6677',
      relationship: 'Hermano'
    },
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
    emergencyContact: {
      name: 'Laura Rossi (Esposa)',
      phone: '+54 11 5566-7788',
      relationship: 'Cónyuge'
    },
    lastUpdated: '2026-09-15T11:00:00.000Z'
  },
  {
    id: 'rec-003',
    patientId: 'user-pac-3',
    bloodType: 'B+',
    allergies: [],
    chronicDiseases: ['Rinitis alérgica estacional'],
    familyHistory: 'Sin antecedentes familiares cardiovasculares precoces.',
    surgicalHistory: 'Ninguna intervención previa.',
    emergencyContact: {
      name: 'Patricia Morales (Madre)',
      phone: '+54 11 7788-9900',
      relationship: 'Madre'
    },
    lastUpdated: '2026-08-20T10:00:00.000Z'
  }
];

export const INITIAL_EVOLUTIONS: EvolutionNote[] = [
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
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
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
      {
        id: 'rxi-1',
        medication: 'Enalapril',
        presentation: '10 mg comprimidos x 30',
        dosage: '1 comprimido cada 24 hs',
        duration: '30 días',
        instructions: 'Tomar por la mañana en ayunas con vaso de agua'
      },
      {
        id: 'rxi-2',
        medication: 'Aspirina Prevent',
        presentation: '100 mg comprimidos x 30',
        dosage: '1 comprimido por día',
        duration: '30 días',
        instructions: 'Tomar junto al almuerzo'
      }
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
      {
        id: 'rxi-3',
        medication: 'Rosuvastatina',
        presentation: '10 mg comprimidos recubiertos x 28',
        dosage: '1 comprimido diario',
        duration: '60 días',
        instructions: 'Tomar antes de acostarse'
      }
    ],
    qrValidationCode: 'MED-RX-2026-88410-VAL-OK',
    digitalSignature: 'Firma Digital Certificada - Dr. Martín Morales - MN 142.890'
  }
];

export const INITIAL_LAB_ORDERS: LabOrder[] = [
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
];

export const INITIAL_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'pay-001',
    appointmentId: 'apt-001',
    patientId: 'user-pac-1',
    patientName: 'Lucía Fernández',
    patientDni: '36987412',
    receptionistId: 'user-recep-1',
    receptionistName: 'Ana Beltrán',
    concept: 'Copago Consulta Médica - Cardiología',
    amount: 3500,
    paymentMethod: 'TARJETA_DEBITO',
    date: '2026-10-05T08:45:00.000Z',
    invoiceType: 'FACTURA_B',
    invoiceNumber: 'B0001-00045892',
    insuranceCoveredAmount: 21500,
    status: 'PAGADO'
  },
  {
    id: 'pay-002',
    appointmentId: 'apt-005',
    patientId: 'user-pac-2',
    patientName: 'Roberto Méndez',
    patientDni: '24158930',
    receptionistId: 'user-recep-1',
    receptionistName: 'Ana Beltrán',
    concept: 'Copago Consulta Especializada - Cardiología',
    amount: 4200,
    paymentMethod: 'EFECTIVO',
    date: '2026-09-15T10:15:00.000Z',
    invoiceType: 'FACTURA_B',
    invoiceNumber: 'B0001-00045610',
    insuranceCoveredAmount: 20800,
    status: 'PAGADO'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
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
    id: 'aud-002',
    timestamp: '2026-10-05T08:45:30.000Z',
    userId: 'user-recep-1',
    userName: 'Ana Beltrán',
    userRole: 'RECEPCIONISTA',
    action: 'COBRO_CAJA',
    resourceType: 'CAJA',
    resourceId: 'pay-001',
    patientName: 'Lucía Fernández',
    details: 'Cobro de copago $3,500 emitido comprobante B0001-00045892 (Tarjeta Débito)',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0'
  },
  {
    id: 'aud-003',
    timestamp: '2026-10-05T08:46:10.000Z',
    userId: 'user-recep-1',
    userName: 'Ana Beltrán',
    userRole: 'RECEPCIONISTA',
    action: 'MODIFICACION_TURNO',
    resourceType: 'TURNO',
    resourceId: 'apt-001',
    patientName: 'Lucía Fernández',
    details: 'Admisión presencial realizada. Estado de turno cambiado a EN_ESPERA',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0'
  },
  {
    id: 'aud-004',
    timestamp: '2026-10-05T08:50:00.000Z',
    userId: 'user-doc-1',
    userName: 'Dr. Martín Morales',
    userRole: 'MEDICO',
    action: 'LECTURA_FICHA',
    resourceType: 'FICHA_CLINICA',
    resourceId: 'rec-001',
    patientName: 'Lucía Fernández',
    details: 'Acceso a historia clínica completa, antecedentes y panel de alergias de Lucía Fernández',
    ipAddress: '192.168.1.145',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/130.0.0.0'
  },
  {
    id: 'aud-005',
    timestamp: '2026-10-04T15:20:00.000Z',
    userId: 'user-admin-1',
    userName: 'Lic. Diego Navarro',
    userRole: 'ADMINISTRADOR',
    action: 'CAMBIO_CONFIGURACION',
    resourceType: 'SISTEMA',
    resourceId: 'cfg-main',
    details: 'Actualización de aranceles base de especialidades cardiovasculares',
    ipAddress: '192.168.1.5',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/131.0'
  }
];

export const INITIAL_CLINIC_SETTINGS: ClinicSettings = {
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
};
