import { useCallback, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppProvider';
import type { HistorySession } from '@/utils/history/historySessions';
import HistorySessionCard from '@/components/pages/history/HistorySessionCard';

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

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="scrollbar-hide h-[70vh] snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-pt-4 scroll-smooth motion-reduce:scroll-auto"
        role="list"
        aria-label={t.history.title}
      >
        <div className="flex flex-col gap-5 px-1 pt-4 pb-24">
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

          {loadingMore ? (
            <div
              className="snap-start flex h-20 items-center justify-center"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm text-slate-500">{t.history.loadingMore}</p>
            </div>
          ) : null}
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
