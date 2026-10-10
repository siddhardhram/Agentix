import React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-main)] shadow-xl backdrop-blur-xl transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3
      className={cn(
        "font-bold tracking-tight text-2xl text-[var(--text-main)]",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <p
      className={cn(
        "text-sm text-[var(--text-muted)] leading-relaxed",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={cn("p-6 pt-0 text-[var(--text-main)]", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div
      className={cn(
        "flex items-center p-6 pt-0 border-t border-[var(--border-subtle)] mt-4 pt-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
