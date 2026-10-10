import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const SelectContext = createContext({
  value: '',
  onSelect: () => {},
  open: false,
  setOpen: () => {},
  disabled: false
});

export function Select({
  value,
  defaultValue = '',
  onValueChange,
  disabled = false,
  children
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedValue = value !== undefined ? value : internalValue;

  const handleSelect = (val) => {
    if (disabled) return;
    if (value === undefined) {
      setInternalValue(val);
    }
    if (onValueChange) {
      onValueChange(val);
    }
    setOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open]);

  return (
    <SelectContext.Provider value={{ value: selectedValue, onSelect: handleSelect, open, setOpen, disabled }}>
      <div ref={containerRef} className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className = '', children, id, ...props }) {
  const { open, setOpen, disabled } = useContext(SelectContext);

  return (
    <button
      id={id}
      type="button"
      disabled={disabled}
      onClick={() => !disabled && setOpen(!open)}
      className={`flex h-10 w-full items-center justify-between rounded-lg border border-[var(--border-card)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-dim)] shadow-sm transition-colors hover:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
      <ChevronDown
        size={14}
        className={`ml-2 text-[var(--text-dim)] shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-indigo-500' : ''}`}
      />
    </button>
  );
}

export function SelectValue({ placeholder = 'Select an option...', children }) {
  const { value } = useContext(SelectContext);
  return (
    <span className={`block truncate ${!value && !children ? 'text-[var(--text-dim)]' : 'text-[var(--text-main)]'}`}>
      {children || value || placeholder}
    </span>
  );
}

export function SelectContent({ className = '', children, position = 'bottom' }) {
  const { open } = useContext(SelectContext);

  if (!open) return null;

  return (
    <div
      className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-1 text-[var(--text-main)] shadow-xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-100 ${className}`}
    >
      {children}
    </div>
  );
}

export function SelectItem({ value, children, className = '' }) {
  const { value: selectedValue, onSelect } = useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <div
      onClick={() => onSelect(value)}
      className={`relative flex cursor-pointer select-none items-center justify-between rounded-md px-3 py-2 text-xs text-[var(--text-main)] outline-none transition-colors hover:bg-[var(--bg-card-hover)] ${
        isSelected ? 'bg-indigo-500/15 font-semibold text-indigo-500' : ''
      } ${className}`}
    >
      <span className="truncate">{children}</span>
      {isSelected && <Check size={14} className="text-indigo-500 shrink-0 ml-2" />}
    </div>
  );
}
