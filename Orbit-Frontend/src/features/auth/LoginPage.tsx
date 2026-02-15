import AuthPage from './AuthPage';
import LoginForm from './components/LoginForm';

export default function LoginPage() {
  return (
    <AuthPage subtitle="Sign in to your account">
      <LoginForm />
    </AuthPage>
  );
}
