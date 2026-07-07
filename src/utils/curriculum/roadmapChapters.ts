/** Roadmap chapter taxonomy — maps existing core + micro lessons without changing IDs. */

export interface RoadmapChapter {
  id: string;
  titleKey: string;
  descriptionKey: string;
  /** Core and micro lesson IDs belonging to this chapter. */
  lessonIds: string[];
}

export const ROADMAP_CHAPTERS: RoadmapChapter[] = [
  {
    id: 'fundamentals',
    titleKey: 'fundamentals',
    descriptionKey: 'fundamentals',
    lessonIds: ['home-row', 'home-left', 'home-right'],
  },
  {
    id: 'expansion',
    titleKey: 'expansion',
    descriptionKey: 'expansion',
    lessonIds: [
      'top-row',
      'top-nivel-1',
      'top-nivel-2',
      'bottom-row',
      'bottom-nivel-1',
      'bottom-nivel-2',
      'punctuation',
      'all-rows',
    ],
  },
  {
    id: 'bilingual',
    titleKey: 'bilingual',
    descriptionKey: 'bilingual',
    lessonIds: ['common-words', 'es-accents', 'es-enye'],
  },
  {
    id: 'mechanics',
    titleKey: 'mechanics',
    descriptionKey: 'mechanics',
    lessonIds: ['shift-caps', 'numbers'],
  },
  {
    id: 'development',
    titleKey: 'development',
    descriptionKey: 'development',
    lessonIds: ['dev-symbols', 'code-html', 'code-ts', 'code-full'],
  },
  {
    id: 'mastery',
    titleKey: 'masteryChapter',
    descriptionKey: 'masteryChapter',
    lessonIds: ['sentences', 'es-full', 'advanced'],
  },
];

export const ROADMAP_LESSON_IDS: string[] = ROADMAP_CHAPTERS.flatMap((chapter) => chapter.lessonIds);

export function getRoadmapChapter(chapterId: string): RoadmapChapter | undefined {
  return ROADMAP_CHAPTERS.find((chapter) => chapter.id === chapterId);
}

export function getChapterForLesson(lessonId: string): RoadmapChapter | undefined {
  return ROADMAP_CHAPTERS.find((chapter) => chapter.lessonIds.includes(lessonId));
}
