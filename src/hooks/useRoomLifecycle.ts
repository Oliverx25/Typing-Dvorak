import { useCallback, useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import {
  closeRoom,
  closeRoomKeepalive,
  transferRoomHost,
  transferRoomHostKeepalive,
} from '@/services/supabase/rooms';
import type { LobbyPlayerPresence } from '@/types/multiplayer';

interface UseRoomLifecycleOptions {
  roomId: string;
  userId: string | null;
  isOwner: boolean;
  getConnectedPlayers: () => LobbyPlayerPresence[];
}

/**
 * Closes or transfers a room when the host disconnects unexpectedly
 * (tab close, navigation away, component unmount).
 */
export function useRoomLifecycle({
  roomId,
  userId,
  isOwner,
  getConnectedPlayers,
}: UseRoomLifecycleOptions) {
  const isOwnerRef = useRef(isOwner);
  const userIdRef = useRef(userId);
  const getConnectedPlayersRef = useRef(getConnectedPlayers);
  const accessTokenRef = useRef<string | null>(null);
  const lifecycleHandledRef = useRef(false);

  isOwnerRef.current = isOwner;
  userIdRef.current = userId;
  getConnectedPlayersRef.current = getConnectedPlayers;

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    void supabase.auth.getSession().then(({ data }) => {
      accessTokenRef.current = data.session?.access_token ?? null;
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      accessTokenRef.current = session?.access_token ?? null;
    });

    return () => subscription.unsubscribe();
  }, []);

  const runHostDisconnect = useCallback(
    (keepalive: boolean) => {
      const hostId = userIdRef.current;
      if (!hostId || !isOwnerRef.current || lifecycleHandledRef.current) return;

      lifecycleHandledRef.current = true;
      const connected = getConnectedPlayersRef.current();
      const others = connected.filter((player) => player.userId !== hostId);
      const token = accessTokenRef.current;

      if (others.length === 0) {
        if (keepalive && token) {
          closeRoomKeepalive(roomId, hostId, token);
        } else {
          void closeRoom(roomId, hostId);
        }
        return;
      }

      const nextHost = others[0];
      if (!nextHost) return;

      if (keepalive && token) {
        transferRoomHostKeepalive(roomId, nextHost.userId, token);
      } else {
        void transferRoomHost(roomId, nextHost.userId);
      }
    },
    [roomId],
  );

  useEffect(() => {
    lifecycleHandledRef.current = false;

    const onBeforeUnload = () => {
      runHostDisconnect(true);
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      runHostDisconnect(false);
    };
  }, [runHostDisconnect, roomId]);

  const closeAsHost = useCallback(async () => {
    if (lifecycleHandledRef.current) return;

    const hostId = userIdRef.current;
    if (!hostId || !isOwnerRef.current) return;

    lifecycleHandledRef.current = true;
    const connected = getConnectedPlayersRef.current();
    const others = connected.filter((player) => player.userId !== hostId);

    if (others.length === 0) {
      await closeRoom(roomId, hostId);
    } else {
      const nextHost = others[0];
      if (nextHost) await transferRoomHost(roomId, nextHost.userId);
    }
  }, [roomId]);

  return { closeAsHost, markHostDepartureHandled: () => { lifecycleHandledRef.current = true; } };
}
