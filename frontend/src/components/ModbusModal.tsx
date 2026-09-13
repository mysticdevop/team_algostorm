import React from 'react';
import { Cpu, X } from 'lucide-react';

interface ModbusModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  pvKw: number;
  batteryKw: number;
  genKw: number;
  socPct: number;
}

export const ModbusModal: React.FC<ModbusModalProps> = ({ isOpen, onClose, isDarkMode, pvKw, batteryKw, genKw, socPct }) => {
  if (!isOpen) return null;

  const registers = [
    { register: "40001", name: "INV_STATE", type: "Uint16", value: "3 (GRID_FORMING)", desc: "Main Inverter Mode" },
    { register: "40020", name: "PV_CURTAIL_LIMIT_KW", type: "Float32", value: `${pvKw.toFixed(1)} kW`, desc: "Solar Maximum Setpoint" },
    { register: "40024", name: "BESS_ACTIVE_DISCHG_KW", type: "Float32", value: `${batteryKw.toFixed(1)} kW`, desc: "Storage Dispatch Command" },
    { register: "40030", name: "GEN_START_RELAY", type: "Binary Coil", value: genKw > 0 ? "1 (CLOSED)" : "0 (OPEN)", desc: "ATS Dry-Contact Generator Starter" },
    { register: "40032", name: "GEN_TARGET_KW", type: "Float32", value: `${genKw.toFixed(1)} kW`, desc: "Generator Throttle Setpoint" },
    { register: "40045", name: "BMS_SOC_TELEMETRY", type: "Uint16", value: `${socPct.toFixed(1)} %`, desc: "Calibrated State of Charge" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className={`w-full max-w-2xl rounded-2xl border p-6 shadow-2xl ${
        isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
      }`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-emerald-400" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider">Industrial Modbus-TCP / SCADA Output Matrix</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-4 overflow-x-auto text-xs font-mono">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2">Register</th>
                <th>Identifier</th>
                <th>Data Type</th>
                <th>Commanded Value</th>
                <th>Channel Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {registers.map((reg) => (
                <tr key={reg.register} className="hover:bg-slate-800/30">
                  <td className="py-2.5 text-emerald-400 font-bold">{reg.register}</td>
                  <td className="text-white">{reg.name}</td>
                  <td className="text-slate-400">{reg.type}</td>
                  <td className="text-amber-400 font-bold">{reg.value}</td>
                  <td className="text-slate-400 text-[11px]">{reg.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center text-[11px] font-mono text-slate-400">
          <span>Protocol: Modbus RTU/TCP over RS-485 • Inverter Baud: 19200</span>
          <button onClick={onClose} className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 text-white">Close</button>
        </div>
      </div>
    </div>
  );
};