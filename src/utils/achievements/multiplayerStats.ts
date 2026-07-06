import { readJson, writeJson } from '../progress/localStorage';
import { STORAGE_KEYS } from '../progress/keys';

export interface MultiplayerStats {
  matches: number;
  wins: number;
  winStreak: number;
}

const EMPTY: MultiplayerStats = { matches: 0, wins: 0, winStreak: 0 };

export function getMultiplayerStats(): MultiplayerStats {
  return readJson(STORAGE_KEYS.multiplayerStats, EMPTY);
}

function saveMultiplayerStats(stats: MultiplayerStats): MultiplayerStats {
  writeJson(STORAGE_KEYS.multiplayerStats, stats);
  return stats;
}

/** Record a completed multiplayer race; optionally counts as a win (1st place). */
export function recordMultiplayerMatch(won: boolean): MultiplayerStats {
  const current = getMultiplayerStats();
  const next: MultiplayerStats = {
    matches: current.matches + 1,
    wins: current.wins + (won ? 1 : 0),
    winStreak: won ? current.winStreak + 1 : 0,
  };
  return saveMultiplayerStats(next);
}

export function replaceMultiplayerStats(stats: MultiplayerStats): void {
  saveMultiplayerStats(stats);
}
