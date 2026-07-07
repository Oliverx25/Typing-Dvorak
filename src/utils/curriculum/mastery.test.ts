import { describe, expect, it } from 'vitest';
import {
  masteryTierFromXp,
  masteryXpForGrade,
  masteryXpForSession,
  effectiveMasteryTier,
  MASTERY_TIER_THRESHOLDS,
} from '@/utils/curriculum/mastery';

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

  it('awards less XP for micro-lessons', () => {
    const main = masteryXpForSession({ wpm: 50, accuracy: 95, grade: 'A', isMicroLesson: false });
    const micro = masteryXpForSession({ wpm: 50, accuracy: 95, grade: 'A', isMicroLesson: true });
    expect(micro).toBeLessThan(main);
  });

  it('returns zero XP for poor performance', () => {
    expect(masteryXpForSession({ wpm: 10, accuracy: 90, grade: 'A' })).toBe(0);
    expect(masteryXpForSession({ wpm: 30, accuracy: 70, grade: 'C' })).toBe(0);
  });

  it('caps tier until WPM and accuracy requirements are met', () => {
    const xp = MASTERY_TIER_THRESHOLDS.diamond;
    expect(effectiveMasteryTier(xp, 40, 90, 'A')).toBeLessThan(4);
    expect(effectiveMasteryTier(xp, 60, 95, 'S')).toBe(4);
  });

  it('requires S+ grade for ascended tier', () => {
    const xp = MASTERY_TIER_THRESHOLDS.ascended;
    expect(effectiveMasteryTier(xp, 80, 98, 'S')).toBeLessThan(5);
    expect(effectiveMasteryTier(xp, 80, 98, 'S+')).toBe(5);
  });
});
