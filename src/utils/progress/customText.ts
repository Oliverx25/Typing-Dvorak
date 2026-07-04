import { STORAGE_KEYS } from './keys';
import { readString, writeString } from './localStorage';

const MAX_LENGTH = 2000;

export function getCustomText(): string {
  return readString(STORAGE_KEYS.customText);
}

export function saveCustomText(text: string): void {
  writeString(STORAGE_KEYS.customText, text.slice(0, MAX_LENGTH));
}
