import { useState, useEffect, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import { 
  Sun, ShieldCheck, Leaf, Zap, Moon, Play, Pause, Flame, Cpu, Lock, LogOut, ShieldAlert, CheckCircle2, BellRing, Map, Activity, Layers, Terminal
} from 'lucide-react';
import { fetchOptimization, type MicrogridParams, type OptimizationResponse } from './api';
import { type AuthSession, type EmergencyActionTicket } from './auth-state';
import { LoginScreen } from './components/LoginScreen';
import { DualAuthModal } from './components/DualAuthModal';
import { ModbusModal } from './components/ModbusModal';
import { PowerFlowDiagram } from './components/PowerFlowDiagram';
import { ChaosPanel } from './components/ChaosPanel';
import { EdgeTerminal } from './components/EdgeTerminal';
import { GridAlertModal, type GridAlertEvent } from './components/GridAlertModal';
import { DistrictMap } from './components/DistrictMap';
import { EnergyRingHUD } from './components/EnergyRingHUD';
import { DISTRICT_MICROGRIDS, type DistrictGridNode } from './district-data';

interface ScenarioPreset {
  name: string;
  description: string;
  params: MicrogridParams;
}

const PRESET_SCENARIOS: Record<string, ScenarioPreset> = {
  baseline: {
    name: "Standard Rural Village",
    description: "Balanced diurnal demand: 80 homes, clinic, school, night illumination.",
    params: {
      latitude: -1.3670,
      longitude: 38.0106,
      solar_capacity_kw: 60,
      wind_capacity_kw: 20,
      battery_capacity_kwh: 120,
      battery_max_kw: 35,
      diesel_max_kw: 40,
      fuel_cost_per_liter: 1.50,
      co2_penalty_per_kg: 0.05,
    },
  },
  healthClinic: {
    name: "24/7 Critical Health Outpost",
    description: "High baseload for surgical cold-chain & vaccines; minimal engine run.",
    params: {
      latitude: 0.5143,
      longitude: 35.2698,
      solar_capacity_kw: 85,
      wind_capacity_kw: 15,
      battery_capacity_kwh: 180,
      battery_max_kw: 45,
      diesel_max_kw: 30,
      fuel_cost_per_liter: 1.80,
      co2_penalty_per_kg: 0.08,
    },
  },
  solarDrought: {
    name: "Monsoon Solar Drought",
    description: "Cloud cover simulation; tests low-irradiance battery buffer & wind dispatch.",
    params: {
      latitude: 12.9716,
      longitude: 77.5946,
      solar_capacity_kw: 25,
      wind_capacity_kw: 45,
      battery_capacity_kwh: 100,
      battery_max_kw: 30,
      diesel_max_kw: 50,
      fuel_cost_per_liter: 1.65,
      co2_penalty_per_kg: 0.05,
    },
  },
  irrigationSpike: {
    name: "Agricultural Pumping Surge",
    description: "Midday pump load spike synchronized against maximum solar PV peak.",
    params: {
      latitude: -2.1534,
      longitude: 34.6857,
      solar_capacity_kw: 110,
      wind_capacity_kw: 10,
      battery_capacity_kwh: 140,
      battery_max_kw: 40,
      diesel_max_kw: 35,
      fuel_cost_per_liter: 1.40,
      co2_penalty_per_kg: 0.04,
    },
  },
};

type DashboardTab = 'DISPATCH' | 'DISTRICT_MAP' | 'CHAOS_MPC' | 'AUDIT_LOGS';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [currentTab, setCurrentTab] = useState<DashboardTab>('DISPATCH');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictGridNode>(DISTRICT_MICROGRIDS[0]);
  const [selectedScenario, setSelectedScenario] = useState<string>("baseline");
  const [params, setParams] = useState<MicrogridParams>(DISTRICT_MICROGRIDS[0].params);
  const [data, setData] = useState<OptimizationResponse | null>(null);
  const [, setLoading] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Circumstance Alert Popup
  const [activeAlert, setActiveAlert] = useState<GridAlertEvent | null>(null);

  // Fault states
  const [activeFault, setActiveFault] = useState<string | null>(null);
  const [alarmAcknowledged, setAlarmAcknowledged] = useState<boolean>(true);

  // Modals state
  const [activeTicket, setActiveTicket] = useState<EmergencyActionTicket | null>(null);
  const [isModbusOpen, setIsModbusOpen] = useState<boolean>(false);

  // Auto MPC simulation loop
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [activeHourIndex, setActiveHourIndex] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const runSolver = async (activeParams: MicrogridParams) => {
    setLoading(true);
    try {
      const res = await fetchOptimization(activeParams);
      setData(res);
    } catch (err) {
      console.error("Optimization failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      runSolver(params);
    }
  }, [params, currentUser]);

  const handleSelectDistrict = (district: DistrictGridNode) => {
    setSelectedDistrict(district);
    setParams(district.params);
    setActiveHourIndex(0);
    setActiveFault(null);
  };

  const handleScenarioChange = (key: string) => {
    setSelectedScenario(key);
    setParams(PRESET_SCENARIOS[key].params);
    setActiveHourIndex(0);
    setActiveFault(null);

    if (key === 'solarDrought') {
      setActiveAlert({
        id: 'ALT-' + Date.now(),
        type: 'HEAVY_RAIN',
        title: 'Torrential Rain & Low Irradiance',
        message: 'Direct Normal Irradiance (DNI) dropped to 110 W/m². Solar output down 65%.',
        mitigationAction: 'Auto-ramped battery buffer and engaged generator spinning reserve.',
        severity: 'WARNING',
      });
    }
  };

  const handleChaosInjection = (type: 'CLOUD_SHADOW' | 'SURGE_LOAD' | 'GEN_FAULT' | 'RESET') => {
    if (type === 'RESET') {
      setActiveFault(null);
      setAlarmAcknowledged(true);
      setActiveAlert(null);
      setParams(selectedDistrict.params);
      return;
    }

    setActiveFault(type);
    setAlarmAcknowledged(false);

    if (type === 'CLOUD_SHADOW') {
      setParams((prev) => ({ ...prev, solar_capacity_kw: Math.max(5, prev.solar_capacity_kw * 0.25) }));
      setActiveAlert({
        id: 'ALT-' + Date.now(),
        type: 'HEAVY_RAIN',
        title: 'Rapid Cloud Occlusion',
        message: 'Sudden 70% irradiance dip. Fast battery inverters stabilizing bus frequency.',
        mitigationAction: 'BESS discharging +18 kW instantaneously.',
        severity: 'CRITICAL',
      });
    } else if (type === 'SURGE_LOAD') {
      setParams((prev) => ({ ...prev, battery_max_kw: prev.battery_max_kw * 1.5 }));
      setActiveAlert({
        id: 'ALT-' + Date.now(),
        type: 'PEAK_SURGE',
        title: 'Critical Health Clinic Surge',
        message: '+40 kW load spike detected from cold-chain and emergency equipment.',
        mitigationAction: 'MILP dynamically shedding non-essential district lighting.',
        severity: 'CRITICAL',
      });
    } else if (type === 'GEN_FAULT') {
      setParams((prev) => ({ ...prev, diesel_max_kw: 0.0 }));
      setActiveAlert({
        id: 'ALT-' + Date.now(),
        type: 'DIESEL_FORCED',
        title: 'Auxiliary Generator Breaker Trip',
        message: 'Thermal overload protection opened ATS breaker 01.',
        mitigationAction: 'Operating in 100% Zero-Carbon Islanded mode.',
        severity: 'CRITICAL',
      });
    }
  };

  // Continuous MPC Simulation Loop
  useEffect(() => {
    if (isSimulating && currentUser) {
      timerRef.current = window.setInterval(() => {
        setActiveHourIndex((prev) => (prev + 1) % 24);
      }, 1600);
    } else if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [isSimulating, currentUser]);

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={setCurrentUser} isDarkMode={isDarkMode} />;
  }

  const canModifyConfig = currentUser.role === 'GRID_ENGINEER' || currentUser.role === 'CHIEF_ADMIN';
  const canTriggerEmergencyTrip = currentUser.role === 'CHIEF_ADMIN';

  const chartData = data ? data.timestamps.map((time, i) => ({
    time,
    Load: data.load_profile[i],
    Solar: Number(data.p_pv[i].toFixed(1)),
    Wind: Number(data.p_wind[i].toFixed(1)),
    Battery_Discharge: Number(data.p_dis[i].toFixed(1)),
    Diesel: Number(data.p_gen[i].toFixed(1)),
    Battery_SOC: Number(data.soc[i].toFixed(1)),
  })) : [];

  const currentSnapshot = chartData[activeHourIndex] || {
    time: "00:00",
    Load: 0,
    Solar: 0,
    Wind: 0,
    Battery_Discharge: 0,
    Diesel: 0,
    Battery_SOC: 50,
  };

  // Real-Time Cumulative Scorecard Calculations
  const slicedHours = data ? data.load_profile.slice(0, activeHourIndex + 1) : [];
  const cumulativeSolarGen = data ? data.p_pv.slice(0, activeHourIndex + 1).reduce((a, b) => a + b, 0) : 0;
  const cumulativeWindGen = data ? data.p_wind.slice(0, activeHourIndex + 1).reduce((a, b) => a + b, 0) : 0;
  const totalCleanKwh = cumulativeSolarGen + cumulativeWindGen;

  const dynamicFuelSavedLiters = Number((totalCleanKwh * 0.28).toFixed(1));
  const dynamicCo2AvoidedKg = Number((dynamicFuelSavedLiters * 2.68).toFixed(1));
  const dynamicCostSaved = Number((dynamicFuelSavedLiters * params.fuel_cost_per_liter).toFixed(2));
  const totalDemandToNow = slicedHours.reduce((a, b) => a + b, 0) || 1;
  const cleanEnergyPercentage = Math.min(100, Math.round((totalCleanKwh / totalDemandToNow) * 100));

  const triggerCriticalDeepDischarge = () => {
    setActiveTicket({
      id: 'TCK-' + Date.now(),
      actionTitle: 'Bypass Battery 20% DOD Safety Floor',
      severity: 'CRITICAL',
      description: 'Critical community blackout threat. Disables hardware low-voltage threshold to drain reserve to 5%. Requires dual senior authorization.',
      commandPayload: 'SET REGISTER 40048 = 0x05 (DOD_FLOOR_OVERRIDE)',
      requiredApprovals: 2,
      approvedBy: [],
      status: 'PENDING',
    });
  };

  const handleExecuteTicket = (ticketId: string) => {
    alert(`[SECURITY CLEARED] Action ${ticketId} verified and written to Modbus registers.`);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      isDarkMode 
        ? "bg-[#090D16] text-slate-100 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" 
        : "bg-slate-50 text-slate-900"
    } p-4 md:p-8`}>
      
      {/* Top Glassmorphic Navigation Bar */}
      <header className={`max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-3xl border backdrop-blur-xl ${
        isDarkMode ? "bg-slate-900/40 border-slate-800/80 shadow-2xl" : "bg-white/80 border-slate-200 shadow-sm"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20">
            <Zap className="h-6 w-6 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight">OptiGrid</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                v2.6 Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Off-Grid Energy Intelligence Platform</p>
          </div>
        </div>

        {/* Global Controls & User Badge */}
        <div className="flex flex-wrap items-center gap-2">
          {/* User Profile Pill */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-mono ${
            isDarkMode ? "bg-black/30 border-slate-800" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <div>
              <span className="font-bold">{currentUser.name}</span>
              <span className="text-[10px] opacity-60 ml-1.5 text-emerald-400 font-semibold">[{currentUser.role}]</span>
            </div>
          </div>

          <button
            onClick={() => setIsModbusOpen(true)}
            className={`text-xs px-3 py-1.5 rounded-2xl border font-mono flex items-center gap-1.5 transition-all ${
              isDarkMode ? "bg-slate-800/40 border-slate-700 hover:bg-slate-800" : "bg-white border-slate-300 hover:bg-slate-100"
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-emerald-400" /> SCADA
          </button>

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`text-xs px-3.5 py-1.5 rounded-2xl border font-mono flex items-center gap-1.5 transition-all shadow-sm ${
              isSimulating
                ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-emerald-500/20"
                : isDarkMode
                ? "bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {isSimulating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isSimulating ? "Ticker Active" : "Resume"}
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-2xl border transition-colors ${
              isDarkMode ? "bg-slate-800/40 border-slate-700 text-amber-300 hover:bg-slate-800" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setCurrentUser(null)}
            className="p-2 rounded-2xl border border-rose-500/30 text-rose-400 hover:bg-rose-950/30 transition-all"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Sleek Segmented View Switcher */}
      <nav className="max-w-7xl mx-auto mt-6 flex justify-center">
        <div className={`p-1.5 rounded-2xl border flex gap-1 font-mono text-xs backdrop-blur-xl ${
          isDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-white/80 border-slate-200 shadow-sm"
        }`}>
          <button
            onClick={() => setCurrentTab('DISPATCH')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              currentTab === 'DISPATCH'
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> Live Power Topology
          </button>

          <button
            onClick={() => setCurrentTab('DISTRICT_MAP')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              currentTab === 'DISTRICT_MAP'
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Map className="h-3.5 w-3.5" /> Regional GIS Grids
          </button>

          <button
            onClick={() => setCurrentTab('CHAOS_MPC')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              currentTab === 'CHAOS_MPC'
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="h-3.5 w-3.5" /> Stress Test & Chaos
          </button>

          <button
            onClick={() => setCurrentTab('AUDIT_LOGS')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              currentTab === 'AUDIT_LOGS'
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" /> SCADA Bus Telemetry
          </button>
        </div>
      </nav>

      {/* Live Operator Dispatch Bar */}
      <section className="max-w-7xl mx-auto mt-6">
        <div className={`p-4 rounded-3xl border flex flex-wrap items-center justify-between gap-4 font-mono text-xs backdrop-blur-xl transition-all ${
          activeFault && !alarmAcknowledged
            ? "bg-rose-950/40 border-rose-500/80 text-rose-200 shadow-lg shadow-rose-950/40"
            : isDarkMode
            ? "bg-slate-900/40 border-slate-800/80 shadow-xl"
            : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 font-bold">
              {activeFault && !alarmAcknowledged ? (
                <span className="text-rose-400 flex items-center gap-1.5 animate-pulse">
                  <BellRing className="h-4 w-4" /> ALARM: {activeFault}
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> SCADA: 100% Demand Balanced
                </span>
              )}
            </span>
            <span className="opacity-40">|</span>
            <span>Step Clock: <strong className="text-emerald-400">{currentSnapshot.time}</strong></span>
          </div>

          <div className="flex items-center gap-4">
            <div>Load: <strong className="text-white">{currentSnapshot.Load} kW</strong></div>
            <div className="text-amber-400">PV: <strong>{currentSnapshot.Solar} kW</strong></div>
            <div className="text-blue-400">Wind: <strong>{currentSnapshot.Wind} kW</strong></div>
            <div className="text-emerald-400">BESS: <strong>{currentSnapshot.Battery_Discharge} kW</strong> ({currentSnapshot.Battery_SOC}%)</div>
            <div className="text-rose-400">Gen: <strong>{currentSnapshot.Diesel} kW</strong></div>

            {activeFault && !alarmAcknowledged && (
              <button
                onClick={() => setAlarmAcknowledged(true)}
                className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1 shadow"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Ack Alarm
              </button>
            )}
          </div>
        </div>
      </section>

      {/* TAB 1: Live Dispatch & Power Topology */}
      {currentTab === 'DISPATCH' && (
        <div className="space-y-6 mt-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PowerFlowDiagram
                solarKw={currentSnapshot.Solar}
                windKw={currentSnapshot.Wind}
                batteryKw={currentSnapshot.Battery_Discharge}
                dieselKw={currentSnapshot.Diesel}
                loadKw={currentSnapshot.Load}
                socPct={currentSnapshot.Battery_SOC}
                isDarkMode={isDarkMode}
              />
            </div>
            <div>
              <EnergyRingHUD
                socPct={currentSnapshot.Battery_SOC}
                cleanFraction={cleanEnergyPercentage}
                totalLoadKw={currentSnapshot.Load}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          {/* Area & SOC Charts */}
          <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 p-6 rounded-3xl border backdrop-blur-xl ${
              isDarkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-bold tracking-tight">24-Hour Active Power Generation Mix</h3>
                  <p className="text-xs opacity-60">Synchronized setpoints balancing solar, wind, battery, and diesel</p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" unit=" kW" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ 
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                      borderColor: isDarkMode ? '#334155' : '#cbd5e1', 
                      color: isDarkMode ? '#fff' : '#000',
                      fontSize: '12px',
                      borderRadius: '12px'
                    }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area type="monotone" dataKey="Solar" stackId="1" stroke="#f59e0b" fill="url(#colorSolar)" />
                    <Area type="monotone" dataKey="Wind" stackId="1" stroke="#3b82f6" fill="url(#colorWind)" />
                    <Area type="monotone" dataKey="Battery_Discharge" stackId="1" stroke="#10b981" fill="url(#colorBat)" />
                    <Area type="monotone" dataKey="Diesel" stackId="1" stroke="#f43f5e" fill="url(#colorGen)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Battery SOC */}
            <div className={`p-6 rounded-3xl border flex flex-col justify-between backdrop-blur-xl ${
              isDarkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Battery State of Charge Dynamics</h3>
                <p className="text-xs opacity-60">Physical bounds guaranteed between 20% and 90%</p>
              </div>

              <div className="h-52 w-full my-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} stroke="#64748b" unit="%" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ 
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                      borderColor: isDarkMode ? '#334155' : '#cbd5e1', 
                      fontSize: '11px',
                      borderRadius: '12px'
                    }} />
                    <Line type="monotone" dataKey="Battery_SOC" stroke="#10b981" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-3 border-t border-slate-800/60 text-[11px] font-mono flex justify-between">
                <span className="text-rose-400">Min Reserve: 20%</span>
                <span className="text-emerald-400">Target Ceiling: 90%</span>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* TAB 2: District GIS Map */}
      {currentTab === 'DISTRICT_MAP' && (
        <section className="max-w-7xl mx-auto mt-6">
          <DistrictMap
            selectedDistrictId={selectedDistrict.id}
            onSelectDistrict={handleSelectDistrict}
            isDarkMode={isDarkMode}
          />
        </section>
      )}

      {/* TAB 3: Chaos & Stress Testing */}
      {currentTab === 'CHAOS_MPC' && (
        <div className="max-w-7xl mx-auto mt-6 space-y-6">
          {/* Preset Scenario Cards */}
          <section className="p-6 rounded-3xl border backdrop-blur-xl bg-slate-900/40 border-slate-800/80">
            <span className="text-xs font-mono tracking-wider uppercase opacity-70 block mb-3">
              Standard Operating Benchmarks {!canModifyConfig && "(Locked for Field Operators)"}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(PRESET_SCENARIOS).map(([key, scenario]) => (
                <button
                  key={key}
                  disabled={!canModifyConfig}
                  onClick={() => handleScenarioChange(key)}
                  className={`p-4 text-left rounded-2xl border transition-all ${
                    !canModifyConfig ? "cursor-not-allowed opacity-60" : ""
                  } ${
                    selectedScenario === key
                      ? "bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                      : "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="font-semibold text-xs text-emerald-400">{scenario.name}</div>
                  <div className="text-[11px] opacity-75 mt-1 line-clamp-2 leading-relaxed">
                    {scenario.description}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Chaos Fault Injector */}
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              {canModifyConfig ? (
                <ChaosPanel
                  onInjectPerturbation={handleChaosInjection}
                  activeFault={activeFault}
                  isDarkMode={isDarkMode}
                />
              ) : (
                <div className="p-5 rounded-2xl border font-mono text-xs flex items-center justify-between bg-slate-900/40 border-slate-800 text-slate-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Perturbation Engine Locked. Elevated privilege required.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Dual-Key Emergency Trip Card */}
            <div className="p-5 rounded-2xl border flex items-center justify-between bg-rose-950/20 border-rose-800/40">
              <div className="text-xs font-mono">
                <span className="text-rose-400 font-bold block">Safety Interlock</span>
                <span className="text-[10px] text-slate-400">Dual-Sign Required</span>
              </div>
              {canTriggerEmergencyTrip ? (
                <button
                  onClick={triggerCriticalDeepDischarge}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs flex items-center gap-1.5 shadow-md font-bold"
                >
                  <Lock className="h-3.5 w-3.5" /> Emergency Trip
                </button>
              ) : (
                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" /> Chief Admin Only
                </span>
              )}
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: SCADA Logs & Hardware Telemetry */}
      {currentTab === 'AUDIT_LOGS' && (
        <section className="max-w-7xl mx-auto mt-6 space-y-6">
          <EdgeTerminal
            currentHour={currentSnapshot.time}
            isSimulating={isSimulating}
            activeFault={activeFault}
          />
        </section>
      )}

      {/* Floating Dynamic Metrics Footer Bar */}
      <section className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className={`p-4 rounded-2xl border backdrop-blur-xl ${isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
          <span className="text-[10px] font-mono opacity-60 uppercase">Diesel Displaced (To Hour)</span>
          <p className="text-xl font-black mt-1 text-emerald-400">{dynamicFuelSavedLiters} L</p>
          <span className="text-[11px] opacity-70 mt-1 flex items-center gap-1">
            <Flame className="h-3 w-3 text-rose-400" /> Active savings
          </span>
        </div>

        <div className={`p-4 rounded-xl border backdrop-blur-xl ${isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
          <span className="text-[10px] font-mono opacity-60 uppercase">CO2 Mitigated</span>
          <p className="text-xl font-black mt-1 text-emerald-400">{dynamicCo2AvoidedKg} kg</p>
          <span className="text-[11px] opacity-70 mt-1 flex items-center gap-1">
            <Leaf className="h-3 w-3" /> Avoided emissions
          </span>
        </div>

        <div className={`p-4 rounded-xl border backdrop-blur-xl ${isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
          <span className="text-[10px] font-mono opacity-60 uppercase">Cost Savings (To Hour)</span>
          <p className="text-xl font-black mt-1 text-emerald-400">${dynamicCostSaved}</p>
          <span className="text-[11px] opacity-70 mt-1 block font-mono">
            {cleanEnergyPercentage}% Clean Power
          </span>
        </div>

        <div className={`p-4 rounded-xl border backdrop-blur-xl ${isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
          <span className="text-[10px] font-mono opacity-60 uppercase">Grid Security</span>
          <p className="text-xl font-black mt-1 text-emerald-400">{activeFault ? "91.4%" : "100.0%"}</p>
          <span className="text-[11px] opacity-70 mt-1 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> N-1 Contingency Safe
          </span>
        </div>
      </section>

      {/* Situational Event Pop-Up */}
      <GridAlertModal
        alert={activeAlert}
        onDismiss={() => setActiveAlert(null)}
        isDarkMode={isDarkMode}
      />

      {/* Dual Authorization Interlock Modal */}
      <DualAuthModal
        ticket={activeTicket}
        onClose={() => setActiveTicket(null)}
        onExecute={handleExecuteTicket}
        isDarkMode={isDarkMode}
      />

      {/* SCADA Modbus Register Matrix Modal */}
      <ModbusModal
        isOpen={isModbusOpen}
        onClose={() => setIsModbusOpen(false)}
        isDarkMode={isDarkMode}
        pvKw={currentSnapshot.Solar}
        batteryKw={currentSnapshot.Battery_Discharge}
        genKw={currentSnapshot.Diesel}
        socPct={currentSnapshot.Battery_SOC}
      />
    </div>
  );
}