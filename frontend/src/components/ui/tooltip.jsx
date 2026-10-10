import React, { useState } from 'react';

export function TooltipProvider({ children }) {
  return <>{children}</>;
}

export function Tooltip({ children, delayDuration = 200 }) {
  const [visible, setVisible] = useState(false);
  const [timer, setTimer] = useState(null);

  const show = () => {
    const t = setTimeout(() => setVisible(true), delayDuration);
    setTimer(t);
  };

  const hide = () => {
    if (timer) clearTimeout(timer);
    setVisible(false);
  };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        if (child.type === TooltipTrigger) {
          return child;
        }
        if (child.type === TooltipContent) {
          return visible ? child : null;
        }
        return child;
      })}
    </div>
  );
}

export function TooltipTrigger({ asChild, children, className = '', ...props }) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: `${children.props.className || ''} ${className}`
    });
  }
  return (
    <span className={`inline-flex ${className}`} {...props}>
      {children}
    </span>
  );
}

export function TooltipContent({ side = 'top', className = '', children, ...props }) {
  const sideClass =
    side === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-2' :
    side === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2' :
    side === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2' :
    'bottom-full left-1/2 -translate-x-1/2 mb-2';

  return (
    <div
      role="tooltip"
      className={`absolute ${sideClass} z-50 overflow-hidden rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-main)] shadow-md animate-in fade-in-0 zoom-in-95 pointer-events-none whitespace-nowrap ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
