import type { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  fullWidth?: boolean;
};

const variants = {
    primary: 'bg-primary-strong text-white hover:bg-primary-hover',
    secondary: 'bg-secondary text-white hover:opacity-90',
    danger: 'bg-error text-white hover:opacity-90',
  };

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-base font-semibold transition
        disabled:cursor-not-allowed disabled:opacity-60
        ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}