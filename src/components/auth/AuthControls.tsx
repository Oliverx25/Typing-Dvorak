import { useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useApp } from '@/contexts/AppProvider';
import { signInWithOAuth, type OAuthProvider } from '@/services/supabase/auth';
import { Button, Icon } from '@/components/ui';

interface AuthButtonProps {
  provider: OAuthProvider;
}

function ProviderButton({ provider }: AuthButtonProps) {
  const auth = useAuthLabels();
  const [loading, setLoading] = useState(false);
  const icon = provider === 'github' ? 'github' : 'google';
  const label = provider === 'github' ? auth.signInGithub : auth.signInGoogle;

  const handleClick = async () => {
    setLoading(true);
    const { error } = await signInWithOAuth(provider);
    if (error) console.warn('[auth]', error);
    setLoading(false);
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleClick} disabled={loading}>
      <Icon name={icon} size={16} />
      {label}
    </Button>
  );
}

function useAuthLabels() {
  const { t } = useApp();
  return t.auth;
}

interface AuthControlsProps {
  variant?: 'app' | 'landing';
}

export default function AuthControls({ variant = 'app' }: AuthControlsProps) {
  const { user, loading, isConfigured } = useAuth();
  const { t } = useApp();

  if (user) return null;
  if (loading) return null;

  if (!isConfigured) {
    return (
      <a
        href="/login"
        className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-muted)] no-underline transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        {t.auth.signIn}
      </a>
    );
  }

  if (variant === 'landing') {
    return (
      <>
        <a
          href="/login"
          className="rounded-lg px-3 py-2 text-sm text-[var(--color-text-muted)] no-underline transition hover:text-[var(--color-accent)]"
        >
          {t.auth.signIn}
        </a>
        <a
          href="/lessons"
          className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white no-underline shadow-lg shadow-[var(--color-accent)]/20 transition hover:bg-[var(--color-accent-hover)]"
        >
          {t.landing.openApp}
        </a>
      </>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <ProviderButton provider="github" />
      <ProviderButton provider="google" />
    </div>
  );
}
