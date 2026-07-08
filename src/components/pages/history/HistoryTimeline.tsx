import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useApp } from '@/contexts/AppProvider';
import { t as translate } from '@/i18n';
import { fetchUserSessionsPage } from '@/services/supabase/queries';
import { getSessionHistory } from '@/utils/progress/storage';
import {
  mapCloudSessionRow,
  mapLocalSessionRecord,
  type HistorySession,
} from '@/utils/history/historySessions';
import HistorySessionCard from '@/components/pages/history/HistorySessionCard';
import HistorySessionDetailModal from '@/components/pages/history/HistorySessionDetailModal';

const PAGE_SIZE = 10;

export default function HistoryTimeline() {
  const { user, progressReady } = useAuth();
  const { t, settings } = useApp();
  const [page, setPage] = useState(0);
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<HistorySession | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadPage = useCallback(async () => {
    setLoading(true);

    if (user) {
      const result = await fetchUserSessionsPage(page, PAGE_SIZE);
      setSessions(result.sessions.map(mapCloudSessionRow));
      setTotal(result.total);
    } else {
      const all = getSessionHistory();
      const start = page * PAGE_SIZE;
      const slice = all.slice(start, start + PAGE_SIZE);
      setSessions(slice.map(mapLocalSessionRecord));
      setTotal(all.length);
    }

    setLoading(false);
  }, [user, page]);

  useEffect(() => {
    if (user && !progressReady) return;
    void loadPage();
  }, [user, progressReady, loadPage]);

  if (loading) {
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

  if (sessions.length === 0) {
    return (
      <p className="rounded-xl border border-slate-800 bg-slate-900/40 px-6 py-12 text-center text-slate-400">
        {t.history.noSessions}
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {sessions.map((session) => (
          <HistorySessionCard
            key={session.id}
            session={session}
            onViewDetails={setSelectedSession}
          />
        ))}
      </div>

      {total > PAGE_SIZE ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            {translate(settings.locale, 'history.page', {
              page: page + 1,
              total: totalPages,
            })}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t.history.previous}
            </button>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t.history.next}
            </button>
          </div>
        </div>
      ) : null}

      {selectedSession ? (
        <HistorySessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      ) : null}
    </>
  );
}
