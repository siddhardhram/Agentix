import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
import { AlertCircle } from 'lucide-react';

export function LoginForm({
  className,
  onSuccess,
  onSwitchToSignup,
  ...props
}) {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { profile, user } = await signIn(email, password);
      if (onSuccess) {
        onSuccess(profile || user);
      } else {
        const role = profile?.role || user?.role;
        const dest = role ? `/${role}/dashboard` : (from && from !== '/login' ? from : '/dashboard');
        navigate(dest, { replace: true });
      }
    } catch (err) {
      const msg = err.errors?.[0]?.longMessage || err.message || '';
      if (msg.includes('Incorrect password') || msg.includes('identifier') || msg.includes('not found')) {
        setError('Incorrect email or password. Please try again.');
      } else if (msg.includes('Too many requests') || msg.includes('rate limit')) {
        setError('Too many login attempts. Please wait a moment before trying again.');
      } else {
        setError(msg || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || err.message || 'Google sign-in failed. Please try email login.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
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
              </Field>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      setError('Password reset instructions will be sent if the account exists.');
                    }}
                    className="ml-auto inline-block text-xs text-indigo-400 underline-offset-4 hover:underline hover:text-indigo-300"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
              <FieldGroup>
                <Field>
                  <Button type="submit" loading={loading} className="w-full">
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleGoogleLogin}
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
                    Login with Google
                  </Button>
                  <FieldDescription className="text-center pt-2">
                    Don&apos;t have an account?{' '}
                    {onSwitchToSignup ? (
                      <button
                        type="button"
                        onClick={onSwitchToSignup}
                        className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                      >
                        Sign up
                      </button>
                    ) : (
                      <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
                        Sign up
                      </Link>
                    )}
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
