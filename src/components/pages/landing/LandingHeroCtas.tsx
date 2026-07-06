import { AuthProvider, useAuth } from '@/contexts/AuthProvider';
import { AppProvider, useApp } from '@/contexts/AppProvider';

const primaryCtaClassName =
  'inline-flex w-full max-w-xs items-center justify-center rounded-xl bg-[var(--color-highlight)] px-8 py-3.5 text-base font-semibold text-white no-underline shadow-lg shadow-[var(--color-highlight)]/25 transition-all duration-300 hover:bg-[var(--color-highlight-hover)] sm:w-auto';

const secondaryCtaClassName =
  'inline-flex w-full max-w-xs items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-8 py-3.5 text-base font-semibold text-[var(--color-text)] no-underline transition-all duration-300 hover:border-[var(--color-highlight)] hover:text-[var(--color-highlight)] sm:w-auto';

function LandingHeroCtasContent() {
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
          <a href="/lessons" className={primaryCtaClassName}>
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
        <a href="/lessons" className={primaryCtaClassName}>
          {t.landing.startPracticing}
        </a>
        <a href="/signup" className={secondaryCtaClassName}>
          {t.landing.createAccount}
        </a>
      </div>
      <p className="mt-4 text-sm text-[var(--color-text-muted)]">
        {t.auth.hasAccount}{' '}
        <a href="/login" className="text-[var(--color-highlight)] no-underline hover:underline">
          {t.auth.signIn}
        </a>
      </p>
    </>
  );
}

/** Auth-aware CTAs — small island; static hero copy lives in index.astro. */
export default function LandingHeroCtas() {
  return (
    <AuthProvider>
      <AppProvider>
        <LandingHeroCtasContent />
      </AppProvider>
    </AuthProvider>
  );
}
