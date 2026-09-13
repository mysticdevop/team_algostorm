import React from 'react';
import { MapPin, Sun, Wind, BatteryCharging, Activity, Globe2 } from 'lucide-react';
import { DISTRICT_MICROGRIDS, type DistrictGridNode } from '../district-data';

interface DistrictMapProps {
  selectedDistrictId: string;
  onSelectDistrict: (district: DistrictGridNode) => void;
  isDarkMode: boolean;
}

export const DistrictMap: React.FC<DistrictMapProps> = ({
  selectedDistrictId,
  onSelectDistrict,
  isDarkMode,
}) => {
  const selectedNode = DISTRICT_MICROGRIDS.find((d) => d.id === selectedDistrictId) || DISTRICT_MICROGRIDS[0];

  return (
    <div className={`p-5 rounded-xl border transition-all ${
      isDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-sm"
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-semibold">District Microgrid Geographic Network & Resource Topology</h3>
          </div>
          <p className="text-xs opacity-60 font-mono">Real-time telemetry routing across decentralized regional sub-grids</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Optimal</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Resource Constrained</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Vector Topological Map View */}
        <div className="lg:col-span-2 relative h-72 w-full rounded-xl border border-slate-800/80 bg-slate-950/70 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[16px_16px] opacity-40"></div>
          
          {/* District Border Outlines */}
          <svg className="absolute inset-0 h-full w-full opacity-20 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 20 15 L 75 10 L 85 45 L 70 90 L 25 85 L 15 50 Z" fill="none" stroke="#10b981" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="48" y1="52" x2="55" y2="22" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="1 2" />
            <line x1="48" y1="52" x2="68" y2="78" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="1 2" />
            <line x1="48" y1="52" x2="30" y2="84" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="1 2" />
          </svg>

          {/* Interactive District Grid Pins */}
          {DISTRICT_MICROGRIDS.map((node) => {
            const isSelected = node.id === selectedDistrictId;
            return (
              <div
                key={node.id}
                style={{ left: `${node.mapCoords.x}%`, top: `${node.mapCoords.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                onClick={() => onSelectDistrict(node)}
              >
                <div className="relative flex items-center justify-center">
                  <span className={`absolute h-8 w-8 rounded-full transition-all ${
                    isSelected 
                      ? 'bg-emerald-500/30 animate-ping' 
                      : 'group-hover:bg-slate-700/40'
                  }`} />
                  <div className={`p-2 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                      : node.status === 'DEGRADED'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:scale-105'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:scale-105'
                  }`}>
                    <MapPin className="h-4 w-4" />
                  </div>
                </div>

                {/* Tooltip on hover */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap z-20">
                  <div className="bg-slate-900 text-slate-100 text-[10px] font-mono px-2 py-1 rounded shadow-lg border border-slate-700">
                    <span className="font-bold block text-emerald-400">{node.name}</span>
                    <span>{node.renewableFraction}% Renewable Fraction</span>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-400 opacity-60">
            GIS Datum: WGS 84 • Regional Telemetry Interlink
          </div>
        </div>

        {/* Selected District Telemetry & Natural Resources Panel */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between h-72 ${
          isDarkMode ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
        }`}>
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Selected Sub-Grid</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {selectedNode.status}
              </span>
            </div>

            <h4 className="text-sm font-bold mt-2.5 text-white">{selectedNode.name}</h4>
            <p className="text-[11px] opacity-70 mt-0.5">{selectedNode.primaryLoadType}</p>
            <p className="text-[10px] font-mono text-slate-400 mt-1">
              Geo: {selectedNode.coordinates.lat.toFixed(4)}°N, {selectedNode.coordinates.lng.toFixed(4)}°E
            </p>
          </div>

          {/* Regional Natural Resources Assessment */}
          <div className="space-y-2 py-2 border-y border-slate-800/80 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-amber-400"><Sun className="h-3.5 w-3.5" /> Solar Potential:</span>
              <span className="font-bold">{selectedNode.solarIrradianceAvg} kWh/m²/day</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-blue-400"><Wind className="h-3.5 w-3.5" /> Mean Wind Speed:</span>
              <span className="font-bold">{selectedNode.windSpeedAvg} m/s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-emerald-400"><BatteryCharging className="h-3.5 w-3.5" /> Clean Energy Share:</span>
              <span className="font-bold text-emerald-400">{selectedNode.renewableFraction}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 text-[10px] font-mono text-slate-400">
            <span>Asset Base: {selectedNode.params.solar_capacity_kw}kW PV / {selectedNode.params.battery_capacity_kwh}kWh BESS</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Activity className="h-3 w-3" /> Live Feed Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};