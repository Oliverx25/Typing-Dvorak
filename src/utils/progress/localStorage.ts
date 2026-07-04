export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function readString(key: string, fallback = ''): string {
  if (typeof window === 'undefined') return fallback;
  return localStorage.getItem(key) ?? fallback;
}

export function writeString(key: string, value: string): void {
  localStorage.setItem(key, value);
}

export function removeKeys(keys: readonly string[]): void {
  if (typeof window === 'undefined') return;
  for (const key of keys) {
    localStorage.removeItem(key);
  }
}
