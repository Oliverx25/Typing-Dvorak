import { LESSON_GROUPS } from '@/data/microLessons';

export function findLessonGroup(lessonId: string, titleKey: string) {
  return LESSON_GROUPS.find(
    (group) =>
      group.titleKey === titleKey ||
      group.microLessons.some((micro) => micro.id === lessonId),
  );
}
