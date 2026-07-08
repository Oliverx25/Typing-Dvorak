import type { Locale } from '@/i18n';
import { getTranslations } from '@/i18n';
import { TITLE_KEY_BY_LESSON_ID } from '@/utils/curriculum/catalogTypes';
import { getLessonById } from '@/utils/curriculum/lessons';

/** Resolve lesson title from ID — prefers i18n, falls back to catalog title from Supabase. */
export function getLessonTitleById(lessonId: string, locale: Locale): string {
  const lesson = getLessonById(lessonId);
  if (!lesson) return lessonId;

  const titleKey = TITLE_KEY_BY_LESSON_ID[lessonId] ?? lesson.titleKey;
  const meta = getTranslations(locale).microLessonMeta[
    titleKey as keyof ReturnType<typeof getTranslations>['microLessonMeta']
  ];
  if (meta?.title) return meta.title;
  if (lesson.catalogTitle) return lesson.catalogTitle;
  return titleKey;
}

/** Resolve lesson description from ID. */
export function getLessonDescriptionById(lessonId: string, locale: Locale): string {
  const lesson = getLessonById(lessonId);
  if (!lesson) return '';

  const titleKey = TITLE_KEY_BY_LESSON_ID[lessonId] ?? lesson.titleKey;
  const meta = getTranslations(locale).microLessonMeta[
    titleKey as keyof ReturnType<typeof getTranslations>['microLessonMeta']
  ];
  if (meta?.description) return meta.description;
  if (lesson.catalogDescription) return lesson.catalogDescription;
  return '';
}

/** Resolve chapter title from chapter titleKey. */
export function getChapterTitleByKey(titleKey: string, locale: Locale): string {
  const meta = getTranslations(locale).chapterMeta[
    titleKey as keyof ReturnType<typeof getTranslations>['chapterMeta']
  ];
  return meta?.title ?? titleKey;
}

/** Resolve chapter description from chapter titleKey. */
export function getChapterDescriptionByKey(titleKey: string, locale: Locale): string {
  const meta = getTranslations(locale).chapterMeta[
    titleKey as keyof ReturnType<typeof getTranslations>['chapterMeta']
  ];
  return meta?.description ?? '';
}
