export interface MicroLesson {
  id: string;
  titleKey: string;
  chars: string;
  /** Route to existing or future lesson page */
  lessonId: string;
  difficulty: 1 | 2 | 3;
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
      { id: 'home-left', titleKey: 'homeLeft', chars: 'aoeu', lessonId: 'home-row', difficulty: 1 },
      { id: 'home-right', titleKey: 'homeRight', chars: 'dhtn', lessonId: 'home-row', difficulty: 1 },
      { id: 'home-full', titleKey: 'homeFull', chars: 'aoeuidhtns', lessonId: 'home-row', difficulty: 1 },
    ],
  },
  {
    id: 'top-row-group',
    titleKey: 'topRow',
    descriptionKey: 'topRow',
    microLessons: [
      { id: 'top-nivel-1', titleKey: 'topNivel1', chars: 'pygcrl', lessonId: 'top-row', difficulty: 2 },
      { id: 'top-nivel-2', titleKey: 'topNivel2', chars: 'fvzx', lessonId: 'top-row', difficulty: 2 },
      { id: 'top-full', titleKey: 'topFull', chars: "',.pyfgcrl", lessonId: 'top-row', difficulty: 2 },
    ],
  },
  {
    id: 'bottom-row-group',
    titleKey: 'bottomRow',
    descriptionKey: 'bottomRow',
    microLessons: [
      { id: 'bottom-nivel-1', titleKey: 'bottomNivel1', chars: 'qjkx', lessonId: 'bottom-row', difficulty: 2 },
      { id: 'bottom-nivel-2', titleKey: 'bottomNivel2', chars: 'bmwv', lessonId: 'bottom-row', difficulty: 2 },
      { id: 'bottom-full', titleKey: 'bottomFull', chars: ';qjkxbmwvz', lessonId: 'bottom-row', difficulty: 2 },
    ],
  },
  {
    id: 'code-mode-group',
    titleKey: 'codeMode',
    descriptionKey: 'codeMode',
    microLessons: [
      { id: 'code-html', titleKey: 'codeHtml', chars: '<>/', lessonId: 'dev-symbols', difficulty: 4 },
      { id: 'code-ts', titleKey: 'codeTs', chars: '{}();', lessonId: 'dev-symbols', difficulty: 4 },
      { id: 'code-full', titleKey: 'codeFull', chars: 'all', lessonId: 'dev-symbols', difficulty: 5 },
    ],
  },
  {
    id: 'spanish-group',
    titleKey: 'spanishDvorak',
    descriptionKey: 'spanishDvorak',
    microLessons: [
      { id: 'es-accents', titleKey: 'esAccents', chars: 'áéíóú', lessonId: 'shift-caps', difficulty: 3 },
      { id: 'es-enye', titleKey: 'esEnye', chars: 'ñÑ', lessonId: 'shift-caps', difficulty: 3 },
      { id: 'es-full', titleKey: 'esFull', chars: 'pangrams', lessonId: 'sentences', difficulty: 4 },
    ],
  },
];
