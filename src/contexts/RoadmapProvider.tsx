import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  computeRoadmapProgress,
  type RoadmapProgressSnapshot,
} from '@/utils/curriculum/roadmapProgress';
import { SESSION_COMPLETE_EVENT } from '@/utils/app/events';

interface RoadmapContextValue extends RoadmapProgressSnapshot {
  archiveOpen: boolean;
  setArchiveOpen: (open: boolean) => void;
  toggleArchive: () => void;
}

const SSR_ROADMAP: RoadmapProgressSnapshot = {
  globalProgress: 0,
  chapterProgress: {},
  completedCount: 0,
  totalCount: 0,
  isRoadmapComplete: false,
};

const RoadmapContext = createContext<RoadmapContextValue | null>(null);

function readRoadmapClient(): RoadmapProgressSnapshot {
  if (typeof window === 'undefined') return SSR_ROADMAP;
  return computeRoadmapProgress();
}

export function RoadmapProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState(readRoadmapClient);
  const [archiveOpen, setArchiveOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setSnapshot(computeRoadmapProgress());
    refresh();
    window.addEventListener(SESSION_COMPLETE_EVENT, refresh);
    return () => window.removeEventListener(SESSION_COMPLETE_EVENT, refresh);
  }, []);

  const toggleArchive = useCallback(() => setArchiveOpen((open) => !open), []);

  const value = useMemo<RoadmapContextValue>(
    () => ({
      ...snapshot,
      archiveOpen,
      setArchiveOpen,
      toggleArchive,
    }),
    [snapshot, archiveOpen, toggleArchive],
  );

  return <RoadmapContext.Provider value={value}>{children}</RoadmapContext.Provider>;
}

export function useRoadmap(): RoadmapContextValue {
  const ctx = useContext(RoadmapContext);
  if (!ctx) throw new Error('useRoadmap must be used within RoadmapProvider');
  return ctx;
}
