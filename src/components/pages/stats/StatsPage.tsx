import BackLink from '@/components/layout/shell/BackLink';
import { useApp } from '@/contexts/AppProvider';
import { useAppHydration } from '@/hooks/useAppHydration';
import StatsDashboard from '@/components/stats/dashboard/StatsDashboard';

function StatsSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-busy="true">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
        />
      ))}
    </div>
  );
}

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
  const { isHydrating, authReady } = useAppHydration();

  if (!authReady || isHydrating) {
    return <StatsSkeleton />;
  }

  return <StatsContent />;
}
