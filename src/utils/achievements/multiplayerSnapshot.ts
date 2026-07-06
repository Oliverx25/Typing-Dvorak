import type { RaceParticipantProgress, RoomBroadcastState, LobbyPlayerPresence } from '@/types/multiplayer';
import {
  computeWinMarginSeconds,
  computeWpmGapToSecond,
} from '@/utils/multiplayer/raceRanking';
import { resolveRaceTextSource } from '@/utils/stats/sessionDisplay';
import type { LastSessionSnapshot } from '@/utils/achievements/achievementEvaluator';

export interface MultiplayerSnapshotInput {
  leaderboard: RaceParticipantProgress[];
  currentUserId: string;
  players: LobbyPlayerPresence[];
  roomState: RoomBroadcastState;
  halfProgressRank: number | null;
  pendingExtras: Partial<LastSessionSnapshot>;
}

export function buildMultiplayerAchievementExtras(
  input: MultiplayerSnapshotInput,
): Partial<LastSessionSnapshot> {
  const { leaderboard, currentUserId, players, roomState, halfProgressRank, pendingExtras } =
    input;

  const won = leaderboard[0]?.userId === currentUserId;
  const finalRank =
    leaderboard.findIndex((entry) => entry.userId === currentUserId) + 1 || players.length;

  return {
    ...pendingExtras,
    isMultiplayerWin: won,
    mpWinMarginSeconds: won ? computeWinMarginSeconds(leaderboard) : undefined,
    mpSecondPlaceWpmGap: computeWpmGapToSecond(leaderboard, won),
    playerCount: players.length,
    halfProgressRank: halfProgressRank ?? undefined,
    finalRank,
    songArtist: roomState.songMeta?.artist ?? undefined,
    multiplayerSource: resolveRaceTextSource(roomState),
    raceModifiers: roomState.modifiers.length > 0 ? roomState.modifiers : undefined,
  };
}
