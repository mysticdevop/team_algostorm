import React, { useState } from 'react';
import { 
  Zap, ShieldCheck, Lock, UserCheck, ArrowRight, AlertCircle, Sparkles
} from 'lucide-react';
import { MOCK_USERS, type AuthSession } from '../auth-state';

interface LoginScreenProps {
  onLoginSuccess: (session: AuthSession) => void;
  isDarkMode: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, isDarkMode }) => {
  const [email, setEmail] = useState('engineer@optigrid.io');
  const [passkey, setPasskey] = useState('eng123');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = MOCK_USERS[email.toLowerCase().trim()];
    if (!match || match.passkey !== passkey) {
      setError('Invalid credentials. Select a quick profile below.');
      return;
    }
    setError('');
    onLoginSuccess(match.user);
  };

  const handleQuickSelect = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPasskey(quickPass);
    setError('');
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center p-6 md:p-12 overflow-hidden font-sans transition-colors duration-500 ${
      isDarkMode ? 'bg-[#060913] text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>

      {/* Atmospheric Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-180 h-180 bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-120 h-120 bg-teal-500/10 rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[24px_24px] opacity-25" />
      </div>

      {/* Two-Column Split: Left = Branding & Glow Ring, Right = Login Box */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        {/* LEFT SIDE: Project Name, Narrative, and Orbital Glow Ring */}
        <div className="lg:col-span-6 relative flex flex-col items-start justify-center space-y-6">
          
          {/* Orbital Glow Ring Behind Left Brand Section */}
          <div className="absolute -left-12 -top-12 w-110 h-110 pointer-events-none flex items-center justify-center">
            <div className="w-95 h-95 rounded-full border border-emerald-500/20 animate-spin [animation-duration:36s] opacity-70" />
            <div className="absolute w-80 h-80 rounded-full border border-emerald-400/30 shadow-[0_0_50px_rgba(16,185,129,0.18)] animate-pulse [animation-duration:5s]" />
            <div className="absolute w-70 h-70 rounded-full border border-dashed border-emerald-400/20 animate-spin [animation-duration:20s] flex items-start justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
            </div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-5 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Autonomous Energy</span>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <div className="p-3.5 rounded-3xl bg-linear-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/30">
                <Zap className="h-8 w-8 font-black" />
              </div>
              <div>
                <h1 className="text-5xl sm:text-4xl font-black tracking-tight text-white">
                  OptiGrid
                </h1>
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest block mt-0.5">
        
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-md pt-2">
              Next-generation autonomous energy management for decentralized microgrids. Real-time weather ingestion, physical constraint guardrails, and industrial Modbus register mapping.
            </p>

            <div className="pt-6 flex items-center gap-6 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>N-1 Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>Dual-Key Auth</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Sub-Second MPC</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: The Actual Login Box */}
        <div className="lg:col-span-6 w-full flex justify-center lg:justify-end">
          <main className="w-full max-w-md rounded-3xl border border-slate-800/90 bg-slate-900/70 backdrop-blur-2xl p-7 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
            
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white tracking-tight">Operator Authentication</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Verify authorized credentials to open microgrid telemetry</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Operator / Official Identity
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@optigrid.io"
                    className="w-full py-2.5 pl-10 pr-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-xs font-mono text-white placeholder:text-slate-600 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <UserCheck className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Passkey Credential
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full py-2.5 pl-10 pr-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-xs font-mono text-white placeholder:text-slate-600 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-mono bg-rose-950/30 border border-rose-800/40 p-2.5 rounded-xl">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer mt-2"
              >
                Authenticate Session <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Quick Demonstration Profile Badges */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2.5">
                Quick-Select Profiles:
              </span>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickSelect("operator@optigrid.io", "op123")}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-blue-500/60 text-left transition-all group cursor-pointer"
                >
                  <span className="text-[10px] text-blue-400 font-bold block">OPERATOR</span>
                  <span className="text-[11px] text-slate-300 font-semibold truncate block group-hover:text-white">Field Ops</span>
                  <span className="text-[9px] text-slate-500 block">Read-Only</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSelect("engineer@optigrid.io", "eng123")}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-amber-500/60 text-left transition-all group cursor-pointer"
                >
                  <span className="text-[10px] text-amber-400 font-bold block">ENGINEER</span>
                  <span className="text-[11px] text-slate-300 font-semibold truncate block group-hover:text-white">M. Thorne</span>
                  <span className="text-[9px] text-slate-500 block">MPC Control</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSelect("admin@optigrid.io", "admin123")}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-emerald-500/60 text-left transition-all group cursor-pointer"
                >
                  <span className="text-[10px] text-emerald-400 font-bold block">CHIEF ADMIN</span>
                  <span className="text-[11px] text-slate-300 font-semibold truncate block group-hover:text-white">Dr. Patel</span>
                  <span className="text-[9px] text-slate-500 block">Dual-Auth</span>
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Physical Hardware Interlock Active
            </div>
          </main>
        </div>

      </div>
    </div>
  );
};