import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TicketProvider } from './context/TicketContext';
import { ToastProvider } from './components/ui/toast';
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute';
import AppShell from './components/layout/AppShell';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_ZW5nYWdpbmctbXVsZS04OS5jbGVyay5hY2NvdW50cy5kZXYk';

// ─── Lazy-loaded auth and public pages ─────────────────────────────────────────
const LandingPage     = lazy(() => import('./pages/public/LandingPage'));
const LoginPage       = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage      = lazy(() => import('./pages/auth/SignupPage'));
const AuthCallback    = lazy(() => import('./pages/auth/AuthCallback'));
const UnauthorizedPage = lazy(() => import('./pages/auth/UnauthorizedPage'));

// ─── Lazy-loaded app pages ────────────────────────────────────────────────────
// Shared
const ProfilePage = lazy(() => import('./pages/shared/ProfilePage'));

// User pages
const UserDashboard   = lazy(() => import('./pages/user/UserDashboard'));
const UserTickets     = lazy(() => import('./pages/user/UserTickets'));
const UserTicketDetail = lazy(() => import('./pages/user/UserTicketDetail'));
const UserCreateTicket = lazy(() => import('./pages/user/UserCreateTicket'));

// Developer pages
const DeveloperDashboard  = lazy(() => import('./pages/developer/DeveloperDashboard'));
const DeveloperIssues     = lazy(() => import('./pages/developer/DeveloperIssues'));
const DeveloperIssueDetail = lazy(() => import('./pages/developer/DeveloperIssueDetail'));
const DeveloperFixes      = lazy(() => import('./pages/developer/DeveloperFixes'));
const DeveloperVerification = lazy(() => import('./pages/developer/DeveloperVerification'));
const ApprovalsPage       = lazy(() => import('./pages/developer/ApprovalsPage'));

// Admin pages
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers      = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAgents     = lazy(() => import('./pages/admin/AdminAgents'));
const AuditPage       = lazy(() => import('./pages/admin/AuditPage'));

// ─── Page loading fallback ────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse p-6">
      <div className="h-7 w-48 rounded-lg bg-slate-800/60" />
      <div className="h-4 w-72 rounded bg-slate-800/40" />
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-900/60 border border-white/[0.05]" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-slate-900/60 border border-white/[0.05]" />
    </div>
  );
}

