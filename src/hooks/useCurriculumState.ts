import { useEffect, useState } from 'react';
import { getRecommendedLessonId, getCurriculumProgress } from '@/utils/curriculum';
import { getCompletedLessonsMap } from '@/utils/storage';
import { SESSION_COMPLETE_EVENT } from '@/utils/events';

export function useCurriculumState() {
  const [progress, setProgress] = useState(0);
  const [recommendedId, setRecommendedId] = useState('home-row');

  useEffect(() => {
    const refresh = () => {
      const completed = getCompletedLessonsMap();
      const forUnlock = Object.fromEntries(
        Object.entries(completed).map(([k, v]) => [k, { bestAccuracy: v.bestAccuracy }]),
      );
      setProgress(getCurriculumProgress(forUnlock));
      setRecommendedId(getRecommendedLessonId(forUnlock));
    };
    refresh();
    window.addEventListener(SESSION_COMPLETE_EVENT, refresh);
    return () => window.removeEventListener(SESSION_COMPLETE_EVENT, refresh);
  }, []);

  return { progress, recommendedId };
}
