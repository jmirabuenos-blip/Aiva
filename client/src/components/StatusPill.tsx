import React from 'react';
import type { ServerStatus } from '../types';

interface StatusPillProps {
  serverStatus: ServerStatus;
  dark: boolean;
}

export const StatusPill = ({ serverStatus, dark }: StatusPillProps) => {
  const configs: Record<ServerStatus, { dot: string; label: string; bg: string; border: string; text: string }> = {
    online:   { dot: '#4ade80', label: 'Online',   bg: dark ? 'rgba(74,222,128,.08)'  : 'rgba(74,222,128,.1)',  border: dark ? 'rgba(74,222,128,.18)'  : 'rgba(74,222,128,.3)',  text: dark ? 'rgba(134,239,172,.8)' : '#166534' },
    checking: { dot: '#fbbf24', label: 'Checking', bg: dark ? 'rgba(251,191,36,.08)'  : 'rgba(251,191,36,.1)',  border: dark ? 'rgba(251,191,36,.18)'  : 'rgba(251,191,36,.3)',  text: dark ? 'rgba(253,224,71,.8)'  : '#92400e' },
    sleeping: { dot: '#94a3b8', label: 'Sleeping', bg: dark ? 'rgba(148,163,184,.08)' : 'rgba(148,163,184,.1)', border: dark ? 'rgba(148,163,184,.18)' : 'rgba(148,163,184,.3)', text: dark ? 'rgba(203,213,225,.7)' : '#475569' },
  };

  const c = configs[serverStatus];

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 10, fontWeight: 500, letterSpacing: '0.1em',
      textTransform: 'uppercase', padding: '4px 9px', borderRadius: 20,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%', background: c.dot, flexShrink: 0,
        animation: serverStatus === 'checking' ? 'pulse 1.4s ease infinite' : 'none',
      }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }`}</style>
      {c.label}
    </span>
  );
};