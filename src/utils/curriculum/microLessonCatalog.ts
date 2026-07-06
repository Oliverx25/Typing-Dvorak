import { LESSON_GROUPS, type MicroLesson } from '../../data/microLessons';
import type { Lesson } from './lessons';

const MICRO_ENTRIES: MicroLesson[] = LESSON_GROUPS.flatMap((group) => group.microLessons);

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

function buildMicroLesson(micro: MicroLesson, parentLookup: (id: string) => Lesson | undefined): Lesson {
  const parent = parentLookup(micro.parentLessonId);
  const isPangram = micro.chars === 'pangrams';
  const isAllChars = micro.chars === 'all';

  if (isPangram && parent) {
    return {
      id: micro.id,
      titleKey: micro.titleKey,
      descriptionKey: parent.descriptionKey,
      category: parent.category,
      difficulty: micro.difficulty,
      optional: true,
      texts: parent.texts,
      textsEs: parent.textsEs,
    };
  }

  if (isAllChars && parent && !parent.generated) {
    return {
      id: micro.id,
      titleKey: micro.titleKey,
      descriptionKey: parent.descriptionKey,
      category: parent.category,
      difficulty: micro.difficulty,
      optional: true,
      texts: parent.texts,
      textsEs: parent.textsEs,
    };
  }

  return {
    id: micro.id,
    titleKey: micro.titleKey,
    descriptionKey: parent?.descriptionKey ?? micro.titleKey,
    category: parent?.category ?? 'drill',
    difficulty: micro.difficulty,
    optional: true,
    generated: true,
    charSet: isAllChars ? (parent?.charSet ?? 'all') : micro.chars,
    texts: [`${micro.chars.split('').join(' ')}`],
  };
}
