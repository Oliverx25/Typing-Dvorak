import { sanitizeTypableText } from '@/utils/security/sanitizeText';

const META_LINE = /^\s*(?:\[[^\]]*]|\([^)]*\))\s*$/gm;
const INLINE_META = /\[[^\]]*]|\([^)]*\)/g;
const TRIPLE_NEWLINE = /\n{3,}/g;

/**
 * Removes section tags and normalizes whitespace while STRICTLY preserving
 * line breaks so the typing engine forces an Enter at the end of each verse.
 * Pass `maxWords` to truncate (e.g. list previews); omit to keep full lyrics.
 */
export function sanitizeLyrics(raw: string, maxWords?: number): string {
  let text = sanitizeTypableText(raw)
    .replace(META_LINE, '')
    .replace(INLINE_META, '')
    .replace(TRIPLE_NEWLINE, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '')
    .trim();

  if (maxWords && maxWords > 0) {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length > maxWords) {
      text = words.slice(0, maxWords).join(' ');
    }
  }

  return text;
}
