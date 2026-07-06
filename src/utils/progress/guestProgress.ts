import { GUEST_PROGRESS_KEYS } from '@/utils/progress/keys';
import { removeKeys } from '@/utils/progress/localStorage';

/** Clear localStorage keys tied to a user session — on login/logout to avoid cross-account bleed. */
export function clearGuestProgress(): void {
  removeKeys(GUEST_PROGRESS_KEYS);
}
