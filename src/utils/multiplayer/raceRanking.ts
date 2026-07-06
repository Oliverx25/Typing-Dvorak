import type { RaceParticipantProgress } from '@/types/multiplayer';
import type { VictoryCondition } from './roomConfig.types';
import { getPrimaryVictoryCondition } from './roomConfig';

export function compareRaceParticipants(
  a: RaceParticipantProgress,
  b: RaceParticipantProgress,
  primaryVictory: VictoryCondition,
): number {
  if (a.finished !== b.finished) return a.finished ? -1 : 1;

  switch (primaryVictory) {
    case 'max_score':
      return b.score - a.score || b.wpm - a.wpm;
    case 'highest_wpm':
      return b.wpm - a.wpm || b.percentage - a.percentage;
    case 'first_finish':
    default:
      return b.percentage - a.percentage || b.wpm - a.wpm;
  }
}

export function rankParticipant(
  entries: RaceParticipantProgress[],
  userId: string,
  override: Partial<RaceParticipantProgress>,
  winCondition: VictoryCondition,
): number {
  const primaryVictory = getPrimaryVictoryCondition(winCondition);
  const merged = entries.map((entry) =>
    entry.userId === userId ? { ...entry, ...override } : entry,
  );
  merged.sort((a, b) => compareRaceParticipants(a, b, primaryVictory));
  const index = merged.findIndex((entry) => entry.userId === userId);
  return index >= 0 ? index + 1 : entries.length;
}

export function computeWinMarginSeconds(
  leaderboard: RaceParticipantProgress[],
): number | undefined {
  if (leaderboard.length < 2) return undefined;
  const first = leaderboard[0];
  const second = leaderboard[1];
  if (!first.finished || !second.finished) return undefined;
  return Math.abs(first.updatedAt - second.updatedAt) / 1000;
}

export function computeWpmGapToSecond(
  leaderboard: RaceParticipantProgress[],
  won: boolean,
): number | undefined {
  if (!won || leaderboard.length < 2) return undefined;
  return leaderboard[0].wpm - leaderboard[1].wpm;
}
