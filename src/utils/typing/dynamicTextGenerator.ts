import { PRACTICE_WORDS_EN, PRACTICE_WORDS_ES } from '@/data/practiceDictionary';
import type { LessonCatalogMeta } from '@/utils/curriculum/catalogTypes';
import type { Locale } from '@/i18n';

const STATIC_VARIANT_SEPARATOR = '\n---\n';
const DEFAULT_TARGET_LENGTH = 48;
const DEFAULT_WORD_COUNT = 12;

export interface DynamicTextOptions {
  locale?: Locale;
  targetLength?: number;
  wordCount?: number;
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function normalizeAllowedChars(chars: string): string {
  return chars.replace(/\s/g, '');
}

function buildAllowedSet(chars: string): Set<string> {
  return new Set(normalizeAllowedChars(chars).split(''));
}

/** True when every character in `word` is contained in `allowed`. */
export function wordUsesOnlyAllowedChars(word: string, allowed: string): boolean {
  const allowedSet = buildAllowedSet(allowed);
  if (allowedSet.size === 0) return false;
  for (const char of word) {
    if (!allowedSet.has(char)) return false;
  }
  return word.length > 0;
}

export function filterDictionaryWords(
  words: readonly string[],
  allowedChars: string,
): string[] {
  return words.filter((word) => wordUsesOnlyAllowedChars(word, allowedChars));
}

function generateRandomCharDrill(allowedChars: string, targetLength: number): string {
  const chars = normalizeAllowedChars(allowedChars);
  if (!chars.length) return '';

  const words: string[] = [];
  let total = 0;

  while (total < targetLength) {
    const wordLen = randomInt(3, 6);
    let word = '';
    for (let i = 0; i < wordLen; i += 1) {
      word += chars[Math.floor(Math.random() * chars.length)];
    }
    words.push(word);
    total += word.length + (total + word.length < targetLength ? 1 : 0);
  }

  return words.join(' ').slice(0, targetLength);
}

function generateDictionaryDrill(
  allowedChars: string,
  locale: Locale,
  wordCount: number,
): string {
  const pools = locale === 'es'
    ? [...PRACTICE_WORDS_ES, ...PRACTICE_WORDS_EN]
    : [...PRACTICE_WORDS_EN, ...PRACTICE_WORDS_ES];

  const filtered = filterDictionaryWords(pools, allowedChars);
  if (filtered.length === 0) {
    return generateRandomCharDrill(allowedChars, DEFAULT_TARGET_LENGTH);
  }

  const words: string[] = [];
  for (let i = 0; i < wordCount; i += 1) {
    words.push(pickRandom(filtered));
  }
  return words.join(' ');
}

function pickStaticVariant(staticText: string): string {
  const variants = staticText.split(STATIC_VARIANT_SEPARATOR).map((v) => v.trim()).filter(Boolean);
  if (variants.length === 0) return '';
  return pickRandom(variants);
}

/** Generate practice text from a catalog lesson definition. */
export function generateDynamicLessonText(
  catalog: LessonCatalogMeta,
  options: DynamicTextOptions = {},
): string {
  const locale = options.locale ?? 'en';
  const targetLength = options.targetLength ?? DEFAULT_TARGET_LENGTH;
  const wordCount = options.wordCount ?? DEFAULT_WORD_COUNT;

  switch (catalog.generationType) {
    case 'static':
      return catalog.staticText ? pickStaticVariant(catalog.staticText) : '';
    case 'random_chars':
      return generateRandomCharDrill(catalog.allowedChars, targetLength);
    case 'dictionary_words':
      return generateDictionaryDrill(catalog.allowedChars, locale, wordCount);
    default:
      return '';
  }
}

/** Longer stream for timed test mode. */
export function generateDynamicTestStream(
  catalog: LessonCatalogMeta,
  options: DynamicTextOptions & { minLength?: number } = {},
): string {
  const minLength = options.minLength ?? 200;
  const parts: string[] = [];
  let text = '';

  while (text.length < minLength) {
    const chunk = generateDynamicLessonText(catalog, {
      ...options,
      targetLength: 64,
      wordCount: 16,
    });
    if (!chunk) break;
    parts.push(chunk);
    text = parts.join(' ');
  }

  return text.slice(0, minLength + 32);
}
