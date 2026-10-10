import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Dialog({ open, onOpenChange, children }) {
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
    <div className="ui-dialog-backdrop" onClick={() => onOpenChange && onOpenChange(false)}>
      <div className="ui-dialog-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className = '', children }) {
  return <div className={`ui-dialog-header ${className}`}>{children}</div>;
}

export function DialogTitle({ className = '', children }) {
  return <h2 className={`ui-dialog-title ${className}`}>{children}</h2>;
}

export function DialogDescription({ className = '', children }) {
  return <p className={`ui-dialog-description ${className}`}>{children}</p>;
}

export function DialogBody({ className = '', children }) {
  return <div className={`ui-dialog-body ${className}`}>{children}</div>;
}

export function DialogFooter({ className = '', children }) {
  return <div className={`ui-dialog-footer ${className}`}>{children}</div>;
}

export function DialogContent({ className = '', children }) {
  return <div className={`ui-dialog-content-inner ${className}`}>{children}</div>;
}

export function DialogTrigger({ asChild, children, onClick }) {
  return <div onClick={onClick} className="inline-block cursor-pointer">{children}</div>;
}

export function DialogClose({ onClick }) {
  return (
    <button className="ui-dialog-close-btn" onClick={onClick} aria-label="Close dialog">
      <X size={18} />
    </button>
  );
}
