import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import ReactMarkdown from 'react-markdown';
import { 
  Trash2, Send, ArrowLeft, Sparkles, User, Lightbulb, BookOpen, HelpCircle 
} from 'lucide-react';

interface Message {
  id: string; role: 'user' | 'aiva'; text: string;
}

interface StudySession {
  id: string; topic: string; content: string; timestamp: number;
}

const AIVA_AVATAR = "/aiva.jpg"; 
// THE PRODUCTION BACKEND URL
const BACKEND_URL = "https://aiva-ddmx.onrender.com/api/generate";

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [topic, setTopic] = useState("");
  const [activeChat, setActiveChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Thinking...");
  const [greeting, setGreeting] = useState("Hey");
  
  const [confirmClear, setConfirmClear] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('study_vault');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (loading) {
      const texts = ["Analyzing topic...", "Structuring logic...", "Creating analogies...", "Almost there..."];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingText(texts[i % texts.length]);
        i++;
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => { 
    localStorage.setItem('study_vault', JSON.stringify(history)); 
  }, [history]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [activeChat, loading]);

  const handleGenerate = async (forcedTopic?: string) => {
    const query = forcedTopic || topic;
    if (!query.trim()) return;
    
    // Clear input if it wasn't a forced button click
    if (!forcedTopic) setTopic(""); 
    
    setHasStarted(true);
    setLoading(true);
    
    // Add User Message to UI
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: query };
    setActiveChat(prev => [...prev, userMsg]);

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: query }),
      });
      
      const data = await response.json();
      const aiText = data.result || "I'm having trouble connecting to my brain right now. Try again?";
      
      setActiveChat(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'aiva', text: aiText }]);
      setHistory(prev => [{ id: Date.now().toString(), topic: query, content: aiText, timestamp: Date.now() }, ...prev]);
    } catch (err) { 
      console.error(err); 
      setActiveChat(prev => [...prev, { id: Date.now().toString(), role: 'aiva', text: "⚠️ Connection Error: Is the backend waking up?" }]);
    } finally { 
      setLoading(false); 
    }
  };

  const handleClearAll = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setHistory([]);
      setIsDeleting(false);
      setConfirmClear(false);
    }, 400); 
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
        <div onClick={goHome} className="p-6 border-b flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-all">
          <AivaAvatar size="w-10 h-10" />
          <span className="text-xl font-black tracking-tighter uppercase italic text-indigo-600">Aiva</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between px-2 mb-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memory Bank</h2>
            {history.length > 0 && (
              <div className="flex items-center gap-2">
                {!confirmClear ? (
                  <button onClick={() => setConfirmClear(true)} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase transition-colors">Clear</button>
                ) : (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-1">
                    <button onClick={handleClearAll} className="text-[10px] font-black text-rose-600 uppercase">Confirm</button>
                    <button onClick={() => setConfirmClear(false)} className="text-[10px] font-bold text-slate-400 uppercase">Cancel</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={`space-y-2 transition-all duration-500 ${isDeleting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
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
          <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-in fade-in duration-700">
             <div className="mb-6 relative">
                <div className="w-48 h-48 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-white">
                   <img src={AIVA_AVATAR} alt="Aiva" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-2xl shadow-lg animate-bounce">
                  <Sparkles size={24} />
                </div>
             </div>
             
             <div className="space-y-1 mb-8">
                <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold uppercase tracking-widest">{greeting}!</span>
                <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-tight block pt-4 italic">I am Aiva.</h1>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl w-full mb-10">
                <button onClick={() => handleGenerate("Explain photosynthesis using the Feynman technique")} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all group">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors"><Lightbulb size={20}/></div>
                  <div className="text-left font-bold text-[10px] text-slate-600 uppercase tracking-tighter leading-tight">Feynman<br/>Explain</div>
                </button>
                <button onClick={() => handleGenerate("Summarize the main points of World War 2")} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all group">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors"><BookOpen size={20}/></div>
                  <div className="text-left font-bold text-[10px] text-slate-600 uppercase tracking-tighter leading-tight">Quick<br/>Summary</div>
                </button>
                <button onClick={() => handleGenerate("Quiz me on basic chemistry")} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all group">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors"><HelpCircle size={20}/></div>
                  <div className="text-left font-bold text-[10px] text-slate-600 uppercase tracking-tighter leading-tight">Test My<br/>Knowledge</div>
                </button>
             </div>

             <button onClick={() => setHasStarted(true)} className="bg-indigo-600 text-white px-12 py-6 rounded-full text-xl font-black shadow-2xl hover:bg-indigo-700 hover:scale-105 transition-all active:scale-95">NEW CHAT</button>
          </div>
        ) : (
          <>
            <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10">
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
                  <div key={msg.id} className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2 duration-300`}>
                    {msg.role === 'aiva' && <AivaAvatar size="w-9 h-9" />}
                    <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] shadow-sm ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                      <div className={`max-w-none prose ${msg.role === 'user' ? 'prose-invert prose-p:text-white' : 'prose-slate prose-p:leading-relaxed prose-headings:text-indigo-600'}`}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                   <div className="flex items-center gap-3">
                     <div className="w-9 h-9 bg-slate-200 rounded-full animate-pulse" />
                     <div className="bg-white px-6 py-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex flex-col gap-2">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest animate-pulse">{loadingText}</span>
                     </div>
                   </div>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
              <div className="max-w-3xl mx-auto flex flex-col gap-2 bg-white p-2 rounded-[2rem] shadow-2xl border border-slate-200 focus-within:ring-4 ring-indigo-50 transition-all">
                <textarea 
                  rows={1}
                  className="w-full p-4 text-lg outline-none bg-transparent font-medium px-6 resize-none min-h-[56px] max-h-[200px]"
                  placeholder="What are we learning today?"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                />
                <div className="flex justify-between items-center px-4 pb-2">
                   <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Shift + Enter for new line</div>
                   <button onClick={() => handleGenerate()} className="bg-indigo-600 text-white p-4 rounded-full hover:scale-105 transition-all shadow-lg active:scale-95">
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