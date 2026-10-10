import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Cpu } from 'lucide-react';

/**
 * Loading spinner shown while auth state is resolving.
 */
function AuthLoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-primary)]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/30 animate-pulse">
          <Cpu size={24} className="text-indigo-400" />
        </div>
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:300ms]" />
        </div>
        <p className="text-xs text-[var(--text-dim)] font-medium tracking-wider">AGENTIX</p>
      </div>
    </div>
  );
}

/**
 * <ProtectedRoute> — guards routes that require authentication.
 *
 * Usage:
 *   <ProtectedRoute>                        — authenticated only
 *   <ProtectedRoute roles={['admin']}>      — admin only
 *   <ProtectedRoute roles={['developer','admin']}> — dev or admin
 *
 * Behavior:
 *   - While loading (session or profile still resolving)  → show spinner
 *   - Not authenticated                                    → redirect to /login
 *   - Authenticated but role not yet loaded                → show spinner (prevents premature 403)
 *   - Wrong role                                           → redirect to /unauthorized
 */
export function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, isLoading, role, profile } = useAuth();
  const location = useLocation();

  // Show spinner while session OR profile is loading
  if (isLoading) return <AuthLoadingScreen />;

  // Not authenticated → send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but profile hasn't loaded yet
  // This prevents a brief flash of /unauthorized while getProfile() is in flight
  if (profile === null && role === null) {
    return <AuthLoadingScreen />;
  }

  // Role-specific guard
  if (roles && roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

/**
 * <PublicRoute> — redirects already-authenticated users away from /login and /signup.
 */
export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) return <AuthLoadingScreen />;

  // Redirect authenticated users. If role is available, go to their specific dashboard.
  // If not, redirect to the root so the dispatcher can handle it (or show an error),
  // preventing them from seeing the login form while authenticated.
  if (isAuthenticated) {
    return <Navigate to={role ? `/${role}/dashboard` : "/"} replace />;
  }

  return children;
}
