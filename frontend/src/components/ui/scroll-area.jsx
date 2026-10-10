import React from 'react';

export function ScrollArea({ className = '', children, ...props }) {
  return (
    <div
      className={`relative overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function ScrollBar({ orientation = 'vertical', className = '', ...props }) {
  return null; // Handled via CSS scrollbar
}
