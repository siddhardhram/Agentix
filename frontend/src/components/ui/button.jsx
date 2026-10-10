import React from 'react';
import { cn } from '@/lib/utils';

export const Button = React.forwardRef(({
  className = '',
  variant = 'default', // default | secondary | outline | ghost | destructive | link
  size = 'default',    // default | sm | lg | icon
  children,
  disabled,
  loading = false,
  type = 'button',
  asChild = false,
  ...props
}, ref) => {
  const variantStyles = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20 active:scale-[0.99]',
    secondary: 'bg-[var(--bg-secondary)] text-[var(--text-main)] hover:bg-[var(--bg-card-active)] border border-[var(--border-card)]',
    outline: 'border border-[var(--border-card)] bg-transparent hover:bg-[var(--bg-card-hover)] text-[var(--text-main)]',
    ghost: 'hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]',
    destructive: 'bg-rose-500/15 border border-rose-500/30 text-rose-500 hover:bg-rose-500/25',
    link: 'text-indigo-500 underline-offset-4 hover:underline hover:text-indigo-600 p-0 h-auto font-normal',
  }[variant] || 'bg-indigo-600 text-white hover:bg-indigo-500';

  const sizeStyles = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-11 px-8 text-base',
    icon: 'h-9 w-9 p-0',
  }[size] || 'h-10 px-4 py-2 text-sm';

  const combinedClassName = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50 select-none",
    variantStyles,
    sizeStyles,
    className
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      className: cn(combinedClassName, children.props.className),
      ...props,
    });
  }

  return (
    <button
      ref={ref}
      type={type}
      className={combinedClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin text-current" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
