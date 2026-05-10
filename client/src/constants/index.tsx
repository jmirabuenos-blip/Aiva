import { Lightbulb, BookOpen, HelpCircle } from 'lucide-react';
import type { QuickPrompt } from '../types';

// ─── API ──────────────────────────────────────────────────────────────────────
export const BACKEND_URL = "https://aiva-npn0.onrender.com/api/generate";
export const SERVER_HOME = "https://aiva-npn0.onrender.com/healthz";

// ─── AVATAR ───────────────────────────────────────────────────────────────────
export const AIVA_AVATAR = "/aiva.jpg";

// ─── LOADING ──────────────────────────────────────────────────────────────────
export const LOADING_TEXTS = [
  "Consulting Llama-3.1…",
  "Applying Feynman Method…",
  "Structuring concepts…",
  "Finalizing response…",
];

// ─── QUICK PROMPTS ────────────────────────────────────────────────────────────
export const QUICK_PROMPTS: QuickPrompt[] = [
  { label: "Concept Mentor",   query: "Explain Quantum Physics", icon: Lightbulb  },
  { label: "Memory Architect", query: "Summarize The Silk Road", icon: BookOpen   },
  { label: "Quiz Master",      query: "Quiz me on Cell Biology", icon: HelpCircle },
];