import { useApp } from '@/contexts/AppProvider';
import { useAuth } from '@/contexts/AuthProvider';
import ThemeToggle from './ThemeToggle';
import SettingsPanel from './SettingsPanel';
import AuthControls from '@/components/auth/AuthControls';
import UserProfileDropdown from '@/components/auth/UserProfileDropdown';
import { headerDividerClassName, headerLinkClassName } from './headerClasses';

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
  const isApp = variant === 'app';

  if (isApp) {
    return (
      <nav className="flex items-center gap-1.5 sm:gap-2" aria-label={t.nav.settings}>
        <div className="flex items-center gap-1.5">
          {onStatsPage ? (
            <a href="/lessons" className={headerLinkClassName}>
              {t.nav.lessons}
            </a>
          ) : (
            <>
              <a href="/stats" className={headerLinkClassName}>
                {t.nav.stats}
              </a>
              {user ? (
                <a href="/multiplayer" className={headerLinkClassName}>
                  {t.nav.multiplayer}
                </a>
              ) : null}
            </>
          )}
          <SettingsPanel />
          <ThemeToggle />
        </div>

        {!loading && (
          <>
            <div className={headerDividerClassName} aria-hidden="true" />
            {user ? <UserProfileDropdown /> : <AuthControls variant="app" />}
          </>
        )}
      </nav>
    );
  }

  return (
    <nav className="flex shrink-0 items-center justify-end gap-2 sm:gap-3" aria-label={t.nav.settings}>
      {user && (
        <>
          <div className="flex items-center gap-1.5">
            {onStatsPage ? (
              <a href="/lessons" className={headerLinkClassName}>
                {t.nav.lessons}
              </a>
            ) : (
              <>
                <a href="/stats" className={headerLinkClassName}>
                  {t.nav.stats}
                </a>
                <a href="/multiplayer" className={headerLinkClassName}>
                  {t.nav.multiplayer}
                </a>
              </>
            )}
          </div>
          <div className={headerDividerClassName} aria-hidden="true" />
          <div className="flex items-center gap-1.5">
            <SettingsPanel />
            <ThemeToggle />
          </div>
          <div className={headerDividerClassName} aria-hidden="true" />
          <UserProfileDropdown />
        </>
      )}

      {!user && !loading && <AuthControls variant="landing" />}

      {!user && loading && (
        <div className="h-9 w-24 animate-pulse rounded-lg bg-[var(--color-surface-elevated)]" aria-hidden="true" />
      )}
    </nav>
  );
}
