import React from 'react';

export function Separator({ orientation = 'horizontal', className = '', ...props }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={`ui-separator orientation-${orientation} ${className}`}
      {...props}
    />
  );
}

export function Progress({ value = 0, max = 100, className = '', ...props }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className={`ui-progress-track ${className}`} {...props}>
      <div className="ui-progress-indicator" style={{ width: `${percentage}%` }} />
    </div>
  );
}

export function Skeleton({ className = '', ...props }) {
  return <div className={`ui-skeleton ${className}`} {...props} />;
}

export function Alert({ variant = 'default', className = '', children, ...props }) {
  const variantClass = {
    default: 'alert-default',
    destructive: 'alert-destructive',
    warning: 'alert-warning',
    success: 'alert-success',
    info: 'alert-info'
  }[variant] || 'alert-default';

  return (
    <div className={`ui-alert ${variantClass} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function AlertTitle({ className = '', children }) {
  return <h5 className={`ui-alert-title ${className}`}>{children}</h5>;
}

export function AlertDescription({ className = '', children }) {
  return <div className={`ui-alert-description ${className}`}>{children}</div>;
}
