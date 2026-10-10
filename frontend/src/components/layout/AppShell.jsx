import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  Cpu, LayoutDashboard, Ticket, GitPullRequest,
  History, Users, Bell, User, ChevronLeft, ChevronRight,
  Search, Sun, Moon, LogOut, Menu, X, Shield,
  Layers, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// ─── Navigation config ───────────────────────────────────────────────────────
const NAV_CONFIG = [
  { label: 'Dashboard',        path: 'dashboard',      icon: LayoutDashboard, roles: ['user','developer','admin'] },
  { label: 'My Tickets',       path: 'tickets',        icon: Ticket,          roles: ['user'] },
  { label: 'Assigned Issues',  path: 'issues',         icon: GitPullRequest,  roles: ['developer','admin'] },
  { label: 'Approvals',        path: 'approvals',      icon: Layers,          roles: ['developer','admin'] },
  { label: 'User Management',  path: 'users',          icon: Users,           roles: ['admin'] },
  { label: 'Audit & Logs',     path: 'audit',          icon: History,         roles: ['admin'] },
  { label: 'Profile',          path: 'profile',        icon: User,            roles: ['user','developer','admin'] },
];

const ROLE_DOT = {
  admin:     'bg-purple-500 ring-purple-400/40',
  developer: 'bg-indigo-500 ring-indigo-400/40',
  user:      'bg-cyan-500 ring-cyan-400/40',
};

