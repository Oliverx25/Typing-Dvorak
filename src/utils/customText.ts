const CUSTOM_TEXT_KEY = 'typing-dvorak-custom-text';
const MAX_LENGTH = 2000;

export function getCustomText(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(CUSTOM_TEXT_KEY) ?? '';
}

export function saveCustomText(text: string): void {
  localStorage.setItem(CUSTOM_TEXT_KEY, text.slice(0, MAX_LENGTH));
}
