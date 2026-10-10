import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings,
  Menu,
  Shield 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { InputGroup, InputGroupInput, InputGroupAddon } from '../ui/input-group';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../ui/breadcrumb';
import { NotificationsPopover } from '../shared/NotificationsPopover';
import { SearchCommand } from '../shared/SearchCommand';

export function AppHeader({
  currentPath = '',
  onNavigate,
  onOpenMobileMenu
}) {
  const { user, profile, role, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const getPageTitle = () => {
    if (currentPath.includes('/create') || currentPath.includes('/new')) return 'Create Incident';
    if (currentPath.startsWith('/user/tickets/') && currentPath !== '/user/tickets/create') return 'Incident Details';
    if (currentPath.startsWith('/developer/issues/') && !currentPath.endsWith('/developer/issues')) return 'Issue Details';
    if (currentPath === '/user/tickets' || currentPath === '/tickets') return 'My Tickets';
    if (currentPath === '/developer/issues' || currentPath === '/assigned-issues') return 'Assigned Issues';
    if (currentPath === '/admin/tickets') return 'All Tickets';
    if (currentPath.includes('dashboard')) return 'Dashboard';
    if (currentPath.includes('investigations')) return 'Investigations';
    if (currentPath.includes('fixes')) return 'Generated Fixes';
    if (currentPath.includes('verification')) return 'Verification Suite';
    if (currentPath.includes('users')) return 'User Management';
    if (currentPath.includes('developers')) return 'Developer Workload';
    if (currentPath.includes('agents')) return 'AI Agent Monitoring';
    if (currentPath.includes('system')) return 'System Health';
    if (currentPath.includes('audit')) return 'Audit Ledger';
    if (currentPath.includes('approvals')) return 'Approvals';
    if (currentPath.includes('settings')) return 'Settings';
    if (currentPath.includes('notifications')) return 'Notifications';
    if (currentPath.includes('profile')) return 'Profile';
    return 'Dashboard';
  };

  // Avatar initial color based on role
  const getAvatarSquareClass = () => {
    switch (role) {
      case 'admin':
        return 'bg-purple-600 text-white';
      case 'user':
        return 'bg-cyan-600 text-white';
      case 'developer':
      default:
        return 'bg-indigo-600 text-white';
    }
  };

  const displayName = profile?.full_name || profile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const displayEmail = profile?.email || user?.email || '';
  const roleLabel = role ? (role.charAt(0).toUpperCase() + role.slice(1)) : '';

  return (
    <header className="app-shell-header">
      {/* Left: Mobile Toggle & Clean Breadcrumb Row */}
      <div className="header-left">
        <button
          type="button"
          className="inline-flex md:hidden h-8 w-8 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          onClick={onOpenMobileMenu}
          aria-label="Open mobile menu"
        >
          <Menu size={18} />
        </button>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden sm:inline-flex">
              <BreadcrumbLink
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate(`/${role || 'user'}/dashboard`);
                }}
                className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-main)] font-medium"
              >
                Agentix
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:inline-flex text-[var(--text-dim)]" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[var(--text-main)] font-semibold">
                {getPageTitle()}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right-aligned Header Controls: Search (Ctrl K), Theme Toggle, Notifications, User Menu */}
      <div className="header-right">
        {/* 1. Quick search input with Ctrl K hint text */}
        <div className="hidden md:block w-52 lg:w-64">
          <InputGroup 
            className="cursor-pointer"
            onClick={() => setIsSearchOpen(true)}
          >
            <InputGroupAddon align="inline-start">
              <Search size={14} className="text-[var(--text-dim)]" />
            </InputGroupAddon>
            <InputGroupInput 
              placeholder="Search incidents, files..." 
              readOnly
              className="cursor-pointer text-xs"
            />
            <InputGroupAddon align="inline-end" className="hidden sm:flex text-[10px] font-mono text-[var(--text-dim)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded mr-1">
              Ctrl K
            </InputGroupAddon>
          </InputGroup>
        </div>

        {/* 2. Theme Toggle (Sun/Moon icon button) */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-colors"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun size={16} className="text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon size={16} className="text-indigo-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* 3. Notification bell icon with small count badge */}
        <div className="relative">
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-colors"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          <NotificationsPopover
            open={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            onNavigate={onNavigate}
          />
        </div>

        {/* 4. User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-[var(--bg-card-hover)] border border-transparent hover:border-[var(--border-subtle)] transition-all cursor-pointer select-none"
              aria-label="User Account Menu"
            >
              <div className="relative">
                <div className={`h-8 w-8 rounded-lg ${getAvatarSquareClass()} flex items-center justify-center font-bold text-xs shadow-sm`}>
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[var(--bg-primary)] ${
                  role === 'admin' ? 'bg-purple-500' : role === 'developer' ? 'bg-indigo-500' : 'bg-cyan-500'
                }`} />
              </div>
              <ChevronDown size={13} className="text-[var(--text-dim)] hidden sm:block" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2.5 py-2 border-b border-[var(--border-subtle)]">
              <div className="font-semibold text-xs text-[var(--text-main)] truncate">{displayName}</div>
              <div className="text-[11px] text-[var(--text-dim)] truncate">{displayEmail}</div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Shield size={11} className="text-indigo-500" />
                <span className="text-[10px] font-bold text-[var(--text-muted)]">
                  {roleLabel}
                </span>
              </div>
            </div>

            <div className="py-1">
              <DropdownMenuItem onClick={() => onNavigate && onNavigate(`/${role || 'user'}/profile`)}>
                <User size={14} />
                <span>Profile</span>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={signOut} className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
              <LogOut size={14} />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Global Search Dialog Modal */}
      <SearchCommand
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelectTicket={(id) => onNavigate && onNavigate(`/${role === 'user' ? 'user/tickets' : 'developer/issues'}/${id}`)}
      />
    </header>
  );
}
