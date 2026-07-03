import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/contexts/AppProvider';
import StatsDashboard from '@/components/stats/StatsDashboard';
import BackLink from '@/components/layout/BackLink';

function StatsContent() {
  const { t } = useApp();
  return (
    <>
      <BackLink />
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">{t.stats.title}</h1>
        <p className="mt-2 text-lg text-[var(--color-text-muted)]">{t.stats.subtitle}</p>
      </header>
      <StatsDashboard />
    </>
  );
}

export default function StatsPage() {
  return (
    <AppShell>
      <StatsContent />
    </AppShell>
  );
}
