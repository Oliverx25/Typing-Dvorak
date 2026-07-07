import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { LessonsCatalogRow } from '@/utils/curriculum/catalogTypes';
import { FALLBACK_CATALOG_ROWS } from '@/data/lessonsCatalogFallback';
import { hydrateLessonsCatalog } from '@/utils/curriculum/catalogStore';

const CATALOG_CACHE_KEY = 'lessons_catalog';
const CATALOG_TTL_MS = 10 * 60 * 1000;
const PUBLIC_CACHE_USER = '__public__';

interface GlobalCacheEntry<T> {
  data: T;
  expiresAt: number;
}

const globalCache = new Map<string, GlobalCacheEntry<unknown>>();

function getGlobalCached<T>(key: string): T | null {
  const entry = globalCache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    if (entry) globalCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setGlobalCached<T>(key: string, data: T, ttlMs = CATALOG_TTL_MS): void {
  globalCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function invalidateLessonsCatalogCache(): void {
  globalCache.delete(CATALOG_CACHE_KEY);
}

function mapRow(row: Record<string, unknown>): LessonsCatalogRow {
  return {
    id: String(row.id),
    chapter_id: Number(row.chapter_id),
    title: String(row.title),
    description: String(row.description ?? ''),
    difficulty: String(row.difficulty ?? '1'),
    generation_type: row.generation_type as LessonsCatalogRow['generation_type'],
    allowed_chars: String(row.allowed_chars ?? ''),
    static_text: row.static_text != null ? String(row.static_text) : null,
    order_index: Number(row.order_index ?? 0),
  };
}

/** Fetch lessons catalog from Supabase; falls back to embedded seed on error. */
export async function fetchLessonsCatalog(): Promise<{
  rows: LessonsCatalogRow[];
  source: 'supabase' | 'fallback';
}> {
  const cached = getGlobalCached<LessonsCatalogRow[]>(CATALOG_CACHE_KEY);
  if (cached) {
    return { rows: cached, source: 'supabase' };
  }

  if (!isSupabaseConfigured()) {
    return { rows: FALLBACK_CATALOG_ROWS, source: 'fallback' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { rows: FALLBACK_CATALOG_ROWS, source: 'fallback' };
  }

  try {
    const { data, error } = await supabase
      .from('lessons_catalog')
      .select('*')
      .order('chapter_id', { ascending: true })
      .order('order_index', { ascending: true });

    if (error || !data?.length) {
      console.warn('[catalog] fetch failed, using fallback:', error?.message);
      return { rows: FALLBACK_CATALOG_ROWS, source: 'fallback' };
    }

    const rows = data.map(mapRow);
    setGlobalCached(CATALOG_CACHE_KEY, rows);
    void PUBLIC_CACHE_USER;
    return { rows, source: 'supabase' };
  } catch (error) {
    console.warn('[catalog] fetch error, using fallback:', error);
    return { rows: FALLBACK_CATALOG_ROWS, source: 'fallback' };
  }
}

/** Load catalog into the in-memory store (idempotent). */
export async function loadLessonsCatalogIntoStore(): Promise<void> {
  const { rows, source } = await fetchLessonsCatalog();
  hydrateLessonsCatalog(rows, source);
}
