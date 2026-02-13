import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useCurrentUser, useRegister, useLogin } from './auth.hooks';
import { getErrorMessage, isPasswordValid } from './auth.utils';
import { PasswordRequirements } from './components/PasswordRequirements';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent } from '@/shared/ui/card';
import { PasswordInput } from './components/PasswordInput';
import { Loader2, AlertCircle } from 'lucide-react';
import OrbitAuthBackground from './components/OrbitAuthBackground';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading: isCheckingAuth } = useCurrentUser();
  const { mutate: registerUser, isPending: isRegistering } = useRegister();
  const { mutate: loginUser, isPending: isLoggingIn } = useLogin();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);

  if (isCheckingAuth) return null;
  if (currentUser) return <Navigate to="/dashboard" replace />;

  const isPending = isRegistering || isLoggingIn;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    registerUser(
      { email, password, full_name: fullName || null },
      {
        onSuccess: () => {
          loginUser(
            { email, password },
            {
              onSuccess: () => navigate('/dashboard'),
              onError: () => navigate('/login'),
            },
          );
        },
        onError: (err) => {
          setError(getErrorMessage(err));
        },
      },
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <OrbitAuthBackground />

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-sm">
            Orbit
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Create your account
          </p>
        </div>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-neutral-300">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:bg-white/10 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:bg-white/10 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" title="password" className="text-neutral-300">Password</Label>
                <PasswordInput
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="Create a strong password"
                  className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:bg-white/10 transition-colors"
                />
                <PasswordRequirements
                  password={password}
                  showRequirements={passwordFocused || password.length > 0}
                />
              </div>

              <Button
                type="submit"
                disabled={isPending || (password.length > 0 && !isPasswordValid(password))}
                className="w-full bg-white text-black hover:bg-neutral-200 transition-all font-semibold"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isRegistering ? 'Creating account...' : isLoggingIn ? 'Signing in...' : 'Create account'}
              </Button>

              <p className="text-center text-sm text-neutral-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-white hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}