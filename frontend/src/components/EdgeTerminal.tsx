import React, { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';

interface EdgeTerminalProps {
  currentHour: string;
  isSimulating: boolean;
  activeFault: string | null;
}

export const EdgeTerminal: React.FC<EdgeTerminalProps> = ({ currentHour, isSimulating, activeFault }) => {
  const [logs, setLogs] = useState<string[]>([
    `[INIT] Industrial RTU Edge daemon v2.4 initialized.`,
    `[OPEN-METEO] Solar/Wind diurnal forecast parsed into PuLP decision matrix.`,
    `[MILP] CBC Branch-and-Cut convergence verified: 0.038s. Status: Optimal.`,
  ]);

  useEffect(() => {
    if (isSimulating) {
      const timestamp = new Date().toLocaleTimeString();
      const newLog = `[${timestamp}] MPC Horizon Step [${currentHour}] -> Modbus TCP write registers (0x9C40) ACK'd.`;
      setLogs((prev) => [...prev.slice(-6), newLog]);
    }
  }, [currentHour, isSimulating]);

  useEffect(() => {
    if (activeFault) {
      const timestamp = new Date().toLocaleTimeString();
      const faultLog = `[${timestamp}] [ALERT] Real-time perturbation: ${activeFault} detected! Re-solving MILP horizon immediately...`;
      setLogs((prev) => [...prev.slice(-6), faultLog]);
    }
  }, [activeFault]);

  return (
    <div className="p-3.5 rounded-xl border border-slate-800 bg-black/70 font-mono text-[11px] text-slate-300 shadow-inner">
      <div className="flex items-center gap-2 text-emerald-400 mb-2 pb-1.5 border-b border-slate-900">
        <Terminal className="h-3.5 w-3.5" />
        <span className="font-bold tracking-wider uppercase text-[10px]">Real-Time Edge Hardware & SCADA Terminal</span>
      </div>
      <div className="space-y-1 overflow-hidden">
        {logs.map((log, index) => (
          <div key={index} className="leading-tight truncate">
            <span className="text-emerald-500">&gt;</span> {log}
          </div>
        ))}
      </div>
    </div>
  );
};