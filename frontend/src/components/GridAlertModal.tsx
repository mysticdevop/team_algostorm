import React from 'react';
import { CloudRain, AlertTriangle, BatteryWarning, ShieldAlert, X, ArrowRight } from 'lucide-react';

export interface GridAlertEvent {
  id: string;
  type: 'HEAVY_RAIN' | 'BATTERY_LOW' | 'PEAK_SURGE' | 'DIESEL_FORCED';
  title: string;
  message: string;
  mitigationAction: string;
  severity: 'WARNING' | 'CRITICAL';
}

interface GridAlertModalProps {
  alert: GridAlertEvent | null;
  onDismiss: () => void;
  isDarkMode: boolean;
}

export const GridAlertModal: React.FC<GridAlertModalProps> = ({ alert, onDismiss, isDarkMode }) => {
  if (!alert) return null;

  const getIcon = () => {
    switch (alert.type) {
      case 'HEAVY_RAIN':
        return <CloudRain className="h-6 w-6 text-blue-400 animate-bounce" />;
      case 'BATTERY_LOW':
        return <BatteryWarning className="h-6 w-6 text-amber-400 animate-pulse" />;
      case 'PEAK_SURGE':
        return <ShieldAlert className="h-6 w-6 text-rose-400 animate-ping" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-top justify-end p-4 sm:p-6 pointer-events-none">
      <div className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl pointer-events-auto transform transition-all duration-300 translate-y-0 ${
        alert.severity === 'CRITICAL'
          ? isDarkMode ? 'bg-slate-900 border-rose-500/60 text-slate-100 shadow-rose-950/50' : 'bg-white border-rose-300 text-slate-900 shadow-rose-100'
          : isDarkMode ? 'bg-slate-900 border-amber-500/60 text-slate-100 shadow-amber-950/50' : 'bg-white border-amber-300 text-slate-900 shadow-amber-100'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              alert.severity === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-amber-500/10 border-amber-500/30'
            }`}>
              {getIcon()}
            </div>
            <div>
              <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${
                alert.severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {alert.severity} Condition Detected
              </span>
              <h4 className="text-sm font-bold leading-snug">{alert.title}</h4>
            </div>
          </div>
          <button onClick={onDismiss} className="text-slate-400 hover:text-white p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-xs opacity-80 leading-relaxed font-sans">
          {alert.message}
        </p>

        <div className={`mt-3 p-2.5 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 ${
          isDarkMode ? 'bg-black/40 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <ArrowRight className="h-3 w-3 text-emerald-400 shrink-0" />
          <span><strong>Auto Action:</strong> {alert.mitigationAction}</span>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};