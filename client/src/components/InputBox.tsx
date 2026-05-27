import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react';

export const resizeTextarea = (el: HTMLTextAreaElement) => {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 140) + 'px';
};

interface InputBoxProps {
  topic: string;
  setTopic: (v: string) => void;
  loading: boolean;
  dark: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onGenerate: () => void;
  placeholder: string;
}

export const InputBox = ({
  topic, setTopic, loading, dark, inputRef, onGenerate, placeholder,
}: InputBoxProps) => {
  const [focused, setFocused] = useState(false);
  const canSend = topic.trim() && !loading;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 10,
      padding: '12px 14px',
      borderRadius: 14,
      transition: 'border-color .15s, box-shadow .15s',
      background: dark ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.9)',
      border: focused
        ? `1px solid ${dark ? 'rgba(201,169,110,.3)' : 'rgba(201,169,110,.45)'}`
        : `1px solid ${dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.08)'}`,
      boxShadow: focused
        ? (dark ? '0 0 0 3px rgba(201,169,110,.06)' : '0 0 0 3px rgba(201,169,110,.1)')
        : 'none',
    }}>
      <textarea
        ref={inputRef}
        rows={1}
        placeholder={placeholder}
        value={topic}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={e => { setTopic(e.target.value); resizeTextarea(e.target); }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onGenerate(); }
        }}
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          resize: 'none', minHeight: 22, fontSize: 13.5, lineHeight: 1.6,
          fontFamily: "'Sora', sans-serif", fontWeight: 400,
          color: dark ? 'rgba(232,228,220,.9)' : 'rgba(28,26,23,.88)',
        }}
      />
      <button
        onClick={onGenerate}
        disabled={!canSend}
        style={{
          flexShrink: 0, width: 32, height: 32, borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: canSend ? 'pointer' : 'default',
          transition: 'all .15s', transform: 'scale(1)',
          background: canSend
            ? '#c9a96e'
            : (dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'),
          color: canSend ? '#1c1a17' : (dark ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.2)'),
        }}
        onMouseEnter={e => { if (canSend) (e.currentTarget as HTMLButtonElement).style.background = '#dbbe86'; }}
        onMouseLeave={e => { if (canSend) (e.currentTarget as HTMLButtonElement).style.background = '#c9a96e'; }}
      >
        <ArrowUp size={14} strokeWidth={2.2} />
      </button>
    </div>
  );
};