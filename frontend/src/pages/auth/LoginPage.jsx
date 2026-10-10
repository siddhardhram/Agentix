import React from 'react';
import { LoginForm } from '@/components/login-form';
import { Cpu, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[var(--bg-primary)] p-6 md:p-10 overflow-hidden transition-colors">
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] shadow-sm transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun size={16} className="text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon size={16} className="text-indigo-600 hover:-rotate-12 transition-transform" />
          )}
        </button>
      </div>

      {/* Glow effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.12),transparent)]" />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      {/* Brand header */}
      <div className="relative z-10 mb-6 flex flex-col items-center gap-2">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Cpu size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--text-main)]">Agentix</span>
        </Link>
        <span className="text-xs text-[var(--text-muted)]">Autonomous AI Platform &amp; Engineering Control</span>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
