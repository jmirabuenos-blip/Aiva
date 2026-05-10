import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, PanelLeft, Zap } from 'lucide-react';

// ─── HOOKS ────────────────────────────────────────────────────────────────────
import { useChat } from './hooks/useChat';

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
import { Avatar }            from './components/Avatar';
import { StatusPill }        from './components/StatusPill';
import { InputBox }          from './components/InputBox';
import { Sidebar }           from './components/Sidebar';
import { MarkdownRenderer, markdownStyles } from './components/MarkdownRenderer';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
import { QUICK_PROMPTS, AIVA_AVATAR } from './constants';

// ─── TYPES ────────────────────────────────────────────────────────────────────
import type { Theme } from './types';

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(128,128,128,.15); border-radius: 2px; }
  .aiva-root { font-family: 'DM Sans', sans-serif; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .msg { animation: fadeUp .26s ease forwards; }

  .dots span {
    display:inline-block; width:5px; height:5px; border-radius:50%;
    background:currentColor; margin:0 2px;
    animation: db 1.1s infinite;
  }
  .dots span:nth-child(2) { animation-delay:.18s; }
  .dots span:nth-child(3) { animation-delay:.36s; }
  @keyframes db { 0%,80%,100%{transform:translateY(0);opacity:.3;} 40%{transform:translateY(-5px);opacity:1;} }
`;

const LOADING_TEXTS = [
  "Consulting Llama-3.1…",
  "Applying Feynman Method…",
  "Structuring concepts…",
  "Finalizing response…",
];

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [theme,       setTheme]       = useState<Theme>('light');
  const [topic,       setTopic]       = useState('');
  const [loadingIdx,  setLoadingIdx]  = useState(0);
  const [greeting,    setGreeting]    = useState('Hello');
  const [imgError,    setImgError]    = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  const {
    activeChat,
    loading,
    serverStatus,
    sessionId,
    hasStarted,
    history,
    sendMessage,
    loadHistoryItem,
    deleteHistoryItem,
    resetChat,
    pingServer,
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [activeChat, loading]);

  const handleGenerate = (forced?: string) => {
    const query = (forced || topic).trim();
    if (!query) return;
    setTopic('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setSidebarOpen(false);
    sendMessage(query);
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
    <div className={`aiva-root flex h-screen overflow-hidden transition-colors duration-200 ${
      dark ? 'bg-[#0f0f11] text-white' : 'bg-[#f0efe9] text-slate-900'
    }`}>
      <style>{globalStyles + markdownStyles}</style>

      {/* Desktop Sidebar */}
      <aside className={`w-60 hidden lg:flex flex-col flex-shrink-0 border-r ${
        dark ? 'border-white/6' : 'border-black/6'
      }`}>
        <Sidebar
          dark={dark}
          serverStatus={serverStatus}
          history={history}
          sessionId={sessionId}
          onHome={handleHome}
          onLoadItem={item => { loadHistoryItem(item); setSidebarOpen(false); }}
          onDeleteItem={handleDeleteItem}
        />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className={`fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden border-r ${
            dark ? 'border-white/6' : 'border-black/6'
          }`}>
            <Sidebar
              dark={dark}
              serverStatus={serverStatus}
              history={history}
              sessionId={sessionId}
              onHome={handleHome}
              onLoadItem={item => { loadHistoryItem(item); setSidebarOpen(false); }}
              onDeleteItem={handleDeleteItem}
            />
          </div>
        </>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 relative">

        {/* Header */}
        <header className={`flex items-center justify-between px-5 py-3 border-b sticky top-0 z-10 backdrop-blur-md ${
          dark ? 'bg-[#0f0f11]/80 border-white/6' : 'bg-[#f0efe9]/80 border-black/6'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden p-1.5 rounded-lg transition-all ${
                dark ? 'text-white/35 hover:text-white/70 hover:bg-white/5' : 'text-slate-400 hover:text-slate-700 hover:bg-black/5'
              }`}
            >
              <PanelLeft size={16} />
            </button>
            <button onClick={handleHome} className="flex items-center gap-2.5">
              <Avatar size={26} dark={dark} />
              <span className={`text-sm font-semibold ${dark ? 'text-white/80' : 'text-slate-700'}`}>
                Aiva
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {hasStarted && <StatusPill serverStatus={serverStatus} dark={dark} />}
            <button
              onClick={() => setTheme((t: Theme) => t === 'light' ? 'dark' : 'light')}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                dark ? 'text-white/40 hover:text-white/80 hover:bg-white/6' : 'text-slate-400 hover:text-slate-700 hover:bg-black/5'
              }`}
              title="Toggle theme"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* ── HOME SCREEN ── */}
        {!hasStarted && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto text-center">
            <div className="relative mb-7">
              <div className={`w-20 h-20 rounded-2xl overflow-hidden ring-1 shadow-xl ${
                dark ? 'ring-white/10' : 'ring-black/8'
              }`}>
                {!imgError
                  ? <img src={AIVA_AVATAR} onError={() => setImgError(true)} alt="Aiva" className="w-full h-full object-cover" />
                  : <div className={`w-full h-full flex items-center justify-center ${dark ? 'bg-blue-900/40' : 'bg-blue-50'}`}>
                      <Zap size={32} className="text-blue-400" />
                    </div>
                }
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ring-2 ${
                serverStatus === 'online'   ? 'bg-emerald-500' :
                serverStatus === 'checking' ? 'bg-amber-400'   : 'bg-red-400'
              } ${dark ? 'ring-[#0f0f11]' : 'ring-[#f0efe9]'}`}>
                <Zap size={10} className="text-white" fill="white" />
              </div>
            </div>

            <p className={`text-sm font-medium mb-1.5 ${dark ? 'text-white/30' : 'text-slate-400'}`}>{greeting}</p>
            <h1 className={`text-3xl font-bold tracking-tight mb-2.5 ${dark ? 'text-white' : 'text-slate-900'}`}>
              I'm Aiva.
            </h1>
            <p className={`text-sm leading-relaxed max-w-sm mb-10 ${dark ? 'text-white/38' : 'text-slate-400'}`}>
              Your AI-powered study companion. Ask me anything — concepts, summaries, or quizzes.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-9 max-w-md">
              {QUICK_PROMPTS.map(({ label, query, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => handleGenerate(query)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    dark
                      ? 'bg-white/4 border-white/8 text-white/60 hover:text-white hover:bg-white/8 hover:border-white/14'
                      : 'bg-white border-black/8 text-slate-600 hover:text-slate-900 hover:border-black/14 shadow-sm hover:shadow'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            <div className="w-full max-w-lg">
              <InputBox
                topic={topic}
                setTopic={setTopic}
                loading={loading}
                dark={dark}
                inputRef={inputRef}
                onGenerate={handleGenerate}
                placeholder="What do you want to learn today?"
              />
              <p className={`text-center text-[11px] mt-2.5 ${dark ? 'text-white/15' : 'text-slate-300'}`}>
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        )}

        {/* ── CHAT SCREEN ── */}
        {hasStarted && (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto px-4 py-8 space-y-7 pb-44">
                {activeChat.map((msg, i) => (
                  <div
                    key={msg.id}
                    className="msg"
                    style={{ animationDelay: `${i * 0.04}s`, animationFillMode: 'both' }}
                  >
                    {msg.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className={`max-w-[78%] rounded-2xl rounded-tr-md px-4 py-3 ${
                          dark ? 'bg-white/8 border border-white/6' : 'bg-white border border-black/6 shadow-sm'
                        }`}>
                          <MarkdownRenderer content={msg.text} variant="user" dark={dark} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <Avatar size={28} dark={dark} />
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${
                            dark ? 'text-blue-400/60' : 'text-blue-500/60'
                          }`}>
                            Aiva
                          </p>
                          <MarkdownRenderer content={msg.text} variant="aiva" dark={dark} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex items-start gap-3 msg">
                    <Avatar size={28} dark={dark} />
                    <div className="pt-1">
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${
                        dark ? 'text-blue-400/60' : 'text-blue-500/60'
                      }`}>
                        Aiva
                      </p>
                      <div className="flex items-center gap-3">
                        <span className={`dots flex ${dark ? 'text-white/25' : 'text-slate-300'}`}>
                          <span /><span /><span />
                        </span>
                        <span className={`text-[11px] font-medium ${dark ? 'text-white/22' : 'text-slate-300'}`}>
                          {LOADING_TEXTS[loadingIdx]}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Floating Input */}
            <div className={`absolute bottom-0 left-0 right-0 px-4 pb-5 pt-12 bg-gradient-to-t ${
              dark ? 'from-[#0f0f11] via-[#0f0f11]/90' : 'from-[#f0efe9] via-[#f0efe9]/90'
            } to-transparent`}>
              <div className="max-w-2xl mx-auto">
                <InputBox
                  topic={topic}
                  setTopic={setTopic}
                  loading={loading}
                  dark={dark}
                  inputRef={inputRef}
                  onGenerate={handleGenerate}
                  placeholder="Ask a follow-up…"
                />
                <p className={`text-center text-[10px] mt-2 ${dark ? 'text-white/12' : 'text-slate-300'}`}>
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