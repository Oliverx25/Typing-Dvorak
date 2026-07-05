import { useApp } from '@/contexts/AppProvider';
import { useAuth } from '@/contexts/AuthProvider';
import { usePathname } from '@/hooks/usePathname';
import { getHeaderNavItems, resolveNavSection } from '@/utils/navigation/headerNav';
import ThemeToggle from './ThemeToggle';
import SettingsPanel from './SettingsPanel';
import AuthControls from '@/components/auth/AuthControls';
import UserProfileDropdown from '@/components/auth/UserProfileDropdown';
import { headerDividerClassName, headerLinkClassName } from './headerClasses';
import { RoomAwareLink } from '@/components/multiplayer/RoomAwareLink';

interface HeaderActionsProps {
  variant?: 'app' | 'landing';
}

function NavLinks({ showMultiplayer }: { showMultiplayer: boolean }) {
  const { t } = useApp();
  const pathname = usePathname();
  const section = resolveNavSection(pathname);
  const items = getHeaderNavItems(section, showMultiplayer);

  const labels = {
    lessons: t.nav.lessons,
    stats: t.nav.stats,
    multiplayer: t.nav.multiplayer,
  } as const;

  return (
    <>
      {items.map((item) => (
        <RoomAwareLink key={item.href} href={item.href} className={headerLinkClassName}>
          {labels[item.labelKey]}
        </RoomAwareLink>
      ))}
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
      <nav className="flex shrink-0 items-center justify-end gap-2 sm:gap-3" aria-label={t.nav.settings}>
        <SettingsPanel />
        <ThemeToggle />
        <div className={headerDividerClassName} aria-hidden="true" />
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
