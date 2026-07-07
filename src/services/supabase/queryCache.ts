const DEFAULT_TTL_MS = 5 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  userId: string;
}

const store = new Map<string, CacheEntry<unknown>>();

export const QUERY_CACHE_KEYS = {
  profile: 'profile',
  keyErrors: 'key_errors',
  lessonMastery: 'lesson_mastery',
  sessionTimestamps: 'session_timestamps',
  sessionSummaries: 'session_summaries',
  achievements: 'achievements',
  sessions: (limit: number) => `sessions:${limit}`,
  room: (code: string) => `room:${code}`,
} as const;

export function getCachedQuery<T>(key: string, userId: string | null): T | null {
  if (!userId) return null;

  const entry = store.get(key);
  if (!entry || entry.userId !== userId || Date.now() > entry.expiresAt) {
    if (entry) store.delete(key);
    return null;
  }

  return entry.data as T;
}

export function setCachedQuery<T>(
  key: string,
  userId: string,
  data: T,
  ttlMs = DEFAULT_TTL_MS,
): void {
  store.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
    userId,
  });
}

/** Drop cached reads — call on sign-out or after mutations that change cloud data. */
export function invalidateQueryCache(userId?: string, keyPrefix?: string): void {
  for (const [key, entry] of store) {
    if (userId && entry.userId !== userId) continue;
    if (keyPrefix && !key.startsWith(keyPrefix)) continue;
    store.delete(key);
  }
}

export function invalidateUserProgressCache(userId: string): void {
  invalidateQueryCache(userId, 'sessions');
  invalidateQueryCache(userId, QUERY_CACHE_KEYS.keyErrors);
  invalidateQueryCache(userId, QUERY_CACHE_KEYS.lessonMastery);
  invalidateQueryCache(userId, QUERY_CACHE_KEYS.sessionTimestamps);
  invalidateQueryCache(userId, QUERY_CACHE_KEYS.sessionSummaries);
  invalidateQueryCache(userId, QUERY_CACHE_KEYS.achievements);
  invalidateQueryCache(userId, QUERY_CACHE_KEYS.profile);
}
