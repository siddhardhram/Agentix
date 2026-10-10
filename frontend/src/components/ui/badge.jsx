import React from 'react';

export function Badge({
  className = '',
  variant = 'default', // default | secondary | outline | success | warning | destructive | info | micro
  children,
  ...props
}) {
  const variantStyles = {
    default: 'bg-indigo-500/15 text-indigo-400 dark:text-indigo-300 border-indigo-500/30',
    secondary: 'bg-[var(--bg-card-active)] text-[var(--text-muted)] border-[var(--border-subtle)]',
    outline: 'border-[var(--border-card)] text-[var(--text-main)] bg-transparent',
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    destructive: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    info: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    micro: 'bg-slate-500/10 text-[var(--text-dim)] border-[var(--border-subtle)] text-[10px] px-1.5 py-0.2'
  }[variant] || 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
