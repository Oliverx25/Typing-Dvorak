import { describe, expect, it } from 'vitest';
import { getHeaderNavItems, resolveNavSection } from '@/utils/navigation/headerNav';

describe('headerNav', () => {
  it('resolves the active nav section from pathname', () => {
    expect(resolveNavSection('/stats')).toBe('stats');
    expect(resolveNavSection('/stats/')).toBe('stats');
    expect(resolveNavSection('/multiplayer')).toBe('multiplayer');
    expect(resolveNavSection('/multiplayer/room')).toBe('multiplayer');
    expect(resolveNavSection('/practice')).toBe('practice');
    expect(resolveNavSection('/practice/custom')).toBe('practice');
    expect(resolveNavSection('/lessons')).toBe('lessons');
    expect(resolveNavSection('/')).toBe('lessons');
    expect(resolveNavSection('/lesson/base_vowels')).toBe('lessons');
  });

  it('hides the current section from header links', () => {
    expect(getHeaderNavItems('stats', true).map((i) => i.labelKey)).toEqual([
      'lessons',
      'practice',
      'multiplayer',
    ]);
    expect(getHeaderNavItems('practice', true).map((i) => i.labelKey)).toEqual([
      'lessons',
      'stats',
      'multiplayer',
    ]);
    expect(getHeaderNavItems('multiplayer', true).map((i) => i.labelKey)).toEqual([
      'lessons',
      'practice',
      'stats',
    ]);
    expect(getHeaderNavItems('lessons', true).map((i) => i.labelKey)).toEqual([
      'practice',
      'stats',
      'multiplayer',
    ]);
  });

  it('omits multiplayer when guest', () => {
    expect(getHeaderNavItems('stats', false).map((i) => i.labelKey)).toEqual(['lessons', 'practice']);
  });
});
