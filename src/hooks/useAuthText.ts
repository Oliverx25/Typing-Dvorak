import { getSettings } from '@/utils/app/settings';
import { getTranslations } from '@/i18n';

export function useAuthText() {
  return getTranslations(getSettings().locale).auth;
}
