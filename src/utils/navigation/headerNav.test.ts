import { describe, expect, it } from 'vitest';
import { getHeaderNavItems, isNavItemHidden, resolveNavSection } from '@/utils/navigation/headerNav';

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

  it('hides the active route from header links', () => {
    expect(getHeaderNavItems('/stats', true).map((i) => i.labelKey)).toEqual([
      'lessons',
      'practice',
      'multiplayer',
    ]);
    expect(getHeaderNavItems('/practice', true).map((i) => i.labelKey)).toEqual([
      'lessons',
      'stats',
      'multiplayer',
    ]);
    expect(getHeaderNavItems('/multiplayer/room', true).map((i) => i.labelKey)).toEqual([
      'lessons',
      'practice',
      'stats',
    ]);
    expect(getHeaderNavItems('/lessons', true).map((i) => i.labelKey)).toEqual([
      'practice',
      'stats',
      'multiplayer',
    ]);
    expect(getHeaderNavItems('/lesson/base_vowels', true).map((i) => i.labelKey)).toEqual([
      'practice',
      'stats',
      'multiplayer',
    ]);
  });

  it('keeps lessons and practice visible on history', () => {
    expect(getHeaderNavItems('/history', true).map((i) => i.labelKey)).toEqual(['lessons', 'practice']);
  });

  it('evaluates hide rules per route', () => {
    expect(isNavItemHidden('/practice', '/practice')).toBe(true);
    expect(isNavItemHidden('/history', '/lessons')).toBe(false);
    expect(isNavItemHidden('/history', '/stats')).toBe(true);
    expect(isNavItemHidden('/lesson/foo', '/lessons')).toBe(true);
  });

  it('omits multiplayer when guest', () => {
    expect(getHeaderNavItems('/stats', false).map((i) => i.labelKey)).toEqual(['lessons', 'practice']);
  });
});
