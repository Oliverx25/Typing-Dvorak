import { describe, expect, it } from 'vitest';
import {
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

  it('allows any connected player to advance results', () => {
    const connected = [player('a', true), player('b', true)];
    expect(canAdvanceToResults('racing', connected, 'a')).toBe(true);
    expect(canAdvanceToResults('racing', connected, 'b')).toBe(true);
    expect(canAdvanceToResults('racing', connected, 'c')).toBe(false);
    expect(canAdvanceToResults('lobby', connected, 'a')).toBe(false);
  });

  it('counts pending opponents', () => {
    const connected = [player('a', true), player('b', false), player('c', false)];
    expect(countPendingPlayers(connected, 'a')).toBe(2);
    expect(countPendingPlayers(connected, 'b')).toBe(1);
  });
});
