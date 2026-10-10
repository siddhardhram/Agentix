import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext({
  toast: (options) => {},
  success: (title, desc) => {},
  error: (title, desc) => {},
  warning: (title, desc) => {},
  info: (title, desc) => {}
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast = { id, duration: 4000, ...toast };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }, [removeToast]);

  const success = useCallback((title, description = '') => {
    addToast({ type: 'success', title, description });
  }, [addToast]);

  const error = useCallback((title, description = '') => {
    addToast({ type: 'error', title, description });
  }, [addToast]);

  const warning = useCallback((title, description = '') => {
    addToast({ type: 'warning', title, description });
  }, [addToast]);

  const info = useCallback((title, description = '') => {
    addToast({ type: 'info', title, description });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, warning, info }}>
      {children}
      <div className="ui-toast-container" aria-live="polite">
        {toasts.map((t) => {
          const Icon = t.type === 'success' ? CheckCircle2 :
                       t.type === 'error' ? AlertCircle :
                       t.type === 'warning' ? AlertTriangle : Info;

          return (
            <div key={t.id} className={`ui-toast toast-${t.type}`}>
              <div className="toast-icon-box">
                <Icon size={18} />
              </div>
              <div className="toast-content">
                <div className="toast-title">{t.title}</div>
                {t.description && <div className="toast-desc">{t.description}</div>}
              </div>
              <button
                type="button"
                className="toast-close"
                onClick={() => removeToast(t.id)}
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
