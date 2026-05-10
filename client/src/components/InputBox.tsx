import React from 'react';
import { Send } from 'lucide-react';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export const resizeTextarea = (el: HTMLTextAreaElement) => {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 140) + 'px';
};

// ─── PROPS ────────────────────────────────────────────────────────────────────
interface InputBoxProps {
  topic: string;
  setTopic: (v: string) => void;
  loading: boolean;
  dark: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onGenerate: () => void;
  placeholder: string;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export const InputBox = ({
  topic,
  setTopic,
  loading,
  dark,
  inputRef,
  onGenerate,
  placeholder,
}: InputBoxProps) => (
  <div className={`flex items-end gap-3 rounded-2xl px-4 py-3 border transition-all ${
    dark
      ? 'bg-white/5 border-white/8 focus-within:border-white/16 focus-within:bg-white/7 shadow-lg'
      : 'bg-white border-black/8 focus-within:border-blue-300 shadow-sm focus-within:shadow-md'
  }`}>
    <textarea
      ref={inputRef}
      rows={1}
      className={`flex-1 bg-transparent outline-none text-sm resize-none leading-relaxed font-medium ${
        dark ? 'text-white/90 placeholder-white/22' : 'text-slate-800 placeholder-slate-300'
      }`}
      placeholder={placeholder}
      value={topic}
      onChange={e => { setTopic(e.target.value); resizeTextarea(e.target); }}
      onKeyDown={e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onGenerate();
        }
      }}
      style={{ minHeight: '22px' }}
    />
    <button
      onClick={onGenerate}
      disabled={!topic.trim() || loading}
      className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
        topic.trim() && !loading
          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
          : (dark ? 'bg-white/6 text-white/20' : 'bg-slate-100 text-slate-300')
      }`}
    >
      <Send size={13} />
    </button>
  </div>
);