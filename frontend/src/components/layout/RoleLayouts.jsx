import React, { useState } from 'react';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { Sheet, SheetHeader, SheetTitle, SheetBody } from '../ui/sheet';

export function UserLayout({ currentPath, onNavigate, onOpenApiGuide, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell-root">
      <AppSidebar
        currentPath={currentPath}
        onNavigate={(path) => {
          onNavigate(path);
          setMobileOpen(false);
        }}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <div className={`app-shell-main-wrapper ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <AppHeader
          currentPath={currentPath}
          onNavigate={onNavigate}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onOpenApiGuide={onOpenApiGuide}
        />

        <main className="app-shell-content">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Sheet Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen} side="left">
        <SheetHeader>
          <SheetTitle>Agentix User Navigation</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <AppSidebar
            currentPath={currentPath}
            onNavigate={(path) => {
              onNavigate(path);
              setMobileOpen(false);
            }}
            collapsed={false}
          />
        </SheetBody>
      </Sheet>
    </div>
  );
}

export function DeveloperLayout({ currentPath, onNavigate, onOpenApiGuide, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell-root">
      <AppSidebar
        currentPath={currentPath}
        onNavigate={(path) => {
          onNavigate(path);
          setMobileOpen(false);
        }}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <div className={`app-shell-main-wrapper ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <AppHeader
          currentPath={currentPath}
          onNavigate={onNavigate}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onOpenApiGuide={onOpenApiGuide}
        />

        <main className="app-shell-content">
          {children}
        </main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen} side="left">
        <SheetHeader>
          <SheetTitle>Developer Technical Navigation</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <AppSidebar
            currentPath={currentPath}
            onNavigate={(path) => {
              onNavigate(path);
              setMobileOpen(false);
            }}
            collapsed={false}
          />
        </SheetBody>
      </Sheet>
    </div>
  );
}

export function AdminLayout({ currentPath, onNavigate, onOpenApiGuide, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell-root">
      <AppSidebar
        currentPath={currentPath}
        onNavigate={(path) => {
          onNavigate(path);
          setMobileOpen(false);
        }}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <div className={`app-shell-main-wrapper ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <AppHeader
          currentPath={currentPath}
          onNavigate={onNavigate}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onOpenApiGuide={onOpenApiGuide}
        />

        <main className="app-shell-content">
          {children}
        </main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen} side="left">
        <SheetHeader>
          <SheetTitle>Admin Control Center Navigation</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <AppSidebar
            currentPath={currentPath}
            onNavigate={(path) => {
              onNavigate(path);
              setMobileOpen(false);
            }}
            collapsed={false}
          />
        </SheetBody>
      </Sheet>
    </div>
  );
}
