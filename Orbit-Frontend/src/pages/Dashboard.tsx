import { useCurrentUser, useLogout } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ModeToggle } from '@/components/mode-toggle';

export default function Dashboard() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-foreground">Orbit</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <ModeToggle />
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground">
              Welcome{user?.full_name ? `, ${user.full_name}` : ''}!
            </h2>
            <p className="mt-2 text-muted-foreground">
              Your dashboard is ready. Projects and tasks are coming soon.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
