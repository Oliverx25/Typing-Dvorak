/** Runs an async task without throwing — logs and returns fallback on failure. */
export async function safeAsync<T>(
  label: string,
  task: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await task();
  } catch (error) {
    console.warn(`[network] ${label} failed:`, error);
    return fallback;
  }
}

/** Fire-and-forget variant for background sync. */
export function safeAsyncVoid(label: string, task: () => Promise<void>): void {
  void safeAsync(label, task, undefined);
}
