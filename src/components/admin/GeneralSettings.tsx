import React, { useState } from 'react';
import { Specialty, ClinicSettings } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { 
  Sliders, 
  Stethoscope, 
  Building2, 
  Database, 
  Download, 
  Upload, 
  Save, 
  Plus, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

export const GeneralSettings: React.FC = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>(() => storageService.getSpecialties());
  const [settings, setSettings] = useState<ClinicSettings>(() => storageService.getSettings());

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<{ success?: boolean; message: string } | null>(null);

  // New Specialty State
  const [isAddingSpecialty, setIsAddingSpecialty] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState({
    name: '',
    description: '',
    baseFee: 20000
  });

  // Handle Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Handle Add Specialty
  const handleAddSpecialty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecialty.name.trim()) return;

    storageService.saveSpecialty({
      name: newSpecialty.name,
      description: newSpecialty.description,
      baseFee: Number(newSpecialty.baseFee)
    });

    setSpecialties(storageService.getSpecialties());
    setIsAddingSpecialty(false);
    setNewSpecialty({ name: '', description: '', baseFee: 20000 });
  };

  // Handle update specialty fee inline
  const handleUpdateSpecialtyFee = (id: string, newFee: number) => {
    const sp = specialties.find(s => s.id === id);
    if (!sp) return;
    storageService.saveSpecialty({ ...sp, baseFee: newFee });
    setSpecialties(storageService.getSpecialties());
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const jsonStr = storageService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medicore_backup_completo_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storageService.importFullBackup(content);
      if (success) {
        setRestoreStatus({ success: true, message: '¡Base de datos restaurada con éxito desde el respaldo!' });
        setSpecialties(storageService.getSpecialties());
        setSettings(storageService.getSettings());
      } else {
        setRestoreStatus({ success: false, message: 'El archivo seleccionado no tiene un formato válido de respaldo MediCore.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
            <span>RF-13</span>
            <span>·</span>
            <span className="uppercase">Configuración General y Respaldos</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Parámetros Institucionales, Aranceles y Respaldo de Datos
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Alta y modificación de especialidades, actualización de tarifas base y generación de respaldos completos del sistema.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Configuración guardada</span>
          </div>
        )}
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Especialidades y Tarifas (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-cyan-700" />
                <h2 className="text-sm font-semibold text-slate-900">Especialidades Médicas y Aranceles Base</h2>
              </div>
              <button
                onClick={() => setIsAddingSpecialty(!isAddingSpecialty)}
                className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingSpecialty ? 'Cancelar' : '+ Nueva Especialidad'}</span>
              </button>
            </div>

            {/* Add Specialty Form */}
            {isAddingSpecialty && (
              <form onSubmit={handleAddSpecialty} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nombre de la Especialidad *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Endocrinología y Metabolismo"
                    value={newSpecialty.name}
                    onChange={e => setNewSpecialty(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Descripción Breve</label>
                  <input
                    type="text"
                    placeholder="Alcance clínico..."
                    value={newSpecialty.description}
                    onChange={e => setNewSpecialty(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Arancel Base Particular ($)</label>
                  <input
                    type="number"
                    required
                    value={newSpecialty.baseFee}
                    onChange={e => setNewSpecialty(prev => ({ ...prev, baseFee: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-cyan-700 text-white font-semibold rounded-lg hover:bg-cyan-800 cursor-pointer"
                  >
                    Crear Especialidad
                  </button>
                </div>
              </form>
            )}

            {/* List of Specialties */}
            <div className="space-y-2.5">
              {specialties.map(sp => (
                <div
                  key={sp.id}
                  className="p-3 bg-slate-50/70 rounded-lg border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 block">{sp.name}</span>
                    <span className="text-[11px] text-slate-500 block truncate">{sp.description}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">Arancel: $</span>
                    <input
                      type="number"
                      step="500"
                      value={sp.baseFee}
                      onChange={e => handleUpdateSpecialtyFee(sp.id, Number(e.target.value))}
                      className="w-24 px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-right text-slate-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Datos Sanatoriales y Backup (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Institutional Info */}
          <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-cyan-700" />
              <h2 className="text-sm font-semibold text-slate-900">Parámetros del Sanatorio</h2>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Razón Social / Nombre Comercial</label>
              <input
                type="text"
                value={settings.clinicName}
                onChange={e => setSettings(prev => ({ ...prev, clinicName: e.target.value }))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">CUIT / Clave Fiscal</label>
                <input
                  type="text"
                  value={settings.taxId}
                  onChange={e => setSettings(prev => ({ ...prev, taxId: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Teléfono Central</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={e => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Dirección Sede Central</label>
              <input
                type="text"
                value={settings.address}
                onChange={e => setSettings(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Horas previas mínimas para cancelación online</label>
              <input
                type="number"
                value={settings.allowOnlineCancellationHours}
                onChange={e => setSettings(prev => ({ ...prev, allowOnlineCancellationHours: Number(e.target.value) }))}
                className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
              <span className="ml-2 text-slate-500">horas antes del turno</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Guardar Parámetros Sanatoriales
              </button>
            </div>
          </form>

          {/* Backup & Restore Panel */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Database className="w-4 h-4 text-cyan-700" />
              <h2 className="text-sm font-semibold text-slate-900">Respaldo y Recuperación de Base de Datos</h2>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Descargue una copia de seguridad íntegra en formato JSON conteniendo usuarios, turnos, fichas clínicas, evoluciones, recetas y auditoría.
            </p>

            {restoreStatus && (
              <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                restoreStatus.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {restoreStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{restoreStatus.message}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={handleExportBackup}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Respaldo (JSON)</span>
              </button>

              <label className="flex-1 py-2.5 px-4 bg-cyan-700 hover:bg-cyan-800 text-white font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 text-center">
                <Upload className="w-4 h-4" />
                <span>Restaurar Copia JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
