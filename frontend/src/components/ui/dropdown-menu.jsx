import React, { useState, useRef, useEffect } from 'react';

export function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, { open, setOpen });
      })}
    </div>
  );
}

export function DropdownMenuTrigger({ asChild, children, open, setOpen, className = '', ...props }) {
  const handleClick = (e) => {
    e.stopPropagation();
    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      'aria-expanded': open,
      className: `${children.props.className || ''} ${className}`
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-expanded={open}
      className={`inline-flex items-center justify-center ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({ open, setOpen, align = 'end', className = '', children, ...props }) {
  if (!open) return null;

  const alignClass = align === 'start' ? 'left-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0';

  return (
    <div
      role="menu"
      className={`absolute ${alignClass} top-full mt-2 w-56 min-w-[8rem] rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in-0 zoom-in-95 ${className}`}
      onClick={() => setOpen(false)}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ className = '', children, onClick, ...props }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)] transition-colors text-left focus:outline-none ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuLabel({ className = '', children, ...props }) {
  return (
    <div className={`px-2.5 py-1.5 text-xs font-semibold text-[var(--text-main)] ${className}`} {...props}>
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className = '', ...props }) {
  return <div className={`my-1 h-[1px] bg-[var(--border-subtle)] ${className}`} {...props} />;
}
