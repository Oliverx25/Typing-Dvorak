/** Characters outside printable ASCII, Latin-1 supplement, and extended Latin (accents). */
const NON_TYPABLE_CHAR =
  /[^\x20-\x7E\xA1-\xFF\u0100-\u017F\u0218-\u021B]/g;

const LETTER = /[a-zA-Z\u00C0-\u024F]/g;

/**
 * Ratio of non-Latin / non-typable characters among all non-whitespace chars.
 * Returns 1 for empty input.
 */
export function nonLatinCharRatio(text: string): number {
  const chars = text.replace(/\s/g, '');
  if (!chars.length) return 1;
  const nonLatin = chars.match(NON_TYPABLE_CHAR);
  return (nonLatin?.length ?? 0) / chars.length;
}

/** True when lyrics are safe to type on a standard Western/Dvorak keyboard. */
export function isTypableLatinLyrics(text: string, maxRatio = 0.05): boolean {
  if (!text.trim()) return false;
  return nonLatinCharRatio(text) <= maxRatio;
}

/** True when a meaningful share of letters are Latin (for metadata titles). */
export function isMostlyLatinText(text: string, maxRatio = 0.15): boolean {
  const letters = text.match(LETTER)?.length ?? 0;
  const nonLatin = text.match(NON_TYPABLE_CHAR)?.length ?? 0;
  if (letters + nonLatin === 0) return true;
  return nonLatin / (letters + nonLatin) <= maxRatio;
}