// ─── Dynamic Role-based Dashboard Dispatcher ──────────────────────────────────
function RoleDashboardDispatcher() {
  const { role, isLoading, profile } = useAuth();

  // Wait for profile to load before deciding which dashboard to show
  if (isLoading || (role === null && profile === null)) {
    return <PageSkeleton />;
  }

  if (role === 'admin') return <AdminDashboard />;
  if (role === 'developer') return <DeveloperDashboard />;
  if (role === 'user') return <UserDashboard />;

  // Role is unknown/unsupported — show error state rather than guessing
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
      <p className="text-sm font-semibold text-[var(--text-main)]">Unable to determine your role</p>
      <p className="text-xs text-[var(--text-muted)] max-w-xs">
        Your account profile could not be loaded. Please refresh or contact your administrator.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="text-xs text-indigo-500 hover:underline"
      >
        Retry
      </button>
    </div>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ThemeProvider>
        <AuthProvider>
          <TicketProvider>
            <ToastProvider>
              <Suspense fallback={null}>
                <Routes>
                  {/* ── Public routes ── */}
                  <Route path="/login" element={<PublicRoute><Suspense fallback={null}><LoginPage /></Suspense></PublicRoute>} />
                  <Route path="/signup" element={<PublicRoute><Suspense fallback={null}><SignupPage /></Suspense></PublicRoute>} />
                  <Route path="/auth/callback" element={<Suspense fallback={null}><AuthCallback /></Suspense>} />
                  <Route path="/unauthorized" element={<Suspense fallback={null}><UnauthorizedPage /></Suspense>} />

                  {/* ── Landing page ── */}
                  <Route path="/" element={<Suspense fallback={null}><LandingPage /></Suspense>} />

                  {/* ── Protected app shell ── */}
                  <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>

                    {/* Dynamic root-level /dashboard based on real session role */}
                    <Route path="/dashboard" element={<Suspense fallback={<PageSkeleton />}><RoleDashboardDispatcher /></Suspense>} />
                    <Route path="/profile" element={<Suspense fallback={<PageSkeleton />}><ProfilePage /></Suspense>} />

                    {/* USER routes */}
                    <Route path="/user/dashboard" element={<ProtectedRoute roles={['user','developer','admin']}><Suspense fallback={<PageSkeleton />}><UserDashboard /></Suspense></ProtectedRoute>} />
                    <Route path="/tickets" element={<ProtectedRoute roles={['user','developer','admin']}><Suspense fallback={<PageSkeleton />}><UserTickets /></Suspense></ProtectedRoute>} />
                    <Route path="/user/tickets" element={<ProtectedRoute roles={['user','developer','admin']}><Suspense fallback={<PageSkeleton />}><UserTickets /></Suspense></ProtectedRoute>} />
                    <Route path="/tickets/new" element={<ProtectedRoute roles={['user','developer','admin']}><Suspense fallback={<PageSkeleton />}><UserCreateTicket /></Suspense></ProtectedRoute>} />
                    <Route path="/user/tickets/create" element={<ProtectedRoute roles={['user','developer','admin']}><Suspense fallback={<PageSkeleton />}><UserCreateTicket /></Suspense></ProtectedRoute>} />
                    <Route path="/tickets/:id" element={<ProtectedRoute roles={['user','developer','admin']}><Suspense fallback={<PageSkeleton />}><UserTicketDetail /></Suspense></ProtectedRoute>} />
                    <Route path="/user/tickets/:id" element={<ProtectedRoute roles={['user','developer','admin']}><Suspense fallback={<PageSkeleton />}><UserTicketDetail /></Suspense></ProtectedRoute>} />
                    <Route path="/user/profile" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><ProfilePage /></Suspense></ProtectedRoute>} />

                    {/* DEVELOPER routes */}
                    <Route path="/developer/dashboard" element={<ProtectedRoute roles={['developer','admin']}><Suspense fallback={<PageSkeleton />}><DeveloperDashboard /></Suspense></ProtectedRoute>} />
                    <Route path="/assigned-issues" element={<ProtectedRoute roles={['developer','admin']}><Suspense fallback={<PageSkeleton />}><DeveloperIssues /></Suspense></ProtectedRoute>} />
                    <Route path="/developer/issues" element={<ProtectedRoute roles={['developer','admin']}><Suspense fallback={<PageSkeleton />}><DeveloperIssues /></Suspense></ProtectedRoute>} />
                    <Route path="/investigations" element={<ProtectedRoute roles={['developer','admin']}><Suspense fallback={<PageSkeleton />}><DeveloperIssues /></Suspense></ProtectedRoute>} />
                    <Route path="/developer/issues/:id" element={<ProtectedRoute roles={['developer','admin']}><Suspense fallback={<PageSkeleton />}><DeveloperIssueDetail /></Suspense></ProtectedRoute>} />
                    <Route path="/generated-fixes" element={<ProtectedRoute roles={['developer','admin']}><Suspense fallback={<PageSkeleton />}><DeveloperFixes /></Suspense></ProtectedRoute>} />
                    <Route path="/developer/fixes" element={<ProtectedRoute roles={['developer','admin']}><Suspense fallback={<PageSkeleton />}><DeveloperFixes /></Suspense></ProtectedRoute>} />
                    <Route path="/verification-suite" element={<ProtectedRoute roles={['developer','admin']}><Suspense fallback={<PageSkeleton />}><DeveloperVerification /></Suspense></ProtectedRoute>} />
                    <Route path="/developer/verification" element={<ProtectedRoute roles={['developer','admin']}><Suspense fallback={<PageSkeleton />}><DeveloperVerification /></Suspense></ProtectedRoute>} />
                    <Route path="/approvals" element={<ProtectedRoute roles={['developer','admin']}><Suspense fallback={<PageSkeleton />}><ApprovalsPage /></Suspense></ProtectedRoute>} />
                    <Route path="/developer/approvals" element={<ProtectedRoute roles={['developer','admin']}><Suspense fallback={<PageSkeleton />}><ApprovalsPage /></Suspense></ProtectedRoute>} />
                    <Route path="/developer/profile" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><ProfilePage /></Suspense></ProtectedRoute>} />

                    {/* ADMIN routes */}
                    <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><Suspense fallback={<PageSkeleton />}><AdminDashboard /></Suspense></ProtectedRoute>} />
                    <Route path="/user-management" element={<ProtectedRoute roles={['admin']}><Suspense fallback={<PageSkeleton />}><AdminUsers /></Suspense></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><Suspense fallback={<PageSkeleton />}><AdminUsers /></Suspense></ProtectedRoute>} />
                    <Route path="/admin/agents" element={<ProtectedRoute roles={['admin']}><Suspense fallback={<PageSkeleton />}><AdminAgents /></Suspense></ProtectedRoute>} />
                    <Route path="/audit-log" element={<ProtectedRoute roles={['admin']}><Suspense fallback={<PageSkeleton />}><AuditPage /></Suspense></ProtectedRoute>} />
                    <Route path="/login-history" element={<ProtectedRoute roles={['admin']}><Suspense fallback={<PageSkeleton />}><AuditPage /></Suspense></ProtectedRoute>} />
                    <Route path="/admin/audit" element={<ProtectedRoute roles={['admin']}><Suspense fallback={<PageSkeleton />}><AuditPage /></Suspense></ProtectedRoute>} />
                    <Route path="/admin/profile" element={<ProtectedRoute><Suspense fallback={<PageSkeleton />}><ProfilePage /></Suspense></ProtectedRoute>} />

                    {/* Catch-all inside shell */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Route>
                </Routes>
              </Suspense>
            </ToastProvider>
          </TicketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
