import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type {
  LobbyPlayerPresence,
  RaceOpponentProgress,
  RaceProgressPayload,
} from '@/types/multiplayer';

interface UseMultiplayerRaceOptions {
  channel: RealtimeChannel | null;
  progressHandlerRef: RefObject<((payload: unknown) => void) | null>;
  currentUserId: string | null;
  players: LobbyPlayerPresence[];
  enabled?: boolean;
}

function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function useMultiplayerRace({
  channel,
  progressHandlerRef,
  currentUserId,
  players,
  enabled = true,
}: UseMultiplayerRaceOptions) {
  const [opponents, setOpponents] = useState<RaceOpponentProgress[]>([]);
  const opponentMapRef = useRef(new Map<string, RaceProgressPayload>());
  const animationFrameRef = useRef<number | null>(null);
  const lastBroadcastAtRef = useRef(0);

  const playerById = useMemo(() => {
    return new Map(players.map((player) => [player.userId, player]));
  }, [players]);

  const flushOpponents = useCallback(() => {
    animationFrameRef.current = null;
    const next: RaceOpponentProgress[] = [];

    for (const progress of opponentMapRef.current.values()) {
      const player = playerById.get(progress.userId);
      if (!player || progress.userId === currentUserId) continue;

      next.push({
        ...progress,
        name: player.name,
        avatarUrl: player.avatarUrl,
        initials: player.initials,
        avatarSource: player.avatarSource,
      });
    }

    next.sort((a, b) => b.percentage - a.percentage || b.wpm - a.wpm);
    setOpponents(next);
  }, [currentUserId, playerById]);

  const scheduleFlush = useCallback(() => {
    if (animationFrameRef.current !== null) return;
    animationFrameRef.current = window.requestAnimationFrame(flushOpponents);
  }, [flushOpponents]);

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

      opponentMapRef.current.set(progress.userId, {
        userId: progress.userId,
        wpm: Math.max(0, Math.round(progress.wpm ?? 0)),
        percentage: clampPercentage(progress.percentage ?? 0),
        updatedAt: progress.updatedAt ?? Date.now(),
      });
      scheduleFlushRef.current();
    };

    return () => {
      progressHandlerRef.current = null;
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      opponentMapRef.current.clear();
      setOpponents([]);
    };
  }, [enabled, progressHandlerRef]);

  useEffect(() => {
    scheduleFlush();
  }, [players, scheduleFlush]);

  const broadcastProgress = useCallback(
    async (wpm: number, percentage: number, force = false) => {
      if (!channel || !currentUserId || !enabled) return;

      const now = Date.now();
      if (!force && now - lastBroadcastAtRef.current < 500) return;
      lastBroadcastAtRef.current = now;

      await channel.send({
        type: 'broadcast',
        event: 'progress',
        payload: {
          userId: currentUserId,
          wpm: Math.max(0, Math.round(wpm)),
          percentage: clampPercentage(percentage),
          updatedAt: now,
        } satisfies RaceProgressPayload,
      });
    },
    [channel, currentUserId, enabled],
  );

  return {
    opponents,
    broadcastProgress,
  };
}
