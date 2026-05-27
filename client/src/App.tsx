import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sun, Moon, PanelLeft, Zap, Copy, Check, RefreshCw, ChevronDown } from 'lucide-react';

import { useChat } from './hooks/useChat';

import { Avatar }            from './components/Avatar';
import { StatusPill }        from './components/StatusPill';
import { InputBox }          from './components/InputBox';
import { Sidebar }           from './components/Sidebar';
import { MarkdownRenderer, markdownStyles } from './components/MarkdownRenderer';

import { QUICK_PROMPTS, AIVA_AVATAR } from './constants';
import type { Theme } from './types';

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; }
  body { margin: 0; }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(128,128,128,.12); border-radius: 2px; }

  .aiva-root { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .msg { animation: fadeUp .32s cubic-bezier(.22,.68,0,1.2) forwards; opacity: 0; }

  @keyframes shimmer {
    0%,100% { opacity: .35; } 50% { opacity: .85; }
  }
  .dots span {
    display: inline-block; width: 4px; height: 4px; border-radius: 50%;
    background: currentColor; margin: 0 2px;
    animation: shimmer 1.4s ease infinite;
  }
  .dots span:nth-child(2) { animation-delay: .22s; }
  .dots span:nth-child(3) { animation-delay: .44s; }

  @keyframes pulse-ring {
    0%   { transform: scale(1); opacity: .5; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  .status-ring { animation: pulse-ring 2s ease infinite; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin .8s linear infinite; }

  @keyframes popIn {
    from { opacity: 0; transform: scale(.85) translateY(6px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .pop-in { animation: popIn .2s cubic-bezier(.22,.68,0,1.2) forwards; }

  .msg-actions { opacity: 0; transition: opacity .15s; }
  .msg-wrap:hover .msg-actions { opacity: 1; }
`;

const LOADING_TEXTS = [
  "Consulting Llama-3.1…",
  "Applying Feynman Method…",
  "Structuring concepts…",
  "Finalizing response…",
];

// ─── COPY BUTTON ─────────────────────────────────────────────────────────────
function CopyButton({ text, dark }: { text: string; dark: boolean }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={handle}
      title="Copy"
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
        fontSize: 11, fontWeight: 500, transition: 'all .15s',
        background: copied
          ? (dark ? 'rgba(74,222,128,.12)' : 'rgba(74,222,128,.15)')
          : (dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)'),
        color: copied
          ? (dark ? '#4ade80' : '#166534')
          : (dark ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.35)'),
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [theme,        setTheme]        = useState<Theme>('dark');
  const [topic,        setTopic]        = useState('');
  const [loadingIdx,   setLoadingIdx]   = useState(0);
  const [greeting,     setGreeting]     = useState('Hello');
  const [imgError,     setImgError]     = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  const {
    activeChat, loading, serverStatus, sessionId,
    hasStarted, history, sendMessage, loadHistoryItem,
    deleteHistoryItem, resetChat, pingServer,
  } = useChat();

  const dark = theme === 'dark';

  useEffect(() => { pingServer(); }, [pingServer]);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setLoadingIdx(i => (i + 1) % LOADING_TEXTS.length), 1800);
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }, []);

  // Auto-scroll + show scroll button
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (atBottom) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [activeChat, loading]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
  }, []);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  const handleGenerate = (forced?: string) => {
    const query = (typeof forced === 'string' ? forced : topic).trim();
    if (!query) return;
    setTopic('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setSidebarOpen(false);
    sendMessage(query);
  };

  const handleRegenerate = () => {
    const lastUser = [...activeChat].reverse().find(m => m.role === 'user');
    if (lastUser) sendMessage(lastUser.text);
  };

  const handleHome = () => {
    resetChat();
    setTopic('');
    setSidebarOpen(false);
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteHistoryItem(id);
    if (sessionId === id) handleHome();
  };

  return (
    <div
      className="aiva-root"
      style={{
        display: 'flex', height: '100vh', overflow: 'hidden',
        background: dark ? '#0e0e10' : '#f6f5f1',
        color: dark ? '#e8e4dc' : '#1c1a17',
        transition: 'background .2s, color .2s',
      }}
    >
      <style>{globalStyles + markdownStyles}</style>

      {/* ── Desktop Sidebar ── */}
      <aside style={{
        width: 232, flexShrink: 0,
        borderRight: `1px solid ${dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)'}`,
        display: 'none',
      }} className="lg-sidebar">
        <style>{`@media(min-width:1024px){.lg-sidebar{display:flex!important;flex-direction:column}}`}</style>
        <Sidebar
          dark={dark} serverStatus={serverStatus} history={history}
          sessionId={sessionId} onHome={handleHome}
          onLoadItem={item => { loadHistoryItem(item); setSidebarOpen(false); }}
          onDeleteItem={handleDeleteItem}
        />
      </aside>

      {/* ── Mobile Sidebar ── */}
      {sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)',
          }} />
          <div style={{
            position: 'fixed', left: 0, top: 0, bottom: 0, width: 256, zIndex: 50,
            borderRight: `1px solid ${dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)'}`,
          }}>
            <Sidebar
              dark={dark} serverStatus={serverStatus} history={history}
              sessionId={sessionId} onHome={handleHome}
              onLoadItem={item => { loadHistoryItem(item); setSidebarOpen(false); }}
              onDeleteItem={handleDeleteItem}
            />
          </div>
        </>
      )}

      {/* ── Main ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>

        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', height: 52,
          borderBottom: `1px solid ${dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'}`,
          position: 'sticky', top: 0, zIndex: 10,
          background: dark ? 'rgba(14,14,16,.9)' : 'rgba(246,245,241,.9)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="mobile-only"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: 8, border: 'none',
                background: 'transparent', cursor: 'pointer',
                color: dark ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,.3)',
              }}
            >
              <PanelLeft size={15} />
            </button>
            <style>{`@media(min-width:1024px){.mobile-only{display:none!important}}`}</style>

            <button onClick={handleHome} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Avatar size={24} dark={dark} />
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.02em', color: dark ? 'rgba(232,228,220,.9)' : 'rgba(28,26,23,.85)' }}>
                Aiva
              </span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {hasStarted && <StatusPill serverStatus={serverStatus} dark={dark} />}
            <button
              onClick={() => setTheme((t: Theme) => t === 'light' ? 'dark' : 'light')}
              style={{
                width: 32, height: 32, borderRadius: 8, border: 'none',
                background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: dark ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,.3)',
              }}
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </header>

        {/* ── HOME SCREEN ── */}
        {!hasStarted && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '48px 24px', overflowY: 'auto', textAlign: 'center',
          }}>
            {/* Avatar + status ring */}
            <div style={{ position: 'relative', marginBottom: 28 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20, overflow: 'hidden',
                border: `1px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)'}`,
              }}>
                {!imgError
                  ? <img src={AIVA_AVATAR} onError={() => setImgError(true)} alt="Aiva" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: dark ? '#1a1a2e' : '#eef2ff' }}>
                      <Zap size={28} style={{ color: '#c9a96e' }} />
                    </div>
                }
              </div>
              <div style={{
                position: 'absolute', bottom: -3, right: -3, width: 16, height: 16,
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2.5px solid ${dark ? '#0e0e10' : '#f6f5f1'}`,
                background: serverStatus === 'online' ? '#4ade80' : serverStatus === 'checking' ? '#fbbf24' : '#94a3b8',
              }}>
                <span className="status-ring" style={{
                  position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
                  background: serverStatus === 'online' ? '#4ade80' : serverStatus === 'checking' ? '#fbbf24' : '#94a3b8',
                }} />
              </div>
            </div>

            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8, color: dark ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.3)' }}>
              {greeting}
            </p>
            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 38px)', fontWeight: 300, letterSpacing: '-0.02em',
              margin: '0 0 10px', color: dark ? '#e8e4dc' : '#1c1a17', lineHeight: 1.1,
            }}>
              I'm <span style={{ fontWeight: 600 }}>Aiva.</span>
            </h1>
            <p style={{
              fontSize: 14, lineHeight: 1.7, maxWidth: 320, margin: '0 0 36px',
              color: dark ? 'rgba(232,228,220,.38)' : 'rgba(28,26,23,.42)', fontWeight: 300,
            }}>
              Your AI-powered study companion. Ask me anything — concepts, summaries, or quizzes.
            </p>


            <div style={{ width: '100%', maxWidth: 480 }}>
              <InputBox
                topic={topic} setTopic={setTopic} loading={loading}
                dark={dark} inputRef={inputRef} onGenerate={handleGenerate}
                placeholder="What do you want to learn today?"
              />
              <p style={{ textAlign: 'center', fontSize: 10.5, marginTop: 10, color: dark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.2)', letterSpacing: '0.02em' }}>
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        )}

        {/* ── CHAT SCREEN ── */}
        {hasStarted && (
          <>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              style={{ flex: 1, overflowY: 'auto' }}
            >
              <div style={{ maxWidth: 680, margin: '0 auto', padding: '36px 20px 180px' }}>
                {activeChat.map((msg, i) => (
                  <div
                    key={msg.id}
                    className="msg msg-wrap"
                    style={{ animationDelay: `${i * 0.04}s`, animationFillMode: 'both', marginBottom: 28 }}
                  >
                    {msg.role === 'user' ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{
                          maxWidth: '76%', padding: '11px 16px',
                          borderRadius: '14px 14px 3px 14px',
                          background: dark ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.85)',
                          border: `1px solid ${dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)'}`,
                        }}>
                          <MarkdownRenderer content={msg.text} variant="user" dark={dark} />
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <Avatar size={26} dark={dark} />
                        <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                          <p style={{
                            fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase',
                            marginBottom: 8, color: dark ? 'rgba(201,169,110,.5)' : 'rgba(180,130,60,.6)',
                          }}>
                            Aiva
                          </p>
                          <MarkdownRenderer content={msg.text} variant="aiva" dark={dark} />
                          {/* Message actions */}
                          <div className="msg-actions" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                            <CopyButton text={msg.text} dark={dark} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="msg" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 28 }}>
                    <Avatar size={26} dark={dark} />
                    <div style={{ paddingTop: 4 }}>
                      <p style={{
                        fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase',
                        marginBottom: 10, color: dark ? 'rgba(201,169,110,.5)' : 'rgba(180,130,60,.6)',
                      }}>
                        Aiva
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="dots" style={{ display: 'flex', color: dark ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.18)' }}>
                          <span /><span /><span />
                        </span>
                        <span style={{ fontSize: 11.5, fontWeight: 400, color: dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.22)', letterSpacing: '0.01em' }}>
                          {LOADING_TEXTS[loadingIdx]}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scroll to bottom button */}
            {showScrollBtn && (
              <button
                onClick={scrollToBottom}
                className="pop-in"
                style={{
                  position: 'absolute', bottom: 110, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 20,
                  background: dark ? 'rgba(30,28,26,.95)' : 'rgba(255,255,255,.95)',
                  border: `1px solid ${dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'}`,
                  color: dark ? 'rgba(232,228,220,.7)' : 'rgba(28,26,23,.6)',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  boxShadow: dark ? '0 4px 16px rgba(0,0,0,.4)' : '0 4px 16px rgba(0,0,0,.1)',
                  zIndex: 9,
                }}
              >
                <ChevronDown size={13} />
                Scroll to bottom
              </button>
            )}

            {/* Floating Input */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '48px 20px 20px',
              background: dark
                ? 'linear-gradient(to top, #0e0e10 65%, transparent)'
                : 'linear-gradient(to top, #f6f5f1 65%, transparent)',
            }}>
              <div style={{ maxWidth: 680, margin: '0 auto' }}>
                {/* Regenerate button */}
                {!loading && activeChat.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                    <button
                      onClick={handleRegenerate}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 14px', borderRadius: 20, border: 'none',
                        background: dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)',
                        color: dark ? 'rgba(232,228,220,.4)' : 'rgba(28,26,23,.4)',
                        fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
                        transition: 'all .15s', letterSpacing: '0.01em',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.color = dark ? 'rgba(201,169,110,.9)' : 'rgba(180,130,60,.9)';
                        (e.currentTarget as HTMLButtonElement).style.background = dark ? 'rgba(201,169,110,.08)' : 'rgba(201,169,110,.1)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.color = dark ? 'rgba(232,228,220,.4)' : 'rgba(28,26,23,.4)';
                        (e.currentTarget as HTMLButtonElement).style.background = dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)';
                      }}
                    >
                      <RefreshCw size={11} />
                      Regenerate response
                    </button>
                  </div>
                )}

                <InputBox
                  topic={topic} setTopic={setTopic} loading={loading}
                  dark={dark} inputRef={inputRef} onGenerate={handleGenerate}
                  placeholder="Ask a follow-up…"
                />
                <p style={{ textAlign: 'center', fontSize: 10, marginTop: 8, color: dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.18)', letterSpacing: '0.02em' }}>
                  Enter to send · Shift+Enter for new line
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}