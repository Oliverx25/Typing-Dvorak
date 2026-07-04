import type { ReactNode } from 'react';
import { isSupabaseConfigured } from '@/services/supabase/auth';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  const configured = isSupabaseConfigured();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <a
        href="/"
        className="mb-8 flex items-center gap-2 text-sm text-[var(--color-text-muted)] no-underline transition hover:text-[var(--color-highlight)]"
      >
        ← Back to home
      </a>

      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8 shadow-xl shadow-black/5">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{title}</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{subtitle}</p>
        </div>

        {!configured ? (
          <div className="rounded-xl border border-[var(--color-key-target)]/30 bg-[var(--color-key-target)]/10 p-4 text-center text-sm text-[var(--color-text-muted)]">
            <p>Cloud auth is not configured on this deployment.</p>
            <a href="/lessons" className="mt-3 inline-block font-medium text-[var(--color-highlight)] no-underline hover:underline">
              Continue without account →
            </a>
          </div>
        ) : (
          children
        )}
      </div>

      {footer && <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">{footer}</div>}
    </div>
  );
}
