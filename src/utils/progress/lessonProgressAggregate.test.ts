import { describe, expect, it } from 'vitest';
import {
  mergeSessionIntoLessonProgress,
  aggregateLessonsFromSessions,
  lessonProgressToCloudPayload,
  cloudRowToLessonProgress,
} from '@/utils/progress/lessonProgressAggregate';
import type { SessionRecord } from '@/utils/progress/storage';

function session(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    lessonId: 'home-row',
    lessonTitle: 'home-row',
    wpm: 50,
    accuracy: 95,
    elapsedSeconds: 60,
    mode: 'practice',
    completedAt: '2026-01-01T00:00:00.000Z',
    grade: 'A',
    score: 400,
    ...overrides,
  };
}

describe('lessonProgressAggregate', () => {
  it('tracks test stats separately from practice', () => {
    const practice = mergeSessionIntoLessonProgress(undefined, session({ mode: 'practice', wpm: 40 }));
    const withTest = mergeSessionIntoLessonProgress(practice, session({
      mode: 'test',
      wpm: 55,
      accuracy: 96,
      grade: 'S',
      completedAt: '2026-01-02T00:00:00.000Z',
    }));

    expect(withTest.bestWpm).toBe(55);
    expect(withTest.testBestWpm).toBe(55);
    expect(withTest.testBestAccuracy).toBe(96);
    expect(withTest.testHighestGrade).toBe('S');
    expect(withTest.testAttempts).toBe(1);
  });

  it('aggregates multiple sessions per lesson', () => {
    const lessons = aggregateLessonsFromSessions([
      session({ wpm: 30 }),
      session({ mode: 'test', wpm: 60, grade: 'S' }),
      session({ lessonId: 'top-row', wpm: 45 }),
    ]);

    expect(lessons['home-row'].attempts).toBe(2);
    expect(lessons['home-row'].testAttempts).toBe(1);
    expect(lessons['top-row'].bestWpm).toBe(45);
  });

  it('round-trips cloud payload', () => {
    const progress = mergeSessionIntoLessonProgress(undefined, session({ mode: 'test', wpm: 62 }));
    const payload = lessonProgressToCloudPayload('home-row', progress, 120);
    const restored = cloudRowToLessonProgress(payload);

    expect(restored.testBestWpm).toBe(62);
    expect(restored.masteryXp).toBe(120);
  });
});
