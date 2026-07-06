import {
  sanitizeUserText,
  stripControlCharacters,
  stripHtmlTags,
  stripInvisibleUnicode,
} from '@/utils/security/sanitizeText';

export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 50;
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 24;
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

export type ProfileFieldError =
  | 'displayNameRequired'
  | 'displayNameTooShort'
  | 'displayNameTooLong'
  | 'usernameTooShort'
  | 'usernameTooLong'
  | 'usernameInvalid'
  | 'usernameTaken';

/** Strips HTML/control chars and normalizes whitespace for display names. */
export function normalizeDisplayName(name: string): string {
  return sanitizeUserText(name, DISPLAY_NAME_MAX);
}

export function validateDisplayName(name: string): ProfileFieldError | null {
  const trimmed = normalizeDisplayName(name);
  if (!trimmed) return 'displayNameRequired';
  if (trimmed.length < DISPLAY_NAME_MIN) return 'displayNameTooShort';
  if (trimmed.length > DISPLAY_NAME_MAX) return 'displayNameTooLong';
  return null;
}

export function normalizeUsername(username: string): string {
  let text = stripHtmlTags(username);
  text = stripControlCharacters(text);
  text = stripInvisibleUnicode(text);
  return text.trim().slice(0, USERNAME_MAX);
}

export function validateUsername(username: string): ProfileFieldError | null {
  const trimmed = normalizeUsername(username);
  if (!trimmed) return null;
  if (trimmed.length < USERNAME_MIN) return 'usernameTooShort';
  if (trimmed.length > USERNAME_MAX) return 'usernameTooLong';
  if (!USERNAME_PATTERN.test(trimmed)) return 'usernameInvalid';
  return null;
}
