import React from 'react';
import type { ServerStatus } from '../types';

// ─── PROPS ────────────────────────────────────────────────────────────────────
interface StatusPillProps {
  serverStatus: ServerStatus;
  dark: boolean;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export const StatusPill = ({ serverStatus, dark }: StatusPillProps) => (
  <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
    serverStatus === 'online'
      ? (dark ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-emerald-600 border-emerald-200 bg-emerald-50')
      : serverStatus === 'checking'
      ? (dark ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-amber-600 border-amber-200 bg-amber-50')
      : (dark ? 'text-red-400 border-red-500/30 bg-red-500/10' : 'text-red-500 border-red-200 bg-red-50')
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${
      serverStatus === 'online'   ? 'bg-emerald-400' :
      serverStatus === 'checking' ? 'bg-amber-400 animate-pulse' :
                                    'bg-red-400'
    }`} />
    {serverStatus}
  </span>
);