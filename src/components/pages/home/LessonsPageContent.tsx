import { lazy, Suspense } from 'react';
import { useAppHydration } from '@/hooks/useAppHydration';
import { useApp } from '@/contexts/AppProvider';
import { useCatalog } from '@/contexts/CatalogProvider';
import { FocusedChapterProvider } from '@/contexts/FocusedChapterProvider';
import { RoadmapProvider } from '@/contexts/RoadmapProvider';
import PrimaryActionCard from '@/components/lessons/cards/PrimaryActionCard';

const LessonLibraryGrid = lazy(() => import('@/components/lessons/library/LessonLibraryGrid'));
const LearnMoreSection = lazy(() => import('@/components/lessons/library/LearnMoreSection'));

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="mt-8 space-y-3" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
        />
      ))}
    </div>
  );
}

function LessonsProgressSkeleton() {
  const { t } = useApp();

  return (
    <div className="space-y-10" role="status" aria-live="polite" aria-busy="true">
      <p className="sr-only">{t.home.loadingProgress}</p>

      <div className="space-y-4">
        <div className="h-3 w-36 animate-pulse rounded bg-[var(--color-border)]" />
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="size-20 shrink-0 animate-pulse rounded-full bg-[var(--color-border)]" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-6 w-2/3 animate-pulse rounded bg-[var(--color-border)]" />
              <div className="h-4 w-full animate-pulse rounded bg-[var(--color-border)]/70" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-[var(--color-border)]/60" />
            </div>
          </div>
        </div>
      </div>

      <SectionSkeleton rows={4} />
    </div>
  );
}

function LessonsMain() {
  return (
    <>
      <PrimaryActionCard />
      <Suspense fallback={<SectionSkeleton rows={4} />}>
        <LessonLibraryGrid />
      </Suspense>
      <Suspense fallback={<SectionSkeleton rows={1} />}>
        <LearnMoreSection />
      </Suspense>
    </>
  );
}

function LessonsContent() {
  const { ready: catalogReady } = useCatalog();

  if (!catalogReady) {
    return <LessonsProgressSkeleton />;
  }

  return (
    <RoadmapProvider>
      <FocusedChapterProvider>
        <LessonsMain />
      </FocusedChapterProvider>
    </RoadmapProvider>
  );
}

/** Lessons home content — mount inside AppLayout chrome. */
export default function LessonsPageContent() {
  const { isHydrating, authReady } = useAppHydration();

  if (!authReady || isHydrating) {
    return <LessonsProgressSkeleton />;
  }

  return <LessonsContent />;
}
