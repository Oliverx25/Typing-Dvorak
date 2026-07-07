import { useEffect, useState } from 'react';
import { readCurriculumFromStorage } from '@/utils/progress/readCurriculumFromStorage';
import { SESSION_COMPLETE_EVENT } from '@/utils/app/events';

const SSR_CURRICULUM = { progress: 0, recommendedId: 'home-row' };

function readCurriculumClient() {
  if (typeof window === 'undefined') return SSR_CURRICULUM;
  return readCurriculumFromStorage();
}

export function useCurriculumState() {
  const [progress, setProgress] = useState(() => readCurriculumClient().progress);
  const [recommendedId, setRecommendedId] = useState(() => readCurriculumClient().recommendedId);

  useEffect(() => {
    const refresh = () => {
      const next = readCurriculumFromStorage();
      setProgress(next.progress);
      setRecommendedId(next.recommendedId);
    };
    refresh();
    window.addEventListener(SESSION_COMPLETE_EVENT, refresh);
    return () => window.removeEventListener(SESSION_COMPLETE_EVENT, refresh);
  }, []);

  return { progress, recommendedId };
}
