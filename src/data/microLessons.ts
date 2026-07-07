/** Ergonomic 7-chapter curriculum — strict left/right hand isolation in early drills. */

export type DrillMode = 'chars' | 'texts' | 'pangrams' | 'code';

export interface MicroLesson {
  id: string;
  titleKey: string;
  chapterId: string;
  /** Character set for generated drills, or sentinel: pangrams | code */
  chars: string;
  texts?: string[];
  textsEs?: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface LessonGroup {
  id: string;
  titleKey: string;
  descriptionKey: string;
  chapterId: string;
  defaultOpen?: boolean;
  microLessons: MicroLesson[];
}

/** Flat curriculum — 26 progressive lessons across 7 chapters. */
export const CURRICULUM_LESSONS: MicroLesson[] = [
  // CAPÍTULO 1 — Fundamentos Dvorak (Fila Base)
  { id: 'base_vowels', titleKey: 'baseVowels', chapterId: 'ch1_fundamentals', chars: 'aoeui', difficulty: 1 },
  { id: 'base_consonants', titleKey: 'baseConsonants', chapterId: 'ch1_fundamentals', chars: 'dhtns', difficulty: 1 },
  { id: 'base_alternation', titleKey: 'baseAlternation', chapterId: 'ch1_fundamentals', chars: 'aoeuidhtns', difficulty: 1 },

  // CAPÍTULO 2 — Expansión Superior
  { id: 'top_left', titleKey: 'topLeft', chapterId: 'ch2_top_expansion', chars: "',.py", difficulty: 2 },
  { id: 'top_right', titleKey: 'topRight', chapterId: 'ch2_top_expansion', chars: 'fgcrl', difficulty: 2 },
  { id: 'base_top_integration', titleKey: 'baseTopIntegration', chapterId: 'ch2_top_expansion', chars: 'aoeuidhtns\',.pyfgcrl', difficulty: 2 },

  // CAPÍTULO 3 — Alcance Inferior
  { id: 'bottom_left', titleKey: 'bottomLeft', chapterId: 'ch3_bottom_reach', chars: ';qjkx', difficulty: 2 },
  { id: 'bottom_right', titleKey: 'bottomRight', chapterId: 'ch3_bottom_reach', chars: 'bmwvz', difficulty: 2 },
  {
    id: 'alphabet_mastery',
    titleKey: 'alphabetMastery',
    chapterId: 'ch3_bottom_reach',
    chars: 'abcdefghijklmnopqrstuvwxyz',
    difficulty: 3,
  },

  // CAPÍTULO 4 — Maestría Bilingüe
  {
    id: 'en_bigrams',
    titleKey: 'enBigrams',
    chapterId: 'ch4_bilingual',
    chars: 'texts',
    difficulty: 3,
    texts: [
      'th th th he he he in in er er nd nd an re on at en',
      'th e th e he r he r in g in g er e st nd ed',
    ],
  },
  {
    id: 'en_trigrams',
    titleKey: 'enTrigrams',
    chapterId: 'ch4_bilingual',
    chars: 'texts',
    difficulty: 3,
    texts: [
      'the and the and the ent ion ing tion for ter',
      'the quick and the end of the ent ire string',
    ],
  },
  {
    id: 'es_accents',
    titleKey: 'esAccents',
    chapterId: 'ch4_bilingual',
    chars: 'áéíóúñÁÉÍÓÚÑ',
    difficulty: 3,
  },
  {
    id: 'es_suffixes',
    titleKey: 'esSuffixes',
    chapterId: 'ch4_bilingual',
    chars: 'texts',
    difficulty: 3,
    texts: [
      'realmente finalmente absolutamente directamente',
      'nación acción educación comunicación organización',
      'unidad libertad comunidad velocidad claridad',
    ],
    textsEs: [
      'realmente finalmente absolutamente directamente',
      'nación acción educación comunicación organización',
      'unidad libertad comunidad velocidad claridad',
    ],
  },
  {
    id: 'bilingual_flow',
    titleKey: 'bilingualFlow',
    chapterId: 'ch4_bilingual',
    chars: 'texts',
    difficulty: 3,
    texts: [
      'the and for are but not you all can had her was one our',
      'el la de que y en un es se no te lo le da su por son con',
    ],
  },

  // CAPÍTULO 5 — Precisión Mecánica
  {
    id: 'shift_cross',
    titleKey: 'shiftCross',
    chapterId: 'ch5_mechanics',
    chars: 'texts',
    difficulty: 3,
    texts: [
      'A O E U I D H T N S P Y F G C R L',
      'The Quick Fox Jumps Over A Lazy Dog',
    ],
  },
  {
    id: 'camel_pascal',
    titleKey: 'camelPascal',
    chapterId: 'ch5_mechanics',
    chars: 'texts',
    difficulty: 4,
    texts: [
      'getUserName parseInput HttpRequest ReactComponent',
      'TypeScript JavaScript DvorakLayout UserProfile',
    ],
  },
  { id: 'num_row_left', titleKey: 'numRowLeft', chapterId: 'ch5_mechanics', chars: '12345', difficulty: 3 },
  { id: 'num_row_right', titleKey: 'numRowRight', chapterId: 'ch5_mechanics', chars: '67890', difficulty: 3 },
  {
    id: 'num_mixed',
    titleKey: 'numMixed',
    chapterId: 'ch5_mechanics',
    chars: 'texts',
    difficulty: 4,
    texts: ['abc123 test45 user99 v2alpha id42ok port8080', 'a1b2c3 x9y8z7 mix99end'],
  },

  // CAPÍTULO 6 — Arsenal de Desarrollo
  { id: 'dev_math_logic', titleKey: 'devMathLogic', chapterId: 'ch6_development', chars: '+-*/=<>', difficulty: 4 },
  { id: 'dev_brackets', titleKey: 'devBrackets', chapterId: 'ch6_development', chars: '{}[]()', difficulty: 4 },
  { id: 'dev_strings', titleKey: 'devStrings', chapterId: 'ch6_development', chars: '\'"`;:,./', difficulty: 4 },
  { id: 'dev_terminal', titleKey: 'devTerminal', chapterId: 'ch6_development', chars: '_|\\~$&@#%^', difficulty: 4 },

  // CAPÍTULO 7 — Pruebas de Fuego
  {
    id: 'code_js_ts',
    titleKey: 'codeJsTs',
    chapterId: 'ch7_fire_test',
    chars: 'texts',
    difficulty: 5,
    texts: [
      'const arr = items.filter(x => x > 0);',
      'function greet(name: string) { return `Hello ${name}`; }',
      'export type User = { id: string; email: string };',
    ],
  },
  {
    id: 'code_python',
    titleKey: 'codePython',
    chapterId: 'ch7_fire_test',
    chars: 'texts',
    difficulty: 5,
    texts: [
      'def fib(n): return n if n < 2 else fib(n-1) + fib(n-2)',
      'for item in items: process(item)',
      'class Handler: def run(self): pass',
    ],
  },
  {
    id: 'advanced_prose',
    titleKey: 'advancedProse',
    chapterId: 'ch7_fire_test',
    chars: 'texts',
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
];

/** Groups for accordion / chapter navigation (derived from curriculum). */
export const LESSON_GROUPS: LessonGroup[] = [
  {
    id: 'ch1-group',
    titleKey: 'ch1Fundamentals',
    descriptionKey: 'ch1Fundamentals',
    chapterId: 'ch1_fundamentals',
    defaultOpen: true,
    microLessons: CURRICULUM_LESSONS.filter((l) => l.chapterId === 'ch1_fundamentals'),
  },
  {
    id: 'ch2-group',
    titleKey: 'ch2TopExpansion',
    descriptionKey: 'ch2TopExpansion',
    chapterId: 'ch2_top_expansion',
    microLessons: CURRICULUM_LESSONS.filter((l) => l.chapterId === 'ch2_top_expansion'),
  },
  {
    id: 'ch3-group',
    titleKey: 'ch3BottomReach',
    descriptionKey: 'ch3BottomReach',
    chapterId: 'ch3_bottom_reach',
    microLessons: CURRICULUM_LESSONS.filter((l) => l.chapterId === 'ch3_bottom_reach'),
  },
  {
    id: 'ch4-group',
    titleKey: 'ch4Bilingual',
    descriptionKey: 'ch4Bilingual',
    chapterId: 'ch4_bilingual',
    microLessons: CURRICULUM_LESSONS.filter((l) => l.chapterId === 'ch4_bilingual'),
  },
  {
    id: 'ch5-group',
    titleKey: 'ch5Mechanics',
    descriptionKey: 'ch5Mechanics',
    chapterId: 'ch5_mechanics',
    microLessons: CURRICULUM_LESSONS.filter((l) => l.chapterId === 'ch5_mechanics'),
  },
  {
    id: 'ch6-group',
    titleKey: 'ch6Development',
    descriptionKey: 'ch6Development',
    chapterId: 'ch6_development',
    microLessons: CURRICULUM_LESSONS.filter((l) => l.chapterId === 'ch6_development'),
  },
  {
    id: 'ch7-group',
    titleKey: 'ch7FireTest',
    descriptionKey: 'ch7FireTest',
    chapterId: 'ch7_fire_test',
    microLessons: CURRICULUM_LESSONS.filter((l) => l.chapterId === 'ch7_fire_test'),
  },
];
