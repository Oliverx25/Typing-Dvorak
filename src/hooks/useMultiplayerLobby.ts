import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthProvider';
import { getMultiplayerPresenceDisplay } from '@/utils/user/multiplayerPrivacy';
import type { AvatarSource } from '@/utils/user/userDisplay';
import type {
  LobbyConnectionStatus,
  LobbyPlayerPresence,
  RoomBroadcastState,
} from '@/types/multiplayer';
import {
  createDefaultRoomState,
  mergeRoomState,
} from '@/utils/multiplayer/roomConfig';
import { clearCreateRoomConfig, readCreateRoomConfig } from '@/utils/multiplayer/roomStorage';

const MAX_CONNECT_RETRIES = 10;
const RETRY_DELAYS_MS = [800, 1200, 2000, 3000, 4000, 5000, 6000, 8000, 10000, 12000];
const OWNERSHIP_CLAIM_DELAY_MS = 1200;

interface UseMultiplayerLobbyOptions {
  roomId: string;
  minPlayers?: number;
  /** Increment to force a fresh connection attempt after a failure. */
  connectAttempt?: number;
}

function parsePresenceState(state: Record<string, unknown[]>): LobbyPlayerPresence[] {
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
        hasFinished: Boolean(entry.hasFinished),
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

function buildPresencePayload(
  userId: string,
  display: ReturnType<typeof getMultiplayerPresenceDisplay>,
  overrides: Partial<Pick<LobbyPlayerPresence, 'isReady' | 'hasFinished' | 'joinedAt'>> = {},
): LobbyPlayerPresence {
  return {
    userId,
    name: display.name,
    avatarUrl: display.avatarUrl,
    initials: display.initials,
    avatarSource: display.avatarSource,
    isReady: overrides.isReady ?? false,
    hasFinished: overrides.hasFinished ?? false,
    joinedAt: overrides.joinedAt ?? Date.now(),
  };
}

export function useMultiplayerLobby({
  roomId,
  minPlayers = 2,
  connectAttempt = 0,
}: UseMultiplayerLobbyOptions) {
  const { user, profile } = useAuth();
  const [players, setPlayers] = useState<LobbyPlayerPresence[]>([]);
  const [status, setStatus] = useState<LobbyConnectionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [roomState, setRoomState] = useState<RoomBroadcastState | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [raceActive, setRaceActive] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceRef = useRef<LobbyPlayerPresence | null>(null);
  const roomStateRef = useRef<RoomBroadcastState | null>(null);
  const progressHandlerRef = useRef<((payload: unknown) => void) | null>(null);
  const roomEventHandlerRef = useRef<((event: string, payload: unknown) => void) | null>(null);
  const ownershipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const returnLobbyCheckRef = useRef(false);
  const readyTogglePendingRef = useRef(false);

  roomStateRef.current = roomState;

  const isOwner = Boolean(user?.id && roomState?.ownerId === user.id);
  const allReady =
    players.length >= minPlayers &&
    players.length > 0 &&
    players.every((player) => player.isReady);
  const allFinished =
    players.length > 0 &&
    players.every((player) => player.hasFinished);

  const applyRoomState = useCallback((incoming: Partial<RoomBroadcastState>) => {
    const merged = mergeRoomState(roomStateRef.current, incoming);
    if (!merged) return;
    roomStateRef.current = merged;
    setRoomState(merged);

    if (merged.phase === 'racing' && merged.raceStartedAt) {
      const remaining = Math.ceil((merged.raceStartedAt - Date.now()) / 1000);
      if (remaining > 0) {
        setCountdownSeconds(remaining);
        setRaceActive(false);
      } else {
        setCountdownSeconds(null);
        setRaceActive(true);
      }
    } else {
      setRaceActive(false);
      setCountdownSeconds(null);
    }
  }, []);

  const broadcastRoomState = useCallback(async (state: RoomBroadcastState) => {
    const activeChannel = channelRef.current;
    if (!activeChannel) return;
    await activeChannel.send({
      type: 'broadcast',
      event: 'room:state',
      payload: state,
    });
  }, []);

  const claimOwnership = useCallback(async () => {
    if (!user?.id) return;

    const createConfig = readCreateRoomConfig(roomId);
    const next = createDefaultRoomState(user.id);

    if (createConfig) {
      next.lessonId = createConfig.lessonId;
      next.customText =
        createConfig.textSource === 'custom' ? createConfig.customText : '';
      next.blindMode = createConfig.blindMode;
      next.winConditions = createConfig.winConditions;
      clearCreateRoomConfig(roomId);
    }

    applyRoomState(next);
    await broadcastRoomState(next);
  }, [applyRoomState, broadcastRoomState, roomId, user?.id]);

  const maybeTransferOwnership = useCallback(
    (nextPlayers: LobbyPlayerPresence[]) => {
      const current = roomStateRef.current;
      if (!user?.id || !current?.ownerId) return;

      const ownerStillHere = nextPlayers.some((player) => player.userId === current.ownerId);
      if (ownerStillHere) return;

      const oldest = nextPlayers[0];
      if (!oldest || oldest.userId !== user.id) return;

      const transferred: RoomBroadcastState = {
        ...current,
        ownerId: user.id,
        version: current.version + 1,
      };
      applyRoomState(transferred);
      void broadcastRoomState(transferred);
    },
    [applyRoomState, broadcastRoomState, user?.id],
  );

  const syncPlayers = useCallback(
    (activeChannel: RealtimeChannel) => {
      const next = parsePresenceState(
        activeChannel.presenceState<LobbyPlayerPresence>() as Record<string, unknown[]>,
      );
      setPlayers(next);

      if (user?.id) {
        const self = next.find((player) => player.userId === user.id);
        if (self) {
          if (!readyTogglePendingRef.current) {
            setIsReady(self.isReady);
          }
          if (presenceRef.current) {
            presenceRef.current = {
              ...presenceRef.current,
              isReady: readyTogglePendingRef.current
                ? presenceRef.current.isReady
                : self.isReady,
              hasFinished: self.hasFinished,
            };
          }
        }
      }

      maybeTransferOwnership(next);

      if (
        roomStateRef.current?.phase === 'racing' &&
        next.length > 0 &&
        next.every((player) => player.hasFinished) &&
        !returnLobbyCheckRef.current
      ) {
        returnLobbyCheckRef.current = true;
        if (user?.id && roomStateRef.current.ownerId === user.id) {
          void (async () => {
            const resetState: RoomBroadcastState = {
              ...roomStateRef.current!,
              phase: 'lobby',
              raceStartedAt: null,
              version: roomStateRef.current!.version + 1,
            };
            applyRoomState(resetState);
            await broadcastRoomState(resetState);
            await activeChannel.send({
              type: 'broadcast',
              event: 'room:return_lobby',
              payload: { version: resetState.version },
            });
          })();
        }
      }
    },
    [applyRoomState, broadcastRoomState, maybeTransferOwnership, user?.id],
  );

  const syncPlayersRef = useRef(syncPlayers);
  syncPlayersRef.current = syncPlayers;

  const scheduleOwnershipClaim = useCallback(() => {
    if (ownershipTimerRef.current) clearTimeout(ownershipTimerRef.current);
    ownershipTimerRef.current = setTimeout(() => {
      if (roomStateRef.current?.ownerId && !readCreateRoomConfig(roomId)) return;
      if (readCreateRoomConfig(roomId)) {
        void claimOwnership();
      }
    }, OWNERSHIP_CLAIM_DELAY_MS);
  }, [claimOwnership, roomId]);

  const returnToLobby = useCallback(async () => {
    returnLobbyCheckRef.current = false;
    const presence = presenceRef.current;
    const activeChannel = channelRef.current;
    if (!presence || !activeChannel) return;

    const resetPresence: LobbyPlayerPresence = {
      ...presence,
      isReady: false,
      hasFinished: false,
    };
    presenceRef.current = resetPresence;
    setIsReady(false);
    await activeChannel.track(resetPresence);
    setRaceActive(false);
    setCountdownSeconds(null);
    roomEventHandlerRef.current?.('return_lobby', {});
  }, []);

  useEffect(() => {
    if (countdownSeconds === null || countdownSeconds <= 0) {
      if (countdownSeconds === 0) {
        setCountdownSeconds(null);
        setRaceActive(true);
      }
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdownSeconds((value) => (value !== null ? value - 1 : null));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdownSeconds]);

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

    let cancelled = false;
    let retryAttempt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const presenceDisplay = getMultiplayerPresenceDisplay(user, profile);
    const presencePayload = buildPresencePayload(user.id, presenceDisplay);
    presenceRef.current = presencePayload;

    setIsReady(false);
    setStatus('connecting');
    setError(null);
    setPlayers([]);
    setRoomState(null);
    roomStateRef.current = null;
    setRaceActive(false);
    setCountdownSeconds(null);
    returnLobbyCheckRef.current = false;

    const cleanupChannel = (ch: RealtimeChannel | null) => {
      if (!ch) return;
      void ch.untrack();
      supabase.removeChannel(ch);
    };

    const attachChannel = () => {
      if (cancelled) return;

      cleanupChannel(channelRef.current);
      channelRef.current = null;
      setChannel(null);

      setStatus(retryAttempt > 0 ? 'reconnecting' : 'connecting');

      const nextChannel = supabase.channel(`room-${roomId}`, {
        config: {
          presence: { key: user.id },
          broadcast: { self: true },
        },
      });

      nextChannel
        .on('presence', { event: 'sync' }, () => syncPlayersRef.current(nextChannel))
        .on('broadcast', { event: 'progress' }, ({ payload }) => {
          progressHandlerRef.current?.(payload);
        })
        .on('broadcast', { event: 'room:state' }, ({ payload }) => {
          applyRoomState(payload as Partial<RoomBroadcastState>);
        })
        .on('broadcast', { event: 'room:request_state' }, () => {
          if (roomStateRef.current?.ownerId === user.id) {
            void broadcastRoomState(roomStateRef.current);
          }
        })
        .on('broadcast', { event: 'room:kick' }, ({ payload }) => {
          const targetUserId = (payload as { targetUserId?: string }).targetUserId;
          if (targetUserId === user.id) {
            roomEventHandlerRef.current?.('kicked', payload);
          }
        })
        .on('broadcast', { event: 'room:return_lobby' }, ({ payload }) => {
          const version = (payload as { version?: number }).version;
          if (roomStateRef.current) {
            applyRoomState({
              ...roomStateRef.current,
              phase: 'lobby',
              raceStartedAt: null,
              version: version ?? roomStateRef.current.version + 1,
            });
          }
          void returnToLobby();
        })
        .subscribe(async (subscribeStatus) => {
          if (cancelled) return;

          if (subscribeStatus === 'SUBSCRIBED') {
            retryAttempt = 0;
            setError(null);

            const { error: trackError } = await nextChannel.track(presencePayload);
            if (cancelled) return;

            if (trackError) {
              setStatus('error');
              setError(trackError.message);
              return;
            }

            setStatus('connected');
            syncPlayersRef.current(nextChannel);
            scheduleOwnershipClaim();
            await nextChannel.send({
              type: 'broadcast',
              event: 'room:request_state',
              payload: { userId: user.id },
            });
          } else if (subscribeStatus === 'CHANNEL_ERROR' || subscribeStatus === 'TIMED_OUT') {
            cleanupChannel(nextChannel);

            if (retryAttempt < MAX_CONNECT_RETRIES) {
              const delay = RETRY_DELAYS_MS[retryAttempt] ?? 5000;
              retryAttempt += 1;
              retryTimer = setTimeout(attachChannel, delay);
            } else {
              setStatus('error');
              setError(subscribeStatus === 'TIMED_OUT' ? 'timed_out' : 'channel_error');
            }
          }
        });

      channelRef.current = nextChannel;
      setChannel(nextChannel);
    };

    attachChannel();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (ownershipTimerRef.current) clearTimeout(ownershipTimerRef.current);
      cleanupChannel(channelRef.current);
      channelRef.current = null;
      presenceRef.current = null;
      progressHandlerRef.current = null;
      setChannel(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, roomId, connectAttempt]);

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
    if (!activeChannel || !presence || roomStateRef.current?.phase === 'racing') return;
    if (readyTogglePendingRef.current) return;

    const previousPresence = presence;
    const previousReady = presence.isReady;
    const nextReady = !previousReady;

    readyTogglePendingRef.current = true;
    const updated: LobbyPlayerPresence = { ...presence, isReady: nextReady, hasFinished: false };
    presenceRef.current = updated;
    setIsReady(nextReady);

    try {
      const { error: trackError } = await activeChannel.track(updated);
      if (trackError) {
        presenceRef.current = previousPresence;
        setIsReady(previousReady);
        setError(trackError.message);
      }
    } catch (err) {
      presenceRef.current = previousPresence;
      setIsReady(previousReady);
      setError(err instanceof Error ? err.message : 'track_failed');
    } finally {
      readyTogglePendingRef.current = false;
      syncPlayersRef.current(activeChannel);
    }
  }, []);

  const updateRoomConfig = useCallback(
    async (partial: Pick<RoomBroadcastState, 'lessonId' | 'customText' | 'blindMode' | 'winConditions'>) => {
      const current = roomStateRef.current;
      if (!user?.id || !current || current.ownerId !== user.id) return;
      if (current.phase === 'racing') return;

      const next: RoomBroadcastState = {
        ...current,
        ...partial,
        version: current.version + 1,
      };
      applyRoomState(next);
      await broadcastRoomState(next);
    },
    [applyRoomState, broadcastRoomState, user?.id],
  );

  const startRace = useCallback(async () => {
    if (!user?.id || roomStateRef.current?.ownerId !== user.id) return;
    if (!allReady) return;

    const raceStartedAt = Date.now() + 3000;
    const next: RoomBroadcastState = {
      ...roomStateRef.current!,
      phase: 'racing',
      raceStartedAt,
      version: roomStateRef.current!.version + 1,
    };

    applyRoomState(next);
    await broadcastRoomState(next);
    returnLobbyCheckRef.current = false;
  }, [allReady, applyRoomState, broadcastRoomState, user?.id]);

  const markRaceFinished = useCallback(async () => {
    const activeChannel = channelRef.current;
    const presence = presenceRef.current;
    if (!activeChannel || !presence || presence.hasFinished) return;

    const updated: LobbyPlayerPresence = { ...presence, hasFinished: true };
    presenceRef.current = updated;
    await activeChannel.track(updated);
    syncPlayersRef.current(activeChannel);
  }, []);

  const kickPlayer = useCallback(
    async (targetUserId: string) => {
      if (!user?.id || roomStateRef.current?.ownerId !== user.id) return;
      if (targetUserId === user.id) return;

      const activeChannel = channelRef.current;
      if (!activeChannel) return;

      await activeChannel.send({
        type: 'broadcast',
        event: 'room:kick',
        payload: { targetUserId },
      });
    },
    [user?.id],
  );

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
    setRoomState(null);
    setRaceActive(false);
  }, []);

  return {
    players,
    status,
    error,
    isReady,
    isConnected: status === 'connected',
    isOwner,
    allReady,
    allFinished,
    roomState,
    raceActive,
    countdownSeconds,
    toggleReadyStatus,
    updateRoomConfig,
    startRace,
    markRaceFinished,
    kickPlayer,
    leaveLobby,
    currentUserId: user?.id ?? null,
    channel,
    progressHandlerRef,
    roomEventHandlerRef,
  };
}
