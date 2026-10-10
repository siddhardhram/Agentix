import React from 'react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';

export function Breadcrumb({ className = '', ...props }) {
  return <nav aria-label="breadcrumb" className={`flex items-center text-sm ${className}`} {...props} />;
}

export function BreadcrumbList({ className = '', ...props }) {
  return (
    <ol
      className={`flex flex-wrap items-center gap-1.5 break-words text-sm text-muted ${className}`}
      {...props}
    />
  );
}

export function BreadcrumbItem({ className = '', ...props }) {
  return <li className={`inline-flex items-center gap-1.5 ${className}`} {...props} />;
}

export function BreadcrumbLink({ className = '', href, ...props }) {
  return (
    <a
      href={href || '#'}
      className={`transition-colors hover:text-main text-muted ${className}`}
      {...props}
    />
  );
}

export function BreadcrumbPage({ className = '', ...props }) {
  return (
    <span
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={`font-medium text-main ${className}`}
      {...props}
    />
  );
}

export function BreadcrumbSeparator({ children, className = '', ...props }) {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={`[&>svg]:size-3.5 text-dim ${className}`}
      {...props}
    >
      {children || <ChevronRight size={14} />}
    </li>
  );
}

export function BreadcrumbEllipsis({ className = '', ...props }) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={`flex h-9 w-9 items-center justify-center ${className}`}
      {...props}
    >
      <MoreHorizontal size={14} />
      <span className="sr-only">More</span>
    </span>
  );
}
