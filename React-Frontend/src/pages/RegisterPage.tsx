import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { AuthLayout } from '../components/AuthLayout';
import { Button, Input, Modal } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../models';
import { getApiError } from '../utils/apiError';
import { notify } from '../utils/notify';
import { isStrongPassword, isValidEmail, isValidName } from '../utils/validation';

type Field = 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword';
type FormState = Record<Field, string>;

const emptyForm: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function validate(form: FormState): Partial<FormState> {
  const errors: Partial<FormState> = {};
  if (!isValidName(form.firstName)) errors.firstName = 'Enter your first name.';
  if (!isValidName(form.lastName)) errors.lastName = 'Enter your last name.';
  if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address.';
  if (!isStrongPassword(form.password))
    errors.password = 'Use at least 8 characters, including a number.';
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match.';
  return errors;
}

export default function RegisterPage() {
  const { user, account, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState<User | null>(null);

  // Already logged in → skip this page, unless we're showing the new-account modal
  if (user && !loading && !createdUser) return <Navigate to="/dashboard" replace />;

  const update = (field: Field) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(errs => ({ ...errs, [field]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const newUser = await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      setCreatedUser(newUser);
    } catch (err) {
      const apiError = getApiError(err);
      if (apiError?.field && apiError.field in emptyForm) {
        setErrors({ [apiError.field]: apiError.message });
      } else {
        notify.error(apiError?.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyUsername = async () => {
    if (!createdUser) return;
    try {
      await navigator.clipboard.writeText(createdUser.username);
      notify.success('Username copied');
    } catch {
      notify.error('Could not copy. Please write it down.');
    }
  };

  const goToDashboard = () => {
    notify.success('Account created!');
    navigate('/dashboard', { replace: true });
  };

  return (
    <AuthLayout title="Create account" subtitle="Open your Bank of CLI account">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            autoComplete="given-name"
            value={form.firstName}
            onChange={update('firstName')}
            error={errors.firstName}
          />
          <Input
            label="Last name"
            autoComplete="family-name"
            value={form.lastName}
            onChange={update('lastName')}
            error={errors.lastName}
          />
        </div>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={update('email')}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={update('confirmPassword')}
          error={errors.confirmPassword}
        />
        <Button type="submit" fullWidth loading={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-base text-text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-link hover:underline">
          Log in
        </Link>
      </p>

      <Modal open={!!createdUser} onClose={goToDashboard} title="Your account is ready">
        <p className="text-base text-text-muted">Your username is:</p>
        <div className="mt-2 flex items-center justify-between gap-2 rounded-sm border border-border bg-background px-3 py-2">
          <span className="text-title font-semibold text-text-main">{createdUser?.username}</span>
          <Button variant="secondary" type="button" onClick={copyUsername}>
            Copy
          </Button>
        </div>
        {account && (
          <p className="mt-3 text-small text-text-muted">
            Account number: {account.accountNumber}
          </p>
        )}
        <p className="mt-3 text-small text-text-muted">
          Save your username. You can log in with it or with your email.
        </p>
        <Button fullWidth className="mt-6" onClick={goToDashboard}>
          Continue to dashboard
        </Button>
      </Modal>
    </AuthLayout>
  );
}