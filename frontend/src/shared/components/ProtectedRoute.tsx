import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/features/auth/auth.hooks';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) return <LoadingScreen />;

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
