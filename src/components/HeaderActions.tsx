import { useApp } from '../contexts/AppProvider';
import ThemeToggle from './ThemeToggle';
import SettingsPanel from './SettingsPanel';

export default function HeaderActions() {
  const { t } = useApp();

  return (
    <div className="flex items-center gap-2">
      <a
        href="/stats"
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text-muted)] no-underline transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        {t.nav.stats}
      </a>
      <SettingsPanel />
      <ThemeToggle />
    </div>
  );
}
