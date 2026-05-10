import type { ElementType } from 'react';

// ─── CHAT ─────────────────────────────────────────────────────────────────────
export type Message = {
  id: string;
  role: 'user' | 'aiva';
  text: string;
};

// ─── HISTORY ──────────────────────────────────────────────────────────────────
export type HistoryItem = {
  id: string;
  topic: string;
  content: string;
  timestamp: number;
};

// ─── SERVER ───────────────────────────────────────────────────────────────────
export type ServerStatus = 'checking' | 'online' | 'sleeping';

// ─── THEME ────────────────────────────────────────────────────────────────────
export type Theme = 'light' | 'dark';

// ─── QUICK PROMPT ─────────────────────────────────────────────────────────────
export type QuickPrompt = {
  label: string;
  query: string;
  icon: ElementType;
};