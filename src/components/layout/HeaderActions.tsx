import { useApp } from '@/contexts/AppProvider';
import { useAuth } from '@/contexts/AuthProvider';
import ThemeToggle from './ThemeToggle';
import SettingsPanel from './SettingsPanel';
import AuthControls from '@/components/auth/AuthControls';
import UserProfileDropdown from '@/components/auth/UserProfileDropdown';

function isStatsPage(): boolean {
  if (typeof window === 'undefined') return false;
  return /^\/stats\/?$/.test(window.location.pathname);
}

interface HeaderActionsProps {
  variant?: 'app' | 'landing';
}

export default function HeaderActions({ variant = 'app' }: HeaderActionsProps) {
  const { t } = useApp();
  const { user, loading } = useAuth();
  const onStatsPage = isStatsPage();
  const isAuthenticated = Boolean(user);

  const linkClass =
    'rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text-muted)] no-underline transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]';

  return (
    <div className="flex items-center gap-2">
      {(isAuthenticated || variant === 'app') && !loading && (
        <>
          {onStatsPage ? (
            <a href="/lessons" className={linkClass}>
              {t.nav.lessons}
            </a>
          ) : (
            <a href="/stats" className={linkClass}>
              {t.nav.stats}
            </a>
          )}
        </>
      )}

      {isAuthenticated && !loading && (
        <>
          <SettingsPanel />
          <ThemeToggle />
          <div className="mx-0.5 hidden h-6 w-px bg-[var(--color-border)] sm:block" aria-hidden="true" />
          <UserProfileDropdown />
        </>
      )}

      {!isAuthenticated && !loading && variant === 'app' && (
        <>
          <AuthControls variant="app" />
          <SettingsPanel />
          <ThemeToggle />
        </>
      )}

      {!isAuthenticated && !loading && variant === 'landing' && <AuthControls variant="landing" />}

      {!isAuthenticated && loading && variant === 'landing' && (
        <div className="h-9 w-24 animate-pulse rounded-lg bg-[var(--color-surface-elevated)]" aria-hidden="true" />
      )}
    </div>
  );
}
