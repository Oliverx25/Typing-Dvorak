import { useCallback, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppProvider';
import type { HistorySession } from '@/utils/history/historySessions';
import HistorySessionCard from '@/components/pages/history/HistorySessionCard';
import HistoryCardSkeleton from '@/components/pages/history/HistoryCardSkeleton';

interface HistorySessionCarouselProps {
  sessions: HistorySession[];
  hasMore: boolean;
  loadingMore: boolean;
  onViewDetails: (session: HistorySession) => void;
  onLoadMore: () => void;
}

export default function HistorySessionCarousel({
  sessions,
  hasMore,
  loadingMore,
  onViewDetails,
  onLoadMore,
}: HistorySessionCarouselProps) {
  const { t } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadTriggeredRef = useRef(false);
  const didInitialScrollRef = useRef(false);

  useEffect(() => {
    if (!loadingMore) loadTriggeredRef.current = false;
  }, [loadingMore]);

  const handleBecameActive = useCallback(
    (session: HistorySession) => {
      const isLast = sessions[sessions.length - 1]?.id === session.id;
      if (!isLast || !hasMore || loadingMore) {
        loadTriggeredRef.current = false;
        return;
      }

      if (loadTriggeredRef.current) return;
      loadTriggeredRef.current = true;
      onLoadMore();
    },
    [sessions, hasMore, loadingMore, onLoadMore],
  );

  // On mount (or when the dataset resets), jump to the first real card so the top spacer
  // doesn't look like empty content.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    if (sessions.length === 0) return;
    if (didInitialScrollRef.current) return;

    const firstCard = root.querySelector('[data-history-card]') as HTMLElement | null;
    if (!firstCard) return;

    // Sync scroll (no animation) to the first card.
    firstCard.scrollIntoView({ block: 'center', behavior: 'auto' });
    didInitialScrollRef.current = true;
  }, [sessions]);

  // If sessions shrink (e.g., user changes auth state), allow re-centering.
  useEffect(() => {
    if (sessions.length <= 1) didInitialScrollRef.current = false;
  }, [sessions.length]);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="scrollbar-hide h-[70vh] snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth motion-reduce:scroll-auto"
        role="list"
        aria-label={t.history.title}
      >
        <div className="flex flex-col gap-5 px-1 py-6">
          <div
            className="h-[calc(50vh-8rem)] shrink-0 pointer-events-none"
            aria-hidden="true"
          />

          {sessions.map((session, index) => (
            <HistorySessionCard
              key={session.id}
              session={session}
              scrollRootRef={scrollRef}
              isDefaultActive={index === 0}
              onViewDetails={onViewDetails}
              onBecameActive={handleBecameActive}
            />
          ))}

          {hasMore || loadingMore ? (
            <>
              <HistoryCardSkeleton />
              <HistoryCardSkeleton emphasis />
              <HistoryCardSkeleton />
            </>
          ) : (
            <div
              className="h-[calc(50vh-8rem)] shrink-0 pointer-events-none"
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[var(--color-surface)] to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--color-surface)] to-transparent"
        aria-hidden
      />
    </div>
  );
}
