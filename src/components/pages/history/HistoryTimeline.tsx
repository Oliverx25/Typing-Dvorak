import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { fetchUserSessionsPage } from '@/services/supabase/queries';
import { getSessionHistory } from '@/utils/progress/storage';
import {
  mapCloudSessionRow,
  mapLocalSessionRecord,
  type HistorySession,
} from '@/utils/history/historySessions';
import HistoryEmptyState from '@/components/pages/history/HistoryEmptyState';
import HistorySessionCarousel from '@/components/pages/history/HistorySessionCarousel';
import HistorySessionDetailModal from '@/components/pages/history/HistorySessionDetailModal';

const PAGE_SIZE = 10;

export default function HistoryTimeline() {
  const { user, progressReady } = useAuth();
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedSession, setSelectedSession] = useState<HistorySession | null>(null);
  const pageRef = useRef(0);

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      if (user) {
        const result = await fetchUserSessionsPage(page, PAGE_SIZE);
        const mapped = result.sessions.map(mapCloudSessionRow);
        setSessions((prev) => (append ? [...prev, ...mapped] : mapped));
        setHasMore((page + 1) * PAGE_SIZE < result.total);
        return;
      }

      const all = getSessionHistory();
      const start = page * PAGE_SIZE;
      const slice = all.slice(start, start + PAGE_SIZE);
      const mapped = slice.map((record, index) => mapLocalSessionRecord(record, start + index));
      setSessions((prev) => (append ? [...prev, ...mapped] : mapped));
      setHasMore(start + PAGE_SIZE < all.length);
    },
    [user],
  );

  useEffect(() => {
    if (user && !progressReady) return;

    pageRef.current = 0;
    setInitialLoading(true);
    void fetchPage(0, false).finally(() => setInitialLoading(false));
  }, [user, progressReady, fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;

    try {
      await fetchPage(nextPage, true);
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loadingMore]);

  if (initialLoading) {
    return (
      <div
        className="flex h-[70vh] flex-col justify-center gap-5 px-1"
        role="status"
        aria-busy="true"
      >
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className={[
              'h-28 animate-pulse rounded-xl border border-slate-800 bg-slate-900/40',
              index === 1 ? 'opacity-100' : 'opacity-50',
            ].join(' ')}
          />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return <HistoryEmptyState />;
  }

  return (
    <>
      <HistorySessionCarousel
        sessions={sessions}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onViewDetails={setSelectedSession}
        onLoadMore={loadMore}
      />

      {selectedSession ? (
        <HistorySessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      ) : null}
    </>
  );
}
