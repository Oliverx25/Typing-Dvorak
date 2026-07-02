export type LessonCategory = 'drill' | 'words' | 'sentences' | 'punctuation' | 'numbers';

export interface Lesson {
  id: string;
  titleKey: string;
  descriptionKey: string;
  category: LessonCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  texts: string[];
  /** Use text generator instead of static texts when true. */
  generated?: boolean;
  charSet?: string;
}

export const LESSONS: Lesson[] = [
  {
    id: 'home-row',
    titleKey: 'homeRow',
    descriptionKey: 'homeRow',
    category: 'drill',
    difficulty: 1,
    generated: true,
    charSet: 'home',
    texts: [
      'aoeu aoeu iuia iuia',
      'dhtn dhtn snth snth',
      'aoeui dhtns aoeui dhtns',
    ],
  },
  {
    id: 'top-row',
    titleKey: 'topRow',
    descriptionKey: 'topRow',
    category: 'drill',
    difficulty: 2,
    generated: true,
    charSet: 'top',
    texts: [
      'pyfg pyfg crlf crlf',
      ',.py ,.py fgcr fgcr',
      'pyfgcrl ,.pyfgcrl',
    ],
  },
  {
    id: 'bottom-row',
    titleKey: 'bottomRow',
    descriptionKey: 'bottomRow',
    category: 'drill',
    difficulty: 2,
    generated: true,
    charSet: 'bottom',
    texts: [
      'qjkx qjkx bmwv bmwv',
      ';qjk ;qjk xbmw xbmw',
      'qjkxbmwv ;qjkxbmwv',
    ],
  },
  {
    id: 'punctuation',
    titleKey: 'punctuation',
    descriptionKey: 'punctuation',
    category: 'punctuation',
    difficulty: 3,
    generated: true,
    charSet: 'punctuation',
    texts: [
      "' , . ; ' , . ;",
      '- / = - / =',
      "a.e,i;o' a.e,i;o'",
    ],
  },
  {
    id: 'numbers',
    titleKey: 'numbers',
    descriptionKey: 'numbers',
    category: 'numbers',
    difficulty: 3,
    generated: true,
    charSet: 'numbers',
    texts: [
      '12345 67890',
      '02468 13579',
      '31415 27182',
    ],
  },
  {
    id: 'all-rows',
    titleKey: 'allRows',
    descriptionKey: 'allRows',
    category: 'drill',
    difficulty: 3,
    generated: true,
    charSet: 'all',
    texts: [
      'the quick brown fox jumps over the lazy dog',
      'practice dvorak layout every single day',
    ],
  },
  {
    id: 'common-words',
    titleKey: 'commonWords',
    descriptionKey: 'commonWords',
    category: 'words',
    difficulty: 3,
    texts: [
      'the and for are but not you all can had her was one our out',
      'day get has him his how man new now old see way who boy did',
      'its let put say she too use dad mom run sun top try win yes',
    ],
  },
  {
    id: 'sentences',
    titleKey: 'sentences',
    descriptionKey: 'sentences',
    category: 'sentences',
    difficulty: 4,
    texts: [
      'Learning Dvorak takes patience and daily practice.',
      'Your fingers will gradually find their home positions.',
      'Accuracy matters more than speed when you are starting out.',
    ],
  },
  {
    id: 'advanced',
    titleKey: 'advanced',
    descriptionKey: 'advanced',
    category: 'sentences',
    difficulty: 5,
    texts: [
      'Programming languages use many symbols and punctuation marks that require practice on any keyboard layout.',
      'The Dvorak Simplified Keyboard was patented in 1936 by August Dvorak and his brother-in-law William Dealey.',
    ],
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}

/** Localized lesson metadata — keys live in i18n lessonMeta. */
export function getLessonText(lesson: Lesson, pick: (texts: string[]) => string, generate?: (charSet: string) => string): string {
  if (lesson.generated && lesson.charSet && generate) {
    return generate(lesson.charSet);
  }
  return pick(lesson.texts);
}
