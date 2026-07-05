/** Macron vowels from Hepburn romaji → plain ASCII for keyboard typing. */
const MACRON_MAP: Record<string, string> = {
  ā: 'a',
  ē: 'e',
  ī: 'i',
  ō: 'o',
  ū: 'u',
  Ā: 'A',
  Ē: 'E',
  Ī: 'I',
  Ō: 'O',
  Ū: 'U',
};

const MACRON_PATTERN = /[āēīōūĀĒĪŌŪ]/g;

/** Replaces long-vowel macrons with plain Latin letters (ō → o, ū → u, …). */
export function stripMacrons(text: string): string {
  return text.replace(MACRON_PATTERN, (char) => MACRON_MAP[char] ?? char);
}
