import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type {
  LobbyPlayerPresence,
  RaceParticipantProgress,
  RaceProgressPayload,
} from '@/types/multiplayer';
import { calculateMaxScore, mergePeakRaceProgress } from '@/utils/multiplayer/raceScoring';
import { compareRaceParticipants } from '@/utils/multiplayer/raceRanking';
import {
  getPrimaryVictoryCondition,
  type VictoryCondition,
} from '@/utils/multiplayer/roomConfig';
import { ThrottledProgressBroadcaster } from '@/utils/multiplayer/progressBroadcast';

export interface LocalRaceProgress {
  wpm: number;
  percentage: number;
  accuracy: number;
  maxCombo: number;
  combo: number;
  score: number;
  finished: boolean;
}

interface UseMultiplayerRaceOptions {
  channel: RealtimeChannel | null;
  progressHandlerRef: RefObject<((payload: unknown) => void) | null>;
  currentUserId: string | null;
  players: LobbyPlayerPresence[];
  localProgress: LocalRaceProgress;
  winCondition: VictoryCondition;
  enabled?: boolean;
}

function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function emptyProgressFor(userId: string): RaceProgressPayload {
  return {
    userId,
    wpm: 0,
    percentage: 0,
    accuracy: 100,
    maxCombo: 0,
    combo: 0,
    score: 0,
    updatedAt: Date.now(),
    finished: false,
  };
}

function normalizeProgressPayload(
  progress: Partial<RaceProgressPayload>,
): RaceProgressPayload {
  const wpm = Math.max(0, Math.round(progress.wpm ?? 0));
  const percentage = clampPercentage(progress.percentage ?? 0);
  const accuracy = Math.min(100, Math.max(0, progress.accuracy ?? 100));
  const maxCombo = Math.max(0, progress.maxCombo ?? 0);
  const combo = Math.max(0, progress.combo ?? 0);
  const score =
    progress.score ??
    calculateMaxScore(wpm, accuracy, maxCombo);

  return {
    userId: progress.userId!,
    wpm,
    percentage,
    accuracy,
    maxCombo,
    combo,
    score,
    updatedAt: progress.updatedAt ?? Date.now(),
    finished: Boolean(progress.finished),
  };
}

export function useMultiplayerRace({
  channel,
  progressHandlerRef,
  currentUserId,
  players,
  localProgress,
  winCondition,
  enabled = true,
}: UseMultiplayerRaceOptions) {
  const [remoteProgress, setRemoteProgress] = useState<RaceParticipantProgress[]>([]);
  const progressMapRef = useRef(new Map<string, RaceProgressPayload>());
  const animationFrameRef = useRef<number | null>(null);
  const broadcasterRef = useRef<ThrottledProgressBroadcaster | null>(null);

  const primaryVictory = useMemo(
    () => getPrimaryVictoryCondition(winCondition),
    [winCondition],
  );

  const flushProgress = useCallback(() => {
    animationFrameRef.current = null;
    const next: RaceParticipantProgress[] = [];

    for (const player of players) {
      const stored =
        player.userId === currentUserId
          ? null
          : progressMapRef.current.get(player.userId);
      const base = stored ?? emptyProgressFor(player.userId);

      next.push({
        ...base,
        name: player.name,
        avatarUrl: player.avatarUrl,
        initials: player.initials,
        avatarSource: player.avatarSource,
        finished: base.finished || player.hasFinished,
        percentage:
          base.finished || player.hasFinished ? Math.max(base.percentage, 100) : base.percentage,
      });
    }

    next.sort((a, b) => compareRaceParticipants(a, b, primaryVictory));
    setRemoteProgress(next);
  }, [currentUserId, players, primaryVictory]);

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

    const progressMap = progressMapRef.current;

    progressHandlerRef.current = (payload) => {
      const progress = payload as Partial<RaceProgressPayload>;
      if (!progress.userId || progress.userId === currentUserIdRef.current) return;

      const previous = progressMapRef.current.get(progress.userId);
      const normalized = normalizeProgressPayload(progress);
      const peaks = mergePeakRaceProgress(previous, normalized);

      progressMapRef.current.set(progress.userId, {
        ...normalized,
        ...peaks,
        finished: Boolean(previous?.finished || normalized.finished),
      });
      scheduleFlushRef.current();
    };

    return () => {
      progressHandlerRef.current = null;
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      progressMap.clear();
      setRemoteProgress([]);
    };
  }, [enabled, progressHandlerRef]);

  useEffect(() => {
    scheduleFlush();
  }, [players, scheduleFlush]);

  useEffect(() => {
    if (!channel || !currentUserId || !enabled) {
      broadcasterRef.current?.dispose();
      broadcasterRef.current = null;
      return;
    }

    const sendProgress = async (payload: RaceProgressPayload) => {
      await channel.send({
        type: 'broadcast',
        event: 'progress',
        payload,
      });
    };

    broadcasterRef.current?.dispose();
    broadcasterRef.current = new ThrottledProgressBroadcaster(sendProgress);

    return () => {
      broadcasterRef.current?.dispose();
      broadcasterRef.current = null;
    };
  }, [channel, currentUserId, enabled]);

  const broadcastProgress = useCallback(
    (
      wpm: number,
      percentage: number,
      accuracy: number,
      maxCombo: number,
      combo: number,
      score: number,
      finished = false,
      force = false,
    ) => {
      if (!currentUserId || !enabled) return;

      const broadcaster = broadcasterRef.current;
      if (!broadcaster) return;

      broadcaster.queue(
        {
          userId: currentUserId,
          wpm: Math.max(0, Math.round(wpm)),
          percentage: clampPercentage(percentage),
          accuracy: Math.min(100, Math.max(0, accuracy)),
          maxCombo: Math.max(0, maxCombo),
          combo: Math.max(0, combo),
          score,
          updatedAt: Date.now(),
          finished,
        },
        force,
      );
    },
    [currentUserId, enabled],
  );

  const leaderboard = useMemo(() => {
    const remoteById = new Map(remoteProgress.map((entry) => [entry.userId, entry]));
    const entries: RaceParticipantProgress[] = [];

    for (const player of players) {
      const isSelf = player.userId === currentUserId;
      const playerMeta = {
        name: player.name,
        avatarUrl: player.avatarUrl,
        initials: player.initials,
        avatarSource: player.avatarSource,
      };

      if (isSelf && currentUserId) {
        entries.push({
          userId: currentUserId,
          wpm: localProgress.wpm,
          percentage: clampPercentage(localProgress.percentage),
          accuracy: localProgress.accuracy,
          maxCombo: localProgress.maxCombo,
          combo: localProgress.combo,
          score: localProgress.score,
          updatedAt: Date.now(),
          finished: localProgress.finished || player.hasFinished,
          ...playerMeta,
        });
        continue;
      }

      const base = remoteById.get(player.userId) ?? {
        ...emptyProgressFor(player.userId),
        ...playerMeta,
      };

      entries.push({
        ...base,
        ...playerMeta,
        finished: base.finished || player.hasFinished,
        percentage:
          base.finished || player.hasFinished
            ? Math.max(base.percentage, 100)
            : base.percentage,
      });
    }

    return entries.sort((a, b) => compareRaceParticipants(a, b, primaryVictory));
  }, [currentUserId, localProgress, players, primaryVictory, remoteProgress]);

  return {
    leaderboard,
    broadcastProgress,
    primaryVictory,
  };
}
