import { STORAGE_KEYS } from '@/utils/progress/keys';
import { readString, writeString } from '@/utils/progress/localStorage';
import { sanitizeTypableText } from '@/utils/security/sanitizeText';

const MAX_LENGTH = 2000;

export function getCustomText(): string {
  return sanitizeTypableText(readString(STORAGE_KEYS.customText), MAX_LENGTH);
}

export function saveCustomText(text: string): void {
  writeString(STORAGE_KEYS.customText, sanitizeCustomText(text));
}

/**
 * Normalizes raw file/pasted text for practice: strips HTML, control chars,
 * unifies newlines, collapses excess blank lines, and clamps to the max length.
 */
export function sanitizeCustomText(raw: string): string {
  return sanitizeTypableText(raw, MAX_LENGTH)
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .trimStart();
}

export const CUSTOM_TEXT_MAX_LENGTH = MAX_LENGTH;
