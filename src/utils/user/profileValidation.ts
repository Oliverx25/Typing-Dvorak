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

export function validateDisplayName(name: string): ProfileFieldError | null {
  const trimmed = name.trim();
  if (!trimmed) return 'displayNameRequired';
  if (trimmed.length < DISPLAY_NAME_MIN) return 'displayNameTooShort';
  if (trimmed.length > DISPLAY_NAME_MAX) return 'displayNameTooLong';
  return null;
}

export function validateUsername(username: string): ProfileFieldError | null {
  const trimmed = username.trim();
  if (!trimmed) return null;
  if (trimmed.length < USERNAME_MIN) return 'usernameTooShort';
  if (trimmed.length > USERNAME_MAX) return 'usernameTooLong';
  if (!USERNAME_PATTERN.test(trimmed)) return 'usernameInvalid';
  return null;
}
