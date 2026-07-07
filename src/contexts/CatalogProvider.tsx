import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CATALOG_UPDATED_EVENT } from '@/utils/curriculum/catalogStore';
import {
  getCatalogChapters,
  getCatalogLessons,
  getCatalogRoadmapLessonIds,
  getCatalogSource,
} from '@/utils/curriculum/catalogStore';
import { loadLessonsCatalogIntoStore } from '@/services/supabase/lessonsCatalog';
import { migrateLegacyProgress } from '@/utils/progress/migrateLegacyProgress';
import { dispatchSessionComplete } from '@/utils/app/events';
import type { RoadmapChapter } from '@/utils/curriculum/catalogTypes';
import type { Lesson } from '@/utils/curriculum/lessons';

interface CatalogContextValue {
  ready: boolean;
  source: 'fallback' | 'supabase';
  lessons: Lesson[];
  chapters: RoadmapChapter[];
  roadmapLessonIds: string[];
  refresh: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(async () => {
    await loadLessonsCatalogIntoStore();
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const migrated = migrateLegacyProgress();
      if (migrated) dispatchSessionComplete();

      await loadLessonsCatalogIntoStore();
      if (!cancelled) setReady(true);
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onUpdate = () => setVersion((v) => v + 1);
    window.addEventListener(CATALOG_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(CATALOG_UPDATED_EVENT, onUpdate);
  }, []);

  const value = useMemo<CatalogContextValue>(
    () => ({
      ready,
      source: getCatalogSource(),
      lessons: getCatalogLessons(),
      chapters: getCatalogChapters(),
      roadmapLessonIds: getCatalogRoadmapLessonIds(),
      refresh,
    }),
    [ready, refresh, version],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
}

/** Optional hook — returns null when CatalogProvider is not mounted. */
export function useCatalogOptional(): CatalogContextValue | null {
  return useContext(CatalogContext);
}