const AVATAR_COLOR = {
  admin:     'bg-purple-600',
  developer: 'bg-indigo-600',
  user:      'bg-cyan-700',
};

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Agent Alpha Generated Fix', desc: 'Diff ready for PR review on #104', time: '5m ago', unread: true },
  { id: 2, title: 'Verification Passed', desc: '5/5 sandbox test suites passed with 0 regressions', time: '18m ago', unread: true },
  { id: 3, title: 'Security Audit Logged', desc: 'Policy compliance check signed', time: '1h ago', unread: false },
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ collapsed, onToggle, onClose }) {
  const { role } = useAuth();
  const visibleItems = NAV_CONFIG.filter(n => role ? n.roles.includes(role) : false);

  return (
    <aside
      className={`flex h-full flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] transition-[width] duration-200 ease-out overflow-hidden select-none
        ${collapsed ? 'w-[64px]' : 'w-[230px]'}`}
    >
      {/* Brand Header — Clean Logo + Name */}
      <div className={`flex items-center gap-2.5 px-3.5 py-4 border-b border-[var(--border-subtle)] ${collapsed ? 'justify-center' : ''}`}>
        <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20 ring-1 ring-white/10">
          <Cpu size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-bold tracking-tight text-[var(--text-main)] leading-none">Agentix</div>
            <div className="text-[10px] text-[var(--text-dim)] leading-none mt-1">Autonomous AI Platform</div>
          </div>
        )}
      </div>

      {/* Navigation Label */}
      {!collapsed && (
        <div className="px-3.5 pt-4 pb-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-dim)]">Navigation</span>
        </div>
      )}

      {/* Nav Items List */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-1.5">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const to = `/${role}/${item.path}`;
          return (
            <NavLink
              key={item.path}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150 outline-none
                focus-visible:ring-2 focus-visible:ring-indigo-500/50
                ${isActive
                  ? 'bg-indigo-600/15 text-indigo-500 dark:text-indigo-300 font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-1 before:rounded-r before:bg-indigo-500'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon size={17} className="shrink-0 group-hover:scale-105 transition-transform" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-[var(--border-subtle)] p-2">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition-all duration-150"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : (
            <>
              <ChevronLeft size={15} />
              <span className="font-medium">Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────
function TopBar({ onOpenMobile }) {
  const { profile, role, user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await signOut();
    navigate('/login', { replace: true });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/${role || 'user'}/tickets`);
    }
  };

  // Derive page title
  const getPageTitle = () => {
    const seg = location.pathname.split('/').filter(Boolean);
    const page = seg[1] || seg[0] || 'dashboard';
    const titles = {
      dashboard: 'Dashboard',
      tickets: 'My Tickets',
      create: 'Submit Ticket',
      issues: 'Assigned Issues',
      fixes: 'Generated Fixes',
      verification: 'Verification Suite',
      approvals: 'Approvals',
      users: 'User Management',
      agents: 'Agent Monitoring',
      audit: 'Audit Log',
      profile: 'Profile & Settings',
    };
    return titles[page] || (page.charAt(0).toUpperCase() + page.slice(1));
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarInitials = displayName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const avatarColor = AVATAR_COLOR[role] || 'bg-slate-700';
  const roleDotClass = ROLE_DOT[role] || 'bg-cyan-500 ring-cyan-400/40';

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 backdrop-blur-md z-30 transition-colors">
      {/* Left side: Mobile button + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          onClick={onOpenMobile}
          aria-label="Open navigation"
        >
          <Menu size={16} />
        </button>

        <div className="flex items-center gap-2 min-w-0 text-xs">
          <span className="hidden sm:inline-block font-medium text-[var(--text-dim)]">
            Agentix
          </span>
          <span className="hidden sm:inline-block text-[var(--text-dim)]">/</span>
          <span className="text-sm font-semibold text-[var(--text-main)] truncate">
            {getPageTitle()}
          </span>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, logs..."
            className="w-full h-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-input)] pl-8 pr-12 text-xs text-[var(--text-main)] placeholder:text-[var(--text-dim)] outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/40 transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-1.5 py-0.5 text-[9px] font-mono text-[var(--text-dim)]">
            Ctrl+K
          </kbd>
        </form>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        {/* Cluster Status Pill */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-500 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          <span>Active Agents</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"
            aria-label="Notifications"
          >
            <Bell size={15} />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white">
              2
            </span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 shadow-2xl shadow-black/30 backdrop-blur-xl z-50 animate-in fade-in-0 duration-150">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 mb-2">
                <span className="text-xs font-bold text-[var(--text-main)]">System Notifications</span>
                <span className="text-[10px] text-indigo-500 font-medium">2 unread</span>
              </div>
              <div className="flex flex-col gap-2">
                {MOCK_NOTIFICATIONS.map(n => (
                  <div key={n.id} className={`p-2.5 rounded-xl border text-left transition-colors ${n.unread ? 'bg-indigo-500/10 border-indigo-500/25' : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)]'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--text-main)]">{n.title}</span>
                      <span className="text-[10px] text-[var(--text-dim)]">{n.time}</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-500" />}
        </button>

        {/* User Profile Menu with Subtle Role Indicator Dot */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-2 rounded-lg p-1 border border-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-all"
            aria-label="User menu"
            aria-expanded={menuOpen}
          >
            <div className="relative">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="h-8 w-8 rounded-lg object-cover ring-1 ring-white/10"
                />
              ) : (
                <div className={`h-8 w-8 rounded-lg ${avatarColor} flex items-center justify-center text-xs font-bold text-white ring-1 ring-white/10`}>
                  {avatarInitials}
                </div>
              )}
              {/* Subtle Role Indicator Dot on Avatar */}
              <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[var(--bg-card)] ${roleDotClass}`} />
            </div>
            <div className="hidden sm:block text-left min-w-0">
              <div className="text-xs font-semibold text-[var(--text-main)] leading-none truncate max-w-[110px]">
                {displayName}
              </div>
              <div className="text-[10px] text-[var(--text-dim)] leading-none mt-0.5 capitalize">{role ? (role.charAt(0).toUpperCase() + role.slice(1)) : ''}</div>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] py-2 shadow-2xl shadow-black/30 backdrop-blur-xl z-50 animate-in fade-in-0 duration-150">
              <div className="px-3.5 py-2 border-b border-[var(--border-subtle)]">
                <div className="text-xs font-bold text-[var(--text-main)] truncate">{displayName}</div>
                <div className="text-[11px] text-[var(--text-muted)] truncate">{profile?.email || user?.email}</div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Shield size={11} className="text-indigo-500" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 dark:text-indigo-300">{role ? role.toUpperCase() : ''}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { navigate(`/${role || 'user'}/profile`); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)] transition-colors"
                >
                  <User size={14} />
                  <span>Profile &amp; Settings</span>
                </button>
                <button
                  onClick={() => { navigate(`/${role || 'user'}/dashboard`); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)] transition-colors"
                >
                  <LayoutDashboard size={14} />
                  <span>Dashboard</span>
                </button>
              </div>

              <div className="border-t border-[var(--border-subtle)] pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
                >
                  <LogOut size={14} />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Main App Shell ──────────────────────────────────────────────────────────
export default function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)] text-[var(--text-main)] overflow-hidden font-sans transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(v => !v)}
          onClose={() => {}}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 flex h-full w-[260px] flex-col bg-[var(--bg-sidebar)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <span className="text-xs font-bold text-[var(--text-main)]">Agentix Navigation</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-[var(--text-dim)] hover:text-[var(--text-main)]"
              >
                <X size={18} />
              </button>
            </div>
            <Sidebar
              collapsed={false}
              onToggle={() => {}}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        <TopBar onOpenMobile={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[var(--bg-primary)] transition-colors">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
