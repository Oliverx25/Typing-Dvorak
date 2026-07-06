import { LESSON_GROUPS, type LessonGroup } from '../../data/microLessons';

export function findLessonGroup(lessonId: string, titleKey: string): LessonGroup | undefined {
  return LESSON_GROUPS.find(
    (group) =>
      group.titleKey === titleKey ||
      group.microLessons.some(
        (micro) => micro.id === lessonId || micro.parentLessonId === lessonId,
      ),
  );
}
