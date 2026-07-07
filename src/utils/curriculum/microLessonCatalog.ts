import { CURRICULUM_LESSONS, LESSON_GROUPS, type MicroLesson } from '@/data/microLessons';
import type { Lesson } from '@/utils/curriculum/lessons';

/** Symbols used in full code drills. */
export const CODE_DRILL_CHARS = '<>/{}();[]=`~#$%^&*_\\|@';

export const MICRO_META_BY_ID = new Map(CURRICULUM_LESSONS.map((micro) => [micro.id, micro]));

export function isMicroLessonId(lessonId: string): boolean {
  return MICRO_META_BY_ID.has(lessonId);
}

export function getMicroMeta(lessonId: string): MicroLesson | undefined {
  return MICRO_META_BY_ID.get(lessonId);
}

export function findGroupForMicro(microId: string) {
  const meta = getMicroMeta(microId);
  if (!meta) return undefined;
  return LESSON_GROUPS.find((group) => group.chapterId === meta.chapterId);
}

export function buildMicroLessons(): Lesson[] {
  return CURRICULUM_LESSONS.map((micro) => buildMicroLesson(micro));
}

function resolveCharSet(micro: MicroLesson): string {
  if (micro.chars === 'code') return CODE_DRILL_CHARS;
  return micro.chars;
}

function buildMicroLesson(micro: MicroLesson): Lesson {
  const base = {
    id: micro.id,
    titleKey: micro.titleKey,
    descriptionKey: micro.titleKey,
    category: categoryForLesson(micro),
    difficulty: micro.difficulty,
    optional: false,
  };

  if (micro.texts?.length) {
    return {
      ...base,
      texts: micro.texts,
      textsEs: micro.textsEs ?? micro.texts,
    };
  }

  if (micro.chars === 'pangrams') {
    return {
      ...base,
      category: 'sentences',
      texts: micro.texts ?? [],
      textsEs: micro.textsEs,
    };
  }

  return {
    ...base,
    generated: true,
    charSet: resolveCharSet(micro),
    texts: [`${resolveCharSet(micro).split('').join(' ')}`],
  };
}

function categoryForLesson(micro: MicroLesson): Lesson['category'] {
  if (micro.chapterId === 'ch6_development' || micro.id.startsWith('code_')) return 'symbols';
  if (micro.chapterId === 'ch5_mechanics' && micro.id.includes('num')) return 'numbers';
  if (micro.chapterId === 'ch4_bilingual') return 'words';
  if (micro.id === 'advanced_prose') return 'sentences';
  return 'drill';
}
