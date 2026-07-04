import { useState } from 'react';
import { useAuthText } from '@/hooks/useAuthText';
import { signInWithOAuth, signUpWithEmail } from '@/services/supabase/auth';
import AuthShell from './AuthShell';
import PublicShell from '@/components/layout/PublicShell';
import { Button, Icon } from '@/components/ui';
import { formFieldClassName } from '@/components/ui/formFieldClasses';

export default function SignupForm() {
  return (
    <PublicShell>
      <SignupFormContent />
    </PublicShell>
  );
}

function SignupFormContent() {
  const t = useAuthText();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
    setSuccess(null);

    const { error: err, needsConfirmation } = await signUpWithEmail(email, password);
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }

    if (needsConfirmation) {
      setSuccess(t.checkEmail);
      setLoading(false);
      return;
    }

    window.location.href = '/lessons';
  };

  const oauth = async (provider: 'github' | 'google') => {
    setLoading(true);
    const { error: err } = await signInWithOAuth(provider);
    if (err) {
      setError(err);
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t.signupTitle}
      subtitle={t.signupSubtitle}
      footer={
        <p>
          {t.hasAccount}{' '}
          <a href="/login" className="text-[var(--color-highlight)] no-underline hover:underline">
            {t.signIn}
          </a>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-incorrect)]/10 px-3 py-2 text-sm text-[var(--color-incorrect)]">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg border border-[var(--color-correct)]/30 bg-[var(--color-correct)]/10 px-3 py-2 text-sm text-[var(--color-correct)]">
            {success}
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

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">{t.password}</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={formFieldClassName}
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
            className={formFieldClassName}
          />
        </label>

        <Button type="submit" fullWidth disabled={loading || !!success}>
          {loading ? t.signingIn : t.signUp}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-xs text-[var(--color-text-muted)]">{t.orContinueWith}</span>
        <div className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="secondary" onClick={() => oauth('github')} disabled={loading}>
          <Icon name="github" size={16} /> {t.signInGithub}
        </Button>
        <Button type="button" variant="secondary" onClick={() => oauth('google')} disabled={loading}>
          <Icon name="google" size={16} /> {t.signInGoogle}
        </Button>
      </div>
    </AuthShell>
  );
}
