export interface MicroLesson {
  id: string;
  titleKey: string;
  chars: string;
  /** Parent chapter lesson id (unlock gate). */
  parentLessonId: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface LessonGroup {
  id: string;
  titleKey: string;
  descriptionKey: string;
  defaultOpen?: boolean;
  microLessons: MicroLesson[];
}

/** Accordion groups with micro-lessons per keyboard row. */
export const LESSON_GROUPS: LessonGroup[] = [
  {
    id: 'home-row-group',
    titleKey: 'homeRow',
    descriptionKey: 'homeRow',
    defaultOpen: true,
    microLessons: [
      { id: 'home-left', titleKey: 'homeLeft', chars: 'aoeu', parentLessonId: 'home-row', difficulty: 1 },
      { id: 'home-right', titleKey: 'homeRight', chars: 'dhtn', parentLessonId: 'home-row', difficulty: 1 },
      { id: 'home-full', titleKey: 'homeFull', chars: 'aoeuidhtns', parentLessonId: 'home-row', difficulty: 1 },
    ],
  },
  {
    id: 'top-row-group',
    titleKey: 'topRow',
    descriptionKey: 'topRow',
    microLessons: [
      { id: 'top-nivel-1', titleKey: 'topNivel1', chars: 'pygcrl', parentLessonId: 'top-row', difficulty: 2 },
      { id: 'top-nivel-2', titleKey: 'topNivel2', chars: 'fvzx', parentLessonId: 'top-row', difficulty: 2 },
      { id: 'top-full', titleKey: 'topFull', chars: "',.pyfgcrl", parentLessonId: 'top-row', difficulty: 2 },
    ],
  },
  {
    id: 'bottom-row-group',
    titleKey: 'bottomRow',
    descriptionKey: 'bottomRow',
    microLessons: [
      { id: 'bottom-nivel-1', titleKey: 'bottomNivel1', chars: 'qjkx', parentLessonId: 'bottom-row', difficulty: 2 },
      { id: 'bottom-nivel-2', titleKey: 'bottomNivel2', chars: 'bmwv', parentLessonId: 'bottom-row', difficulty: 2 },
      { id: 'bottom-full', titleKey: 'bottomFull', chars: ';qjkxbmwvz', parentLessonId: 'bottom-row', difficulty: 2 },
    ],
  },
  {
    id: 'code-mode-group',
    titleKey: 'codeMode',
    descriptionKey: 'codeMode',
    microLessons: [
      { id: 'code-html', titleKey: 'codeHtml', chars: '<>/', parentLessonId: 'dev-symbols', difficulty: 4 },
      { id: 'code-ts', titleKey: 'codeTs', chars: '{}();', parentLessonId: 'dev-symbols', difficulty: 4 },
      { id: 'code-full', titleKey: 'codeFull', chars: 'all', parentLessonId: 'dev-symbols', difficulty: 5 },
    ],
  },
  {
    id: 'spanish-group',
    titleKey: 'spanishDvorak',
    descriptionKey: 'spanishDvorak',
    microLessons: [
      { id: 'es-accents', titleKey: 'esAccents', chars: 'áéíóú', parentLessonId: 'shift-caps', difficulty: 3 },
      { id: 'es-enye', titleKey: 'esEnye', chars: 'ñÑ', parentLessonId: 'shift-caps', difficulty: 3 },
      { id: 'es-full', titleKey: 'esFull', chars: 'pangrams', parentLessonId: 'sentences', difficulty: 4 },
    ],
  },
];
