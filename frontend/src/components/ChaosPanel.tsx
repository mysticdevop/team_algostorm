import React from 'react';
import { CloudRain, AlertOctagon, ZapOff, Activity, RefreshCw } from 'lucide-react';

interface ChaosPanelProps {
  onInjectPerturbation: (type: 'CLOUD_SHADOW' | 'SURGE_LOAD' | 'GEN_FAULT' | 'RESET') => void;
  activeFault: string | null;
  isDarkMode: boolean;
}

export const ChaosPanel: React.FC<ChaosPanelProps> = ({ onInjectPerturbation, activeFault, isDarkMode }) => {
  return (
    <div className={`p-4 rounded-xl border ${
      isDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-sm"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-amber-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Chaos & Grid Perturbation Injector</h4>
        </div>
        {activeFault && (
          <span className="text-[10px] font-mono text-rose-400 bg-rose-950/40 border border-rose-800/50 px-2 py-0.5 rounded">
            FAULT ACTIVE: {activeFault}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => onInjectPerturbation('CLOUD_SHADOW')}
          className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-left text-xs font-mono transition-all flex items-center gap-2"
        >
          <CloudRain className="h-4 w-4 shrink-0" />
          <div>
            <div className="font-bold">Cloud Shadow</div>
            <div className="text-[9px] opacity-70">-70% Solar Drop</div>
          </div>
        </button>

        <button
          onClick={() => onInjectPerturbation('SURGE_LOAD')}
          className="p-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-left text-xs font-mono transition-all flex items-center gap-2"
        >
          <AlertOctagon className="h-4 w-4 shrink-0" />
          <div>
            <div className="font-bold">Clinic Surge</div>
            <div className="text-[9px] opacity-70">+40 kW Load Spike</div>
          </div>
        </button>

        <button
          onClick={() => onInjectPerturbation('GEN_FAULT')}
          className="p-2.5 rounded-lg border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 text-left text-xs font-mono transition-all flex items-center gap-2"
        >
          <ZapOff className="h-4 w-4 shrink-0" />
          <div>
            <div className="font-bold">Diesel Trip</div>
            <div className="text-[9px] opacity-70">Generator Offline</div>
          </div>
        </button>

        <button
          onClick={() => onInjectPerturbation('RESET')}
          className="p-2.5 rounded-lg border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-300 text-left text-xs font-mono transition-all flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4 shrink-0" />
          <div>
            <div className="font-bold">Restore Nominal</div>
            <div className="text-[9px] opacity-70">Clear Faults</div>
          </div>
        </button>
      </div>
    </div>
  );
};