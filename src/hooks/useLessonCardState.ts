import { useEffect, useState } from 'react';
import { isLessonUnlocked } from '../utils/curriculum';
import { getBestWpmForLesson, getCompletedLessonsMap } from '../utils/storage';
import { SESSION_COMPLETE_EVENT } from '../utils/events';

function getUnlockState(lessonId: string) {
  const completed = getCompletedLessonsMap();
  const forUnlock = Object.fromEntries(
    Object.entries(completed).map(([k, v]) => [k, { bestAccuracy: v.bestAccuracy }]),
  );
  return {
    unlocked: isLessonUnlocked(lessonId, forUnlock),
    bestWpm: getBestWpmForLesson(lessonId),
  };
}

export function useLessonCardState(lessonId: string) {
  const [state, setState] = useState(() => getUnlockState(lessonId));

  useEffect(() => {
    const refresh = () => setState(getUnlockState(lessonId));
    refresh();
    window.addEventListener(SESSION_COMPLETE_EVENT, refresh);
    return () => window.removeEventListener(SESSION_COMPLETE_EVENT, refresh);
  }, [lessonId]);

  return state;
}
