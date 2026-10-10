import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk, AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { Cpu, Loader2, AlertCircle, User, Code2 } from 'lucide-react';
import { supabase } from '../../services/supabase';

export default function AuthCallback() {
  const { user, isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
  const navigate = useNavigate();

  const [stage, setStage] = useState('loading'); // 'loading' | 'role-select' | 'error'
  const [status, setStatus] = useState('Finalizing session...');
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function handlePostAuth() {
      if (!isLoaded) return;

      if (!isSignedIn || !user) {
        // Still processing or not signed in
        return;
      }

      try {
        setStatus('Loading your profile...');

        // Check if role was cached during OAuth button click
        const cachedRole = sessionStorage.getItem('agentix_oauth_role');
        const existingRole = user.unsafeMetadata?.role || user.publicMetadata?.role;

        const effectiveRole = existingRole || cachedRole;

        if (effectiveRole && ['developer', 'admin', 'user'].includes(effectiveRole)) {
          if (!existingRole || existingRole !== effectiveRole) {
            await user.update({
              unsafeMetadata: {
                ...user.unsafeMetadata,
                role: effectiveRole,
                requested_role: effectiveRole,
              }
            });
          }

          // Sync with database
          try {
            await supabase.from('profiles').upsert({
              id: user.id,
              email: user.primaryEmailAddress?.emailAddress || '',
              full_name: user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress?.split('@')[0] || '',
              avatar_url: user.imageUrl || null,
              role: effectiveRole,
              requested_role: effectiveRole,
              role_request_status: 'approved',
            }, { onConflict: 'id' });
          } catch (dbErr) {
            console.warn('[AuthCallback DB Sync]', dbErr);
          }

          sessionStorage.removeItem('agentix_oauth_role');

          if (mounted) {
            setStatus(`Welcome! Redirecting to ${effectiveRole} dashboard...`);
            setTimeout(() => {
              if (mounted) navigate(`/${effectiveRole}/dashboard`, { replace: true });
            }, 300);
          }
          return;
        }

        // Brand new Google user with no role chosen yet
        if (mounted) {
          setStage('role-select');
        }
      } catch (err) {
        console.error('[AuthCallback error]', err);
        if (mounted) {
          setError(err.message || 'Failed to complete authentication.');
          setStage('error');
        }
      }
    }

    handlePostAuth();
    return () => { mounted = false; };
  }, [isLoaded, isSignedIn, user, navigate]);

  const handleRoleSelect = async (selectedRole) => {
    if (!user) return;
    setStage('loading');
    setStatus('Setting up your workspace...');

    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          role: selectedRole,
          requested_role: selectedRole,
        }
      });

      // Sync with database
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          full_name: user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress?.split('@')[0] || '',
          avatar_url: user.imageUrl || null,
          role: selectedRole,
          requested_role: selectedRole,
          role_request_status: 'approved',
        }, { onConflict: 'id' });
      } catch (dbErr) {
        console.warn('[AuthCallback DB Sync]', dbErr);
      }

      sessionStorage.removeItem('agentix_oauth_role');
      setStatus(`Account ready! Redirecting to ${selectedRole} dashboard...`);
      setTimeout(() => navigate(`/${selectedRole}/dashboard`, { replace: true }), 300);
    } catch (err) {
      console.error('[AuthCallback role selection error]', err);
      setError(err.message || 'Failed to assign role.');
      setStage('error');
    }
  };

  if (stage === 'error') {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[var(--bg-primary)] p-4 text-[var(--text-main)] transition-colors">
        <div className="flex flex-col items-center max-w-sm text-center p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 mb-5">
            <AlertCircle size={28} className="text-rose-500" />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-main)] mb-2">Authentication Failed</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'role-select') {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[var(--bg-primary)] p-4 text-[var(--text-main)] transition-colors">
        <div className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-[var(--border-subtle)] text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 mx-auto mb-3">
              <Cpu size={24} className="text-indigo-500" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-main)]">One more step</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Choose your role in Agentix:
            </p>
            <p className="text-xs text-[var(--text-dim)] mt-0.5">
              Signed in as <span className="font-semibold text-[var(--text-muted)]">{user?.primaryEmailAddress?.emailAddress}</span>
            </p>
          </div>

          <div className="p-6 grid grid-cols-1 gap-3">
            {/* User Option */}
            <button
              onClick={() => handleRoleSelect('user')}
              className="flex items-start gap-4 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-indigo-500 hover:bg-indigo-500/5 transition-all text-left group cursor-pointer"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 group-hover:bg-cyan-500/15 transition-colors">
                <User size={20} className="text-cyan-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-main)]">User / Reporter</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                  Submit tickets, track automated resolutions, and verify fixes.
                </div>
              </div>
            </button>

            {/* Developer Option */}
            <button
              onClick={() => handleRoleSelect('developer')}
              className="flex items-start gap-4 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-indigo-500 hover:bg-indigo-500/5 transition-all text-left group cursor-pointer"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/15 transition-colors">
                <Code2 size={20} className="text-indigo-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-main)]">Developer</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                  Inspect code ASTs, review generated diffs, and approve code patches.
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[var(--bg-primary)] p-4 text-[var(--text-main)] transition-colors">
      <div className="flex flex-col items-center max-w-sm text-center p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl backdrop-blur-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 mb-5 shadow-lg shadow-indigo-500/20">
          <Cpu size={28} className="animate-pulse text-indigo-500" />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-[var(--text-main)] mb-1">
          Finalizing Authentication
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-6 flex items-center justify-center gap-2">
          <Loader2 size={13} className="animate-spin text-indigo-500" />
          <span>{status}</span>
        </p>
        <div className="h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse w-3/4 mx-auto" />
        </div>
      </div>
    </div>
  );
}
