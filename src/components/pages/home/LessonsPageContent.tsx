import { lazy, Suspense } from 'react';
import { FocusedChapterProvider } from '@/contexts/FocusedChapterProvider';
import PrimaryActionCard from '@/components/lessons/cards/PrimaryActionCard';
import AdaptiveDrillCard from '@/components/lessons/cards/AdaptiveDrillCard';

const LessonLibraryGrid = lazy(() => import('@/components/lessons/library/LessonLibraryGrid'));
const ExtraPracticeCard = lazy(() => import('@/components/lessons/cards/ExtraPracticeCard'));
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

/** Lessons home content — mount inside AppLayout chrome. */
export default function LessonsPageContent() {
  return (
    <FocusedChapterProvider>
      <PrimaryActionCard />
      <AdaptiveDrillCard />
      <Suspense fallback={<SectionSkeleton rows={4} />}>
        <LessonLibraryGrid />
      </Suspense>
      <Suspense fallback={<SectionSkeleton rows={1} />}>
        <ExtraPracticeCard />
      </Suspense>
      <Suspense fallback={<SectionSkeleton rows={1} />}>
        <LearnMoreSection />
      </Suspense>
    </FocusedChapterProvider>
  );
}
