import { useApp } from '@/contexts/AppProvider';
import ThemeToggle from './ThemeToggle';
import SettingsPanel from './SettingsPanel';
import AuthControls from '@/components/auth/AuthControls';

function isStatsPage(): boolean {
  if (typeof window === 'undefined') return false;
  return /^\/stats\/?$/.test(window.location.pathname);
}

export default function HeaderActions() {
  const { t } = useApp();
  const onStatsPage = isStatsPage();

  const linkClass =
    'rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text-muted)] no-underline transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]';

  return (
    <div className="flex items-center gap-2">
      {onStatsPage ? (
        <a href="/" className={linkClass}>
          {t.nav.lessons}
        </a>
      ) : (
        <a href="/stats" className={linkClass}>
          {t.nav.stats}
        </a>
      )}
      <AuthControls />
      <SettingsPanel />
      <ThemeToggle />
    </div>
  );
}
