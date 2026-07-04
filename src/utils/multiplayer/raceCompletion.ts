import type { LobbyPlayerPresence, RoomPhase } from '@/types/multiplayer';

/**
 * A race is complete when every player still connected to the channel has finished.
 * Disconnected players (removed from presence) are not waited on.
 */
export function isRaceCompleteForConnected(connectedPlayers: LobbyPlayerPresence[]): boolean {
  return connectedPlayers.length > 0 && connectedPlayers.every((player) => player.hasFinished);
}

/** Any connected participant may broadcast the transition to results. */
export function canAdvanceToResults(
  phase: RoomPhase | undefined,
  connectedPlayers: LobbyPlayerPresence[],
  userId: string | null | undefined,
): boolean {
  if (phase !== 'racing' || !userId) return false;
  if (!isRaceCompleteForConnected(connectedPlayers)) return false;
  return connectedPlayers.some((player) => player.userId === userId);
}

export function countPendingPlayers(
  connectedPlayers: LobbyPlayerPresence[],
  excludeUserId?: string | null,
): number {
  return connectedPlayers.filter(
    (player) => player.userId !== excludeUserId && !player.hasFinished,
  ).length;
}
