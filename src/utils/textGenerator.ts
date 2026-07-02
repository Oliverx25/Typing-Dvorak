import { BOTTOM_ROW, HOME_ROW, TOP_ROW } from './dvorak';

const CHARSETS: Record<string, string> = {
  home: HOME_ROW,
  top: TOP_ROW,
  bottom: BOTTOM_ROW,
  all: HOME_ROW + TOP_ROW + BOTTOM_ROW,
  punctuation: "' , . ; - / =",
  numbers: '0123456789',
};

function randomChar(chars: string): string {
  return chars[Math.floor(Math.random() * chars.length)];
}

/** Builds a drill string from a character set, grouped in chunks. */
export function generateDrillText(charSet: string, length = 48): string {
  const chars = CHARSETS[charSet] ?? charSet;
  const words: string[] = [];
  let built = 0;
  while (built < length) {
    const wordLen = 3 + Math.floor(Math.random() * 4);
    let word = '';
    for (let i = 0; i < wordLen && built + i < length; i++) {
      word += randomChar(chars);
    }
    words.push(word);
    built += word.length + 1;
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
