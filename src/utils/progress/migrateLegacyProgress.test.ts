import { describe, expect, it } from 'vitest';
import {
  remapCloudMasteryRows,
  remapCloudSessionRows,
} from '@/utils/progress/migrateLegacyProgress';
import { resolveLessonId } from '@/utils/progress/legacyLessonIds';

describe('migrateLegacyProgress', () => {
  it('maps known legacy ids', () => {
    expect(resolveLessonId('home-row')).toBe('base_alternation');
    expect(resolveLessonId('top-nivel-1')).toBe('top_left');
    expect(resolveLessonId('base_vowels')).toBe('base_vowels');
  });

  it('remaps cloud session rows', () => {
    const rows = remapCloudSessionRows([
      { lesson_id: 'home-row', wpm: 40 },
      { lesson_id: 'base_vowels', wpm: 30 },
    ]);
    expect(rows[0].lesson_id).toBe('base_alternation');
    expect(rows[1].lesson_id).toBe('base_vowels');
  });

  it('merges cloud mastery rows that map to the same new id', () => {
    const rows = remapCloudMasteryRows([
      { lesson_id: 'home-row', mastery_xp: 100 },
      { lesson_id: 'base_alternation', mastery_xp: 50 },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].lesson_id).toBe('base_alternation');
    expect(rows[0].mastery_xp).toBe(100);
  });
});
