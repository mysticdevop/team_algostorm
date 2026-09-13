import React from 'react';
import { BatteryCharging, Zap, Leaf } from 'lucide-react';

interface EnergyRingProps {
  socPct: number;
  cleanFraction: number;
  totalLoadKw: number;
  isDarkMode: boolean;
}

export const EnergyRingHUD: React.FC<EnergyRingProps> = ({
  socPct,
  cleanFraction,
  totalLoadKw,
  isDarkMode
}) => {
  // SVG circular perimeter: 2 * PI * r = 2 * 3.1415 * 52 ≈ 326.7
  const circumference = 326.7;
  const strokeDashoffset = circumference - (socPct / 100) * circumference;

  return (
    <div className={`relative p-6 rounded-3xl border backdrop-blur-2xl transition-all shadow-xl overflow-hidden ${
      isDarkMode 
        ? "bg-linear-to-br from-slate-900/80 via-slate-900/40 to-emerald-950/20 border-slate-800/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
        : "bg-white/80 border-slate-200/80 shadow-slate-200/50"
    }`}>
      {/* Ambient Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
            Core Microgrid Dynamics
          </span>
          <h3 className="text-base font-bold tracking-tight">Active Islanding HUD</h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Zap className="h-3.5 w-3.5 animate-pulse" /> 100% Up-Time
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        {/* Animated Circular Gauge */}
        <div className="relative flex items-center justify-center">
          <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52"
              className="text-slate-800/60"
              strokeWidth="9"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              className="text-emerald-500 transition-all duration-700 ease-out"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Center Info */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <BatteryCharging className="h-5 w-5 text-emerald-400 mb-0.5" />
            <span className="text-2xl font-black font-mono tracking-tight text-white">{socPct}%</span>
            <span className="text-[9px] font-mono uppercase opacity-60">Storage SOC</span>
          </div>
        </div>

        {/* Micro-metrics with pill badges */}
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 rounded-2xl bg-black/20 border border-slate-800/60 flex items-center justify-between">
            <span className="opacity-70 flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-400" /> Renewable Ratio:
            </span>
            <span className="text-emerald-400 font-bold text-sm">{cleanFraction}%</span>
          </div>

          <div className="p-3 rounded-2xl bg-black/20 border border-slate-800/60 flex items-center justify-between">
            <span className="opacity-70 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" /> Total Village Sink:
            </span>
            <span className="text-white font-bold text-sm">{totalLoadKw.toFixed(1)} kW</span>
          </div>

          <div className="text-[10px] text-slate-400 flex justify-between px-1">
            <span>Minimum DOD: 20%</span>
            <span>Reserve Ceiling: 90%</span>
          </div>
        </div>
      </div>
    </div>
  );
};