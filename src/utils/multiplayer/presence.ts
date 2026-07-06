import type { AvatarSource } from '@/utils/user/userDisplay';
import type { LobbyPlayerPresence } from '@/types/multiplayer';

export type PresenceRealtimeEvent = 'sync' | 'join' | 'leave';

export interface PresenceJoinDiff {
  event: 'join';
  key: string;
  newPresences: Partial<LobbyPlayerPresence>[];
}

export interface PresenceLeaveDiff {
  event: 'leave';
  key: string;
  leftPresences: Partial<LobbyPlayerPresence>[];
}

function normalizePresenceEntry(raw: Partial<LobbyPlayerPresence>): LobbyPlayerPresence | null {
  if (!raw.userId || !raw.name) return null;

  return {
    userId: raw.userId,
    name: raw.name,
    avatarUrl: raw.avatarUrl ?? null,
    initials: raw.initials ?? raw.name.slice(0, 2).toUpperCase(),
    avatarSource: (raw.avatarSource as AvatarSource) ?? 'none',
    isReady: Boolean(raw.isReady),
    hasFinished: Boolean(raw.hasFinished),
    joinedAt: raw.joinedAt ?? 0,
  };
}

function sortPresencePlayers(players: Iterable<LobbyPlayerPresence>): LobbyPlayerPresence[] {
  return Array.from(players).sort((a, b) => a.joinedAt - b.joinedAt);
}

export function parsePresenceState(
  state: Record<string, unknown[]>,
): LobbyPlayerPresence[] {
  const byUser = new Map<string, LobbyPlayerPresence>();

  for (const presences of Object.values(state)) {
    for (const raw of presences) {
      const player = normalizePresenceEntry(raw as Partial<LobbyPlayerPresence>);
      if (!player) continue;

      const existing = byUser.get(player.userId);
      if (!existing || player.joinedAt >= existing.joinedAt) {
        byUser.set(player.userId, player);
      }
    }
  }

  return sortPresencePlayers(byUser.values());
}

/** Incremental join — mirrors Supabase Realtime `presence` join payloads. */
export function applyPresenceJoinDiff(
  current: Map<string, LobbyPlayerPresence>,
  diff: PresenceJoinDiff,
): LobbyPlayerPresence[] {
  for (const raw of diff.newPresences) {
    const player = normalizePresenceEntry(raw);
    if (!player) continue;

    const existing = current.get(player.userId);
    if (!existing || player.joinedAt >= existing.joinedAt) {
      current.set(player.userId, player);
    }
  }

  return sortPresencePlayers(current.values());
}

/** Incremental leave — removes players that went offline. */
export function applyPresenceLeaveDiff(
  current: Map<string, LobbyPlayerPresence>,
  diff: PresenceLeaveDiff,
): LobbyPlayerPresence[] {
  for (const raw of diff.leftPresences) {
    const userId = raw.userId;
    if (!userId) continue;

    const existing = current.get(userId);
    if (!existing) continue;

    if (raw.joinedAt != null && raw.joinedAt < existing.joinedAt) continue;
    current.delete(userId);
  }

  return sortPresencePlayers(current.values());
}

/** In the waiting room, race-finished flags should not affect lobby UI. */
export function normalizePlayersForLobbyView(
  players: LobbyPlayerPresence[],
): LobbyPlayerPresence[] {
  return players.map((player) => ({ ...player, hasFinished: false }));
}
