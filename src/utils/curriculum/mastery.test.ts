import { describe, expect, it } from 'vitest';
import {
  masteryTierFromXp,
  masteryXpForGrade,
  masteryXpForSession,
  effectiveMasteryTier,
  meetsTierRequirements,
  MASTERY_TIER_THRESHOLDS,
} from '@/utils/curriculum/mastery';
import type { LessonMasteryPerformance } from '@/utils/progress/lessonProgressAggregate';

const BASE_PERF: LessonMasteryPerformance = {
  bestWpm: 80,
  bestAccuracy: 98,
  highestGrade: 'S+',
  testBestWpm: 75,
  testBestAccuracy: 97,
  testHighestGrade: 'S+',
  testAttempts: 3,
};

describe('mastery', () => {
  it('awards more XP for higher grades', () => {
    expect(masteryXpForGrade('B')).toBeLessThan(masteryXpForGrade('S'));
    expect(masteryXpForGrade('S')).toBeLessThan(masteryXpForGrade('SS'));
    expect(masteryXpForGrade('S+')).toBeGreaterThan(masteryXpForGrade('S'));
    expect(masteryXpForGrade('SS+')).toBeGreaterThan(masteryXpForGrade('SS'));
  });

  it('maps XP to tiers with higher thresholds', () => {
    expect(masteryTierFromXp(0)).toBe(0);
    expect(masteryTierFromXp(149)).toBe(0);
    expect(masteryTierFromXp(MASTERY_TIER_THRESHOLDS.bronze)).toBe(1);
    expect(masteryTierFromXp(MASTERY_TIER_THRESHOLDS.silver)).toBe(2);
    expect(masteryTierFromXp(MASTERY_TIER_THRESHOLDS.gold)).toBe(3);
    expect(masteryTierFromXp(MASTERY_TIER_THRESHOLDS.diamond)).toBe(4);
    expect(masteryTierFromXp(MASTERY_TIER_THRESHOLDS.ascended)).toBe(5);
  });

  it('scales session XP with WPM and accuracy', () => {
    const low = masteryXpForSession({ wpm: 15, accuracy: 80, grade: 'B' });
    const high = masteryXpForSession({ wpm: 60, accuracy: 98, grade: 'S' });
    expect(low).toBeGreaterThan(0);
    expect(high).toBeGreaterThan(low);
  });

  it('awards more XP in test mode than practice', () => {
    const practice = masteryXpForSession({ wpm: 50, accuracy: 95, grade: 'A', mode: 'practice' });
    const test = masteryXpForSession({ wpm: 50, accuracy: 95, grade: 'A', mode: 'test' });
    expect(test).toBeGreaterThan(practice);
  });

  it('awards less XP for micro-lessons', () => {
    const main = masteryXpForSession({ wpm: 50, accuracy: 95, grade: 'A', isMicroLesson: false });
    const micro = masteryXpForSession({ wpm: 50, accuracy: 95, grade: 'A', isMicroLesson: true });
    expect(micro).toBeLessThan(main);
  });

  it('returns zero XP for poor performance', () => {
    expect(masteryXpForSession({ wpm: 10, accuracy: 90, grade: 'A' })).toBe(0);
    expect(masteryXpForSession({ wpm: 30, accuracy: 70, grade: 'C' })).toBe(0);
  });

  it('caps diamond tier until test requirements are met', () => {
    const xp = MASTERY_TIER_THRESHOLDS.diamond;
    const noTest: LessonMasteryPerformance = {
      ...BASE_PERF,
      testBestWpm: 0,
      testBestAccuracy: 0,
      testHighestGrade: null,
      testAttempts: 0,
    };
    expect(effectiveMasteryTier(xp, noTest)).toBeLessThan(4);

    const weakTest: LessonMasteryPerformance = {
      ...BASE_PERF,
      testBestWpm: 40,
      testBestAccuracy: 85,
      testHighestGrade: 'B',
      testAttempts: 1,
    };
    expect(effectiveMasteryTier(xp, weakTest)).toBeLessThan(4);
    expect(effectiveMasteryTier(xp, BASE_PERF)).toBe(4);
  });

  it('requires S+ grade in test for ascended tier', () => {
    const xp = MASTERY_TIER_THRESHOLDS.ascended;
    const sOnly: LessonMasteryPerformance = {
      ...BASE_PERF,
      testHighestGrade: 'S',
    };
    expect(effectiveMasteryTier(xp, sOnly)).toBeLessThan(5);
    expect(effectiveMasteryTier(xp, BASE_PERF)).toBe(5);
  });

  it('requires overall stats for gold tier', () => {
    expect(meetsTierRequirements(3, { ...BASE_PERF, bestWpm: 30, bestAccuracy: 80, highestGrade: 'B' })).toBe(false);
    expect(meetsTierRequirements(3, BASE_PERF)).toBe(true);
  });
});
