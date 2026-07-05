import { STORAGE_KEYS } from '../progress/keys';
import { readJson, writeJson } from '../progress/localStorage';

/** One recorded sample: correct char index reached at time offset (ms) from start. */
export interface ReplaySample {
  i: number;
  t: number;
}

export type ReplayData = ReplaySample[];

/** Local map of best-run replays keyed by lessonId. */
type GhostStore = Record<string, { wpm: number; replay: ReplayData }>;

const MAX_SAMPLES = 2000;

/** Downsamples to keep payloads small while preserving timing shape. */
export function compactReplay(samples: ReplayData): ReplayData {
  if (samples.length <= MAX_SAMPLES) return samples;
  const step = Math.ceil(samples.length / MAX_SAMPLES);
  const out: ReplayData = [];
  for (let idx = 0; idx < samples.length; idx += step) {
    out.push(samples[idx]);
  }
  const last = samples[samples.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

/** Returns the char index the ghost has reached at a given elapsed time. */
export function ghostIndexAt(samples: ReplayData, elapsedMs: number): number {
  if (samples.length === 0) return 0;
  let lo = 0;
  let hi = samples.length - 1;
  if (elapsedMs <= samples[0].t) return samples[0].i;
  if (elapsedMs >= samples[hi].t) return samples[hi].i;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (samples[mid].t <= elapsedMs) lo = mid;
    else hi = mid - 1;
  }
  return samples[lo].i;
}

export function getGhostStore(): GhostStore {
  return readJson(STORAGE_KEYS.ghostReplays, {} as GhostStore);
}

export function getGhostReplay(lessonId: string): { wpm: number; replay: ReplayData } | null {
  return getGhostStore()[lessonId] ?? null;
}

/** Persists a replay locally only if it beats the stored WPM for the lesson. */
export function saveGhostReplayIfBest(lessonId: string, wpm: number, replay: ReplayData): boolean {
  const store = getGhostStore();
  const existing = store[lessonId];
  if (existing && existing.wpm >= wpm) return false;
  store[lessonId] = { wpm, replay: compactReplay(replay) };
  writeJson(STORAGE_KEYS.ghostReplays, store);
  return true;
}
