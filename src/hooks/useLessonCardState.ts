import { useEffect, useState } from 'react';
import { isLessonUnlocked } from '@/utils/curriculum/curriculum';
import {
  getBestScoreForLesson,
  getBestWpmForLesson,
  getBestAccuracyForLesson,
  getHighestGradeForLesson,
  getMasteryXpForLesson,
} from '@/utils/progress/storage';
import { buildUnlockMap } from '@/utils/progress/readCurriculumFromStorage';
import { buildLessonMasterySnapshot, type LessonMasterySnapshot } from '@/utils/curriculum/mastery';
import { SESSION_COMPLETE_EVENT } from '@/utils/app/events';

function getUnlockState(lessonId: string) {
  const forUnlock = buildUnlockMap();
  const masteryXp = getMasteryXpForLesson(lessonId);
  const bestWpm = getBestWpmForLesson(lessonId) ?? 0;
  const bestAccuracy = getBestAccuracyForLesson(lessonId) ?? 0;
  const highestGrade = getHighestGradeForLesson(lessonId);
  const mastery = buildLessonMasterySnapshot(masteryXp, bestWpm, bestAccuracy, highestGrade);

  return {
    unlocked: isLessonUnlocked(lessonId, forUnlock),
    bestWpm: getBestWpmForLesson(lessonId),
    highestGrade,
    highestScore: getBestScoreForLesson(lessonId),
    masteryXp,
    masteryTier: mastery.masteryTier,
    masteryProgress: mastery.xpProgress,
    blockedRequirements: mastery.blockedRequirements,
  };
}

export type LessonCardState = ReturnType<typeof getUnlockState>;

/** Synchronous unlock check for guards and first paint. */
export function readLessonUnlockState(lessonId: string): boolean {
  return getUnlockState(lessonId).unlocked;
}

const SSR_UNLOCK_STATE: LessonCardState = {
  unlocked: false,
  bestWpm: null,
  highestGrade: null,
  highestScore: null,
  masteryXp: 0,
  masteryTier: 0,
  masteryProgress: { tier: 0, current: 0, next: 150, xpToNext: 150 },
  blockedRequirements: null,
};

function readUnlockStateClient(lessonId: string): LessonCardState {
  if (typeof window === 'undefined') return SSR_UNLOCK_STATE;
  return getUnlockState(lessonId);
}

export function useLessonCardState(lessonId: string) {
  const [state, setState] = useState(() => readUnlockStateClient(lessonId));

  useEffect(() => {
    const refresh = () => setState(getUnlockState(lessonId));
    refresh();
    window.addEventListener(SESSION_COMPLETE_EVENT, refresh);
    return () => window.removeEventListener(SESSION_COMPLETE_EVENT, refresh);
  }, [lessonId]);

  return state;
}

export type { LessonMasterySnapshot };
