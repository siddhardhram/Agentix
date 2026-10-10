import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabase';
import { AlertCircle, CheckCircle2, User, Code2, Shield } from 'lucide-react';

export function SignupForm({
  onSuccess,
  onSwitchToLogin,
  ...props
}) {
  const { signUp, signUpWithGoogle, verifyEmailCode } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' | 'developer'
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { requiresConfirmation } = await signUp(email, password, name, role);
      if (requiresConfirmation) {
        setEmailSent(true);
      } else {
        if (onSuccess) {
          onSuccess({ role });
        } else {
          navigate(`/${role}/dashboard`, { replace: true });
        }
      }
    } catch (err) {
      const msg = err.errors?.[0]?.longMessage || err.message || '';
      if (msg.includes('already registered') || msg.includes('taken') || msg.includes('exists')) {
        setError('An account with this email already exists. Try signing in.');
      } else if (msg.includes('password') && msg.includes('pwned')) {
        setError('Please choose a more secure password.');
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;
    setError(null);
    setVerifying(true);
    try {
      await verifyEmailCode(verificationCode.trim());
      if (onSuccess) {
        onSuccess({ role });
      } else {
        navigate(`/${role}/dashboard`, { replace: true });
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || err.message || 'Incorrect verification code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signUpWithGoogle(role);
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || err.message || 'Google sign-up failed. Please try email registration.');
      setGoogleLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card {...props}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-500/30">
            <CheckCircle2 size={24} className="text-indigo-400" />
          </div>
          <CardTitle>Enter verification code</CardTitle>
          <CardDescription>
            We sent a verification code to <span className="font-semibold text-slate-200">{email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
            <Field>
              <FieldLabel htmlFor="code">Verification Code</FieldLabel>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </Field>
            <Button type="submit" loading={verifying} className="w-full">
              Complete Registration
            </Button>
          </form>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              if (onSwitchToLogin) onSwitchToLogin();
              else navigate('/login');
            }}
          >
            Back to Sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Select your workspace role and enter your details
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {/* Account Type / Role Selection */}
            <Field>
              <FieldLabel>Account Type</FieldLabel>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {/* User Option */}
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                    role === 'user'
                      ? 'border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-500 text-white'
                      : 'border-white/10 bg-slate-950/60 text-slate-400 hover:border-white/20 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User size={15} className={role === 'user' ? 'text-indigo-400' : 'text-slate-400'} />
                    <span className="text-xs font-bold text-slate-100">User</span>
                  </div>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    Raise tickets, track status &amp; review agent progress
                  </span>
                </button>

                {/* Developer Option */}
                <button
                  type="button"
                  onClick={() => setRole('developer')}
                  className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                    role === 'developer'
                      ? 'border-cyan-500 bg-cyan-500/15 ring-1 ring-cyan-500 text-white'
                      : 'border-white/10 bg-slate-950/60 text-slate-400 hover:border-white/20 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Code2 size={15} className={role === 'developer' ? 'text-cyan-400' : 'text-slate-400'} />
                    <span className="text-xs font-bold text-slate-100">Developer</span>
                  </div>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    Review diffs, run sandboxes &amp; approve code patches
                  </span>
                </button>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FieldDescription>
                We&apos;ll use this to send notifications and secure your account.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Field>

            <FieldGroup>
              <Field>
                <Button type="submit" loading={loading} className="w-full">
                  Create Account as {role === 'developer' ? 'Developer' : 'User'}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogleSignup}
                  loading={googleLoading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center pt-2">
                  Already have an account?{' '}
                  {onSwitchToLogin ? (
                    <button
                      type="button"
                      onClick={onSwitchToLogin}
                      className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                    >
                      Sign in
                    </button>
                  ) : (
                    <Link to="/login" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
                      Sign in
                    </Link>
                  )}
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
