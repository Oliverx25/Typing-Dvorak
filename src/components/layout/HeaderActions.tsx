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

function NavLinks({ showMultiplayer }: { showMultiplayer: boolean }) {
  const { t } = useApp();
  const onStatsPage = isStatsPage();

  if (onStatsPage) {
    return (
      <a href="/lessons" className={headerLinkClassName}>
        {t.nav.lessons}
      </a>
    );
  }

  return (
    <>
      <a href="/stats" className={headerLinkClassName}>
        {t.nav.stats}
      </a>
      {showMultiplayer ? (
        <a href="/multiplayer" className={headerLinkClassName}>
          {t.nav.multiplayer}
        </a>
      ) : null}
    </>
  );
}

export default function HeaderActions({ variant = 'app' }: HeaderActionsProps) {
  const { t } = useApp();
  const { user, loading } = useAuth();
  const isLanding = variant === 'landing';
  const showNav = !isLanding || Boolean(user);
  const showMultiplayer = Boolean(user);

  if (isLanding && !user && !loading) {
    return (
      <nav className="flex shrink-0 items-center justify-end" aria-label={t.nav.settings}>
        <AuthControls variant="landing" />
      </nav>
    );
  }

  if (isLanding && !user && loading) {
    return (
      <nav className="flex shrink-0 items-center justify-end" aria-label={t.nav.settings}>
        <div className="h-9 w-24 animate-pulse rounded-lg bg-[var(--color-surface-elevated)]" aria-hidden="true" />
      </nav>
    );
  }

  return (
    <nav className="flex shrink-0 items-center justify-end gap-2 sm:gap-3" aria-label={t.nav.settings}>
      {showNav && (
        <>
          <div className="flex items-center gap-1.5">
            <NavLinks showMultiplayer={showMultiplayer} />
          </div>
          <div className={headerDividerClassName} aria-hidden="true" />
        </>
      )}

      <div className="flex items-center gap-1.5">
        <SettingsPanel />
        <ThemeToggle />
      </div>

      {!loading && (
        <>
          <div className={headerDividerClassName} aria-hidden="true" />
          {user ? <UserProfileDropdown /> : <AuthControls variant={variant} />}
        </>
      )}
    </nav>
  );
}
