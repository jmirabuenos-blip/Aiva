import React from 'react';
import { Trash2, Plus, Clock } from 'lucide-react';
import { Avatar } from './Avatar';
import { StatusPill } from './StatusPill';
import type { HistoryItem, ServerStatus } from '../types';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

// ─── PROPS ────────────────────────────────────────────────────────────────────
interface SidebarProps {
  dark: boolean;
  serverStatus: ServerStatus;
  history: HistoryItem[];
  sessionId: string | null;
  onHome: () => void;
  onLoadItem: (item: HistoryItem) => void;
  onDeleteItem: (e: React.MouseEvent, id: string) => void;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export const Sidebar = ({
  dark,
  serverStatus,
  history,
  sessionId,
  onHome,
  onLoadItem,
  onDeleteItem,
}: SidebarProps) => (
  <div className={`flex flex-col h-full ${dark ? 'bg-[#161618]' : 'bg-[#edece9]'}`}>

    {/* Header */}
    <div
      onClick={onHome}
      className={`flex items-center justify-between px-5 py-4 border-b cursor-pointer transition-colors ${
        dark ? 'border-white/6 hover:bg-white/3' : 'border-black/6 hover:bg-black/3'
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar size={28} dark={dark} />
        <span className={`font-bold text-sm tracking-tight ${dark ? 'text-white/90' : 'text-slate-800'}`}>
          Aiva
        </span>
      </div>
      <StatusPill serverStatus={serverStatus} dark={dark} />
    </div>

    {/* New Chat */}
    <div className="px-3 pt-3 pb-2">
      <button
        onClick={onHome}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
          dark
            ? 'text-white/50 border-white/8 hover:text-white hover:bg-white/5 hover:border-white/14'
            : 'text-slate-500 border-black/8 hover:text-slate-800 hover:bg-black/4 hover:border-black/14'
        }`}
      >
        <Plus size={14} /> New chat
      </button>
    </div>

    {/* History List */}
    <div className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
      {history.length > 0 && (
        <p className={`px-2 py-2 text-[10px] font-semibold uppercase tracking-widest ${
          dark ? 'text-white/20' : 'text-slate-400'
        }`}>
          Recent
        </p>
      )}

      {history.map(item => (
        <div
          key={item.id}
          onClick={() => onLoadItem(item)}
          className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all ${
            sessionId === item.id
              ? (dark ? 'bg-white/8 text-white' : 'bg-blue-50 text-blue-700')
              : (dark
                  ? 'text-white/45 hover:text-white/80 hover:bg-white/4'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-black/3')
          }`}
        >
          <Clock size={11} className="flex-shrink-0 opacity-40" />
          <span className="truncate flex-1 font-medium">{item.topic}</span>
          <span className={`text-[10px] flex-shrink-0 ${dark ? 'text-white/20' : 'text-slate-300'}`}>
            {fmt(item.timestamp)}
          </span>
          <button
            onClick={e => onDeleteItem(e, item.id)}
            className={`absolute right-2 opacity-0 group-hover:opacity-100 p-1 transition-all ${
              dark ? 'text-white/20 hover:text-red-400' : 'text-slate-300 hover:text-red-500'
            }`}
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}

      {history.length === 0 && (
        <p className={`px-3 py-8 text-center text-xs ${dark ? 'text-white/15' : 'text-slate-300'}`}>
          No history yet
        </p>
      )}
    </div>

    {/* Footer */}
    <div className={`px-5 py-3.5 border-t ${dark ? 'border-white/5' : 'border-black/5'}`}>
      <p className={`text-[10px] font-medium ${dark ? 'text-white/15' : 'text-slate-300'}`}>
        Powered by Llama-3.1 · Groq
      </p>
    </div>

  </div>
);