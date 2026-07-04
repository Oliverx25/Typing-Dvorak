import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useCurriculumState } from '@/hooks/useCurriculumState';
import { getCompletedLessonsMap } from '@/utils/storage';
import { SESSION_COMPLETE_EVENT } from '@/utils/events';
import { UNLOCK_ACCURACY } from '@/utils/curriculum';

interface FocusedChapterContextValue {
  focusedLessonId: string;
  recommendedId: string;
  isRecommendedFocus: boolean;
  focusedProgress: number;
  setFocusedLessonId: (lessonId: string) => void;
}

const FocusedChapterContext = createContext<FocusedChapterContextValue | null>(null);

function getLessonBestAccuracy(lessonId: string): number {
  const completed = getCompletedLessonsMap();
  return completed[lessonId]?.bestAccuracy ?? 0;
}

function getFocusedProgress(focusedLessonId: string, recommendedId: string, curriculumProgress: number): number {
  if (focusedLessonId === recommendedId) return curriculumProgress;
  const best = getLessonBestAccuracy(focusedLessonId);
  return best >= UNLOCK_ACCURACY ? 100 : best;
}

export function FocusedChapterProvider({ children }: { children: ReactNode }) {
  const { progress, recommendedId } = useCurriculumState();
  const [focusedLessonId, setFocusedLessonIdState] = useState(recommendedId);
  const [progressTick, setProgressTick] = useState(0);

  useEffect(() => {
    setFocusedLessonIdState(recommendedId);
  }, [recommendedId]);

  useEffect(() => {
    const refresh = () => setProgressTick((n) => n + 1);
    window.addEventListener(SESSION_COMPLETE_EVENT, refresh);
    return () => window.removeEventListener(SESSION_COMPLETE_EVENT, refresh);
  }, []);

  const setFocusedLessonId = useCallback((lessonId: string) => {
    setFocusedLessonIdState(lessonId);
  }, []);

  void progressTick;
  const focusedProgress = getFocusedProgress(focusedLessonId, recommendedId, progress);

  const value = useMemo<FocusedChapterContextValue>(
    () => ({
      focusedLessonId,
      recommendedId,
      isRecommendedFocus: focusedLessonId === recommendedId,
      focusedProgress,
      setFocusedLessonId,
    }),
    [focusedLessonId, recommendedId, focusedProgress, setFocusedLessonId],
  );

  return <FocusedChapterContext.Provider value={value}>{children}</FocusedChapterContext.Provider>;
}

export function useFocusedChapter(): FocusedChapterContextValue {
  const ctx = useContext(FocusedChapterContext);
  if (!ctx) throw new Error('useFocusedChapter must be used within FocusedChapterProvider');
  return ctx;
}
