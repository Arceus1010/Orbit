import AuthPage from './AuthPage';
import RegisterForm from './components/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthPage subtitle="Create your account">
      <RegisterForm />
    </AuthPage>
  );
}
