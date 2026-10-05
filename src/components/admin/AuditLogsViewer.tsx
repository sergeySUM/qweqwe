import React, { useState, useMemo } from 'react';
import { AuditLog } from '../../types/hospital';
import { storageService } from '../../services/storageService';
import { 
  ShieldAlert, 
  Search, 
  Download, 
  Filter, 
  Clock, 
  User, 
  Laptop, 
  FileText,
  Activity,
  Receipt
} from 'lucide-react';

export const AuditLogsViewer: React.FC = () => {
  const logs = storageService.getAuditLogs();

  const [filterAction, setFilterAction] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filterAction && log.action !== filterAction) return false;
      if (filterRole && log.userRole !== filterRole) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchUser = log.userName.toLowerCase().includes(term);
        const matchPatient = log.patientName && log.patientName.toLowerCase().includes(term);
        const matchDetails = log.details.toLowerCase().includes(term);
        const matchIp = log.ipAddress.includes(term);
        if (!matchUser && !matchPatient && !matchDetails && !matchIp) return false;
      }
      return true;
    });
  }, [logs, filterAction, filterRole, searchTerm]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Usuario', 'Rol', 'Accion', 'Recurso', 'Paciente', 'Detalles', 'IP'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      `"${l.userName}"`,
      l.userRole,
      l.action,
      l.resourceType,
      `"${l.patientName || '-'}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      l.ipAddress
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria_medicore_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'LECTURA_FICHA':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-amber-100 text-amber-900 font-bold">LECTURA FICHA</span>;
      case 'REGISTRO_EVOLUCION':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-cyan-100 text-cyan-900 font-bold">EVOLUCION</span>;
      case 'EMISION_RECETA':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-100 text-emerald-900 font-bold">RECETA</span>;
      case 'COBRO_CAJA':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-blue-100 text-blue-900 font-bold">CAJA / PAGO</span>;
      case 'CANCELACION_TURNO':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-rose-100 text-rose-900 font-bold">CANCELACION</span>;
      default:
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 text-slate-800">{action}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-700">
            <span>RF-12</span>
            <span>·</span>
            <span className="uppercase">Auditoría de Accesos y Trazabilidad (Logs)</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Registro Histórico de Auditoría y Seguridad de Fichas Médicas
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Trazabilidad inmutable: consulte quién, cuándo, desde qué terminal e IP se accedió o modificó un registro médico o financiero.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Log Legal (CSV)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-medium text-slate-700 mb-1">Filtrar por Acción Operativa</label>
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
          >
            <option value="">Todas las acciones...</option>
            <option value="LECTURA_FICHA">Lectura de Ficha Clínica (RF-07)</option>
            <option value="REGISTRO_EVOLUCION">Registro de Evolución (RF-08)</option>
            <option value="EMISION_RECETA">Emisión de Receta (RF-09)</option>
            <option value="ORDEN_ESTUDIO">Orden de Estudio (RF-09)</option>
            <option value="COBRO_CAJA">Cobro en Caja (RF-06)</option>
            <option value="MODIFICACION_TURNO">Modificación de Turno</option>
            <option value="CANCELACION_TURNO">Cancelación de Turno</option>
            <option value="ALTA_USUARIO">Alta de Usuario</option>
            <option value="CAMBIO_ESTADO_USUARIO">Cambio de Estado de Usuario</option>
            <option value="CAMBIO_CONFIGURACION">Cambio de Configuración</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Filtrar por Rol de Usuario</label>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
          >
            <option value="">Todos los roles...</option>
            <option value="MEDICO">Médicos</option>
            <option value="RECEPCIONISTA">Recepcionistas</option>
            <option value="ADMINISTRADOR">Administradores</option>
            <option value="PACIENTE">Pacientes</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Búsqueda rápida</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por usuario, paciente o detalle..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-cyan-600"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <span className="font-semibold text-slate-800">
            Eventos Registrados ({filteredLogs.length} eventos)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Conforme a Normativa de Historia Clínica Electrónica
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 uppercase text-[10px] font-semibold">
                <th className="py-3 px-4">Fecha / Hora</th>
                <th className="py-3 px-4">Usuario Responsable</th>
                <th className="py-3 px-4">Acción Realizada</th>
                <th className="py-3 px-4">Paciente Afectado</th>
                <th className="py-3 px-4">Detalle de Operación</th>
                <th className="py-3 px-4 text-right">Terminal / IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                    <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                    <div className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </td>

                  <td className="py-2.5 px-4">
                    <div className="font-bold text-slate-900">{log.userName}</div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{log.userRole}</span>
                  </td>

                  <td className="py-2.5 px-4">
                    {getActionBadge(log.action)}
                  </td>

                  <td className="py-2.5 px-4">
                    {log.patientName ? (
                      <span className="font-semibold text-slate-800">{log.patientName}</span>
                    ) : (
                      <span className="text-slate-400 italic">No aplica</span>
                    )}
                  </td>

                  <td className="py-2.5 px-4 text-slate-700 max-w-sm">
                    <p className="line-clamp-2">{log.details}</p>
                    <span className="text-[10px] font-mono text-slate-400">{log.resourceType}: {log.resourceId}</span>
                  </td>

                  <td className="py-2.5 px-4 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    <div>{log.ipAddress}</div>
                    <div className="text-[9px] text-slate-400 truncate max-w-[120px] ml-auto">
                      {log.userAgent.split(' ')[0]}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
