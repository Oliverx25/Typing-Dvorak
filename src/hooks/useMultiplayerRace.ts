import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type {
  LobbyPlayerPresence,
  RaceParticipantProgress,
  RaceProgressPayload,
} from '@/types/multiplayer';
import { calculateMaxScore } from '@/utils/multiplayer/raceScoring';
import {
  getPrimaryVictoryCondition,
  type WinCondition,
} from '@/utils/multiplayer/roomConfig';

export interface LocalRaceProgress {
  wpm: number;
  percentage: number;
  accuracy: number;
  maxCombo: number;
  score: number;
  finished: boolean;
}

interface UseMultiplayerRaceOptions {
  channel: RealtimeChannel | null;
  progressHandlerRef: RefObject<((payload: unknown) => void) | null>;
  currentUserId: string | null;
  players: LobbyPlayerPresence[];
  localProgress: LocalRaceProgress;
  winConditions: WinCondition[];
  enabled?: boolean;
}

function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function normalizeProgressPayload(
  progress: Partial<RaceProgressPayload>,
): RaceProgressPayload {
  const wpm = Math.max(0, Math.round(progress.wpm ?? 0));
  const percentage = clampPercentage(progress.percentage ?? 0);
  const accuracy = Math.min(100, Math.max(0, progress.accuracy ?? 100));
  const maxCombo = Math.max(0, progress.maxCombo ?? 0);
  const score =
    progress.score ??
    calculateMaxScore(wpm, accuracy, maxCombo);

  return {
    userId: progress.userId!,
    wpm,
    percentage,
    accuracy,
    maxCombo,
    score,
    updatedAt: progress.updatedAt ?? Date.now(),
    finished: Boolean(progress.finished),
  };
}

function compareParticipants(
  a: RaceParticipantProgress,
  b: RaceParticipantProgress,
  primaryVictory: WinCondition,
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

export function useMultiplayerRace({
  channel,
  progressHandlerRef,
  currentUserId,
  players,
  localProgress,
  winConditions,
  enabled = true,
}: UseMultiplayerRaceOptions) {
  const [remoteProgress, setRemoteProgress] = useState<RaceParticipantProgress[]>([]);
  const progressMapRef = useRef(new Map<string, RaceProgressPayload>());
  const animationFrameRef = useRef<number | null>(null);
  const lastBroadcastAtRef = useRef(0);

  const primaryVictory = useMemo(
    () => getPrimaryVictoryCondition(winConditions),
    [winConditions],
  );

  const playerById = useMemo(() => {
    return new Map(players.map((player) => [player.userId, player]));
  }, [players]);

  const flushProgress = useCallback(() => {
    animationFrameRef.current = null;
    const next: RaceParticipantProgress[] = [];

    for (const progress of progressMapRef.current.values()) {
      const player = playerById.get(progress.userId);
      if (!player) continue;

      next.push({
        ...progress,
        name: player.name,
        avatarUrl: player.avatarUrl,
        initials: player.initials,
        avatarSource: player.avatarSource,
      });
    }

    next.sort((a, b) => compareParticipants(a, b, primaryVictory));
    setRemoteProgress(next);
  }, [playerById, primaryVictory]);

  const scheduleFlush = useCallback(() => {
    if (animationFrameRef.current !== null) return;
    animationFrameRef.current = window.requestAnimationFrame(flushProgress);
  }, [flushProgress]);

  const scheduleFlushRef = useRef(scheduleFlush);
  scheduleFlushRef.current = scheduleFlush;

  const currentUserIdRef = useRef(currentUserId);
  currentUserIdRef.current = currentUserId;

  useEffect(() => {
    if (!enabled) {
      progressHandlerRef.current = null;
      return;
    }

    progressHandlerRef.current = (payload) => {
      const progress = payload as Partial<RaceProgressPayload>;
      if (!progress.userId || progress.userId === currentUserIdRef.current) return;

      progressMapRef.current.set(
        progress.userId,
        normalizeProgressPayload(progress),
      );
      scheduleFlushRef.current();
    };

    return () => {
      progressHandlerRef.current = null;
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      progressMapRef.current.clear();
      setRemoteProgress([]);
    };
  }, [enabled, progressHandlerRef]);

  useEffect(() => {
    scheduleFlush();
  }, [players, scheduleFlush]);

  const broadcastProgress = useCallback(
    async (
      wpm: number,
      percentage: number,
      accuracy: number,
      maxCombo: number,
      score: number,
      finished = false,
      force = false,
    ) => {
      if (!channel || !currentUserId || !enabled) return;

      const now = Date.now();
      if (!force && !finished && now - lastBroadcastAtRef.current < 500) return;
      lastBroadcastAtRef.current = now;

      await channel.send({
        type: 'broadcast',
        event: 'progress',
        payload: {
          userId: currentUserId,
          wpm: Math.max(0, Math.round(wpm)),
          percentage: clampPercentage(percentage),
          accuracy: Math.min(100, Math.max(0, accuracy)),
          maxCombo: Math.max(0, maxCombo),
          score,
          updatedAt: now,
          finished,
        } satisfies RaceProgressPayload,
      });
    },
    [channel, currentUserId, enabled],
  );

  const leaderboard = useMemo(() => {
    const entries: RaceParticipantProgress[] = [];

    if (currentUserId) {
      const self = playerById.get(currentUserId);
      if (self) {
        entries.push({
          userId: currentUserId,
          wpm: localProgress.wpm,
          percentage: clampPercentage(localProgress.percentage),
          accuracy: localProgress.accuracy,
          maxCombo: localProgress.maxCombo,
          score: localProgress.score,
          updatedAt: Date.now(),
          finished: localProgress.finished || self.hasFinished,
          name: self.name,
          avatarUrl: self.avatarUrl,
          initials: self.initials,
          avatarSource: self.avatarSource,
        });
      }
    }

    for (const remote of remoteProgress) {
      if (remote.userId === currentUserId) continue;
      const player = playerById.get(remote.userId);
      entries.push({
        ...remote,
        finished: remote.finished || Boolean(player?.hasFinished),
        percentage: remote.finished || player?.hasFinished ? 100 : remote.percentage,
      });
    }

    return entries.sort((a, b) => compareParticipants(a, b, primaryVictory));
  }, [currentUserId, localProgress, playerById, primaryVictory, remoteProgress]);

  return {
    leaderboard,
    broadcastProgress,
    primaryVictory,
  };
}

/** @deprecated use leaderboard from useMultiplayerRace */
export type { RaceParticipantProgress as RaceOpponentProgress };
