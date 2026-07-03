import { useState } from 'react';
import { useAuthText } from '@/hooks/useAuthText';
import { updatePassword } from '@/services/supabase/auth';
import AuthShell from './AuthShell';
import { Button } from '@/components/ui';

export default function ResetPasswordForm() {
  const t = useAuthText();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError(t.passwordTooShort);
      return;
    }
    if (password !== confirm) {
      setError(t.passwordMismatch);
      return;
    }

    setLoading(true);
    setError(null);
    const { error: err } = await updatePassword(password);
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }
    window.location.href = '/lessons';
  };

  return (
    <AuthShell title={t.resetTitle} subtitle={t.resetSubtitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-incorrect)]/10 px-3 py-2 text-sm text-[var(--color-incorrect)]">
            {error}
          </p>
        )}

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">{t.password}</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">{t.confirmPassword}</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
          />
        </label>

        <Button type="submit" fullWidth disabled={loading}>
          {t.savePassword}
        </Button>
      </form>
    </AuthShell>
  );
}
