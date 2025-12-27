import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import ReactMarkdown from 'react-markdown';
import { 
  Trash2, Send, ArrowLeft, Sparkles, User, Lightbulb, BookOpen, HelpCircle, Activity, Info
} from 'lucide-react';

// --- CONFIGURATION ---
const AIVA_AVATAR = "/aiva.jpg"; 
// MATCHES YOUR WORKING BACKEND:
const BACKEND_URL = "https://aiva-npn0.onrender.com/api/generate";
const SERVER_HOME = "https://aiva-npn0.onrender.com/healthz"; // Using the healthz route we added

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [topic, setTopic] = useState("");
  const [activeChat, setActiveChat] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Thinking...");
  const [greeting, setGreeting] = useState("Hey");
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'sleeping'>('checking');
  
  const [imgError, setImgError] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [history, setHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('study_vault');
    return saved ? JSON.parse(saved) : [];
  });

  // 1. AUTO-WAKE: Pings Render immediately on load
  useEffect(() => {
    const wakeServer = async () => {
      try {
        const res = await fetch(SERVER_HOME);
        if (res.ok) setServerStatus('online');
        else setServerStatus('sleeping');
      } catch (e) {
        setServerStatus('sleeping');
      }
    };
    wakeServer();
  }, []);

  // 2. Loading Text Cycles
  useEffect(() => {
    if (loading) {
      const texts = ["Consulting Llama-3.1...", "Applying Feynman Method...", "Structuring concepts...", "Finalizing response..."];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingText(texts[i % texts.length]);
        i++;
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  // 3. Greetings & Storage Persistence
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => { 
    localStorage.setItem('study_vault', JSON.stringify(history)); 
  }, [history]);

  // 4. Auto-Scroll to Bottom
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [activeChat, loading]);

  const handleGenerate = async (forcedTopic?: string) => {
    const query = forcedTopic || topic;
    if (!query.trim()) return;
    
    if (!forcedTopic) setTopic(""); 
    setHasStarted(true);
    setLoading(true);
    
    const userMsg = { id: Date.now().toString(), role: 'user', text: query };
    setActiveChat(prev => [...prev, userMsg]);

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: query }),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Server error");

      const aiText = data.result || "I processed that, but my response was empty.";
      
      setActiveChat(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'aiva', text: aiText }]);
      setHistory(prev => [{ id: Date.now().toString(), topic: query, content: aiText, timestamp: Date.now() }, ...prev]);
      setServerStatus('online');
    } catch (err: any) { 
      setActiveChat(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'aiva', 
        text: `⚠️ **Server is warming up.** Render's free tier takes about 50 seconds to boot. \n\n*Error Detail: ${err.message}* \n\nPlease try again in a few seconds!` 
      }]);
      setServerStatus('sleeping');
    } finally { 
      setLoading(false); 
    }
  };

  const goHome = () => { setHasStarted(false); setActiveChat([]); setTopic(""); };

  const AivaAvatar = ({ size = "w-10 h-10" }: { size?: string }) => (
    <div className={`${size} rounded-full overflow-hidden border-2 border-indigo-500 shadow-sm flex-shrink-0 bg-indigo-100 flex items-center justify-center`}>
      {!imgError ? (
        <img src={AIVA_AVATAR} onError={() => setImgError(true)} alt="Aiva" className="w-full h-full object-cover" />
      ) : (
        <User className="text-indigo-400" size={20} />
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col hidden lg:flex">
        <div onClick={goHome} className="p-6 border-b flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all">
          <div className="flex items-center gap-3">
            <AivaAvatar size="w-10 h-10" />
            <span className="text-xl font-black tracking-tighter uppercase italic text-indigo-600">Aiva</span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-black uppercase border ${
            serverStatus === 'online' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
            serverStatus === 'checking' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-rose-50 text-rose-600 border-rose-200'
          }`}>
            <Activity size={10} className={serverStatus === 'checking' ? 'animate-spin' : ''} />
            {serverStatus}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4">Memory Bank</h2>
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item.id} onClick={() => { setHasStarted(true); setActiveChat([{id:'1', role:'user', text:item.topic}, {id:'2', role:'aiva', text:item.content}])}}
                className="group relative p-3 text-sm bg-slate-50 hover:bg-white rounded-xl cursor-pointer transition-all border border-transparent hover:shadow-md"
              >
                <div className="font-bold text-slate-700 truncate pr-8">{item.topic}</div>
                <button onClick={(e) => { e.stopPropagation(); setHistory(prev => prev.filter(i => i.id !== item.id)); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-slate-50">
        {!hasStarted ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
             <div className="mb-6 relative">
                <div className="w-48 h-48 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-white">
                   <img src={AIVA_AVATAR} alt="Aiva" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-2xl shadow-lg animate-bounce">
                  <Sparkles size={24} />
                </div>
             </div>
             <div className="space-y-1 mb-8">
                <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">{greeting}!</span>
                <h1 className="text-7xl font-black text-slate-900 tracking-tighter italic">I am Aiva.</h1>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl w-full mb-10">
                <button onClick={() => handleGenerate("Explain Quantum Physics")} className="flex items-center gap-3 p-4 bg-white border rounded-2xl hover:border-indigo-500 transition-all group">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white"><Lightbulb size={20}/></div>
                  <span className="font-bold text-[10px] uppercase tracking-tighter">Concept Mentor</span>
                </button>
                <button onClick={() => handleGenerate("Summarize The Silk Road")} className="flex items-center gap-3 p-4 bg-white border rounded-2xl hover:border-indigo-500 transition-all group">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white"><BookOpen size={20}/></div>
                  <span className="font-bold text-[10px] uppercase tracking-tighter">Memory Architect</span>
                </button>
                <button onClick={() => handleGenerate("Quiz me on Cell Biology")} className="flex items-center gap-3 p-4 bg-white border rounded-2xl hover:border-indigo-500 transition-all group">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white"><HelpCircle size={20}/></div>
                  <span className="font-bold text-[10px] uppercase tracking-tighter">Quiz Master</span>
                </button>
             </div>
             <button onClick={() => setHasStarted(true)} className="bg-indigo-600 text-white px-12 py-6 rounded-full text-xl font-black shadow-2xl hover:bg-indigo-700 transition-all">NEW CHAT</button>
          </div>
        ) : (
          <>
            <div className="bg-white/90 backdrop-blur-md border-b p-4 flex items-center justify-between sticky top-0 z-10">
              <button onClick={goHome} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs"><ArrowLeft size={14} /> HOME</button>
              <div className="flex items-center gap-2">
                <AivaAvatar size="w-7 h-7" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">AIVA ASSISTANT</span>
              </div>
              <div className="w-12"></div>
            </div>

            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
              <div className="w-full max-w-3xl space-y-8 pb-48">
                {activeChat.map((msg) => (
                  <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.role === 'aiva' && <AivaAvatar size="w-9 h-9" />}
                    <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] shadow-sm ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                      <div className={`prose prose-sm ${msg.role === 'user' ? 'prose-invert' : 'prose-slate'} max-w-none`}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-200 rounded-full animate-pulse" />
                      <div className="bg-white px-6 py-4 rounded-2xl rounded-tl-none shadow-sm border animate-pulse">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{loadingText}</span>
                      </div>
                    </div>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-50 to-transparent">
              <div className="max-w-3xl mx-auto flex flex-col gap-2 bg-white p-2 rounded-[2rem] shadow-2xl border">
                <textarea 
                  rows={1}
                  className="w-full p-4 text-lg outline-none bg-transparent font-medium px-6 resize-none"
                  placeholder="Ask me anything..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleGenerate())}
                />
                <div className="flex justify-between items-center px-4 pb-2">
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase">
                     <Info size={12} /> Shift + Enter for new line
                   </div>
                   <button onClick={() => handleGenerate()} className="bg-indigo-600 text-white p-4 rounded-full hover:scale-105 transition-all shadow-lg">
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}