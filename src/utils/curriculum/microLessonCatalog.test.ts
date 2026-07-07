import { describe, expect, it } from 'vitest';
import { CURRICULUM_LESSONS, LESSON_GROUPS } from '@/data/microLessons';
import { ROADMAP_CHAPTERS, ROADMAP_LESSON_IDS } from '@/utils/curriculum/roadmapChapters';
import { HOME_ROW, TOP_ROW, BOTTOM_ROW } from '@/utils/keyboard/dvorak';
import { buildMicroLessons } from '@/utils/curriculum/microLessonCatalog';

const MICRO_LESSONS = buildMicroLessons();
const MICRO_BY_ID = new Map(MICRO_LESSONS.map((lesson) => [lesson.id, lesson]));

function charsOnly(row: string): string {
  return row.replace(/\s/g, '');
}

function isSubsetOf(charSet: string, row: string): boolean {
  const allowed = new Set(charsOnly(row).split(''));
  return [...charSet].every((char) => allowed.has(char));
}

describe('microLessonCatalog', () => {
  it('defines 26 lessons across 7 chapters', () => {
    expect(CURRICULUM_LESSONS).toHaveLength(26);
    expect(LESSON_GROUPS).toHaveLength(7);
    expect(ROADMAP_LESSON_IDS).toHaveLength(26);
  });

  it('keeps strict hand isolation on home row drills', () => {
    expect(isSubsetOf(MICRO_BY_ID.get('base_vowels')!.charSet!, 'aoeui')).toBe(true);
    expect(isSubsetOf(MICRO_BY_ID.get('base_consonants')!.charSet!, 'dhtns')).toBe(true);
    expect(MICRO_BY_ID.get('base_vowels')!.charSet).not.toContain('d');
    expect(MICRO_BY_ID.get('base_consonants')!.charSet).not.toContain('a');
  });

  it('isolates top row by hand', () => {
    expect(isSubsetOf(MICRO_BY_ID.get('top_left')!.charSet!, TOP_ROW)).toBe(true);
    expect(isSubsetOf(MICRO_BY_ID.get('top_right')!.charSet!, TOP_ROW)).toBe(true);
    expect(MICRO_BY_ID.get('top_left')!.charSet).not.toMatch(/[fgcrl]/);
    expect(MICRO_BY_ID.get('top_right')!.charSet).not.toMatch(/['.,py]/);
  });

  it('isolates bottom row by hand', () => {
    expect(isSubsetOf(MICRO_BY_ID.get('bottom_left')!.charSet!, BOTTOM_ROW)).toBe(true);
    expect(isSubsetOf(MICRO_BY_ID.get('bottom_right')!.charSet!, BOTTOM_ROW)).toBe(true);
  });

  it('uses static texts for bigram and code lessons', () => {
    expect(MICRO_BY_ID.get('en_bigrams')!.generated).toBeFalsy();
    expect(MICRO_BY_ID.get('en_bigrams')!.texts!.length).toBeGreaterThan(0);
    expect(MICRO_BY_ID.get('code_js_ts')!.texts!.length).toBeGreaterThan(0);
  });

  it('aligns roadmap chapters with curriculum groups', () => {
    for (const chapter of ROADMAP_CHAPTERS) {
      const group = LESSON_GROUPS.find((g) => g.chapterId === chapter.id);
      expect(group?.microLessons.map((m) => m.id)).toEqual(chapter.lessonIds);
    }
  });
});
