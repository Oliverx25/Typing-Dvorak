import { describe, expect, it } from 'vitest';
import { masteryTierFromXp, masteryXpForGrade } from './mastery';

describe('mastery', () => {
  it('awards more XP for higher grades', () => {
    expect(masteryXpForGrade('B')).toBeLessThan(masteryXpForGrade('S'));
    expect(masteryXpForGrade('S')).toBeLessThan(masteryXpForGrade('SS'));
  });

  it('maps XP to tiers', () => {
    expect(masteryTierFromXp(0)).toBe(0);
    expect(masteryTierFromXp(30)).toBe(1);
    expect(masteryTierFromXp(80)).toBe(2);
    expect(masteryTierFromXp(160)).toBe(3);
    expect(masteryTierFromXp(350)).toBe(4);
  });
});
