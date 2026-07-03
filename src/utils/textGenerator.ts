import { BOTTOM_ROW, HOME_ROW, TOP_ROW } from './dvorak';

const CHARSETS: Record<string, string> = {
  home: HOME_ROW,
  top: TOP_ROW,
  bottom: BOTTOM_ROW,
  all: HOME_ROW + TOP_ROW + BOTTOM_ROW,
  punctuation: "'.,;-/=",
  numbers: '0123456789',
};

function drillChars(charSet: string): string {
  const raw = CHARSETS[charSet] ?? charSet;
  // Never pick space randomly — spaces only appear as word separators
  return raw.replace(/\s/g, '');
}

function randomChar(chars: string): string {
  return chars[Math.floor(Math.random() * chars.length)];
}

/** Builds a drill string from a character set, grouped in word chunks separated by single spaces. */
export function generateDrillText(charSet: string, length = 48): string {
  const chars = drillChars(charSet);
  if (!chars.length) return '';

  const words: string[] = [];
  let total = 0;

  while (total < length) {
    const wordLen = Math.min(3 + Math.floor(Math.random() * 4), length - total);
    if (wordLen <= 0) break;

    let word = '';
    for (let i = 0; i < wordLen; i++) {
      word += randomChar(chars);
    }
    words.push(word);
    total += word.length + (total + word.length < length ? 1 : 0);
  }

  return words.join(' ').slice(0, length);
}

/** Generates continuous text for timed test mode. */
export function generateTestStream(charSet: string, minLength = 200): string {
  return generateDrillText(charSet, minLength);
}

export function getLessonCharSet(lessonId: string): string {
  const map: Record<string, string> = {
    'home-row': 'home',
    'top-row': 'top',
    'bottom-row': 'bottom',
    'punctuation': 'punctuation',
    'numbers': 'numbers',
    'all-rows': 'all',
    'common-words': 'all',
    'sentences': 'all',
    'advanced': 'all',
  };
  return map[lessonId] ?? 'all';
}
