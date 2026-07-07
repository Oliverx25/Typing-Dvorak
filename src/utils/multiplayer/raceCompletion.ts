import type { LobbyPlayerPresence, RoomPhase } from '@/types/multiplayer';

/**
 * A race is complete when every player still connected to the channel has finished.
 * Disconnected players (removed from presence) are not waited on.
 *
 * @deprecated Prefer {@link areAllRaceParticipantsFinished} during an active race.
 */
export function isRaceCompleteForConnected(connectedPlayers: LobbyPlayerPresence[]): boolean {
  return connectedPlayers.length > 0 && connectedPlayers.every((player) => player.hasFinished);
}

/**
 * True when every participant snapshotted at race start is connected and has finished.
 * Prevents ending the race early when opponents briefly disappear from presence sync.
 */
export function areAllRaceParticipantsFinished(
  connectedPlayers: LobbyPlayerPresence[],
  raceParticipantIds: string[],
): boolean {
  if (raceParticipantIds.length === 0) {
    return isRaceCompleteForConnected(connectedPlayers);
  }

  const connectedById = new Map(connectedPlayers.map((player) => [player.userId, player]));

  for (const participantId of raceParticipantIds) {
    const player = connectedById.get(participantId);
    if (!player || !player.hasFinished) return false;
  }

  return true;
}

/** Any connected participant may broadcast the transition to results. */
export function canAdvanceToResults(
  phase: RoomPhase | undefined,
  connectedPlayers: LobbyPlayerPresence[],
  userId: string | null | undefined,
  raceParticipantIds: string[] = [],
): boolean {
  if (phase !== 'racing' || !userId) return false;
  if (!connectedPlayers.some((player) => player.userId === userId)) return false;
  return areAllRaceParticipantsFinished(connectedPlayers, raceParticipantIds);
}

export function countPendingPlayers(
  connectedPlayers: LobbyPlayerPresence[],
  excludeUserId?: string | null,
): number {
  return connectedPlayers.filter(
    (player) => player.userId !== excludeUserId && !player.hasFinished,
  ).length;
}
