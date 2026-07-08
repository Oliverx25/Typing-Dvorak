import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { computeAllChapterStats, type ChapterStats } from '@/utils/curriculum/chapterStats';
import { SESSION_COMPLETE_EVENT } from '@/utils/app/events';

const SSR_STATS: Record<string, ChapterStats> = {};

function readChapterStats(): Record<string, ChapterStats> {
  if (typeof window === 'undefined') return SSR_STATS;
  return computeAllChapterStats();
}

export function useChapterStats(): Record<string, ChapterStats> {
  const { progressReady } = useAuth();
  const [stats, setStats] = useState(readChapterStats);

  useEffect(() => {
    const refresh = () => setStats(computeAllChapterStats());
    refresh();
    window.addEventListener(SESSION_COMPLETE_EVENT, refresh);
    return () => window.removeEventListener(SESSION_COMPLETE_EVENT, refresh);
  }, [progressReady]);

  return stats;
}
