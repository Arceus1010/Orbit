import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../auth.hooks';
import { getErrorMessage } from '../auth.utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { PasswordInput } from './PasswordInput';
import { Loader2, AlertCircle } from 'lucide-react';

export default function LoginForm() {
  const navigate = useNavigate();
  const { mutate: loginUser, isPending } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-muted-foreground">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:bg-background/80 transition-all"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" title="password" className="text-muted-foreground">Password</Label>
        </div>
        <PasswordInput
          id="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:bg-background/80 transition-all"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full font-semibold transition-all"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-foreground hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
