import React from 'react';
import { cn } from '@/lib/utils';

export function FieldGroup({ className = '', children, ...props }) {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {children}
    </div>
  );
}

export function Field({ orientation = 'vertical', className = '', children, ...props }) {
  const isHorizontal = orientation === 'horizontal';
  return (
    <div
      className={cn(
        "flex",
        isHorizontal ? "flex-row items-center justify-between gap-3" : "flex-col gap-1.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FieldContent({ className = '', children, ...props }) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  );
}

export function FieldLabel({ className = '', children, htmlFor, ...props }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("text-xs font-semibold text-[var(--text-main)] select-none cursor-pointer", className)}
      {...props}
    >
      {children}
    </label>
  );
}

export function FieldTitle({ className = '', children, ...props }) {
  return (
    <div className={cn("text-sm font-medium text-[var(--text-main)]", className)} {...props}>
      {children}
    </div>
  );
}

export function FieldDescription({ className = '', children, ...props }) {
  return (
    <p className={cn("text-xs text-[var(--text-dim)] leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}
