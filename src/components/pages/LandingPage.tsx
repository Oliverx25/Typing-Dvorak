import { AuthProvider, useAuth } from '@/contexts/AuthProvider';
import { AppProvider, useApp } from '@/contexts/AppProvider';
import SiteHeader from '@/components/layout/SiteHeader';

function LandingHeroCtas() {
  const { t } = useApp();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <div className="h-12 w-full max-w-xs animate-pulse rounded-xl bg-[var(--color-surface-elevated)] sm:w-48" />
      </div>
    );
  }

  if (user) {
    return (
      <>
        <div className="mt-10 flex justify-center">
          <a
            href="/lessons"
            className="inline-flex w-full max-w-xs items-center justify-center rounded-xl bg-[var(--color-accent)] px-8 py-3.5 text-base font-semibold text-white no-underline shadow-lg shadow-[var(--color-accent)]/25 transition hover:bg-[var(--color-accent-hover)] sm:w-auto"
          >
            {t.landing.continuePracticing}
          </a>
        </div>
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">{t.landing.welcomeBack}</p>
      </>
    );
  }

  return (
    <>
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href="/lessons"
          className="inline-flex w-full max-w-xs items-center justify-center rounded-xl bg-[var(--color-accent)] px-8 py-3.5 text-base font-semibold text-white no-underline shadow-lg shadow-[var(--color-accent)]/25 transition hover:bg-[var(--color-accent-hover)] sm:w-auto"
        >
          {t.landing.startPracticing}
        </a>
        <a
          href="/signup"
          className="inline-flex w-full max-w-xs items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-8 py-3.5 text-base font-semibold text-[var(--color-text)] no-underline transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] sm:w-auto"
        >
          {t.landing.createAccount}
        </a>
      </div>
      <p className="mt-4 text-sm text-[var(--color-text-muted)]">
        {t.auth.hasAccount}{' '}
        <a href="/login" className="text-[var(--color-accent)] no-underline hover:underline">
          {t.auth.signIn}
        </a>
      </p>
    </>
  );
}

function LandingContent() {
  const { t } = useApp();

  return (
    <div className="relative flex min-h-full w-full flex-1 flex-col">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-accent)_0%,_transparent_50%)] opacity-10"
        aria-hidden="true"
      />

      <SiteHeader variant="landing" />

      <main className="relative mx-auto w-full max-w-5xl flex-1 px-4 pb-20 pt-8 text-center sm:pt-16">
        <p className="mb-4 inline-flex rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-[var(--color-accent)]">
          {t.landing.badge}
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-6xl">
          {t.landing.title}
          <br />
          <span className="text-[var(--color-accent)]">{t.landing.titleAccent}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-text-muted)] sm:text-xl">
          {t.landing.subtitle}
        </p>

        <LandingHeroCtas />

        <section className="mt-20 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">{t.landing.featureLessonsTitle}</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{t.landing.featureLessonsDesc}</p>
          </article>
          <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-correct)]/15 text-[var(--color-correct)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="m22 4-10 10.01-3-3" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">{t.landing.featureFeedbackTitle}</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{t.landing.featureFeedbackDesc}</p>
          </article>
          <article className="rounded-2xl border border-[var(--color-highlight)]/30 bg-[var(--color-surface-elevated)] p-6 ring-1 ring-[var(--color-highlight)]/10">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-highlight)]/15 text-[var(--color-highlight)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">{t.landing.featureMultiplayerTitle}</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{t.landing.featureMultiplayerDesc}</p>
          </article>
          <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-key-target)]/15 text-[var(--color-key-target)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">{t.landing.featureSyncTitle}</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{t.landing.featureSyncDesc}</p>
          </article>
        </section>

        <section className="mt-16 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8">
          <p className="font-mono text-2xl tracking-[0.25em] text-[var(--color-accent)] sm:text-3xl">
            {t.home.homeRowKeys}
          </p>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">{t.landing.homeRowCaption}</p>
        </section>
      </main>

      <footer className="mt-auto shrink-0 border-t border-[var(--color-border)] py-8 text-center text-sm text-[var(--color-text-muted)]">
        <p>
          {t.landing.builtWith} ·{' '}
          <a href="/lessons" className="text-[var(--color-accent)] no-underline hover:underline">
            {t.landing.goToLessons}
          </a>
        </p>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="flex min-h-full w-full flex-1 flex-col">
          <LandingContent />
        </div>
      </AppProvider>
    </AuthProvider>
  );
}
