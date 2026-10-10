import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function UnauthorizedPage() {
  const { role } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--bg-primary)] px-4 text-center transition-colors">
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

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_30%,rgba(244,63,94,0.06),transparent)]" />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/30">
          <ShieldX size={36} className="text-rose-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-[var(--text-main)]">403</h1>
          <p className="mt-1 text-lg font-semibold text-[var(--text-muted)]">Access Denied</p>
          <p className="mt-2 max-w-sm text-sm text-[var(--text-dim)] leading-relaxed">
            You don&apos;t have permission to view this page. Your current role
            ({role ? <span className="font-semibold text-[var(--text-main)]">{role.toUpperCase()}</span> : 'UNAUTHENTICATED'})
            does not meet the requirements for this resource.
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          {role && (
            <Link
              to={`/${role}/dashboard`}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all"
            >
              <Home size={15} />
              Go to Dashboard
            </Link>
          )}
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-colors"
          >
            <ArrowLeft size={15} />
            Sign in with different account
          </Link>
        </div>
      </div>
    </div>
  );
}
