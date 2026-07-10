export type SessionType = 'lesson' | 'practice' | 'multiplayer';

export const FREE_PRACTICE_LESSON_ID = 'free-practice';

export function resolveSessionType(
  lessonId: string,
  explicit?: SessionType,
): SessionType {
  if (explicit) return explicit;
  if (lessonId === 'multiplayer') return 'multiplayer';
  if (lessonId === FREE_PRACTICE_LESSON_ID || lessonId === 'sandbox-practice' || lessonId === 'custom-practice') {
    return 'practice';
  }
  return 'lesson';
}

export function isRoadmapSession(sessionType: SessionType): boolean {
  return sessionType === 'lesson';
}
