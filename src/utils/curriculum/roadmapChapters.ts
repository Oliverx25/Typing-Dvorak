/** Roadmap chapter taxonomy — 7 progressive ergonomic chapters. */

export interface RoadmapChapter {
  id: string;
  titleKey: string;
  descriptionKey: string;
  lessonIds: string[];
}

export const ROADMAP_CHAPTERS: RoadmapChapter[] = [
  {
    id: 'ch1_fundamentals',
    titleKey: 'ch1Fundamentals',
    descriptionKey: 'ch1Fundamentals',
    lessonIds: ['base_vowels', 'base_consonants', 'base_alternation'],
  },
  {
    id: 'ch2_top_expansion',
    titleKey: 'ch2TopExpansion',
    descriptionKey: 'ch2TopExpansion',
    lessonIds: ['top_left', 'top_right', 'base_top_integration'],
  },
  {
    id: 'ch3_bottom_reach',
    titleKey: 'ch3BottomReach',
    descriptionKey: 'ch3BottomReach',
    lessonIds: ['bottom_left', 'bottom_right', 'alphabet_mastery'],
  },
  {
    id: 'ch4_bilingual',
    titleKey: 'ch4Bilingual',
    descriptionKey: 'ch4Bilingual',
    lessonIds: ['en_bigrams', 'en_trigrams', 'es_accents', 'es_suffixes', 'bilingual_flow'],
  },
  {
    id: 'ch5_mechanics',
    titleKey: 'ch5Mechanics',
    descriptionKey: 'ch5Mechanics',
    lessonIds: ['shift_cross', 'camel_pascal', 'num_row_left', 'num_row_right', 'num_mixed'],
  },
  {
    id: 'ch6_development',
    titleKey: 'ch6Development',
    descriptionKey: 'ch6Development',
    lessonIds: ['dev_math_logic', 'dev_brackets', 'dev_strings', 'dev_terminal'],
  },
  {
    id: 'ch7_fire_test',
    titleKey: 'ch7FireTest',
    descriptionKey: 'ch7FireTest',
    lessonIds: ['code_js_ts', 'code_python', 'advanced_prose'],
  },
];

export const ROADMAP_LESSON_IDS: string[] = ROADMAP_CHAPTERS.flatMap((chapter) => chapter.lessonIds);

export function getRoadmapChapter(chapterId: string): RoadmapChapter | undefined {
  return ROADMAP_CHAPTERS.find((chapter) => chapter.id === chapterId);
}

export function getChapterForLesson(lessonId: string): RoadmapChapter | undefined {
  return ROADMAP_CHAPTERS.find((chapter) => chapter.lessonIds.includes(lessonId));
}
