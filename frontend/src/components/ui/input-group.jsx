import React from 'react';
import { Search } from 'lucide-react';

export function InputGroup({ className = '', children, ...props }) {
  return (
    <div
      className={`relative flex items-center w-full rounded-md border border-slate-700/80 bg-slate-900/60 transition-colors focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function InputGroupInput({ className = '', placeholder = 'Search...', ...props }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className={`w-full bg-transparent px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export function InputGroupAddon({ align = 'inline-start', className = '', children, ...props }) {
  const isEnd = align === 'inline-end';
  return (
    <div
      className={`flex items-center justify-center px-2.5 text-xs text-slate-400 select-none ${
        isEnd ? 'border-l border-slate-800' : 'text-slate-500'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function InputGroupDemo() {
  return (
    <InputGroup className="max-w-xs">
      <InputGroupAddon>
        <Search size={14} />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
    </InputGroup>
  );
}
