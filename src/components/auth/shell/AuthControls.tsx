import { useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useApp } from '@/contexts/AppProvider';
import { signInWithOAuth, type OAuthProvider } from '@/services/supabase/auth';
import { Icon } from '@/components/ui';
import { headerIconButtonClassName, headerLinkClassName } from '@/components/layout/headerClasses';

interface OAuthIconButtonProps {
  provider: OAuthProvider;
  label: string;
}

function OAuthIconButton({ provider, label }: OAuthIconButtonProps) {
  const [loading, setLoading] = useState(false);
  const icon = provider === 'github' ? 'github' : 'google';

  const handleClick = async () => {
    setLoading(true);
    const { error } = await signInWithOAuth(provider);
    if (error) console.warn('[auth]', error);
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={headerIconButtonClassName}
      aria-label={label}
      title={label}
    >
      <Icon name={icon} size={20} />
    </button>
  );
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
      <a href="/login" className={headerLinkClassName}>
        {t.auth.signIn}
      </a>
    );
  }

  if (variant === 'landing') {
    return (
      <div className="flex items-center gap-1.5">
        <a
          href="/login"
          className="rounded-lg px-3 py-2 text-sm leading-none text-[var(--color-text-muted)] no-underline transition hover:text-[var(--color-highlight)]"
        >
          {t.auth.signIn}
        </a>
        <a
          href="/lessons"
          className="inline-flex h-9 items-center rounded-xl bg-[var(--color-highlight)] px-4 text-sm font-semibold leading-none text-white no-underline shadow-lg shadow-[var(--color-highlight)]/20 transition hover:bg-[var(--color-highlight-hover)]"
        >
          {t.landing.openApp}
        </a>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <a
        href="/login"
        className="hidden h-9 items-center px-2 text-sm leading-none text-[var(--color-text-muted)] no-underline transition hover:text-[var(--color-highlight)] sm:inline-flex"
      >
        {t.auth.signIn}
      </a>
      <OAuthIconButton provider="github" label={t.auth.signInGithub} />
      <OAuthIconButton provider="google" label={t.auth.signInGoogle} />
    </div>
  );
}
