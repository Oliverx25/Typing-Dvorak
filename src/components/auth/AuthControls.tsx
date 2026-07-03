import { useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useApp } from '@/contexts/AppProvider';
import { signInWithOAuth, type OAuthProvider } from '@/services/supabase/auth';
import { Button, Icon } from '@/components/ui';

interface AuthButtonProps {
  provider: OAuthProvider;
}

function ProviderButton({ provider }: AuthButtonProps) {
  const { t } = useAuthLabels();
  const [loading, setLoading] = useState(false);
  const icon = provider === 'github' ? 'github' : 'google';
  const label = provider === 'github' ? t.signInGithub : t.signInGoogle;

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

export default function AuthControls() {
  const { user, loading, isConfigured, signOut } = useAuth();
  const { t } = useApp();

  if (!isConfigured) {
    return (
      <a href="/login" className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-muted)] no-underline transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
        {t.auth.signIn}
      </a>
    );
  }
  if (loading) return null;

  if (user) {
    const name = user.user_metadata?.user_name ?? user.user_metadata?.name ?? user.email?.split('@')[0];
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-[var(--color-text-muted)] sm:inline">{name}</span>
        <Button variant="ghost" size="sm" onClick={signOut}>
          {t.auth.signOut}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <ProviderButton provider="github" />
      <ProviderButton provider="google" />
    </div>
  );
}
