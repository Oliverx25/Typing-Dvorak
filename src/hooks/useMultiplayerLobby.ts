import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthProvider';
import { ensureRoomExists, closeRoom, transferRoomHost } from '@/services/supabase/rooms';
import { getMultiplayerPresenceDisplay } from '@/utils/user/multiplayerPrivacy';
import type {
  LobbyConnectionStatus,
  LobbyPlayerPresence,
  RoomBroadcastState,
  RoomPhase,
} from '@/types/multiplayer';
import {
  createDefaultRoomState,
  mergeRoomState,
} from '@/utils/multiplayer/roomConfig';
import { clearCreateRoomConfig, readCreateRoomConfig } from '@/utils/multiplayer/roomStorage';
import { parsePresenceState, normalizePlayersForLobbyView } from '@/utils/multiplayer/presence';
import { canAdvanceToResults } from '@/utils/multiplayer/raceCompletion';
import {
  RACE_COUNTDOWN_SECONDS,
  resolveRaceCountdownSeconds,
} from '@/utils/multiplayer/raceScoring';

const MAX_CONNECT_RETRIES = 10;
const RETRY_DELAYS_MS = [800, 1200, 2000, 3000, 4000, 5000, 6000, 8000, 10000, 12000];
const OWNERSHIP_CLAIM_DELAY_MS = 1200;

interface UseMultiplayerLobbyOptions {
  roomId: string;
  minPlayers?: number;
  /** Increment to force a fresh connection attempt after a failure. */
  connectAttempt?: number;
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
  const [returnedFromResults, setReturnedFromResults] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceRef = useRef<LobbyPlayerPresence | null>(null);
  const roomStateRef = useRef<RoomBroadcastState | null>(null);
  const progressHandlerRef = useRef<((payload: unknown) => void) | null>(null);
  const roomEventHandlerRef = useRef<((event: string, payload: unknown) => void) | null>(null);
  const ownershipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const returnLobbyCheckRef = useRef(false);
  const pendingReadyRef = useRef<boolean | null>(null);
  const returnedFromResultsRef = useRef(false);
  const voluntaryDepartRef = useRef(false);
  const dismissedPlayersRef = useRef<Map<string, number>>(new Map());

  returnedFromResultsRef.current = returnedFromResults;

  roomStateRef.current = roomState;

  const canUseLobbyActions = useCallback(() => {
    const phase = roomStateRef.current?.phase;
    return phase === 'lobby' || (phase === 'results' && returnedFromResultsRef.current);
  }, []);

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

    if (merged.phase === 'racing' || merged.phase === 'lobby') {
      setReturnedFromResults(false);
    }

