import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type {
  LobbyPlayerPresence,
  RaceOpponentProgress,
  RaceProgressPayload,
} from '@/types/multiplayer';

interface UseMultiplayerRaceOptions {
  channel: RealtimeChannel | null;
  currentUserId: string | null;
  players: LobbyPlayerPresence[];
  enabled?: boolean;
}

function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function useMultiplayerRace({
  channel,
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

  useEffect(() => {
    if (!channel || !enabled) return;

    const opponentMap = opponentMapRef.current;

    channel.on('broadcast', { event: 'progress' }, ({ payload }) => {
      const progress = payload as Partial<RaceProgressPayload>;
      if (!progress.userId || progress.userId === currentUserId) return;

      opponentMap.set(progress.userId, {
        userId: progress.userId,
        wpm: Math.max(0, Math.round(progress.wpm ?? 0)),
        percentage: clampPercentage(progress.percentage ?? 0),
        updatedAt: progress.updatedAt ?? Date.now(),
      });
      scheduleFlush();
    });

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      opponentMap.clear();
      setOpponents([]);
    };
  }, [channel, currentUserId, enabled, scheduleFlush]);

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
