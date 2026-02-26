import { useCurrentUser } from '@/features/auth/auth.hooks';
import { Card, CardContent } from '@/shared/ui/card';

export default function DashboardPage() {
  const { data: user } = useCurrentUser();

  return (
    <div className="p-6">
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
    </div>
  );
}