    if (merged.phase !== 'racing') {
      if (merged.phase === 'lobby') {
        setRaceActive(false);
        setCountdownSeconds(null);
      } else if (merged.phase === 'results') {
        setRaceActive(false);
        setCountdownSeconds(null);
      }
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
      next.textSource = createConfig.textSource;
      next.customText =
        createConfig.textSource === 'custom' ? createConfig.customText : '';
      next.blindMode = createConfig.blindMode;
      next.winConditions = createConfig.winConditions;
      clearCreateRoomConfig(roomId);
      await ensureRoomExists(roomId, user.id);
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
      void transferRoomHost(roomId, user.id);
    },
    [applyRoomState, broadcastRoomState, roomId, user?.id],
  );

  const maybeAdvanceToResults = useCallback(
    (connectedPlayers: LobbyPlayerPresence[]) => {
      if (!canAdvanceToResults(roomStateRef.current?.phase, connectedPlayers, user?.id)) {
        return;
      }
      if (returnLobbyCheckRef.current) return;

      returnLobbyCheckRef.current = true;
      const resultsState: RoomBroadcastState = {
        ...roomStateRef.current!,
        phase: 'results',
        raceStartedAt: null,
        version: roomStateRef.current!.version + 1,
      };
      applyRoomState(resultsState);
      void broadcastRoomState(resultsState);
    },
    [applyRoomState, broadcastRoomState, user?.id],
  );

  const isInLobbyView = useCallback(() => {
    const phase = roomStateRef.current?.phase;
    return phase === 'lobby' || returnedFromResultsRef.current;
  }, []);

  const syncPlayers = useCallback(
    (activeChannel: RealtimeChannel) => {
      const parsed = parsePresenceState(
        activeChannel.presenceState<LobbyPlayerPresence>() as Record<string, unknown[]>,
      );

      for (const [userId] of dismissedPlayersRef.current) {
        if (!parsed.some((player) => player.userId === userId)) {
          dismissedPlayersRef.current.delete(userId);
        }
      }

      const isHost = user?.id === roomStateRef.current?.ownerId;
      const visible = isHost
        ? parsed.filter((player) => {
            const kickedAt = dismissedPlayersRef.current.get(player.userId);
            if (kickedAt === undefined) return true;
            if (player.joinedAt > kickedAt) {
              dismissedPlayersRef.current.delete(player.userId);
              return true;
            }
            return false;
          })
        : parsed;

      const inLobbyView = isInLobbyView();
      const next = inLobbyView ? normalizePlayersForLobbyView(visible) : visible;
      setPlayers(next);

      if (user?.id) {
        const self = parsed.find((player) => player.userId === user.id);
        if (self) {
          let ready = self.isReady;
          if (pendingReadyRef.current !== null) {
            ready = pendingReadyRef.current;
            if (self.isReady === pendingReadyRef.current) {
              pendingReadyRef.current = null;
            }
          }

          setIsReady(ready);

          if (presenceRef.current) {
            presenceRef.current = {
              ...presenceRef.current,
              isReady: ready,
              hasFinished: inLobbyView ? false : self.hasFinished,
            };
          }
        }
      }

      maybeTransferOwnership(parsed);
      maybeAdvanceToResults(parsed);
    },
    [isInLobbyView, maybeAdvanceToResults, maybeTransferOwnership, user?.id],
  );

  const syncPlayersRef = useRef(syncPlayers);
  syncPlayersRef.current = syncPlayers;

  const prevPhaseRef = useRef<RoomPhase | null>(null);

  /** Clear ready flag when a race ends so the host must wait again before the next start. */
  const resetReadyAfterResults = useCallback(async () => {
    const activeChannel = channelRef.current;
    const presence = presenceRef.current;
    if (!activeChannel || !presence || !presence.isReady) return;

    const updated: LobbyPlayerPresence = { ...presence, isReady: false };
    presenceRef.current = updated;
    setIsReady(false);
    await activeChannel.track(updated);
    syncPlayersRef.current(activeChannel);
  }, []);

  useEffect(() => {
    const current = roomState?.phase ?? null;
    const prev = prevPhaseRef.current;

    if (current === 'results' && prev !== 'results') {
      void resetReadyAfterResults();
    }

    prevPhaseRef.current = current;
  }, [roomState?.phase, resetReadyAfterResults]);

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
    const startedAt =
      roomState?.phase === 'racing' ? roomState.raceStartedAt : null;

    if (!startedAt) {
      return;
    }

    // Local, per-client countdown: every player sees the full window regardless
    // of broadcast latency or clock skew. Anchored to when this client enters
    // the racing view, not to the shared timestamp.
    const localDeadline = Date.now() + RACE_COUNTDOWN_SECONDS * 1000;

    const tick = () => {
      const { countdownSeconds: nextCountdown, raceActive: nextActive } =
        resolveRaceCountdownSeconds(localDeadline);
      setCountdownSeconds(nextCountdown);
      setRaceActive(nextActive);
    };

    tick();
    const interval = window.setInterval(tick, 100);
    return () => window.clearInterval(interval);
  }, [roomState?.phase, roomState?.raceStartedAt]);

  useEffect(() => {
    const onPageHide = () => {
      if (voluntaryDepartRef.current) return;
      const ch = channelRef.current;
      if (ch) void ch.untrack();
    };
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, []);

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
    setReturnedFromResults(false);
    voluntaryDepartRef.current = false;
    pendingReadyRef.current = null;
    dismissedPlayersRef.current.clear();

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
        .on('presence', { event: 'join' }, () => syncPlayersRef.current(nextChannel))
        .on('presence', { event: 'leave' }, () => syncPlayersRef.current(nextChannel))
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
        .on('broadcast', { event: 'room:closed' }, () => {
          roomEventHandlerRef.current?.('closed', {});
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
      if (!voluntaryDepartRef.current) {
        cleanupChannel(channelRef.current);
      }
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
    if (pendingReadyRef.current !== null) return;

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
    if (!activeChannel || !presence || !canUseLobbyActions()) return;
    if (pendingReadyRef.current !== null) return;

    const previousPresence = presence;
    const previousReady = presence.isReady;
    const nextReady = !previousReady;

    pendingReadyRef.current = nextReady;
    const updated: LobbyPlayerPresence = { ...presence, isReady: nextReady, hasFinished: false };
    presenceRef.current = updated;
    setIsReady(nextReady);

    try {
      const { error: trackError } = await activeChannel.track(updated);
      if (trackError) {
        pendingReadyRef.current = null;
        presenceRef.current = previousPresence;
        setIsReady(previousReady);
        setError(trackError.message);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 150));
      syncPlayersRef.current(activeChannel);
    } catch (err) {
      pendingReadyRef.current = null;
      presenceRef.current = previousPresence;
      setIsReady(previousReady);
      setError(err instanceof Error ? err.message : 'track_failed');
    }
  }, [canUseLobbyActions]);

  const updateRoomConfig = useCallback(
    async (partial: Pick<RoomBroadcastState, 'lessonId' | 'customText' | 'textSource' | 'blindMode' | 'winConditions'>) => {
      const current = roomStateRef.current;
      if (!user?.id || !current || current.ownerId !== user.id) return;
      if (!canUseLobbyActions()) return;

      const next: RoomBroadcastState = {
        ...current,
        ...partial,
        version: current.version + 1,
      };
      applyRoomState(next);
      await broadcastRoomState(next);
    },
    [applyRoomState, broadcastRoomState, canUseLobbyActions, user?.id],
  );

  const startRace = useCallback(async () => {
    if (!user?.id || roomStateRef.current?.ownerId !== user.id) return;
    if (!allReady) return;

    const phase = roomStateRef.current?.phase;
    if (phase !== 'lobby' && phase !== 'results') return;

    const raceStartedAt = Date.now();
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

  const returnToWaitingRoom = useCallback(async () => {
    if (roomStateRef.current?.phase !== 'results') return;

    setReturnedFromResults(true);
    await returnToLobby();
  }, [returnToLobby]);

  const kickPlayer = useCallback(
    async (targetUserId: string) => {
      if (!user?.id || roomStateRef.current?.ownerId !== user.id) return;
      if (targetUserId === user.id) return;

      const activeChannel = channelRef.current;
      if (!activeChannel) return;

      dismissedPlayersRef.current.set(targetUserId, Date.now());

      const connected = parsePresenceState(
        activeChannel.presenceState<LobbyPlayerPresence>() as Record<string, unknown[]>,
      );
      const targetOnline = connected.some((player) => player.userId === targetUserId);

      if (targetOnline) {
        await activeChannel.send({
          type: 'broadcast',
          event: 'room:kick',
          payload: { targetUserId },
        });
      }

      syncPlayersRef.current(activeChannel);
    },
    [user?.id],
  );

  const getConnectedPlayers = useCallback((): LobbyPlayerPresence[] => {
    const activeChannel = channelRef.current;
    if (!activeChannel) return players;
    return parsePresenceState(
      activeChannel.presenceState<LobbyPlayerPresence>() as Record<string, unknown[]>,
    );
  }, [players]);

  const leaveLobby = useCallback(async () => {
    const activeChannel = channelRef.current;
    const supabase = getSupabaseClient();
    if (!activeChannel || !supabase) return;

    voluntaryDepartRef.current = true;
    pendingReadyRef.current = null;

    if (presenceRef.current) {
      const cleanPresence: LobbyPlayerPresence = {
        ...presenceRef.current,
        isReady: false,
        hasFinished: false,
      };
      await activeChannel.track(cleanPresence);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const { error: untrackError } = await activeChannel.untrack();
    if (untrackError) {
      console.warn('[multiplayer] untrack failed:', untrackError.message);
    }

    await new Promise((resolve) => window.setTimeout(resolve, 300));
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

  /** Voluntary leave — broadcasts host handoff or room closure before untrack. */
  const departFromRoom = useCallback(async () => {
    const activeChannel = channelRef.current;
    const userId = user?.id;
    const current = roomStateRef.current;

    if (userId && current?.ownerId === userId && activeChannel) {
      const others = getConnectedPlayers().filter((player) => player.userId !== userId);

      if (others.length === 0) {
        await activeChannel.send({
          type: 'broadcast',
          event: 'room:closed',
          payload: { reason: 'host_left' },
        });
        await closeRoom(roomId, userId);
      } else {
        const nextHost = others[0];
        if (nextHost) {
          const transferred: RoomBroadcastState = {
            ...current,
            ownerId: nextHost.userId,
            version: current.version + 1,
          };
          applyRoomState(transferred);
          await activeChannel.send({
            type: 'broadcast',
            event: 'room:state',
            payload: transferred,
          });
          await transferRoomHost(roomId, nextHost.userId);
        }
      }
    }

    await leaveLobby();
  }, [applyRoomState, getConnectedPlayers, leaveLobby, roomId, user?.id]);

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
    returnToWaitingRoom,
    returnedFromResults,
    kickPlayer,
    leaveLobby,
    departFromRoom,
    currentUserId: user?.id ?? null,
    channel,
    progressHandlerRef,
    roomEventHandlerRef,
    getConnectedPlayers,
  };
}
