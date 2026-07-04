import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthProvider';
import type { MultiplayerPrivacy } from '@/utils/user/multiplayerPrivacy';
import { getMultiplayerPresenceDisplay } from '@/utils/user/multiplayerPrivacy';
import type { AvatarSource } from '@/utils/user/userDisplay';
import type { LobbyConnectionStatus, LobbyPlayerPresence } from '@/types/multiplayer';

interface UseMultiplayerLobbyOptions {
  roomId: string;
  /** Fired once when every connected player has `isReady: true`. */
  onAllReady?: () => void;
  minPlayers?: number;
}

function parsePresenceState(state: Record<string, unknown[]>): LobbyPlayerPresence[] {
  // Dedupe by userId — a player may have multiple presence entries (e.g. after
  // re-tracking on ready toggle or transient reconnects). Keep the latest one.
  const byUser = new Map<string, LobbyPlayerPresence>();

  for (const presences of Object.values(state)) {
    for (const raw of presences) {
      const entry = raw as Partial<LobbyPlayerPresence>;
      if (!entry.userId || !entry.name) continue;

      const player: LobbyPlayerPresence = {
        userId: entry.userId,
        name: entry.name,
        avatarUrl: entry.avatarUrl ?? null,
        initials: entry.initials ?? entry.name.slice(0, 2).toUpperCase(),
        avatarSource: (entry.avatarSource as AvatarSource) ?? 'none',
        isReady: Boolean(entry.isReady),
        joinedAt: entry.joinedAt ?? 0,
      };

      const existing = byUser.get(player.userId);
      if (!existing || player.joinedAt >= existing.joinedAt) {
        byUser.set(player.userId, player);
      }
    }
  }

  return Array.from(byUser.values()).sort((a, b) => a.joinedAt - b.joinedAt);
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
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceRef = useRef<LobbyPlayerPresence | null>(null);
  const allReadyFiredRef = useRef(false);
  const onAllReadyRef = useRef(onAllReady);
  const progressHandlerRef = useRef<((payload: unknown) => void) | null>(null);
  onAllReadyRef.current = onAllReady;

  const syncPlayers = useCallback(
    (activeChannel: RealtimeChannel) => {
      const next = parsePresenceState(
        activeChannel.presenceState<LobbyPlayerPresence>() as Record<string, unknown[]>,
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

  const syncPlayersRef = useRef(syncPlayers);
  syncPlayersRef.current = syncPlayers;

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

    const presenceDisplay = getMultiplayerPresenceDisplay(user, profile);
    const presencePayload: LobbyPlayerPresence = {
      userId: user.id,
      name: presenceDisplay.name,
      avatarUrl: presenceDisplay.avatarUrl,
      initials: presenceDisplay.initials,
      avatarSource: presenceDisplay.avatarSource,
      isReady: false,
      joinedAt: Date.now(),
    };

    presenceRef.current = presencePayload;
    setIsReady(false);
    setStatus('connecting');
    setError(null);
    setPlayers([]);

    const nextChannel = supabase.channel(`room-${roomId}`, {
      config: {
        presence: { key: user.id },
        broadcast: { self: false },
      },
    });

    // All listeners must be registered before subscribe().
    nextChannel
      .on('presence', { event: 'sync' }, () => syncPlayersRef.current(nextChannel))
      .on('broadcast', { event: 'progress' }, ({ payload }) => {
        progressHandlerRef.current?.(payload);
      })
      .subscribe(async (subscribeStatus) => {
        if (subscribeStatus === 'SUBSCRIBED') {
          const { error: trackError } = await nextChannel.track(presencePayload);
          if (trackError) {
            setStatus('error');
            setError(trackError.message);
            return;
          }
          setStatus('connected');
          syncPlayersRef.current(nextChannel);
        } else if (subscribeStatus === 'CHANNEL_ERROR') {
          setStatus('error');
          setError('channel_error');
        } else if (subscribeStatus === 'TIMED_OUT') {
          setStatus('error');
          setError('timed_out');
        }
      });

    channelRef.current = nextChannel;
    setChannel(nextChannel);

    return () => {
      channelRef.current = null;
      presenceRef.current = null;
      progressHandlerRef.current = null;
      setChannel(null);
      void nextChannel.untrack();
      supabase.removeChannel(nextChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- channel keyed by user id + room; profile syncs separately
  }, [user?.id, roomId]);

  useEffect(() => {
    const activeChannel = channelRef.current;
    if (status !== 'connected' || !user || !activeChannel || !presenceRef.current) return;

    const presenceDisplay = getMultiplayerPresenceDisplay(user, profile);
    const updated: LobbyPlayerPresence = {
      ...presenceRef.current,
      name: presenceDisplay.name,
      avatarUrl: presenceDisplay.avatarUrl,
      initials: presenceDisplay.initials,
      avatarSource: presenceDisplay.avatarSource,
    };
    presenceRef.current = updated;
    void activeChannel.track(updated);
  }, [user, profile, status]);

  const toggleReadyStatus = useCallback(async () => {
    const activeChannel = channelRef.current;
    const presence = presenceRef.current;
    if (!activeChannel || !presence) return;

    const nextReady = !presence.isReady;
    const updated: LobbyPlayerPresence = { ...presence, isReady: nextReady };
    presenceRef.current = updated;
    setIsReady(nextReady);

    const { error: trackError } = await activeChannel.track(updated);
    if (trackError) {
      setError(trackError.message);
      presenceRef.current = presence;
      setIsReady(presence.isReady);
    }
  }, []);

  const leaveLobby = useCallback(async () => {
    const activeChannel = channelRef.current;
    const supabase = getSupabaseClient();
    if (!activeChannel || !supabase) return;

    await activeChannel.untrack();
    supabase.removeChannel(activeChannel);
    channelRef.current = null;
    presenceRef.current = null;
    progressHandlerRef.current = null;
    setChannel(null);
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
    channel,
    progressHandlerRef,
  };
}
