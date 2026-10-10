import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser, useAuth as useClerkAuth, useSignIn, useSignUp, useClerk } from '@clerk/clerk-react';
import { supabase, recordLoginAttempt } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user: clerkUser, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { isLoaded: isAuthLoaded, sessionId, getToken } = useClerkAuth();
  const { signIn: clerkSignIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp: clerkSignUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();
  const clerk = useClerk();

  const [dbProfile, setDbProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Sync Clerk user with Supabase profiles table for database consistency
  const syncWithDatabase = useCallback(async (u, explicitRole = null) => {
    if (!u) return null;
    try {
      const email = u.primaryEmailAddress?.emailAddress || '';
      const fullName = u.fullName || u.firstName || email.split('@')[0] || '';
      const avatarUrl = u.imageUrl || null;
      const roleValue = explicitRole || u.unsafeMetadata?.role || u.publicMetadata?.role || 'user';

      const profilePayload = {
        id: u.id,
        email: email,
        full_name: fullName,
        avatar_url: avatarUrl,
        role: roleValue,
        requested_role: roleValue,
        role_request_status: 'approved',
      };

      setDbProfile(profilePayload);

      // Upsert into Supabase profiles table so ticket tables & foreign keys work
      try {
        await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' });
      } catch (dbErr) {
        // Non-blocking database sync
        console.warn('[AuthContext] Supabase profile sync notice:', dbErr?.message || dbErr);
      }

      return profilePayload;
    } catch (e) {
      console.warn('[AuthContext] syncWithDatabase error:', e);
      return null;
    }
  }, []);

  useEffect(() => {
    if (isUserLoaded && isSignedIn && clerkUser) {
      syncWithDatabase(clerkUser);
    } else if (isUserLoaded && !isSignedIn) {
      setDbProfile(null);
    }
  }, [isUserLoaded, isSignedIn, clerkUser, syncWithDatabase]);

  // One-time cleanup of stale Supabase session tokens
  useEffect(() => {
    try {
      localStorage.removeItem('agentix-auth-token');
      localStorage.removeItem('agentix_active_user');
      localStorage.removeItem('agentix_tab_auth'); // Also clean up the tab auth flag we removed
    } catch (e) {}
  }, []);

  /**
   * Sign In with Email & Password via Clerk
   */
  const signIn = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!isSignInLoaded) throw new Error('Authentication is initializing. Please wait a moment.');

    try {
      // If a session exists in the client, check if it's already the same user
      if (clerk.session) {
        const currentEmail = clerkUser?.primaryEmailAddress?.emailAddress?.toLowerCase();
        if (currentEmail === cleanEmail) {
          await syncWithDatabase(clerkUser);
          return { user: clerkUser, profile: dbProfile };
        }
        // Different user — sign out old session first
        try {
          await clerk.signOut();
        } catch {}
      }

      const result = await clerkSignIn.create({
        identifier: cleanEmail,
        password,
      });

      if (result.status === 'complete') {
        await setSignInActive({ session: result.createdSessionId });
        
        await recordLoginAttempt({
          emailAttempted: cleanEmail,
          userId: result.createdUserId,
          role: clerkUser?.unsafeMetadata?.role || 'user',
          success: true,
          failureReason: null,
        });

        return { user: clerkUser, profile: dbProfile };
      } else {
        throw new Error(`Sign in incomplete: ${result.status}`);
      }
    } catch (error) {
      const errText = (error.errors?.[0]?.longMessage || error.errors?.[0]?.message || error.message || '').toLowerCase();
      
      // If a session already exists on the browser, sign out and retry cleanly
      if (errText.includes('already signed in') || errText.includes('session_exists')) {
        try {
          await clerk.signOut();
          const retryResult = await clerkSignIn.create({
            identifier: cleanEmail,
            password,
          });
          if (retryResult.status === 'complete') {
            await setSignInActive({ session: retryResult.createdSessionId });
            return { user: clerkUser, profile: dbProfile };
          }
        } catch (retryErr) {
          error = retryErr;
        }
      }

      await recordLoginAttempt({
        emailAttempted: cleanEmail,
        userId: null,
        role: null,
        success: false,
        failureReason: error.errors?.[0]?.longMessage || error.message,
      });
      throw error;
    }
  };

  /**
   * Sign Up with Email, Password & Role via Clerk
   */
  const signUp = async (email, password, fullName, selectedRole = 'user') => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const roleValue = ['developer', 'admin', 'user'].includes(selectedRole) ? selectedRole : 'user';

    if (!isSignUpLoaded) throw new Error('Authentication is initializing. Please wait a moment.');

    try {
      if (clerk.session) {
        try {
          await clerk.signOut();
        } catch {}
      }

      // Create account with role stored in unsafeMetadata (accessible on client & Clerk dashboard)
      const result = await clerkSignUp.create({
        emailAddress: cleanEmail,
        password,
        firstName: fullName,
        unsafeMetadata: {
          role: roleValue,
          requested_role: roleValue,
          full_name: fullName,
        },
      });

      if (result.status === 'complete') {
        await setSignUpActive({ session: result.createdSessionId });
        return {
          user: result,
          role: roleValue,
          requiresConfirmation: false,
        };
      }

      // Check if email verification code is required
      if (result.status === 'missing_requirements' && result.unverifiedFields?.includes('email_address')) {
        await clerkSignUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        return {
          user: result,
          role: roleValue,
          requiresConfirmation: true,
        };
      }

      return {
        user: result,
        role: roleValue,
        requiresConfirmation: false,
      };
    } catch (error) {
      if (error.errors?.[0]?.code === 'session_exists' || error.message?.includes('already signed in')) {
        try {
          await clerk.signOut();
          
          // Retry signup after signing out of the stale session
          const retryResult = await clerkSignUp.create({
            emailAddress: cleanEmail,
            password,
            firstName: fullName,
            unsafeMetadata: {
              role: roleValue,
              requested_role: roleValue,
              full_name: fullName,
            },
          });

          if (retryResult.status === 'complete') {
            await setSignUpActive({ session: retryResult.createdSessionId });
            return {
              user: retryResult,
              role: roleValue,
              requiresConfirmation: false,
            };
          }

          if (retryResult.status === 'missing_requirements' && retryResult.unverifiedFields?.includes('email_address')) {
            await clerkSignUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            return {
              user: retryResult,
              role: roleValue,
              requiresConfirmation: true,
            };
          }

          return {
            user: retryResult,
            role: roleValue,
            requiresConfirmation: false,
          };
        } catch (retryErr) {
          throw retryErr;
        }
      }
      throw error;
    }
  };

  /**
   * Google 1-Click OAuth Sign-In / Sign-Up via Clerk
   */
  const signInWithGoogle = async (selectedRole = null) => {
    if (!isSignInLoaded) throw new Error('Authentication is initializing. Please wait a moment.');

    try {
      // If a role was selected, store it in sessionStorage so AuthCallback can apply it
      if (selectedRole) {
        sessionStorage.setItem('agentix_oauth_role', selectedRole);
      }

      await clerkSignIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/auth/callback',
        redirectUrlComplete: '/auth/callback',
        additionalData: {
          prompt: 'select_account',
        },
      });
    } catch (err) {
      console.error('[Google OAuth Error]', err);
      throw err;
    }
  };

  /**
   * Google 1-Click OAuth Sign-Up via Clerk
   */
  const signUpWithGoogle = async (selectedRole = 'user') => {
    if (!isSignUpLoaded) throw new Error('Authentication is initializing. Please wait a moment.');

    try {
      if (selectedRole) {
        sessionStorage.setItem('agentix_oauth_role', selectedRole);
      }

      await clerkSignUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/auth/callback',
        redirectUrlComplete: '/auth/callback',
        additionalData: {
          prompt: 'select_account',
        },
      });
    } catch (err) {
      console.error('[Google OAuth Error]', err);
      throw err;
    }
  };

  /**
   * Verify Email Code (for Clerk verification if enabled)
   */
  const verifyEmailCode = async (code) => {
    if (!isSignUpLoaded) return;
    const result = await clerkSignUp.attemptEmailAddressVerification({ code });
    if (result.status === 'complete') {
      await setSignUpActive({ session: result.createdSessionId });
    }
    return result;
  };

  /**
   * Update Profile & Role
   */
  const updateProfile = async (updates) => {
    if (!clerkUser) return null;
    setProfileLoading(true);
    try {
      const userUpdates = {};
      if (updates.full_name) {
        userUpdates.firstName = updates.full_name;
      }
      if (updates.role) {
        userUpdates.unsafeMetadata = {
          ...clerkUser.unsafeMetadata,
          role: updates.role,
          requested_role: updates.role,
        };
      }

      const updated = await clerkUser.update(userUpdates);
      const synced = await syncWithDatabase(updated, updates.role);
      return synced;
    } finally {
      setProfileLoading(false);
    }
  };

  /**
   * Upload Avatar via Clerk
   */
  const uploadAvatar = async (file) => {
    if (!clerkUser) return null;
    setProfileLoading(true);
    try {
      const updated = await clerkUser.setProfileImage({ file });
      await syncWithDatabase(updated);
      return updated;
    } finally {
      setProfileLoading(false);
    }
  };

  /**
   * Sign Out
   */
  const signOut = async () => {
    try {
      await clerk.signOut();
    } catch (e) {
      console.warn('[signOut error]', e);
    } finally {
      setDbProfile(null);
    }
  };

  const isLoaded = isUserLoaded && isAuthLoaded;
  const isLoading = !isLoaded || profileLoading;
  const isAuthenticated = isLoaded && isSignedIn && !!clerkUser;

  // Real role from Clerk metadata or synced DB record
  const role = clerkUser
    ? (clerkUser?.unsafeMetadata?.role || clerkUser?.publicMetadata?.role || dbProfile?.role || null)
    : null;

  // User normalized structure for entire app
  const user = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    full_name: clerkUser.fullName || clerkUser.firstName || clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] || '',
    avatar_url: clerkUser.imageUrl || null,
    role: role,
    created_at: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
  } : null;

  const profile = user ? {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    role: role,
    requested_role: role,
    role_request_status: 'approved',
    created_at: user.created_at,
  } : null;

  return (
    <AuthContext.Provider value={{
      session: sessionId ? { id: sessionId, user } : null,
      user,
      profile,
      role,
      userRole: role,
      isAuthenticated,
      isLoading,
      signIn,
      signUp,
      signInWithGoogle,
      signUpWithGoogle,
      verifyEmailCode,
      updateProfile,
      uploadAvatar,
      signOut,
      refreshProfile: () => clerkUser?.reload(),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
