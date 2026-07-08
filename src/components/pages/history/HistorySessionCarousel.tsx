import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useApp } from '@/contexts/AppProvider';
import type { HistorySession } from '@/utils/history/historySessions';
import HistorySessionCard from '@/components/pages/history/HistorySessionCard';
import HistoryCardSkeleton from '@/components/pages/history/HistoryCardSkeleton';
import { getSpotlightStyle } from '@/components/pages/history/historySpotlight';

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!loadingMore) loadTriggeredRef.current = false;
  }, [loadingMore]);

  const skeletonCount = useMemo(() => {
    if (!hasMore && !loadingMore) return 0;
    return 3;
  }, [hasMore, loadingMore]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const onScroll = () => {
      if (!hasMore || loadingMore || loadTriggeredRef.current) return;
      if (root.scrollTop + root.clientHeight >= root.scrollHeight - 220) {
        loadTriggeredRef.current = true;
        onLoadMore();
      }
    };

    root.addEventListener('scroll', onScroll, { passive: true });
    return () => root.removeEventListener('scroll', onScroll);
  }, [hasMore, loadingMore, onLoadMore]);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="scrollbar-hide mask-dynamic flex h-[70vh] flex-col gap-4 overflow-y-auto overflow-x-hidden px-6 pt-6 pb-24 -mx-6 -mt-6"
        role="list"
        aria-label={t.history.title}
        onMouseLeave={() => setHoveredIndex(null)}
        style={
          {
            '--mask-start': hoveredIndex !== null && hoveredIndex < 2 ? '0px' : '40px',
          } as CSSProperties
        }
      >
        {sessions.map((session, index) => (
          <HistorySessionCard
            key={session.id}
            session={session}
            spotlightStyle={getSpotlightStyle(hoveredIndex, index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onViewDetails={onViewDetails}
          />
        ))}

        {skeletonCount > 0
          ? Array.from({ length: skeletonCount }, (_, offset) => {
              const index = sessions.length + offset;
              return (
                <HistoryCardSkeleton
                  key={`sk-${index}`}
                  spotlightStyle={getSpotlightStyle(hoveredIndex, index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                />
              );
            })
          : null}
      </div>
    </div>
  );
}
