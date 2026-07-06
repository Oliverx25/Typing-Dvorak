import { describe, expect, it } from 'vitest';
import { addDaysToDateString, collectPracticeDates, computeStreakFromPracticeDates } from '@/utils/progress/streak';

const TODAY = '2026-07-03';

describe('streak', () => {
  it('returns zero when there are no practice dates', () => {
    expect(computeStreakFromPracticeDates([], TODAY)).toEqual({
      streak: 0,
      lastPracticeDate: null,
    });
  });

  it('counts consecutive days ending today', () => {
    const dates = [
      TODAY,
      addDaysToDateString(TODAY, -1),
      addDaysToDateString(TODAY, -2),
    ];
    expect(computeStreakFromPracticeDates(dates, TODAY)).toEqual({
      streak: 3,
      lastPracticeDate: TODAY,
    });
  });

  it('keeps streak alive when last practice was yesterday', () => {
    const yesterday = addDaysToDateString(TODAY, -1);
    expect(computeStreakFromPracticeDates([yesterday, addDaysToDateString(TODAY, -2)], TODAY)).toEqual({
      streak: 2,
      lastPracticeDate: yesterday,
    });
  });

  it('resets streak when last practice was two or more days ago', () => {
    const twoDaysAgo = addDaysToDateString(TODAY, -2);
    expect(computeStreakFromPracticeDates([twoDaysAgo], TODAY)).toEqual({
      streak: 0,
      lastPracticeDate: twoDaysAgo,
    });
  });

  it('deduplicates multiple sessions on the same day', () => {
    expect(
      computeStreakFromPracticeDates(
        collectPracticeDates([
          `${TODAY}T08:00:00.000Z`,
          `${TODAY}T20:00:00.000Z`,
          `${addDaysToDateString(TODAY, -1)}T12:00:00.000Z`,
        ]),
        TODAY,
      ),
    ).toEqual({
      streak: 2,
      lastPracticeDate: TODAY,
    });
  });

  it('breaks streak on a gap day', () => {
    const yesterday = addDaysToDateString(TODAY, -1);
    const threeDaysAgo = addDaysToDateString(TODAY, -3);
    expect(computeStreakFromPracticeDates([TODAY, yesterday, threeDaysAgo], TODAY)).toEqual({
      streak: 2,
      lastPracticeDate: TODAY,
    });
  });
});
