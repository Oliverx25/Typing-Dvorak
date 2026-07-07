/**
 * Maps legacy lesson IDs to their ergonomic curriculum equivalents.
 * Used when migrating localStorage and Supabase progress after catalog restructure.
 */
export const LEGACY_LESSON_ID_MAP: Readonly<Record<string, string>> = {
  'home-row': 'base_alternation',
  'home-left': 'base_vowels',
  'home-right': 'base_consonants',
  'top-row': 'base_top_integration',
  'top-nivel-1': 'top_left',
  'top-nivel-2': 'top_right',
  'middle-row': 'base_alternation',
  'bottom-row': 'alphabet_mastery',
  'bottom-left': 'bottom_left',
  'bottom-right': 'bottom_right',
  'shift-caps': 'shift_cross',
  'all-rows': 'alphabet_mastery',
  'common-words': 'bilingual_flow',
  'punctuation': 'dev_strings',
  'numbers': 'num_mixed',
  'dev-symbols': 'dev_terminal',
  'sentences': 'advanced_prose',
  'advanced': 'advanced_prose',
};

export function resolveLessonId(lessonId: string): string {
  return LEGACY_LESSON_ID_MAP[lessonId] ?? lessonId;
}

export function isLegacyLessonId(lessonId: string): boolean {
  return lessonId in LEGACY_LESSON_ID_MAP;
}
