import { LESSON_GROUPS, type LessonGroup } from '@/data/microLessons';

export function findLessonGroup(lessonId: string, titleKey: string): LessonGroup | undefined {
  return LESSON_GROUPS.find(
    (g) => g.titleKey === titleKey || g.microLessons.some((m) => m.lessonId === lessonId),
  );
}
