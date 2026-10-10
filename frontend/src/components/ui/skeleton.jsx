import React from 'react';

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className}`}
      {...props}
    />
  );
}

export function SkeletonDemo() {
  return (
    <div className="flex items-center gap-4 p-4 border border-slate-800 rounded-lg bg-slate-900/50">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
