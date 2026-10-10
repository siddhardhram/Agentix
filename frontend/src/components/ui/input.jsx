import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef(({
  className = '',
  type = 'text',
  error = false,
  ...props
}, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-dim)] outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/30",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';
