import { calculateGrade, bestGrade } from '../grading';
import { readJson, writeJson } from './localStorage';
import { STORAGE_KEYS } from './keys';

export interface SongProgressRecord {
  highestGrade: string;
  highestScore: number;
  maxWpm: number;
  bestAccuracy: number;
  lastPlayedAt: string;
}

type SongProgressMap = Record<string, SongProgressRecord>;

function readSongProgress(): SongProgressMap {
  return readJson(STORAGE_KEYS.songProgress, {} as SongProgressMap);
}

function writeSongProgress(map: SongProgressMap): void {
  writeJson(STORAGE_KEYS.songProgress, map);
}

export function getSongProgress(songId: number | string): SongProgressRecord | null {
  return readSongProgress()[String(songId)] ?? null;
}

export function saveSongProgress(
  songId: number | string,
  stats: { wpm: number; accuracy: number; score: number; totalMultiplier?: number },
): SongProgressRecord {
  const key = String(songId);
  const grade = calculateGrade(stats.accuracy, stats.totalMultiplier ?? 1);
  const existing = readSongProgress()[key];

  const record: SongProgressRecord = {
    highestGrade: bestGrade(existing?.highestGrade, grade) ?? grade,
    highestScore: Math.max(existing?.highestScore ?? 0, stats.score),
    maxWpm: Math.max(existing?.maxWpm ?? 0, stats.wpm),
    bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, stats.accuracy),
    lastPlayedAt: new Date().toISOString(),
  };

  writeSongProgress({ ...readSongProgress(), [key]: record });
  return record;
}

/** Merge stored grades/scores into API search results. */
export function mergeSongProgress<T extends { id: number; highestGrade?: string | null; highestScore?: number | null; maxWpm?: number | null }>(
  songs: T[],
): T[] {
  const progress = readSongProgress();
  return songs.map((song) => {
    const stored = progress[String(song.id)];
    if (!stored) return song;
    return {
      ...song,
      highestGrade: stored.highestGrade,
      highestScore: stored.highestScore,
      maxWpm: stored.maxWpm,
    };
  });
}
