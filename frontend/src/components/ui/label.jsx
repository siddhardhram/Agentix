import React from 'react';

export function Label({ className = '', htmlFor, children, ...props }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none text-main select-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
