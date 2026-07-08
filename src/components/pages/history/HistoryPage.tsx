import BackLink from '@/components/layout/shell/BackLink';
import { useApp } from '@/contexts/AppProvider';
import { useAuth } from '@/contexts/AuthProvider';
import { useAppHydration } from '@/hooks/useAppHydration';
import { useIsClient } from '@/hooks/useIsClient';
import HistoryTimeline from '@/components/pages/history/HistoryTimeline';

function HistorySkeleton() {
  return (
    <div className="space-y-3" role="status" aria-busy="true">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-xl border border-slate-800 bg-slate-900/40"
        />
      ))}
    </div>
  );
}

function HistoryContent() {
  const { t } = useApp();
  const { user, isConfigured } = useAuth();

  return (
    <>
      <BackLink />
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">{t.history.title}</h1>
        <p className="mt-2 max-w-2xl text-lg text-[var(--color-text-muted)]">{t.history.subtitle}</p>
        {isConfigured && !user ? (
          <p className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
            {t.history.guestHint}
          </p>
        ) : null}
      </header>
      <HistoryTimeline />
    </>
  );
}

export default function HistoryPage() {
  const isClient = useIsClient();
  const { isHydrating, authReady } = useAppHydration();
  const { user } = useAuth();

  if (!isClient || (user && (!authReady || isHydrating))) {
    return <HistorySkeleton />;
  }

  return <HistoryContent />;
}
