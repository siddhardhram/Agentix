import React from 'react';

export function Separator({
  orientation = 'horizontal',
  decorative = true,
  className = '',
  ...props
}) {
  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-orientation={orientation}
      data-orientation={orientation}
      className={`shrink-0 bg-slate-800 ${
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'
      } ${className}`}
      {...props}
    />
  );
}
