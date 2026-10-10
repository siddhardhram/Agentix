import React from 'react';
import { 
  Cpu, 
  LayoutDashboard, 
  Ticket, 
  GitPullRequest, 
  History, 
  Users, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';

/**
 * Single unified navigation items config filtered dynamically by authenticated role
 */
const NAV_ITEMS = [
  { label: 'Dashboard', routeSuffix: 'dashboard', icon: LayoutDashboard, roles: ['user', 'developer', 'admin'] },
  { label: 'My Tickets', routeSuffix: 'tickets', icon: Ticket, roles: ['user'] },
  { label: 'Assigned Issues', routeSuffix: 'issues', icon: GitPullRequest, roles: ['developer', 'admin'] },
  { label: 'Approvals', routeSuffix: 'approvals', icon: Layers, roles: ['developer', 'admin'] },
  { label: 'User Management', routeSuffix: 'users', icon: Users, roles: ['admin'] },
  { label: 'Audit Ledger', routeSuffix: 'audit', icon: History, roles: ['admin'] },
  { label: 'Profile', routeSuffix: 'profile', icon: User, roles: ['user', 'developer', 'admin'] },
];

export function AppSidebar({
  currentPath = '',
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  className = ''
}) {
  const { role } = useAuth();
  const { unreadCount } = useNotifications();

  // Filter single unified config dynamically by current role
  const visibleNavItems = NAV_ITEMS.filter((item) => role ? item.roles.includes(role) : false);

  return (
    <aside className={`app-shell-sidebar ${collapsed ? 'is-collapsed' : ''} ${className}`}>
      {/* 1. Top Logo Block: Square Icon + Agentix + Subtitle */}
      <div 
        className="sidebar-brand-box cursor-pointer select-none"
        onClick={() => onNavigate && role && onNavigate(`/${role}/dashboard`)}
      >
        <div className="sidebar-brand-icon shadow-sm">
          <Cpu size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-title">Agentix</div>
            <div className="sidebar-brand-sub">Autonomous AI Platform</div>
          </div>
        )}
      </div>

      {/* 2. Section Label: NAVIGATION */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">
            Navigation
          </span>
        </div>
      )}

      {/* 3. Nav Items: Icon + Label Rows (Filtered by role) */}
      <nav className="sidebar-nav-list flex-1 px-2 py-2 flex flex-col gap-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const fullPath = `/${role}/${item.routeSuffix}`;
          const isExact = currentPath === fullPath;
          const isChild = item.routeSuffix !== 'dashboard' && currentPath.startsWith(fullPath);
          const isActive = isExact || isChild;

          const buttonContent = (
            <button
              type="button"
              className={`sidebar-nav-item ${isActive ? 'is-active' : ''}`}
              onClick={() => onNavigate && onNavigate(fullPath)}
            >
              <Icon size={17} className="nav-item-icon shrink-0" />
              {!collapsed && <span className="nav-item-label truncate">{item.label}</span>}
              {!collapsed && item.isBadge && unreadCount > 0 && (
                <span className="nav-item-badge ml-auto">
                  {unreadCount}
                </span>
              )}
            </button>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.routeSuffix} delayDuration={100}>
                <TooltipTrigger asChild>
                  {buttonContent}
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.label} {item.isBadge && unreadCount > 0 ? `(${unreadCount})` : ''}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <React.Fragment key={item.routeSuffix}>{buttonContent}</React.Fragment>;
        })}
      </nav>

      {/* 4. Bottom: Collapse Menu Button */}
      <div className="sidebar-footer p-2.5 border-t border-[var(--border-subtle)]">
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <>
              <ChevronLeft size={16} />
              <span className="font-medium text-xs">Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
