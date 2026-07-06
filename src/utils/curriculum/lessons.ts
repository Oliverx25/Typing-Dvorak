import { generateAdaptiveDrillText } from '../typing/adaptiveDrill';
import { buildMicroLessons } from './microLessonCatalog';

export type LessonCategory = 'drill' | 'words' | 'sentences' | 'punctuation' | 'numbers' | 'symbols';

export interface Lesson {
  id: string;
  titleKey: string;
  descriptionKey: string;
  category: LessonCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  texts: string[];
  textsEs?: string[];
  /** Use text generator instead of static texts when true. */
  generated?: boolean;
  charSet?: string;
  /** Optional lessons are always unlocked and excluded from curriculum %. */
  optional?: boolean;
  /** Adaptive lesson generates text from heatmap data. */
  adaptive?: boolean;
}

const BASE_LESSONS: Lesson[] = [
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
    id: 'shift-caps',
    titleKey: 'shiftCaps',
    descriptionKey: 'shiftCaps',
    category: 'words',
    difficulty: 3,
    texts: [
      'The Quick Brown Fox Jumps Over The Lazy Dog',
      'Hello World Practice Every Single Day',
      'Dvorak Layout Makes Typing Feel Natural',
      'Shift Keys Unlock Capital Letters',
    ],
    textsEs: [
      'El Zorro Marron Salta Sobre El Perro Perezoso',
      'Practica Dvorak Cada Dia Con Paciencia',
      'Las Mayusculas Requieren La Tecla Shift',
    ],
  },
  {
    id: 'all-rows',
    titleKey: 'allRows',
    descriptionKey: 'allRows',
    category: 'words',
    difficulty: 3,
    texts: [
      'the quick brown fox jumps over the lazy dog',
      'practice dvorak layout every single day for best results',
      'typing speed grows with consistent daily drills and focus',
      'pack my box with five dozen liquor jugs today',
      'how vexingly quick daft zebras jump over fences',
      'the five boxing wizards jump quickly on the mat',
    ],
    textsEs: [
      'el veloz murcielago hindu comia feliz cardillo y kiwi',
      'practica el layout dvorak cada dia con constancia',
      'la velocidad llega cuando la precision es solida',
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
    textsEs: [
      'Aprender Dvorak requiere paciencia y practica diaria.',
      'Tus dedos encontraran gradualmente su posicion en la fila base.',
      'La precision importa mas que la velocidad al empezar.',
    ],
  },
  {
    id: 'dev-symbols',
    titleKey: 'devSymbols',
    descriptionKey: 'devSymbols',
    category: 'symbols',
    difficulty: 4,
    texts: [
      '{ } [ ] ( ) < > ` ~ # $ % ^ & *',
      'const fn = () => { return true; };',
      'import { useState } from "react";',
      'git commit -m "fix: keyboard layout"',
      'SELECT * FROM users WHERE id = 1;',
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
    textsEs: [
      'Los lenguajes de programacion usan muchos simbolos que exigen practica en cualquier layout.',
      'El teclado Dvorak simplificado fue patentado en 1936 por August Dvorak.',
    ],
  },
  {
    id: 'adaptive-drill',
    titleKey: 'adaptiveDrill',
    descriptionKey: 'adaptiveDrill',
    category: 'drill',
    difficulty: 3,
    optional: true,
    adaptive: true,
    texts: ['aoeu dhtn aoeu dhtn'],
  },
];

export const MICRO_LESSONS: Lesson[] = buildMicroLessons((id) =>
  BASE_LESSONS.find((lesson) => lesson.id === id),
);

export const LESSONS: Lesson[] = [...BASE_LESSONS, ...MICRO_LESSONS];

export const CORE_LESSONS = BASE_LESSONS.filter((l) => !l.optional);

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}

/** Localized lesson metadata — keys live in i18n lessonMeta. */
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
