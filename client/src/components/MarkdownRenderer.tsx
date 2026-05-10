import React from 'react';
// @ts-ignore
import ReactMarkdown from 'react-markdown';

// ─── PROPS ────────────────────────────────────────────────────────────────────
interface MarkdownRendererProps {
  content: string;
  variant: 'aiva' | 'user';
  dark: boolean;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
export const markdownStyles = `
  .prose-dark { color: rgba(255,255,255,.8); line-height: 1.78; font-size: .925rem; }
  .prose-dark p { margin: 0 0 .7em; } .prose-dark p:last-child { margin-bottom: 0; }
  .prose-dark strong { color: #fff; font-weight: 600; }
  .prose-dark em { color: rgba(255,255,255,.6); font-style: italic; }
  .prose-dark code { font-family: 'DM Mono',monospace; background: rgba(255,255,255,.08); padding: .15em .4em; border-radius: 5px; font-size: .82em; color: #93c5fd; }
  .prose-dark pre { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; padding: 1em 1.2em; overflow-x: auto; margin: .6em 0; }
  .prose-dark pre code { background: none; padding: 0; color: rgba(255,255,255,.8); }
  .prose-dark ul,.prose-dark ol { padding-left: 1.3em; margin: .4em 0; }
  .prose-dark li { margin: .3em 0; }
  .prose-dark h1,.prose-dark h2,.prose-dark h3 { color: #fff; font-weight: 600; margin: .9em 0 .4em; }
  .prose-dark h1 { font-size: 1.15em; } .prose-dark h2 { font-size: 1.08em; } .prose-dark h3 { font-size: 1em; }
  .prose-dark blockquote { border-left: 2px solid rgba(147,197,253,.35); padding-left: 1em; color: rgba(255,255,255,.45); margin: .6em 0; }
  .prose-dark hr { border: none; border-top: 1px solid rgba(255,255,255,.08); margin: .8em 0; }

  .prose-light { color: #374151; line-height: 1.78; font-size: .925rem; }
  .prose-light p { margin: 0 0 .7em; } .prose-light p:last-child { margin-bottom: 0; }
  .prose-light strong { color: #111827; font-weight: 600; }
  .prose-light em { color: #6b7280; font-style: italic; }
  .prose-light code { font-family: 'DM Mono',monospace; background: #eff6ff; padding: .15em .4em; border-radius: 5px; font-size: .82em; color: #2563eb; }
  .prose-light pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1em 1.2em; overflow-x: auto; margin: .6em 0; }
  .prose-light pre code { background: none; padding: 0; color: #334155; }
  .prose-light ul,.prose-light ol { padding-left: 1.3em; margin: .4em 0; }
  .prose-light li { margin: .3em 0; }
  .prose-light h1,.prose-light h2,.prose-light h3 { color: #0f172a; font-weight: 600; margin: .9em 0 .4em; }
  .prose-light h1 { font-size: 1.15em; } .prose-light h2 { font-size: 1.08em; } .prose-light h3 { font-size: 1em; }
  .prose-light blockquote { border-left: 2px solid #bfdbfe; padding-left: 1em; color: #6b7280; margin: .6em 0; }
  .prose-light hr { border: none; border-top: 1px solid #e5e7eb; margin: .8em 0; }

  .prose-user-d { color: rgba(255,255,255,.88); line-height: 1.7; font-size: .925rem; }
  .prose-user-d p { margin: 0 0 .5em; } .prose-user-d p:last-child { margin-bottom: 0; }
  .prose-user-l { color: #1e293b; line-height: 1.7; font-size: .925rem; }
  .prose-user-l p { margin: 0 0 .5em; } .prose-user-l p:last-child { margin-bottom: 0; }
`;

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export const MarkdownRenderer = ({ content, variant, dark }: MarkdownRendererProps) => {
  const className =
    variant === 'user'
      ? (dark ? 'prose-user-d' : 'prose-user-l')
      : (dark ? 'prose-dark'   : 'prose-light');

  return (
    <div className={className}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};