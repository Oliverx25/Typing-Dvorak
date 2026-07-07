import { describe, expect, it } from 'vitest';
import { FALLBACK_CATALOG_ROWS } from '@/data/lessonsCatalogFallback';
import { HOME_ROW, TOP_ROW, BOTTOM_ROW } from '@/utils/keyboard/dvorak';
import {
  buildChaptersFromRows,
  catalogRowToLesson,
  getCatalogLessons,
  hydrateLessonsCatalog,
} from '@/utils/curriculum/catalogStore';
import { getRoadmapChapters, getRoadmapLessonIds } from '@/utils/curriculum/roadmapChapters';

function charsOnly(row: string): string {
  return row.replace(/\s/g, '');
}

function isSubsetOf(charSet: string, row: string): boolean {
  const allowed = new Set(charsOnly(row).split(''));
  return [...charSet].every((char) => allowed.has(char));
}

describe('microLessonCatalog', () => {
  hydrateLessonsCatalog(FALLBACK_CATALOG_ROWS, 'fallback');

  const lessons = getCatalogLessons();
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));

  it('defines 26 lessons across 7 chapters', () => {
    expect(FALLBACK_CATALOG_ROWS).toHaveLength(26);
    expect(getRoadmapLessonIds()).toHaveLength(26);
    expect(getRoadmapChapters()).toHaveLength(7);
  });

  it('keeps strict hand isolation on home row drills', () => {
    const vowels = byId.get('base_vowels')!;
    const consonants = byId.get('base_consonants')!;
    expect(isSubsetOf(vowels.catalog!.allowedChars, 'aoeui')).toBe(true);
    expect(isSubsetOf(consonants.catalog!.allowedChars, 'dhtns')).toBe(true);
    expect(vowels.catalog!.allowedChars).not.toContain('d');
    expect(consonants.catalog!.allowedChars).not.toContain('a');
  });

  it('isolates top row by hand', () => {
    expect(isSubsetOf(byId.get('top_left')!.catalog!.allowedChars, TOP_ROW)).toBe(true);
    expect(isSubsetOf(byId.get('top_right')!.catalog!.allowedChars, TOP_ROW)).toBe(true);
  });

  it('isolates bottom row by hand', () => {
    expect(isSubsetOf(byId.get('bottom_left')!.catalog!.allowedChars, BOTTOM_ROW)).toBe(true);
    expect(isSubsetOf(byId.get('bottom_right')!.catalog!.allowedChars, BOTTOM_ROW)).toBe(true);
  });

  it('assigns generation types from catalog rows', () => {
    expect(byId.get('base_vowels')!.catalog!.generationType).toBe('random_chars');
    expect(byId.get('en_bigrams')!.catalog!.generationType).toBe('static');
    expect(byId.get('alphabet_mastery')!.catalog!.generationType).toBe('dictionary_words');
  });

  it('aligns roadmap chapters with catalog grouping', () => {
    const chapters = buildChaptersFromRows(FALLBACK_CATALOG_ROWS);
    for (const chapter of getRoadmapChapters()) {
      const fromRows = chapters.find((c) => c.id === chapter.id);
      expect(fromRows?.lessonIds).toEqual(chapter.lessonIds);
    }
  });

  it('maps catalog rows to playable lessons', () => {
    const row = FALLBACK_CATALOG_ROWS[0];
    const lesson = catalogRowToLesson(row);
    expect(lesson.id).toBe(row.id);
    expect(lesson.catalog).toBeDefined();
  });
});
