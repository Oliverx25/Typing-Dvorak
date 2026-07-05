import { useState } from 'react';
import { useAuthText } from '@/hooks/useAuthText';
import { signInWithEmail, signInWithOAuth } from '@/services/supabase/auth';
import AuthShell from '@/components/auth/shell/AuthShell';
import PublicShell from '@/components/layout/shell/PublicShell';
import { Button, Icon } from '@/components/ui';
import { formFieldClassName } from '@/components/ui/formFieldClasses';

export default function LoginForm() {
  return (
    <PublicShell>
      <LoginFormContent />
    </PublicShell>
  );
}

function LoginFormContent() {
  const t = useAuthText();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await signInWithEmail(email, password);
    if (err) {
      setError(err);
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
      title={t.loginTitle}
      subtitle={t.loginSubtitle}
      footer={
        <>
          <p>
            {t.noAccount}{' '}
            <a href="/signup" className="text-[var(--color-highlight)] no-underline hover:underline">
              {t.signUp}
            </a>
          </p>
          <p className="mt-2">
            <a href="/lessons" className="text-[var(--color-text-muted)] no-underline hover:text-[var(--color-highlight)]">
              {t.continueWithout} →
            </a>
          </p>
        </>
      }
    >
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

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">{t.password}</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={formFieldClassName}
          />
        </label>

        <div className="text-right">
          <a href="/forgot-password" className="text-xs text-[var(--color-highlight)] no-underline hover:underline">
            {t.forgotPassword}
          </a>
        </div>

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? t.signingIn : t.signIn}
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
