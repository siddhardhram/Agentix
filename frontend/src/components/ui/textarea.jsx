import React from 'react';

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none ${className}`}
      {...props}
    />
  );
}
