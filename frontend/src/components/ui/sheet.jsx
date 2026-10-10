import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Sheet({
  open,
  onOpenChange,
  side = 'right', // right | left | bottom
  children
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open && onOpenChange) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="ui-sheet-backdrop" onClick={() => onOpenChange && onOpenChange(false)}>
      <div className={`ui-sheet-panel side-${side}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ className = '', children }) {
  return <div className={`ui-sheet-header ${className}`}>{children}</div>;
}

export function SheetTitle({ className = '', children }) {
  return <h2 className={`ui-sheet-title ${className}`}>{children}</h2>;
}

export function SheetDescription({ className = '', children }) {
  return <p className={`ui-sheet-description ${className}`}>{children}</p>;
}

export function SheetBody({ className = '', children }) {
  return <div className={`ui-sheet-body ${className}`}>{children}</div>;
}

export function SheetFooter({ className = '', children }) {
  return <div className={`ui-sheet-footer ${className}`}>{children}</div>;
}

export function SheetClose({ onClick }) {
  return (
    <button className="ui-dialog-close-btn" onClick={onClick} aria-label="Close sheet">
      <X size={18} />
    </button>
  );
}
