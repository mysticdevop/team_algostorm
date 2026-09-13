import React from 'react';
import { Sun, Wind, BatteryCharging, Fuel, Home, ArrowRight } from 'lucide-react';

interface PowerFlowProps {
  solarKw: number;
  windKw: number;
  batteryKw: number; // positive = discharge, negative = charge
  dieselKw: number;
  loadKw: number;
  socPct: number;
  isDarkMode: boolean;
}

export const PowerFlowDiagram: React.FC<PowerFlowProps> = ({
  solarKw,
  windKw,
  batteryKw,
  dieselKw,
  loadKw,
  socPct,
  isDarkMode,
}) => {
  const isCharging = batteryKw < 0;
  const isDischarging = batteryKw > 0;

  return (
    <div className={`p-5 rounded-xl border transition-all ${
      isDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-sm"
    }`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-semibold">Microgrid Topology & Active Bus Power Flow</h3>
          <p className="text-xs opacity-60 font-mono">Simulated 400V AC / 48V DC Common Bus Vectoring</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
          BUS FREQ: 50.02 Hz
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 items-center text-center py-4">
        {/* Source 1: Solar */}
        <div className="flex flex-col items-center">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
            <Sun className={`h-6 w-6 ${solarKw > 0 ? "animate-spin" : ""}`} style={{ animationDuration: '10s' }} />
          </div>
          <span className="text-[11px] font-semibold">Solar PV</span>
          <span className="text-xs font-mono font-bold text-amber-400">{solarKw.toFixed(1)} kW</span>
        </div>

        {/* Source 2: Wind */}
        <div className="flex flex-col items-center">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-1">
            <Wind className={`h-6 w-6 ${windKw > 0 ? "animate-pulse" : ""}`} />
          </div>
          <span className="text-[11px] font-semibold">Wind</span>
          <span className="text-xs font-mono font-bold text-blue-400">{windKw.toFixed(1)} kW</span>
        </div>

        {/* Central AC/DC Synchronous Microgrid Bus */}
        <div className="flex flex-col items-center">
          <div className="w-full py-3 px-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 shadow-inner">
            <span className="text-[10px] font-mono block uppercase text-emerald-400 font-bold">Main AC Bus</span>
            <span className="text-sm font-mono font-black text-white">{loadKw.toFixed(1)} kW</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowRight className="h-3 w-3" /> Demand Sink
          </span>
        </div>

        {/* Source 3: Battery Storage */}
        <div className="flex flex-col items-center">
          <div className={`p-3 rounded-2xl border mb-1 transition-all ${
            isCharging 
              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
              : isDischarging
              ? "bg-teal-500/20 border-teal-500 text-teal-300"
              : "bg-slate-800/40 border-slate-700 text-slate-400"
          }`}>
            <BatteryCharging className="h-6 w-6" />
          </div>
          <span className="text-[11px] font-semibold">Storage (BESS)</span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {isCharging ? `-${Math.abs(batteryKw).toFixed(1)} kW` : `${batteryKw.toFixed(1)} kW`}
          </span>
          <span className="text-[10px] font-mono text-slate-400">{socPct.toFixed(0)}% SOC</span>
        </div>

        {/* Source 4: Diesel Generator */}
        <div className="flex flex-col items-center">
          <div className={`p-3 rounded-2xl border mb-1 ${
            dieselKw > 0 
              ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse" 
              : "bg-slate-800/40 border-slate-700 text-slate-400"
          }`}>
            <Fuel className="h-6 w-6" />
          </div>
          <span className="text-[11px] font-semibold">Diesel Gen</span>
          <span className="text-xs font-mono font-bold text-rose-400">{dieselKw.toFixed(1)} kW</span>
          <span className="text-[10px] font-mono text-slate-400">{dieselKw > 0 ? "RUNNING" : "STANDBY"}</span>
        </div>
      </div>

      {/* Dynamic Energy Balance Indicator */}
      <div className="mt-2 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="opacity-60">Dispatch Mode:</span>
          <span className="text-emerald-400 font-bold">
            {solarKw + windKw >= loadKw ? "100% Zero-Carbon Islanded" : dieselKw > 0 ? "Hybrid Asset Support" : "Storage Peaking Mode"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Home className="h-3.5 w-3.5" /> Village Demand: <strong className="text-white">{loadKw} kW</strong>
        </div>
      </div>
    </div>
  );
};