import React from 'react';

export function Alert({ variant = 'default', className = '', children, ...props }) {
  const variantStyles = {
    default: 'bg-slate-900/90 text-slate-200 border-slate-800',
    destructive: 'bg-rose-500/10 text-rose-300 border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800/60',
    warning: 'bg-amber-500/10 text-amber-300 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/60',
    success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/60',
    info: 'bg-sky-500/10 text-sky-300 border-sky-500/30 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800/60'
  }[variant] || 'bg-slate-900/90 text-slate-200 border-slate-800';

  return (
    <div
      role="alert"
      className={`relative w-full rounded-lg border p-4 text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-current ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertTitle({ className = '', children, ...props }) {
  return (
    <h5
      className={`mb-1 font-semibold leading-none tracking-tight text-current ${className}`}
      {...props}
    >
      {children}
    </h5>
  );
}

export function AlertDescription({ className = '', children, ...props }) {
  return (
    <div
      className={`text-xs opacity-90 leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
