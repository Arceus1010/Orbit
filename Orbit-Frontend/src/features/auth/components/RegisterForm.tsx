import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister, useLogin } from '../auth.hooks';
import { getErrorMessage, isPasswordValid } from '../auth.utils';
import { PasswordRequirements } from './PasswordRequirements';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { PasswordInput } from './PasswordInput';
import { Loader2, AlertCircle } from 'lucide-react';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { mutate: registerUser, isPending: isRegistering } = useRegister();
  const { mutate: loginUser, isPending: isLoggingIn } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-muted-foreground">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
          className="border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:bg-background/80 transition-colors"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-muted-foreground">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:bg-background/80 transition-colors"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" title="password" className="text-muted-foreground">Password</Label>
        <PasswordInput
          id="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          placeholder="Create a strong password"
          className="border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:bg-background/80 transition-colors"
        />
        <PasswordRequirements
          password={password}
          showRequirements={passwordFocused || password.length > 0}
        />
      </div>

      <Button
        type="submit"
        disabled={isPending || (password.length > 0 && !isPasswordValid(password))}
        className="w-full font-semibold transition-all"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isRegistering ? 'Creating account...' : isLoggingIn ? 'Signing in...' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
