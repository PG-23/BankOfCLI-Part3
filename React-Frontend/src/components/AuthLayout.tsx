import type { ReactNode } from 'react';

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center auth-background px-4 py-8">
      <div className="w-full max-w-[26rem] rounded-md border border-border bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-heading font-bold leading-tight text-text-main">{title}</h1>
        {subtitle && <p className="mt-1 text-base text-text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}