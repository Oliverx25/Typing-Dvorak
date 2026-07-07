import type { Lesson } from '@/utils/curriculum/lessons';
import {
  CHAPTER_META_BY_NUMBER,
  TITLE_KEY_BY_LESSON_ID,
  type LessonCatalogMeta,
  type LessonsCatalogRow,
  type RoadmapChapter,
} from '@/utils/curriculum/catalogTypes';
import { FALLBACK_CATALOG_ROWS } from '@/data/lessonsCatalogFallback';

export const CATALOG_UPDATED_EVENT = 'typing-dvorak-catalog-updated';

function parseDifficulty(value: string): 1 | 2 | 3 | 4 | 5 {
  const n = Number.parseInt(value, 10);
  if (n >= 1 && n <= 5) return n as 1 | 2 | 3 | 4 | 5;
  return 3;
}

function categoryForRow(row: LessonsCatalogRow): Lesson['category'] {
  if (row.chapter_id === 6 || row.id.startsWith('code_')) return 'symbols';
  if (row.chapter_id === 5 && row.id.includes('num')) return 'numbers';
  if (row.chapter_id === 4) return 'words';
  if (row.id === 'advanced_prose') return 'sentences';
  return 'drill';
}

function rowToCatalogMeta(row: LessonsCatalogRow): LessonCatalogMeta {
  return {
    generationType: row.generation_type,
    allowedChars: row.allowed_chars,
    staticText: row.static_text,
  };
}

export function catalogRowToLesson(row: LessonsCatalogRow): Lesson {
  const titleKey = TITLE_KEY_BY_LESSON_ID[row.id] ?? row.id;
  const catalog = rowToCatalogMeta(row);
  const usesGenerator = row.generation_type !== 'static';

  return {
    id: row.id,
    titleKey,
    descriptionKey: titleKey,
    category: categoryForRow(row),
    difficulty: parseDifficulty(row.difficulty),
    texts: row.static_text ? [row.static_text] : [`${row.allowed_chars}`],
    generated: usesGenerator,
    charSet: row.allowed_chars,
    catalog,
    catalogTitle: row.title,
    catalogDescription: row.description,
  };
}

export function buildChaptersFromRows(rows: LessonsCatalogRow[]): RoadmapChapter[] {
  const byChapter = new Map<number, LessonsCatalogRow[]>();

  for (const row of rows) {
    const list = byChapter.get(row.chapter_id) ?? [];
    list.push(row);
    byChapter.set(row.chapter_id, list);
  }

  return [...byChapter.entries()]
    .sort(([a], [b]) => a - b)
    .map(([chapterId, chapterRows]) => {
      const meta = CHAPTER_META_BY_NUMBER[chapterId];
      const sorted = [...chapterRows].sort((a, b) => a.order_index - b.order_index);
      return {
        id: meta?.id ?? `ch${chapterId}`,
        titleKey: meta?.titleKey ?? `ch${chapterId}`,
        descriptionKey: meta?.descriptionKey ?? `ch${chapterId}`,
        lessonIds: sorted.map((row) => row.id),
      };
    });
}

export function buildRoadmapLessonIds(chapters: RoadmapChapter[]): string[] {
  return chapters.flatMap((chapter) => chapter.lessonIds);
}

interface CatalogState {
  rows: LessonsCatalogRow[];
  lessons: Lesson[];
  chapters: RoadmapChapter[];
  roadmapLessonIds: string[];
  source: 'fallback' | 'supabase';
}

let state: CatalogState = hydrateFromRows(FALLBACK_CATALOG_ROWS, 'fallback');

function hydrateFromRows(rows: LessonsCatalogRow[], source: CatalogState['source']): CatalogState {
  const sorted = [...rows].sort((a, b) => {
    if (a.chapter_id !== b.chapter_id) return a.chapter_id - b.chapter_id;
    return a.order_index - b.order_index;
  });
  const lessons = sorted.map(catalogRowToLesson);
  const chapters = buildChaptersFromRows(sorted);
  return {
    rows: sorted,
    lessons,
    chapters,
    roadmapLessonIds: buildRoadmapLessonIds(chapters),
    source,
  };
}

function dispatchCatalogUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CATALOG_UPDATED_EVENT));
  }
}

export function hydrateLessonsCatalog(rows: LessonsCatalogRow[], source: CatalogState['source'] = 'supabase'): void {
  state = hydrateFromRows(rows, source);
  dispatchCatalogUpdated();
}

export function getCatalogRows(): LessonsCatalogRow[] {
  return state.rows;
}

export function getCatalogLessons(): Lesson[] {
  return state.lessons;
}

export function getCatalogChapters(): RoadmapChapter[] {
  return state.chapters;
}

export function getCatalogRoadmapLessonIds(): string[] {
  return state.roadmapLessonIds;
}

export function getCatalogLessonById(id: string): Lesson | undefined {
  return state.lessons.find((lesson) => lesson.id === id);
}

export function isCatalogLessonId(id: string): boolean {
  return state.rows.some((row) => row.id === id);
}

export function getCatalogSource(): CatalogState['source'] {
  return state.source;
}

export function findCatalogRow(id: string): LessonsCatalogRow | undefined {
  return state.rows.find((row) => row.id === id);
}
