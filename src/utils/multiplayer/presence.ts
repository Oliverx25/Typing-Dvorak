import type { AvatarSource } from '@/utils/user/userDisplay';
import type { LobbyPlayerPresence } from '@/types/multiplayer';

export function parsePresenceState(
  state: Record<string, unknown[]>,
): LobbyPlayerPresence[] {
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
