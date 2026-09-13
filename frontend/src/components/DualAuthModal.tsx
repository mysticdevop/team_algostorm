import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Lock, KeyRound, AlertTriangle } from 'lucide-react';
import { AUTHORITIES_DIRECTORY, type EmergencyActionTicket } from '../auth-state';

interface DualAuthModalProps {
  ticket: EmergencyActionTicket | null;
  onClose: () => void;
  onExecute: (ticketId: string) => void;
  isDarkMode: boolean;
}

export const DualAuthModal: React.FC<DualAuthModalProps> = ({ ticket, onClose, onExecute, isDarkMode }) => {
  const [approvals, setApprovals] = useState<string[]>([]);
  const [enteredPasskey, setEnteredPasskey] = useState<string>('');
  const [selectedAuthId, setSelectedAuthId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!ticket) return null;

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuthId) {
      setErrorMsg('Select a senior officer.');
      return;
    }
    if (enteredPasskey !== 'override2026') {
      setErrorMsg('Invalid authorization passkey (Demo: use "override2026").');
      return;
    }
    if (approvals.includes(selectedAuthId)) {
      setErrorMsg('Officer has already signed. Second distinct authority required.');
      return;
    }

    const updated = [...approvals, selectedAuthId];
    setApprovals(updated);
    setEnteredPasskey('');
    setSelectedAuthId('');
    setErrorMsg('');

    if (updated.length >= ticket.requiredApprovals) {
      setTimeout(() => {
        onExecute(ticket.id);
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all ${
        isDarkMode ? 'bg-slate-900 border-rose-500/40 text-slate-100' : 'bg-white border-rose-300 text-slate-900'
      }`}>
        <div className="flex items-center gap-3 text-rose-500 pb-3 border-b border-rose-500/20">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <ShieldAlert className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold uppercase tracking-wide">Dual-Key Security Interlock</h2>
            <p className="text-[11px] text-rose-400 font-mono">CRITICAL SAFETY THRESHOLD BYPASS</p>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-rose-950/20 border border-rose-800/30 text-xs">
          <p className="font-semibold text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-rose-400" /> Action: {ticket.actionTitle}
          </p>
          <p className="mt-1 text-slate-300 opacity-80 leading-relaxed">{ticket.description}</p>
          <div className="mt-2 font-mono text-[10px] text-slate-400 bg-black/40 p-1.5 rounded">
            Payload: {ticket.commandPayload}
          </div>
        </div>

        {/* Status of Signatures */}
        <div className="my-5">
          <div className="flex justify-between text-xs font-mono mb-2">
            <span>Required Approvals: 2</span>
            <span className="text-emerald-400 font-bold">{approvals.length} / 2 Verified</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[0, 1].map((slot) => {
              const signerId = approvals[slot];
              const signer = AUTHORITIES_DIRECTORY.find((a) => a.id === signerId);
              return (
                <div key={slot} className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                  signer 
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400' 
                    : 'border-dashed border-slate-700 bg-slate-950/40 text-slate-500'
                }`}>
                  {signer ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      <div className="text-left text-xs leading-tight">
                        <div className="font-semibold text-white">{signer.name}</div>
                        <div className="text-[10px] opacity-70 font-mono">{signer.role}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5 opacity-40 shrink-0" />
                      <span className="text-xs font-mono">Signatory #{slot + 1} Needed</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Signature Input Form */}
        {approvals.length < ticket.requiredApprovals ? (
          <form onSubmit={handleSign} className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Verify Senior Authority</label>
              <select
                value={selectedAuthId}
                onChange={(e) => setSelectedAuthId(e.target.value)}
                className={`w-full rounded-lg border p-2 text-xs font-mono outline-none ${
                  isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-black'
                }`}
              >
                <option value="">-- Choose Signatory --</option>
                {AUTHORITIES_DIRECTORY.filter((a) => !approvals.includes(a.id)).map((auth) => (
                  <option key={auth.id} value={auth.id}>
                    {auth.name} ({auth.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Passkey Credential</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter cryptographic key..."
                  value={enteredPasskey}
                  onChange={(e) => setEnteredPasskey(e.target.value)}
                  className={`w-full rounded-lg border p-2 pl-8 text-xs font-mono outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-black'
                  }`}
                />
                <KeyRound className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              </div>
            </div>

            {errorMsg && <p className="text-xs text-rose-400 font-mono mt-1">{errorMsg}</p>}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2 text-xs font-mono rounded-lg border border-slate-700 hover:bg-slate-800"
              >
                Cancel Override
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 text-xs font-mono rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all"
              >
                Sign & Authorize
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-2 text-emerald-400 font-mono text-xs flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 animate-bounce" /> Dual confirmation validated. Executing setpoints...
          </div>
        )}
      </div>
    </div>
  );
};