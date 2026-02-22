import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/features/auth/auth.hooks';

export default function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return null;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
