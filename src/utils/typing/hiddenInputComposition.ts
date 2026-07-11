/** Known dead-key prefix glyphs (macOS / Windows) before the final composed letter. */
const DEAD_KEY_PREFIX_CHARS = new Set(['´', '^', '¨', '~', '`', "'"]);

/** Split user input into user-perceived grapheme clusters. */
export function segmentInputGraphemes(text: string): string[] {
  if (!text) return [];
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return [...segmenter.segment(text)].map((part) => part.segment);
  }
  return [...text.normalize('NFC')];
}

/** Whether the input value is only a dead-key accent prefix (not a final letter). */
export function isDeadKeyPrefix(value: string): boolean {
  if (!value) return false;
  const graphemes = segmentInputGraphemes(value);
  if (graphemes.length !== 1) return false;
  const char = graphemes[0];
  if (DEAD_KEY_PREFIX_CHARS.has(char)) return true;
  return /\p{M}/u.test(char);
}

/** Whether an input event is an echo of a character already committed via compositionEnd. */
export function isDuplicateCompositionEcho(value: string, committed: string): boolean {
  if (!committed) return false;
  const normalizedValue = value.normalize('NFC');
  const normalizedCommitted = committed.normalize('NFC');
  return normalizedValue === normalizedCommitted;
}

/** Returns remaining text after a committed dead-key prefix, or null if value is only the echo. */
export function stripCommittedPrefix(value: string, committed: string): string | null {
  if (!value) return null;
  if (isDuplicateCompositionEcho(value, committed)) return null;

  const valueGraphemes = segmentInputGraphemes(value);
  const committedGraphemes = segmentInputGraphemes(committed);
  const prefixMatches = committedGraphemes.every((g, i) => valueGraphemes[i] === g);
  if (!prefixMatches || valueGraphemes.length <= committedGraphemes.length) return value;

  return valueGraphemes.slice(committedGraphemes.length).join('');
}

/** Keys that start a dead-key / Option accent sequence (´ on QWERTY, Option on Dvorak). */
export function isDeadKeyActivationKey(e: Pick<KeyboardEvent, 'key' | 'altKey'>): boolean {
  if (e.altKey || e.key === 'Alt' || e.key === 'AltGraph' || e.key === 'Option' || e.key === 'Dead') {
    return true;
  }
  return e.key.length === 1 && DEAD_KEY_PREFIX_CHARS.has(e.key);
}
