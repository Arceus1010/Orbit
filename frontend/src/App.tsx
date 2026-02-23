import { Routes, Route, Navigate } from 'react-router-dom';
import { useCurrentUser } from './features/auth/auth.hooks';
import ProtectedRoute from './shared/components/ProtectedRoute';
import GuestOnlyRoute from './shared/components/GuestOnlyRoute';
import LoadingScreen from './shared/components/LoadingScreen';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DashboardPage from './features/dashboard/DashboardPage';
import NotFoundPage from './shared/components/NotFoundPage';

function RootRedirect() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return <LoadingScreen />;

  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
      <Route path="/register" element={<GuestOnlyRoute><RegisterPage /></GuestOnlyRoute>} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
