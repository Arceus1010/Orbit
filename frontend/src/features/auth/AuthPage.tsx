import { Card, CardContent } from '@/shared/ui/card';
import OrbitAuthBackground from './components/OrbitAuthBackground';
import { AuthThemeToggle } from './components/AuthThemeToggle';

interface AuthPageProps {
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthPage({ subtitle, children }: AuthPageProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <OrbitAuthBackground />
      <AuthThemeToggle />

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground drop-shadow-md">
            Orbit
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl">
          <CardContent className="pt-6">{children}</CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground/70">
          By continuing, you agree to our{' '}
          <span className="underline cursor-pointer hover:text-muted-foreground">Terms of Service</span> and{' '}
          <span className="underline cursor-pointer hover:text-muted-foreground">Privacy Policy</span>.
        </p>
      </div>
    </main>
  );
}
