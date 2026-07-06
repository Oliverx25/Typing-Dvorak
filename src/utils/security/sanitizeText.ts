/** Strips dangerous HTML blocks and any remaining tags — plain text only. */
const DANGEROUS_HTML_BLOCKS =
  /<(?:script|style|iframe|object|embed|link|meta|svg|math)\b[^>]*>[\s\S]*?<\/(?:script|style|iframe|object|embed|svg|math)>/gi;
const HTML_TAG = /<[^>]*>/g;

/** Zero-width and bidi override characters (split patterns for ESLint). */
const ZERO_WIDTH_CHARS = /[\u200B-\u200F\uFEFF\u00AD]/g;
const BIDI_OVERRIDE_CHARS = /[\u202A-\u202E]/g;
const OTHER_INVISIBLE_CHARS = /[\u2060-\u206F\u061C\u180E]/g;
const COMBINING_GRAPHEME_JOINER = /\u034F/g;

interface StripControlOptions {
  keepNewlines?: boolean;
  keepTabs?: boolean;
}

/**
 * Removes HTML tags and script-like blocks. Does not decode entities — output stays
 * safe for React text nodes and the typing engine.
 */
export function stripHtmlTags(raw: string): string {
  return raw.replace(DANGEROUS_HTML_BLOCKS, '').replace(HTML_TAG, '');
}

/** Removes ASCII control chars and invisible Unicode (optionally keeps \\n / \\t). */
export function stripControlCharacters(
  raw: string,
  { keepNewlines = false, keepTabs = false }: StripControlOptions = {},
): string {
  if (keepNewlines && keepTabs) {
    // eslint-disable-next-line no-control-regex
    return raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  }
  if (keepNewlines) {
    // eslint-disable-next-line no-control-regex
    return raw.replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g, '');
  }
  // eslint-disable-next-line no-control-regex
  return raw.replace(/[\u0000-\u001F\u007F]/g, '');
}

export function stripInvisibleUnicode(raw: string): string {
  return raw
    .replace(ZERO_WIDTH_CHARS, '')
    .replace(BIDI_OVERRIDE_CHARS, '')
    .replace(OTHER_INVISIBLE_CHARS, '')
    .replace(COMBINING_GRAPHEME_JOINER, '');
}

/**
 * Sanitizes free-form text destined for the typing engine (custom practice, race text, lyrics).
 * Preserves line breaks and tabs; strips HTML, control chars, and invisible Unicode.
 */
export function sanitizeTypableText(raw: string, maxLength?: number): string {
  let text = stripHtmlTags(raw);
  text = stripControlCharacters(text, { keepNewlines: true, keepTabs: true });
  text = stripInvisibleUnicode(text);
  text = text.replace(/\r\n?/g, '\n');
  if (maxLength !== undefined && maxLength > 0) {
    text = text.slice(0, maxLength);
  }
  return text;
}

/**
 * Sanitizes short user-facing strings (display names, search queries) before persistence.
 * Collapses whitespace to a single line.
 */
export function sanitizeUserText(raw: string, maxLength?: number): string {
  let text = stripHtmlTags(raw);
  text = stripControlCharacters(text, { keepNewlines: false, keepTabs: false });
  text = stripInvisibleUnicode(text);
  text = text.replace(/\s+/g, ' ').trim();
  if (maxLength !== undefined && maxLength > 0) {
    text = text.slice(0, maxLength);
  }
  return text;
}

/** Normalizes lyric-search and API query strings. */
export function sanitizeSearchQuery(raw: string, maxLength = 200): string {
  return sanitizeUserText(raw, maxLength);
}
