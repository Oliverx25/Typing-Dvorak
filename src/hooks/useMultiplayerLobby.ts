import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthProvider';
import { getUserDisplay } from '@/utils/user/userDisplay';
import type { AvatarSource } from '@/utils/user/userDisplay';
import type { LobbyConnectionStatus, LobbyPlayerPresence } from '@/types/multiplayer';

interface UseMultiplayerLobbyOptions {
  roomId: string;
  /** Fired once when every connected player has `isReady: true`. */
  onAllReady?: () => void;
  minPlayers?: number;
}

function parsePresenceState(state: Record<string, unknown[]>): LobbyPlayerPresence[] {
  const players: LobbyPlayerPresence[] = [];

  for (const presences of Object.values(state)) {
    for (const raw of presences) {
      const entry = raw as Partial<LobbyPlayerPresence>;
      if (!entry.userId || !entry.name) continue;

      players.push({
        userId: entry.userId,
        name: entry.name,
        avatarUrl: entry.avatarUrl ?? null,
        initials: entry.initials ?? entry.name.slice(0, 2).toUpperCase(),
        avatarSource: (entry.avatarSource as AvatarSource) ?? 'none',
        isReady: Boolean(entry.isReady),
        joinedAt: entry.joinedAt ?? 0,
      });
    }
  }

  return players.sort((a, b) => a.joinedAt - b.joinedAt);
}

export function useMultiplayerLobby({
  roomId,
  onAllReady,
  minPlayers = 2,
}: UseMultiplayerLobbyOptions) {
  const { user, profile } = useAuth();
  const [players, setPlayers] = useState<LobbyPlayerPresence[]>([]);
  const [status, setStatus] = useState<LobbyConnectionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceRef = useRef<LobbyPlayerPresence | null>(null);
  const allReadyFiredRef = useRef(false);
  const onAllReadyRef = useRef(onAllReady);
  onAllReadyRef.current = onAllReady;

  const syncPlayers = useCallback(
    (channel: RealtimeChannel) => {
      const next = parsePresenceState(
        channel.presenceState<LobbyPlayerPresence>() as Record<string, unknown[]>,
      );
      setPlayers(next);

      if (user?.id) {
        const self = next.find((player) => player.userId === user.id);
        if (self) setIsReady(self.isReady);
      }

      if (
        !allReadyFiredRef.current &&
        next.length >= minPlayers &&
        next.every((player) => player.isReady)
      ) {
        allReadyFiredRef.current = true;
        onAllReadyRef.current?.();
      }
    },
    [user?.id, minPlayers],
  );

  useEffect(() => {
    allReadyFiredRef.current = false;
  }, [roomId]);

  useEffect(() => {
    if (!user || !roomId) {
      setStatus('idle');
      setPlayers([]);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus('error');
      setError('supabase_not_configured');
      return;
    }

    const display = getUserDisplay(user, profile);
    const presencePayload: LobbyPlayerPresence = {
      userId: user.id,
      name: display.name,
      avatarUrl: display.avatarUrl,
      initials: display.initials,
      avatarSource: display.avatarSource,
      isReady: false,
      joinedAt: Date.now(),
    };

    presenceRef.current = presencePayload;
    setIsReady(false);
    setStatus('connecting');
    setError(null);
    setPlayers([]);

    const channel = supabase.channel(`room-${roomId}`, {
      config: { presence: { key: user.id } },
    });

    channel.on('presence', { event: 'sync' }, () => syncPlayers(channel)).subscribe(async (subscribeStatus) => {
      if (subscribeStatus === 'SUBSCRIBED') {
        const { error: trackError } = await channel.track(presencePayload);
        if (trackError) {
          setStatus('error');
          setError(trackError.message);
          return;
        }
        setStatus('connected');
        syncPlayers(channel);
      } else if (subscribeStatus === 'CHANNEL_ERROR') {
        setStatus('error');
        setError('channel_error');
      } else if (subscribeStatus === 'TIMED_OUT') {
        setStatus('error');
        setError('timed_out');
      }
    });

    channelRef.current = channel;

    return () => {
      void channel.untrack().finally(() => {
        supabase.removeChannel(channel);
      });
      channelRef.current = null;
      presenceRef.current = null;
    };
  }, [user, profile, roomId, syncPlayers]);

  const toggleReadyStatus = useCallback(async () => {
    const channel = channelRef.current;
    const presence = presenceRef.current;
    if (!channel || !presence) return;

    const nextReady = !presence.isReady;
    const updated: LobbyPlayerPresence = { ...presence, isReady: nextReady };
    presenceRef.current = updated;
    setIsReady(nextReady);

    const { error: trackError } = await channel.track(updated);
    if (trackError) {
      setError(trackError.message);
      presenceRef.current = presence;
      setIsReady(presence.isReady);
    }
  }, []);

  const leaveLobby = useCallback(async () => {
    const channel = channelRef.current;
    const supabase = getSupabaseClient();
    if (!channel || !supabase) return;

    await channel.untrack();
    supabase.removeChannel(channel);
    channelRef.current = null;
    presenceRef.current = null;
    setPlayers([]);
    setStatus('idle');
    setIsReady(false);
  }, []);

  return {
    players,
    status,
    error,
    isReady,
    isConnected: status === 'connected',
    toggleReadyStatus,
    leaveLobby,
    currentUserId: user?.id ?? null,
  };
}
