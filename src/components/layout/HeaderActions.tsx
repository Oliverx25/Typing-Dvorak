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
  const showUtilities = isApp || Boolean(user);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {showUtilities && (
        <div className="flex items-center gap-1.5">
          {onStatsPage ? (
            <a href="/lessons" className={headerLinkClassName}>
              {t.nav.lessons}
            </a>
          ) : (
            <a href="/stats" className={headerLinkClassName}>
              {t.nav.stats}
            </a>
          )}
          <SettingsPanel />
          <ThemeToggle />
        </div>
      )}

      {!user && !loading && showUtilities && (
        <div className={headerDividerClassName} aria-hidden="true" />
      )}

      {user && (
        <>
          <div className={headerDividerClassName} aria-hidden="true" />
          <UserProfileDropdown />
        </>
      )}

      {!user && !loading && <AuthControls variant={variant} />}

      {!user && loading && variant === 'landing' && (
        <div className="h-9 w-24 animate-pulse rounded-lg bg-[var(--color-surface-elevated)]" aria-hidden="true" />
      )}
    </div>
  );
}
