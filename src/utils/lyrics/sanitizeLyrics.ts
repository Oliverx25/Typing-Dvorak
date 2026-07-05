const META_LINE = /^\s*(?:\[[^\]]*]|\([^)]*\))\s*$/gm;
const INLINE_META = /\[[^\]]*]|\([^)]*\)/g;
const TRIPLE_NEWLINE = /\n{3,}/g;

/** Removes section tags, collapses whitespace, and caps word count for races. */
export function sanitizeLyrics(raw: string, maxWords = 200): string {
  let text = raw
    .replace(META_LINE, '')
    .replace(INLINE_META, '')
    .replace(/\r\n/g, '\n')
    .replace(TRIPLE_NEWLINE, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .trim();

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length > maxWords) {
    text = words.slice(0, maxWords).join(' ');
  }

  return text;
}
