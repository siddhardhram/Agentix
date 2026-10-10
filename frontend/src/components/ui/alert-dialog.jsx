import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export function AlertDialog({
  open,
  onOpenChange,
  title = 'Are you absolutely sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Continue',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'destructive', // destructive | default
  loading = false
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
    <div className="ui-dialog-backdrop" onClick={() => onOpenChange && onOpenChange(false)}>
      <div className="ui-dialog-content ui-alert-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="ui-alert-dialog-icon-row">
          <div className={`ui-alert-icon-box ${variant === 'destructive' ? 'is-destructive' : 'is-info'}`}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 className="ui-dialog-title">{title}</h3>
            <p className="ui-dialog-description">{description}</p>
          </div>
        </div>

        <div className="ui-dialog-footer">
          <button
            type="button"
            className="ui-btn btn-secondary btn-md"
            onClick={() => onOpenChange && onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`ui-btn ${variant === 'destructive' ? 'btn-destructive' : 'btn-primary'} btn-md`}
            onClick={() => {
              if (onConfirm) onConfirm();
            }}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
