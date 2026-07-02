import { AppProvider } from '../contexts/AppProvider';
import { useApp } from '../contexts/AppProvider';
import StatsDashboard from './StatsDashboard';
import PageLayout from './PageLayout';

function StatsContent() {
  const { t } = useApp();
  return (
    <>
      <nav className="mb-8">
        <a href="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] no-underline transition hover:text-[var(--color-accent)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          {t.nav.backToLessons}
        </a>
      </nav>
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
    <AppProvider>
      <PageLayout>
        <StatsContent />
      </PageLayout>
    </AppProvider>
  );
}
