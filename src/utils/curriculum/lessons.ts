import { generateAdaptiveDrillText } from '@/utils/typing/adaptiveDrill';
import { buildMicroLessons } from '@/utils/curriculum/microLessonCatalog';
import { ROADMAP_LESSON_IDS } from '@/utils/curriculum/roadmapChapters';

export type LessonCategory = 'drill' | 'words' | 'sentences' | 'punctuation' | 'numbers' | 'symbols';

export interface Lesson {
  id: string;
  titleKey: string;
  descriptionKey: string;
  category: LessonCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  texts: string[];
  textsEs?: string[];
  generated?: boolean;
  charSet?: string;
  optional?: boolean;
  adaptive?: boolean;
}

const ADAPTIVE_DRILL: Lesson = {
  id: 'adaptive-drill',
  titleKey: 'adaptiveDrill',
  descriptionKey: 'adaptiveDrill',
  category: 'drill',
  difficulty: 3,
  optional: true,
  adaptive: true,
  texts: ['aoeu dhtn aoeu dhtn'],
};

export const MICRO_LESSONS: Lesson[] = buildMicroLessons();

/** All playable curriculum lessons (26) + optional adaptive drill. */
export const LESSONS: Lesson[] = [...MICRO_LESSONS, ADAPTIVE_DRILL];

/** Curriculum lessons in roadmap order — used for stats and legacy imports. */
export const CORE_LESSONS: Lesson[] = MICRO_LESSONS.filter((lesson) =>
  ROADMAP_LESSON_IDS.includes(lesson.id),
);

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}

export function getLessonText(
  lesson: Lesson,
  pick: (texts: string[]) => string,
  generate?: (charSet: string) => string,
  locale: 'en' | 'es' = 'en',
): string {
  if (lesson.adaptive) {
    return generateAdaptiveDrillText() ?? pick(lesson.texts);
  }
  const pool = locale === 'es' && lesson.textsEs?.length ? lesson.textsEs : lesson.texts;
  if (lesson.generated && lesson.charSet && generate) {
    return generate(lesson.charSet);
  }
  return pick(pool);
}
