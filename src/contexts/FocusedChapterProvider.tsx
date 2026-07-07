import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useCurriculumState } from '@/hooks/useCurriculumState';
import { getChapterIdForLesson } from '@/utils/curriculum/chapterStats';
import { getRoadmapChapter, ROADMAP_CHAPTERS } from '@/utils/curriculum/roadmapChapters';

interface FocusedChapterContextValue {
  selectedChapterId: string;
  recommendedId: string;
  isRecommendedChapter: boolean;
  setSelectedChapterId: (chapterId: string, options?: { scrollToTop?: boolean }) => void;
  selectRecommendedChapter: () => void;
}

const FocusedChapterContext = createContext<FocusedChapterContextValue | null>(null);

export function FocusedChapterProvider({ children }: { children: ReactNode }) {
  const { recommendedId } = useCurriculumState();
  const userPickedRef = useRef(false);
  const [selectedChapterId, setSelectedChapterIdState] = useState(() =>
    getChapterIdForLesson(recommendedId),
  );

  useEffect(() => {
    if (!userPickedRef.current) {
      setSelectedChapterIdState(getChapterIdForLesson(recommendedId));
    }
  }, [recommendedId]);

  const setSelectedChapterId = useCallback(
    (chapterId: string, options?: { scrollToTop?: boolean }) => {
      if (!getRoadmapChapter(chapterId)) return;
      userPickedRef.current = true;
      setSelectedChapterIdState(chapterId);
      if (options?.scrollToTop) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [],
  );

  const selectRecommendedChapter = useCallback(() => {
    userPickedRef.current = false;
    setSelectedChapterIdState(getChapterIdForLesson(recommendedId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [recommendedId]);

  const recommendedChapterId = getChapterIdForLesson(recommendedId);

  const value = useMemo<FocusedChapterContextValue>(
    () => ({
      selectedChapterId,
      recommendedId,
      isRecommendedChapter: selectedChapterId === recommendedChapterId,
      setSelectedChapterId,
      selectRecommendedChapter,
    }),
    [selectedChapterId, recommendedId, recommendedChapterId, setSelectedChapterId, selectRecommendedChapter],
  );

  return <FocusedChapterContext.Provider value={value}>{children}</FocusedChapterContext.Provider>;
}

export function useFocusedChapter(): FocusedChapterContextValue {
  const ctx = useContext(FocusedChapterContext);
  if (!ctx) throw new Error('useFocusedChapter must be used within FocusedChapterProvider');
  return ctx;
}

export { ROADMAP_CHAPTERS };
