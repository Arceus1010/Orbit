import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useCurrentUser, useLogin } from './auth.hooks';
import { getErrorMessage } from './auth.utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent } from '@/shared/ui/card';
import { PasswordInput } from './components/PasswordInput';
import { Loader2, AlertCircle } from 'lucide-react';
import OrbitAuthBackground from './components/OrbitAuthBackground';

export default function LoginPage() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading: isCheckingAuth } = useCurrentUser();
  const { mutate: loginUser, isPending } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isCheckingAuth) return null;
  if (currentUser) return <Navigate to="/dashboard" replace />;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    loginUser(
      { email, password },
      {
        onSuccess: () => navigate('/dashboard'),
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
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md">
            Orbit
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Sign in to your account
          </p>
        </div>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:bg-white/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" title="password" className="text-neutral-300">Password</Label>
                  {/* Example: Add a "Forgot Password" link later if needed */}
                </div>
                <PasswordInput
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:bg-white/10 transition-all"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isPending} 
                className="w-full bg-white text-black hover:bg-neutral-200 transition-all font-semibold"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Signing in...' : 'Sign in'}
              </Button>

              <p className="text-center text-sm text-neutral-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-white hover:underline">
                  Register
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}