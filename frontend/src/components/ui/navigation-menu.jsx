import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function NavigationMenu({ className = '', children, ...props }) {
  return (
    <nav className={`relative z-10 flex max-w-max flex-1 items-center justify-center ${className}`} {...props}>
      {children}
    </nav>
  );
}

export function NavigationMenuList({ className = '', children, ...props }) {
  return (
    <ul className={`group flex flex-1 list-none items-center justify-center gap-1 ${className}`} {...props}>
      {children}
    </ul>
  );
}

export function NavigationMenuItem({ className = '', children, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <li
      className={`relative ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { isOpen, setIsOpen });
        }
        return child;
      })}
    </li>
  );
}

export function NavigationMenuTrigger({ className = '', children, isOpen, setIsOpen, ...props }) {
  return (
    <button
      type="button"
      className={`group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white focus:outline-none ${
        isOpen ? 'bg-slate-800 text-white' : ''
      } ${className}`}
      onClick={() => setIsOpen && setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      <ChevronDown
        size={14}
        className={`ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        aria-hidden="true"
      />
    </button>
  );
}

export function NavigationMenuContent({ className = '', children, isOpen, ...props }) {
  if (!isOpen) return null;
  return (
    <div
      className={`absolute left-0 top-full mt-1.5 w-auto rounded-lg border border-slate-800 bg-slate-900/95 p-4 shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 z-50 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function NavigationMenuLink({ className = '', render, children, ...props }) {
  if (render) {
    return React.cloneElement(render, {
      className: `${render.props.className || ''} ${className}`,
      ...props
    });
  }
  return (
    <a
      className={`block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-800 hover:text-white ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}

export function navigationMenuTriggerStyle() {
  return 'group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white focus:outline-none';
}
