import React from 'react';
import { Trash2, Plus, MessageSquare } from 'lucide-react';
import { Avatar } from './Avatar';
import { StatusPill } from './StatusPill';
import type { HistoryItem, ServerStatus } from '../types';

const fmt = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

interface SidebarProps {
  dark: boolean;
  serverStatus: ServerStatus;
  history: HistoryItem[];
  sessionId: string | null;
  onHome: () => void;
  onLoadItem: (item: HistoryItem) => void;
  onDeleteItem: (e: React.MouseEvent, id: string) => void;
}

export const Sidebar = ({
  dark, serverStatus, history, sessionId,
  onHome, onLoadItem, onDeleteItem,
}: SidebarProps) => {
  const bg = dark ? '#0e0e10' : '#efede9';
  const borderColor = dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.06)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bg }}>

      {/* Header */}
      <div
        onClick={onHome}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderBottom: `1px solid ${borderColor}`,
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar size={26} dark={dark} />
          <span style={{
            fontSize: 13, fontWeight: 600, letterSpacing: '0.01em',
            color: dark ? 'rgba(232,228,220,.88)' : 'rgba(28,26,23,.82)',
          }}>
            Aiva
          </span>
        </div>
        <StatusPill serverStatus={serverStatus} dark={dark} />
      </div>

      {/* New Chat */}
      <div style={{ padding: '10px 10px 6px' }}>
        <button
          onClick={onHome}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 12px', borderRadius: 9, fontSize: 12.5, fontWeight: 500,
            cursor: 'pointer', transition: 'all .15s', letterSpacing: '0.01em',
            background: 'transparent',
            border: `1px solid ${dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.08)'}`,
            color: dark ? 'rgba(232,228,220,.4)' : 'rgba(28,26,23,.4)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = dark ? 'rgba(201,169,110,.9)' : 'rgba(180,130,60,.9)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = dark ? 'rgba(201,169,110,.25)' : 'rgba(201,169,110,.35)';
            (e.currentTarget as HTMLButtonElement).style.background = dark ? 'rgba(201,169,110,.05)' : 'rgba(201,169,110,.06)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = dark ? 'rgba(232,228,220,.4)' : 'rgba(28,26,23,.4)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.08)';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <Plus size={13} style={{ opacity: .7 }} />
          New chat
        </button>
      </div>

      {/* History */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 10px 8px' }}>
        {history.length > 0 && (
          <p style={{
            padding: '8px 6px 6px', fontSize: 9.5, fontWeight: 500,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: dark ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.28)',
          }}>
            Recent
          </p>
        )}

        {history.map(item => {
          const active = sessionId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onLoadItem(item)}
              style={{
                position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 1,
                transition: 'all .13s',
                background: active
                  ? (dark ? 'rgba(201,169,110,.1)' : 'rgba(201,169,110,.12)')
                  : 'transparent',
                border: `1px solid ${active
                  ? (dark ? 'rgba(201,169,110,.18)' : 'rgba(201,169,110,.22)')
                  : 'transparent'}`,
              }}
              className="hist-item"
            >
              <MessageSquare
                size={10}
                style={{ flexShrink: 0, opacity: .35, color: active ? '#c9a96e' : 'inherit' }}
              />
              <span style={{
                flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontSize: 12.5, fontWeight: active ? 500 : 400,
                color: active
                  ? (dark ? '#c9a96e' : '#a07840')
                  : (dark ? 'rgba(232,228,220,.42)' : 'rgba(28,26,23,.48)'),
              }}>
                {item.topic}
              </span>
              <span style={{
                fontSize: 9.5, flexShrink: 0, letterSpacing: '0.01em',
                color: dark ? 'rgba(255,255,255,.15)' : 'rgba(0,0,0,.22)',
              }}>
                {fmt(item.timestamp)}
              </span>
              <button
                onClick={e => onDeleteItem(e, item.id)}
                style={{
                  position: 'absolute', right: 6, padding: '3px',
                  background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4,
                  opacity: 0, transition: 'opacity .15s',
                  color: dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.22)',
                }}
                className="del-btn"
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.22)'; }}
              >
                <Trash2 size={11} />
              </button>
              <style>{`.hist-item:hover .del-btn { opacity: 1 !important; }`}</style>
            </div>
          );
        })}

        {history.length === 0 && (
          <p style={{
            padding: '32px 12px', textAlign: 'center', fontSize: 12,
            color: dark ? 'rgba(255,255,255,.13)' : 'rgba(0,0,0,.2)', lineHeight: 1.6,
          }}>
            No history yet
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: `1px solid ${borderColor}`,
      }}>
        <p style={{
          fontSize: 10, fontWeight: 400, letterSpacing: '0.04em',
          color: dark ? 'rgba(255,255,255,.13)' : 'rgba(0,0,0,.22)',
        }}>
          Powered by Llama-3.1 · Groq
        </p>
      </div>
    </div>
  );
};