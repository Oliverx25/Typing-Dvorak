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
import { getCompletedLessonsMap } from '@/utils/progress/storage';
import { SESSION_COMPLETE_EVENT } from '@/utils/app/events';
import { UNLOCK_ACCURACY } from '@/utils/curriculum/curriculum';

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
  const [focusedProgress, setFocusedProgress] = useState(0);

  useEffect(() => {
    setFocusedLessonIdState(recommendedId);
  }, [recommendedId]);

  useEffect(() => {
    const refresh = () => {
      setFocusedProgress(getFocusedProgress(focusedLessonId, recommendedId, progress));
    };
    refresh();
    window.addEventListener(SESSION_COMPLETE_EVENT, refresh);
    return () => window.removeEventListener(SESSION_COMPLETE_EVENT, refresh);
  }, [focusedLessonId, recommendedId, progress]);

  const setFocusedLessonId = useCallback((lessonId: string) => {
    setFocusedLessonIdState(lessonId);
  }, []);

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
