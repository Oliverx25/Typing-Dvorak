import { describe, expect, it } from 'vitest';
import { LESSON_GROUPS } from '@/data/microLessons';
import { BOTTOM_ROW, HOME_ROW, TOP_ROW } from '@/utils/keyboard/dvorak';
import {
  CODE_DRILL_CHARS,
  SPANISH_PANGRAM_TEXTS,
  buildMicroLessons,
} from '@/utils/curriculum/microLessonCatalog';

const MICRO_LESSONS = buildMicroLessons(() => undefined);
const MICRO_BY_ID = new Map(MICRO_LESSONS.map((lesson) => [lesson.id, lesson]));

function charsOnly(row: string): string {
  return row.replace(/\s/g, '');
}

function isSubsetOf(charSet: string, row: string): boolean {
  const allowed = new Set(charsOnly(row).split(''));
  return [...charSet].every((char) => allowed.has(char));
}

describe('microLessonCatalog', () => {
  it('defines 12 micro lessons across 5 groups (no full-row duplicates)', () => {
    const ids = LESSON_GROUPS.flatMap((group) => group.microLessons.map((micro) => micro.id));
    expect(ids).toHaveLength(12);
    expect(ids).not.toContain('home-full');
    expect(ids).not.toContain('top-full');
    expect(ids).not.toContain('bottom-full');
  });

  it('uses micro-specific descriptions, not parent chapter descriptions', () => {
    for (const lesson of MICRO_LESSONS) {
      expect(lesson.descriptionKey).toBe(lesson.titleKey);
      expect(lesson.descriptionKey).not.toBe('homeRow');
      expect(lesson.descriptionKey).not.toBe('topRow');
      expect(lesson.descriptionKey).not.toBe('bottomRow');
      expect(lesson.descriptionKey).not.toBe('devSymbols');
      expect(lesson.descriptionKey).not.toBe('sentences');
    }
  });

  it('never copies parent lesson static texts except dedicated pangrams', () => {
    const esFull = MICRO_BY_ID.get('es-full')!;
    expect(esFull.texts).toEqual(SPANISH_PANGRAM_TEXTS);
    expect(esFull.generated).toBeFalsy();

    for (const lesson of MICRO_LESSONS) {
      if (lesson.id === 'es-full') continue;
      expect(lesson.generated).toBe(true);
      expect(lesson.charSet).toBeTruthy();
    }
  });

  it('keeps home and row micro char sets within their parent row', () => {
    expect(isSubsetOf(MICRO_BY_ID.get('home-left')!.charSet!, HOME_ROW)).toBe(true);
    expect(isSubsetOf(MICRO_BY_ID.get('home-right')!.charSet!, HOME_ROW)).toBe(true);
    expect(isSubsetOf(MICRO_BY_ID.get('top-nivel-1')!.charSet!, TOP_ROW)).toBe(true);
    expect(isSubsetOf(MICRO_BY_ID.get('top-nivel-2')!.charSet!, TOP_ROW)).toBe(true);
    expect(isSubsetOf(MICRO_BY_ID.get('bottom-nivel-1')!.charSet!, BOTTOM_ROW)).toBe(true);
    expect(isSubsetOf(MICRO_BY_ID.get('bottom-nivel-2')!.charSet!, BOTTOM_ROW)).toBe(true);
  });

  it('covers each row micro group without duplicating the full row lesson', () => {
    const topMicro =
      MICRO_BY_ID.get('top-nivel-1')!.charSet! + MICRO_BY_ID.get('top-nivel-2')!.charSet!;
    expect(charsOnly(TOP_ROW).split('').sort().join('')).toBe(
      [...new Set(topMicro.split(''))].sort().join(''),
    );

    const bottomMicro =
      MICRO_BY_ID.get('bottom-nivel-1')!.charSet! + MICRO_BY_ID.get('bottom-nivel-2')!.charSet!;
    expect(charsOnly(BOTTOM_ROW).replace(';', '').split('').sort().join('')).toBe(
      [...new Set(bottomMicro.split(''))].sort().join(''),
    );
  });

  it('uses a dedicated symbol set for code-full', () => {
    expect(MICRO_BY_ID.get('code-full')!.charSet).toBe(CODE_DRILL_CHARS);
  });
});
