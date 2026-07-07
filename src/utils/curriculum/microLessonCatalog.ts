import { LESSON_GROUPS, type MicroLesson } from '@/data/microLessons';
import type { Lesson } from '@/utils/curriculum/lessons';

const MICRO_ENTRIES: MicroLesson[] = LESSON_GROUPS.flatMap((group) => group.microLessons);

/** Symbols used in code-full micro lesson (subset of dev-symbols). */
export const CODE_DRILL_CHARS = '<>/{}();[]=`~#$%^&*';

/** Spanish pangrams for es-full — not copied from the main sentences lesson. */
export const SPANISH_PANGRAM_TEXTS = [
  'El veloz murcielago hindu comia feliz cardillo y kiwi.',
  'Fabio me exige sin tapujos que un pez gordo saque la valla.',
  'Jovencillo emponzonado de whisky, cigarrillo rubio.',
  'Quien compra lana en invierno tiene panos en verano.',
  'La ciguena gigante avanza con paso firme y elegante.',
];

export const MICRO_META_BY_ID = new Map(MICRO_ENTRIES.map((micro) => [micro.id, micro]));

export function isMicroLessonId(lessonId: string): boolean {
  return MICRO_META_BY_ID.has(lessonId);
}

export function getMicroMeta(lessonId: string): MicroLesson | undefined {
  return MICRO_META_BY_ID.get(lessonId);
}

export function findGroupForMicro(microId: string) {
  return LESSON_GROUPS.find((group) => group.microLessons.some((micro) => micro.id === microId));
}

/** Builds playable Lesson records from micro-lesson definitions. */
export function buildMicroLessons(parentLookup: (id: string) => Lesson | undefined): Lesson[] {
  return MICRO_ENTRIES.map((micro) => buildMicroLesson(micro, parentLookup));
}

function resolveCharSet(micro: MicroLesson): string {
  if (micro.chars === 'code') return CODE_DRILL_CHARS;
  return micro.chars;
}

function buildMicroLesson(micro: MicroLesson, parentLookup: (id: string) => Lesson | undefined): Lesson {
  const parent = parentLookup(micro.parentLessonId);
  const base = {
    id: micro.id,
    titleKey: micro.titleKey,
    descriptionKey: micro.titleKey,
    category: parent?.category ?? 'drill',
    difficulty: micro.difficulty,
    optional: true,
  };

  if (micro.chars === 'pangrams') {
    return {
      ...base,
      category: 'sentences',
      texts: SPANISH_PANGRAM_TEXTS,
      textsEs: SPANISH_PANGRAM_TEXTS,
    };
  }

  return {
    ...base,
    generated: true,
    charSet: resolveCharSet(micro),
    texts: [`${resolveCharSet(micro).split('').join(' ')}`],
  };
}
