import { en, type TranslationKey } from '@/i18n/en';
import { es } from '@/i18n/es';

export type Locale = 'en' | 'es';

const translations: Record<Locale, TranslationKey> = { en, es };

export function getTranslations(locale: Locale): TranslationKey {
  return translations[locale] ?? en;
}

export function t(
  locale: Locale,
  path: string,
  params?: Record<string, string | number>,
): string {
  const keys = path.split('.');
  let value: unknown = getTranslations(locale);
  for (const key of keys) {
    value = (value as Record<string, unknown>)?.[key];
  }
  if (typeof value !== 'string') return path;
  if (!params) return value;
  return Object.entries(params).reduce(
    (str, [k, v]) => str.replace(`{${k}}`, String(v)),
    value,
  );
}

export { en, es };
export type { TranslationKey };
