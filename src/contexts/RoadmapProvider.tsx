import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import {
  computeRoadmapProgress,
  type RoadmapProgressSnapshot,
} from '@/utils/curriculum/roadmapProgress';
import { SESSION_COMPLETE_EVENT } from '@/utils/app/events';

type RoadmapContextValue = RoadmapProgressSnapshot;

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
  const { progressReady } = useAuth();
  const [snapshot, setSnapshot] = useState(readRoadmapClient);

  useEffect(() => {
    const refresh = () => setSnapshot(computeRoadmapProgress());
    refresh();
    window.addEventListener(SESSION_COMPLETE_EVENT, refresh);
    return () => window.removeEventListener(SESSION_COMPLETE_EVENT, refresh);
  }, [progressReady]);

  const value = useMemo<RoadmapContextValue>(() => snapshot, [snapshot]);

  return <RoadmapContext.Provider value={value}>{children}</RoadmapContext.Provider>;
}

export function useRoadmap(): RoadmapContextValue {
  const ctx = useContext(RoadmapContext);
  if (!ctx) throw new Error('useRoadmap must be used within RoadmapProvider');
  return ctx;
}
