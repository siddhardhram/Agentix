import React from 'react';
import { Check } from 'lucide-react';

export function Checkbox({
  id,
  name,
  checked,
  defaultChecked,
  defaultSelected,
  isDisabled,
  disabled,
  onChange,
  className = '',
  ...props
}) {
  const isChecked = checked !== undefined ? checked : (defaultChecked || defaultSelected || false);
  const isBlocked = isDisabled || disabled;

  return (
    <label
      htmlFor={id}
      className={`relative inline-flex items-center justify-center h-4 w-4 shrink-0 rounded border border-slate-700 bg-slate-900/90 transition-all cursor-pointer select-none ${
        isBlocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500'
      } ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : ''} ${className}`}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        defaultChecked={defaultChecked || defaultSelected}
        disabled={isBlocked}
        onChange={onChange}
        className="sr-only"
        {...props}
      />
      {isChecked && <Check size={12} strokeWidth={3} className="text-white" />}
    </label>
  );
}
