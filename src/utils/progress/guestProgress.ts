import { GUEST_PROGRESS_KEYS } from './keys';
import { removeKeys } from './localStorage';

/** Clear localStorage keys tied to a user session — on login/logout to avoid cross-account bleed. */
export function clearGuestProgress(): void {
  removeKeys(GUEST_PROGRESS_KEYS);
}
