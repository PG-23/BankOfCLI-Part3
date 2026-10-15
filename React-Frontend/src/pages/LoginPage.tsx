import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { AuthLayout } from '../components/AuthLayout';
import { Button, Input } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { getApiError } from '../utils/apiError';
import { notify } from '../utils/notify';

type Errors = { identifier?: string; password?: string };

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  // Already logged in → skip the login page
  if (user && !loading) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const next: Errors = {};
    if (!identifier.trim()) next.identifier = 'Enter your username or email.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await login({ identifier, password });
      notify.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      notify.error(getApiError(err)?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Log in" subtitle="Welcome back to Bank of CLI">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Username or email"
          autoComplete="username"
          value={identifier}
          onChange={e => {
            setIdentifier(e.target.value);
            setErrors(errs => ({ ...errs, identifier: undefined }));
          }}
          error={errors.identifier}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            setErrors(errs => ({ ...errs, password: undefined }));
          }}
          error={errors.password}
        />
        <Button type="submit" fullWidth loading={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-base text-text-muted">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-link hover:underline">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}