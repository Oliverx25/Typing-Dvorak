import AppShell from '@/components/layout/shell/AppShell';
import BackLink from '@/components/layout/shell/BackLink';
import { useApp } from '@/contexts/AppProvider';
import { useAuth } from '@/contexts/AuthProvider';
import AchievementsGrid from '@/components/achievements/AchievementsGrid';

function AchievementsContent() {
  const { t } = useApp();
  const { user, isConfigured } = useAuth();

  return (
    <>
      <BackLink />
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">{t.achievements.title}</h1>
        <p className="mt-2 max-w-2xl text-lg text-[var(--color-text-muted)]">{t.achievements.subtitle}</p>
        {isConfigured && !user && (
          <p className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
            {t.achievements.guestHint}
          </p>
        )}
        {user && isConfigured && (
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">{t.achievements.syncHint}</p>
        )}
      </header>
      <AchievementsGrid />
    </>
  );
}

export default function AchievementsPage() {
  return (
    <AppShell>
      <AchievementsContent />
    </AppShell>
  );
}
