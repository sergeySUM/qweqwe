import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types/hospital';
import { storageService } from './services/storageService';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Paciente Components (RF-01 to RF-03)
import { PatientProfile } from './components/patient/PatientProfile';
import { AppointmentBooking } from './components/patient/AppointmentBooking';
import { PatientHistoryDownloads } from './components/patient/PatientHistoryDownloads';

// Recepcionista Components (RF-04 to RF-06)
import { GlobalAgenda } from './components/reception/GlobalAgenda';
import { PatientAdmission } from './components/reception/PatientAdmission';
import { CashRegister } from './components/reception/CashRegister';

// Médico Components (RF-07 to RF-10)
import { ClinicalRecordViewer } from './components/doctor/ClinicalRecordViewer';
import { EvolutionForm } from './components/doctor/EvolutionForm';
import { PrescriptionsOrders } from './components/doctor/PrescriptionsOrders';
import { DoctorScheduleConfig } from './components/doctor/DoctorScheduleConfig';

// Administrador Components (RF-11 to RF-13)
import { UserManagement } from './components/admin/UserManagement';
import { AuditLogsViewer } from './components/admin/AuditLogsViewer';
import { GeneralSettings } from './components/admin/GeneralSettings';
import { LoginGate } from './components/auth/LoginGate';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.getActiveUser());
  const [activeTab, setActiveTab] = useState<string>('rf07');
  const [targetPatientId, setTargetPatientId] = useState<string | undefined>(undefined);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      const updatedUser = storageService.getActiveUser();
      setCurrentUser(updatedUser);
    });
    return unsubscribe;
  }, []);

  // Set default tab when role changes
  const handleSelectRole = (newRole: UserRole) => {
    if (!currentUser) return;
    
    // Only Admin can freely switch active user across all roles
    if (currentUser.role === 'ADMINISTRADOR') {
      const users = storageService.getUsers();
      const firstUserWithRole = users.find(u => u.role === newRole && u.status === 'ACTIVO');
      if (firstUserWithRole) {
        storageService.setActiveUserId(firstUserWithRole.id);
        setCurrentUser(firstUserWithRole);
      }
    }

    switch (newRole) {
      case 'PACIENTE':
        setActiveTab('rf02');
        break;
      case 'RECEPCIONISTA':
        setActiveTab('rf04');
        break;
      case 'MEDICO':
        setActiveTab('rf07');
        break;
      case 'ADMINISTRADOR':
        setActiveTab('rf11');
        break;
    }
  };

  // Sync active tab if currentUser role changes
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'PACIENTE' && !['rf01', 'rf02', 'rf03'].includes(activeTab)) {
      setActiveTab('rf02');
    } else if (currentUser.role === 'RECEPCIONISTA' && !['rf04', 'rf05', 'rf06'].includes(activeTab)) {
      setActiveTab('rf04');
    } else if (currentUser.role === 'MEDICO' && !['rf07', 'rf08', 'rf09', 'rf10'].includes(activeTab)) {
      setActiveTab('rf07');
    } else if (currentUser.role === 'ADMINISTRADOR' && !['rf11', 'rf12', 'rf13'].includes(activeTab)) {
      setActiveTab('rf11');
    }
  }, [currentUser?.role, activeTab]);

  // Si no está autenticado o la cuenta está suspendida, mostrar pantalla de bloqueo y acceso autorizado
  if (!currentUser || currentUser.status !== 'ACTIVO') {
    return (
      <LoginGate
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'PACIENTE') setActiveTab('rf02');
          else if (user.role === 'RECEPCIONISTA') setActiveTab('rf04');
          else if (user.role === 'MEDICO') setActiveTab('rf07');
          else setActiveTab('rf11');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Contract (3 zones) */}
      <Navbar
        currentUser={currentUser}
        onSelectRole={handleSelectRole}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Role-specific Sidebar */}
        <Sidebar
          currentUser={currentUser}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        {/* Main Content Workspace Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* PACIENTE VIEWS */}
            {currentUser.role === 'PACIENTE' && (
              <>
                {activeTab === 'rf01' && <PatientProfile patient={currentUser} />}
                {activeTab === 'rf02' && <AppointmentBooking patient={currentUser} />}
                {activeTab === 'rf03' && <PatientHistoryDownloads patient={currentUser} />}
              </>
            )}

            {/* RECEPCIONISTA VIEWS */}
            {currentUser.role === 'RECEPCIONISTA' && (
              <>
                {activeTab === 'rf04' && <GlobalAgenda currentUser={currentUser} />}
                {activeTab === 'rf05' && <PatientAdmission currentUser={currentUser} />}
                {activeTab === 'rf06' && <CashRegister currentUser={currentUser} />}
              </>
            )}

            {/* MEDICO VIEWS */}
            {currentUser.role === 'MEDICO' && (
              <>
                {activeTab === 'rf07' && (
                  <ClinicalRecordViewer
                    currentUser={currentUser}
                    onNavigateToEvolution={(patientId) => {
                      setTargetPatientId(patientId);
                      setActiveTab('rf08');
                    }}
                  />
                )}
                {activeTab === 'rf08' && (
                  <EvolutionForm
                    currentUser={currentUser}
                    initialPatientId={targetPatientId}
                    onNavigateToPrescription={(patientId) => {
                      setTargetPatientId(patientId);
                      setActiveTab('rf09');
                    }}
                  />
                )}
                {activeTab === 'rf09' && (
                  <PrescriptionsOrders
                    currentUser={currentUser}
                    initialPatientId={targetPatientId}
                  />
                )}
                {activeTab === 'rf10' && <DoctorScheduleConfig currentUser={currentUser} />}
              </>
            )}

            {/* ADMINISTRADOR VIEWS */}
            {currentUser.role === 'ADMINISTRADOR' && (
              <>
                {activeTab === 'rf11' && <UserManagement />}
                {activeTab === 'rf12' && <AuditLogsViewer />}
                {activeTab === 'rf13' && <GeneralSettings />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
