import React, { useState, useEffect } from 'react';
import { User } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { Save, CheckCircle2, Shield, UserCircle, CreditCard, Building } from 'lucide-react';

interface PatientProfileProps {
  patient: User;
}

export const PatientProfile: React.FC<PatientProfileProps> = ({ patient }) => {
  const [formData, setFormData] = useState({
    name: patient.name || '',
    dni: patient.dni || '',
    phone: patient.phone || '',
    email: patient.email || '',
    birthDate: patient.birthDate || '',
    address: patient.address || '',
    insuranceName: patient.insuranceName || '',
    insuranceNumber: patient.insuranceNumber || '',
    billingCuit: patient.billingCuit || ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const insurances = storageService.getSettings().insurances;

  useEffect(() => {
    setFormData({
      name: patient.name || '',
      dni: patient.dni || '',
      phone: patient.phone || '',
      email: patient.email || '',
      birthDate: patient.birthDate || '',
      address: patient.address || '',
      insuranceName: patient.insuranceName || '',
      insuranceNumber: patient.insuranceNumber || '',
      billingCuit: patient.billingCuit || ''
    });
  }, [patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSavedSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveUser({
      ...patient,
      ...formData
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
            <span>RF-01</span>
            <span>·</span>
            <span className="uppercase">Registro y Autogestión de Paciente</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Mi Perfil, Contacto y Datos de Facturación
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Mantenga actualizada su información personal, cobertura médica y datos fiscales para emisión de comprobantes.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Datos actualizados correctamente</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Datos Personales */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserCircle className="w-4 h-4 text-cyan-700" />
            <h2 className="text-sm font-semibold text-slate-900">Datos Personales y Contacto</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nombre Completo *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">DNI / Documento de Identidad *</label>
              <input
                type="text"
                name="dni"
                required
                value={formData.dni}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Correo Electrónico *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Teléfono Móvil *</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="+54 11 ..."
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Fecha de Nacimiento</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Dirección de Domicilio</label>
              <input
                type="text"
                name="address"
                placeholder="Calle, número, piso, localidad"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Cobertura Médica */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Shield className="w-4 h-4 text-cyan-700" />
            <h2 className="text-sm font-semibold text-slate-900">Cobertura Médica / Obra Social</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Obra Social o Prepaga</label>
              <select
                name="insuranceName"
                value={formData.insuranceName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden bg-white"
              >
                <option value="">Seleccione cobertura...</option>
                {insurances.map(ins => (
                  <option key={ins.id} value={ins.name}>
                    {ins.name} ({ins.copayPercentage === 0 ? 'Sin copago' : `${ins.copayPercentage}% copago`})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Número de Afiliado / Credencial</label>
              <input
                type="text"
                name="insuranceNumber"
                placeholder="Ej. OS-984123-01"
                value={formData.insuranceNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Datos de Facturación */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-cyan-700" />
            <h2 className="text-sm font-semibold text-slate-900">Datos Fiscales para Facturación</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">CUIT / CUIL para Facturación</label>
              <input
                type="text"
                name="billingCuit"
                placeholder="20-xxxxxxxx-x"
                value={formData.billingCuit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-hidden font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">Requerido para la emisión automática de Facturas tipo B o C por copagos.</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                <Building className="w-3.5 h-3.5 text-slate-600" />
                <span>Condición Fiscal</span>
              </span>
              <p className="text-[11px] text-slate-600">
                Las consultas de pacientes registrados se emiten a Consumidor Final de forma predeterminada con comprobante fiscal descargable.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Guardar y Actualizar Perfil</span>
          </button>
        </div>
      </form>
    </div>
  );
};
