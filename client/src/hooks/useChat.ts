import { useState, useCallback } from 'react';
import { BACKEND_URL, SERVER_HOME } from '../constants';
import type { Message, HistoryItem, ServerStatus } from '../types';

// ─── HOOK ─────────────────────────────────────────────────────────────────────
export function useChat() {
  const [activeChat,   setActiveChat]   = useState<Message[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');
  const [sessionId,    setSessionId]    = useState<string | null>(null);
  const [hasStarted,   setHasStarted]   = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('aiva_vault') || '[]'); }
    catch { return []; }
  });

  // ── ping server ───────────────────────────────────────────────────────────
  const pingServer = useCallback(() => {
    fetch(SERVER_HOME)
      .then(r => setServerStatus(r.ok ? 'online' : 'sleeping'))
      .catch(() => setServerStatus('sleeping'));
  }, []);

  // ── persist history to localStorage ──────────────────────────────────────
  const persistHistory = useCallback((updated: HistoryItem[]) => {
    localStorage.setItem('aiva_vault', JSON.stringify(updated));
  }, []);

  // ── send a message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setHasStarted(true);
    setLoading(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
    };
    setActiveChat(prev => [...prev, userMsg]);

    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: query }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');

      const aiText: string = data.result || 'I processed that, but my response was empty.';

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'aiva',
        text: aiText,
      };

      setActiveChat(prev => [...prev, aiMsg]);

      setHistory(prev => {
        let updated: HistoryItem[];
        if (sessionId) {
          updated = prev.map(x => x.id === sessionId ? { ...x, content: aiText } : x);
        } else {
          const nid = Date.now().toString();
          setSessionId(nid);
          updated = [{ id: nid, topic: query, content: aiText, timestamp: Date.now() }, ...prev];
        }
        persistHistory(updated);
        return updated;
      });

      setServerStatus('online');
    } catch {
      const errMsg: Message = {
        id: Date.now().toString(),
        role: 'aiva',
        text: "**Server is warming up.** Render's free tier takes ~50 s to boot. Please try again shortly.",
      };
      setActiveChat(prev => [...prev, errMsg]);
      setServerStatus('sleeping');
    } finally {
      setLoading(false);
    }
  }, [sessionId, persistHistory]);

  // ── load a history item ───────────────────────────────────────────────────
  const loadHistoryItem = useCallback((item: HistoryItem) => {
    setHasStarted(true);
    setSessionId(item.id);
    setActiveChat([
      { id: 'h1', role: 'user', text: item.topic   },
      { id: 'h2', role: 'aiva', text: item.content },
    ]);
  }, []);

  // ── delete a history item ─────────────────────────────────────────────────
  const deleteHistoryItem = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(x => x.id !== id);
      persistHistory(updated);
      return updated;
    });
  }, [persistHistory]);

  // ── reset to home ─────────────────────────────────────────────────────────
  const resetChat = useCallback(() => {
    setHasStarted(false);
    setActiveChat([]);
    setSessionId(null);
  }, []);

  return {
    // state
    activeChat,
    loading,
    serverStatus,
    sessionId,
    hasStarted,
    history,
    // actions
    sendMessage,
    loadHistoryItem,
    deleteHistoryItem,
    resetChat,
    pingServer,
  };
}