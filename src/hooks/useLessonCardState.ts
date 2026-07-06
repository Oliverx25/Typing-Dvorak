import { useEffect, useState } from 'react';
import { isLessonUnlocked } from '@/utils/curriculum/curriculum';
import {
  getBestScoreForLesson,
  getBestWpmForLesson,
  getCompletedLessonsMap,
  getHighestGradeForLesson,
  getMasteryXpForLesson,
} from '@/utils/progress/storage';
import { masteryTierFromXp } from '@/utils/curriculum/mastery';
import { SESSION_COMPLETE_EVENT } from '@/utils/app/events';

function getUnlockState(lessonId: string) {
  const completed = getCompletedLessonsMap();
  const forUnlock = Object.fromEntries(
    Object.entries(completed).map(([k, v]) => [k, { bestAccuracy: v.bestAccuracy }]),
  );
  return {
    unlocked: isLessonUnlocked(lessonId, forUnlock),
    bestWpm: getBestWpmForLesson(lessonId),
    highestGrade: getHighestGradeForLesson(lessonId),
    highestScore: getBestScoreForLesson(lessonId),
    masteryXp: getMasteryXpForLesson(lessonId),
    masteryTier: masteryTierFromXp(getMasteryXpForLesson(lessonId)),
  };
}

/** Synchronous unlock check for guards and first paint. */
export function readLessonUnlockState(lessonId: string): boolean {
  return getUnlockState(lessonId).unlocked;
}

/** Stable defaults for SSR — localStorage sync runs after mount only. */
const INITIAL_STATE = {
  unlocked: false,
  bestWpm: null as number | null,
  highestGrade: null as string | null,
  highestScore: null as number | null,
  masteryXp: 0,
  masteryTier: 0 as 0 | 1 | 2 | 3 | 4,
};

export function useLessonCardState(lessonId: string) {
  const [state, setState] = useState(() =>
    typeof window !== 'undefined' ? getUnlockState(lessonId) : INITIAL_STATE,
  );

  useEffect(() => {
    const refresh = () => setState(getUnlockState(lessonId));
    refresh();
    window.addEventListener(SESSION_COMPLETE_EVENT, refresh);
    return () => window.removeEventListener(SESSION_COMPLETE_EVENT, refresh);
  }, [lessonId]);

  return state;
}
