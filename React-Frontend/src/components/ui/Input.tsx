import { useId, type InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-base font-medium text-text-main">
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-sm border bg-surface px-3 py-2 text-base text-text-main outline-none transition focus:ring-2
            ${error ? 'border-error focus:ring-error/20' : 'border-border focus:ring-primary/20'}
            ${className}`}
      />
      {error && (
        <p id={errorId} className="text-small text-error">
          {error}
        </p>
      )}
    </div>
  );
}