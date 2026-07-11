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

/** Whether a single grapheme is a dead-key accent prefix (not a final letter). */
export function isDeadKeyPrefix(value: string): boolean {
  if (!value) return false;
  const graphemes = segmentInputGraphemes(value);
  if (graphemes.length !== 1) return false;
  const char = graphemes[0];
  if (DEAD_KEY_PREFIX_CHARS.has(char)) return true;
  return /\p{M}/u.test(char);
}

/** Whether the hidden-input buffer still holds a pending accent mark. */
export function containsDeadKeyPrefix(value: string): boolean {
  if (!value) return false;
  return segmentInputGraphemes(value).some((char) => isDeadKeyPrefix(char));
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

function isWordBoundaryChar(char: string): boolean {
  return char === ' ' || char === '\t' || char === '\n';
}

/** How many typed characters Option+Backspace should remove (macOS word-delete). */
export function getWordBackspaceCount(text: string): number {
  if (!text.length) return 0;

  let pos = text.length;

  while (pos > 0 && isWordBoundaryChar(text[pos - 1]!)) {
    pos--;
  }

  while (pos > 0 && !isWordBoundaryChar(text[pos - 1]!)) {
    pos--;
  }

  return text.length - pos;
}

/** Whether a keydown is Option/Ctrl + Backspace (word delete backward). */
export function isWordBackspaceKey(
  e: Pick<KeyboardEvent, 'key' | 'altKey' | 'ctrlKey' | 'metaKey'> & {
    getModifierState?: (key: string) => boolean;
  },
): boolean {
  if (e.key !== 'Backspace') return false;
  if (e.altKey || e.getModifierState?.('Alt')) return true;
  return e.ctrlKey && !e.metaKey;
}

/** Keys that start a dead-key / Option accent sequence (´ on QWERTY, Option on Dvorak). */
export function isDeadKeyActivationKey(e: Pick<KeyboardEvent, 'key' | 'altKey'>): boolean {
  if (e.key === 'Backspace' || e.key === 'Delete') {
    return false;
  }
  if (e.altKey || e.key === 'Alt' || e.key === 'AltGraph' || e.key === 'Option' || e.key === 'Dead') {
    return true;
  }
  return e.key.length === 1 && DEAD_KEY_PREFIX_CHARS.has(e.key);
}
