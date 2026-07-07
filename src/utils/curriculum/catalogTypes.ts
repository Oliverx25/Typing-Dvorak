export type GenerationType = 'static' | 'random_chars' | 'dictionary_words';

export interface LessonsCatalogRow {
  id: string;
  chapter_id: number;
  title: string;
  description: string;
  difficulty: string;
  generation_type: GenerationType;
  allowed_chars: string;
  static_text: string | null;
  order_index: number;
}

export interface LessonCatalogMeta {
  generationType: GenerationType;
  allowedChars: string;
  staticText: string | null;
}

export interface RoadmapChapter {
  id: string;
  titleKey: string;
  descriptionKey: string;
  lessonIds: string[];
}

export const CHAPTER_META_BY_NUMBER: Record<
  number,
  { id: string; titleKey: string; descriptionKey: string }
> = {
  1: { id: 'ch1_fundamentals', titleKey: 'ch1Fundamentals', descriptionKey: 'ch1Fundamentals' },
  2: { id: 'ch2_top_expansion', titleKey: 'ch2TopExpansion', descriptionKey: 'ch2TopExpansion' },
  3: { id: 'ch3_bottom_reach', titleKey: 'ch3BottomReach', descriptionKey: 'ch3BottomReach' },
  4: { id: 'ch4_bilingual', titleKey: 'ch4Bilingual', descriptionKey: 'ch4Bilingual' },
  5: { id: 'ch5_mechanics', titleKey: 'ch5Mechanics', descriptionKey: 'ch5Mechanics' },
  6: { id: 'ch6_development', titleKey: 'ch6Development', descriptionKey: 'ch6Development' },
  7: { id: 'ch7_fire_test', titleKey: 'ch7FireTest', descriptionKey: 'ch7FireTest' },
};

/** Maps lesson id → i18n microLessonMeta key. */
export const TITLE_KEY_BY_LESSON_ID: Record<string, string> = {
  base_vowels: 'baseVowels',
  base_consonants: 'baseConsonants',
  base_alternation: 'baseAlternation',
  top_left: 'topLeft',
  top_right: 'topRight',
  base_top_integration: 'baseTopIntegration',
  bottom_left: 'bottomLeft',
  bottom_right: 'bottomRight',
  alphabet_mastery: 'alphabetMastery',
  en_bigrams: 'enBigrams',
  en_trigrams: 'enTrigrams',
  es_accents: 'esAccents',
  es_suffixes: 'esSuffixes',
  bilingual_flow: 'bilingualFlow',
  shift_cross: 'shiftCross',
  camel_pascal: 'camelPascal',
  num_row_left: 'numRowLeft',
  num_row_right: 'numRowRight',
  num_mixed: 'numMixed',
  dev_math_logic: 'devMathLogic',
  dev_brackets: 'devBrackets',
  dev_strings: 'devStrings',
  dev_terminal: 'devTerminal',
  code_js_ts: 'codeJsTs',
  code_python: 'codePython',
  advanced_prose: 'advancedProse',
};
