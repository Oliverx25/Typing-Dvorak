import { STORAGE_KEYS } from './keys';
import { readString, writeString } from './localStorage';

const MAX_LENGTH = 2000;

export function getCustomText(): string {
  return readString(STORAGE_KEYS.customText);
}

export function saveCustomText(text: string): void {
  writeString(STORAGE_KEYS.customText, text.slice(0, MAX_LENGTH));
}

/**
 * Normalizes raw file/pasted text for practice: unifies newlines, strips
 * carriage returns and non-printable control chars (keeps \n and \t),
 * collapses excess blank lines, and clamps to the max length.
 */
export function sanitizeCustomText(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .trimStart()
    .slice(0, MAX_LENGTH);
}

export const CUSTOM_TEXT_MAX_LENGTH = MAX_LENGTH;
