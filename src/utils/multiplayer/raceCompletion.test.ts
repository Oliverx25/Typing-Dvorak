import { describe, expect, it } from 'vitest';
import {
  areAllRaceParticipantsFinished,
  canAdvanceToResults,
  countPendingPlayers,
  isRaceCompleteForConnected,
} from '@/utils/multiplayer/raceCompletion';
import type { LobbyPlayerPresence } from '@/types/multiplayer';

function player(
  id: string,
  hasFinished: boolean,
): LobbyPlayerPresence {
  return {
    userId: id,
    name: id,
    avatarUrl: null,
    initials: id.slice(0, 2).toUpperCase(),
    avatarSource: 'none',
    isReady: true,
    hasFinished,
    joinedAt: 0,
  };
}

describe('raceCompletion', () => {
  it('completes when all connected players finished', () => {
    expect(isRaceCompleteForConnected([player('a', true)])).toBe(true);
    expect(isRaceCompleteForConnected([player('a', true), player('b', true)])).toBe(true);
    expect(isRaceCompleteForConnected([player('a', true), player('b', false)])).toBe(false);
    expect(isRaceCompleteForConnected([])).toBe(false);
  });

  it('requires every snapshotted participant to be connected and finished', () => {
    const participants = ['a', 'b'];

    expect(
      areAllRaceParticipantsFinished([player('a', true), player('b', true)], participants),
    ).toBe(true);

    expect(
      areAllRaceParticipantsFinished([player('a', true), player('b', false)], participants),
    ).toBe(false);

    // Opponent briefly missing from presence must not count as finished.
    expect(areAllRaceParticipantsFinished([player('a', true)], participants)).toBe(false);
  });

  it('allows any connected participant to advance results', () => {
    const connected = [player('a', true), player('b', true)];
    const participants = ['a', 'b'];

    expect(canAdvanceToResults('racing', connected, 'a', participants)).toBe(true);
    expect(canAdvanceToResults('racing', connected, 'b', participants)).toBe(true);
    expect(canAdvanceToResults('racing', connected, 'c', participants)).toBe(false);
    expect(canAdvanceToResults('lobby', connected, 'a', participants)).toBe(false);
  });

  it('does not advance when only the finisher remains visible in presence', () => {
    const participants = ['a', 'b'];
    const connected = [player('a', true)];

    expect(canAdvanceToResults('racing', connected, 'a', participants)).toBe(false);
    expect(isRaceCompleteForConnected(connected)).toBe(true);
  });

  it('counts pending opponents', () => {
    const connected = [player('a', true), player('b', false), player('c', false)];
    expect(countPendingPlayers(connected, 'a')).toBe(2);
    expect(countPendingPlayers(connected, 'b')).toBe(1);
  });
});
