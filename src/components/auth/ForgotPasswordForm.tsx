import { useState } from 'react';
import { useAuthText } from '@/hooks/useAuthText';
import { resetPasswordForEmail } from '@/services/supabase/auth';
import AuthShell from './AuthShell';
import PublicShell from '@/components/layout/PublicShell';
import { Button } from '@/components/ui';
import { formFieldClassName } from '@/components/ui/formFieldClasses';

export default function ForgotPasswordForm() {
  return (
    <PublicShell>
      <ForgotPasswordFormContent />
    </PublicShell>
  );
}

function ForgotPasswordFormContent() {
  const t = useAuthText();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: err } = await resetPasswordForEmail(email);
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <AuthShell
      title={t.forgotTitle}
      subtitle={t.forgotSubtitle}
      footer={
        <a href="/login" className="text-[var(--color-highlight)] no-underline hover:underline">
          ← {t.signIn}
        </a>
      }
    >
      {success ? (
        <p className="rounded-lg border border-[var(--color-correct)]/30 bg-[var(--color-correct)]/10 px-4 py-3 text-center text-sm text-[var(--color-correct)]">
          {t.resetEmailSent}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-incorrect)]/10 px-3 py-2 text-sm text-[var(--color-incorrect)]">
              {error}
            </p>
          )}

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">{t.email}</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={formFieldClassName}
            />
          </label>

          <Button type="submit" fullWidth disabled={loading}>
            {t.sendResetLink}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
