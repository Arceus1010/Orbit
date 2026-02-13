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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Orbit</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending && <Loader2 className="animate-spin" />}
                {isPending ? 'Signing in...' : 'Sign in'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-primary hover:underline">
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
