import React, { createContext, useContext, useState } from 'react';
import { PanelLeft } from 'lucide-react';
import { Button } from './button';

const SidebarContext = createContext({
  open: true,
  setOpen: (open) => {},
  toggleSidebar: () => {}
});

export function SidebarProvider({ defaultOpen = true, open: openProp, onOpenChange, children, className = '' }) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp !== undefined ? openProp : openState;

  const setOpen = (val) => {
    setOpenState(val);
    if (onOpenChange) onOpenChange(val);
  };

  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggleSidebar }}>
      <div className={`flex min-h-screen w-full bg-[var(--bg-primary)] ${className}`}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarInset({ children, className = '' }) {
  return (
    <main className={`flex flex-1 flex-col overflow-y-auto bg-[var(--bg-primary)] min-h-screen ${className}`}>
      {children}
    </main>
  );
}

export function SidebarTrigger({ className = '', onClick, ...props }) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-8 w-8 p-0 text-muted hover:text-main ${className}`}
      onClick={(e) => {
        if (onClick) onClick(e);
        toggleSidebar();
      }}
      aria-label="Toggle Sidebar"
      {...props}
    >
      <PanelLeft size={18} />
    </Button>
  );
}
