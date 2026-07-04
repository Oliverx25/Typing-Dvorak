export interface StreakResult {
  streak: number;
  lastPracticeDate: string | null;
}

/** Local calendar date `YYYY-MM-DD` (avoids UTC drift near midnight). */
export function toLocalPracticeDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y!, m! - 1, d);
  date.setDate(date.getDate() + days);
  return toLocalPracticeDate(date);
}

/** Unique local practice dates, most recent first. */
export function collectPracticeDates(timestamps: Iterable<string | Date>): string[] {
  const set = new Set<string>();
  for (const ts of timestamps) {
    set.add(toLocalPracticeDate(ts));
  }
  return [...set].sort((a, b) => b.localeCompare(a));
}

/**
 * Consecutive practice days ending on the latest session.
 * Streak stays active only if the last practice was today or yesterday (local time).
 */
export function computeStreakFromPracticeDates(
  practiceDates: string[],
  referenceDate?: string,
): StreakResult {
  if (practiceDates.length === 0) {
    return { streak: 0, lastPracticeDate: null };
  }

  const unique = [...new Set(practiceDates)].sort((a, b) => b.localeCompare(a));
  const lastPracticeDate = unique[0]!;
  const today = referenceDate ?? toLocalPracticeDate(new Date());
  const yesterday = addDaysToDateString(today, -1);

  if (lastPracticeDate !== today && lastPracticeDate !== yesterday) {
    return { streak: 0, lastPracticeDate };
  }

  const dateSet = new Set(unique);
  const anchor = lastPracticeDate === today ? today : yesterday;
  let streak = 0;
  let cursor = anchor;

  while (dateSet.has(cursor)) {
    streak++;
    cursor = addDaysToDateString(cursor, -1);
  }

  return { streak, lastPracticeDate };
}
