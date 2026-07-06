import { describe, expect, it } from 'vitest';
import {
  normalizePlayersForLobbyView,
  applyPresenceJoinDiff,
  applyPresenceLeaveDiff,
} from './presence';
import type { LobbyPlayerPresence } from '@/types/multiplayer';

const samplePlayer = (overrides: Partial<LobbyPlayerPresence> = {}): LobbyPlayerPresence => ({
  userId: 'u1',
  name: 'Test',
  avatarUrl: null,
  initials: 'TE',
  avatarSource: 'none',
  isReady: false,
  hasFinished: true,
  joinedAt: 1,
  ...overrides,
});

describe('presence', () => {
  it('clears hasFinished in lobby view normalization', () => {
    const players = [samplePlayer(), samplePlayer({ userId: 'u2', hasFinished: false })];
    const normalized = normalizePlayersForLobbyView(players);
    expect(normalized.every((player) => !player.hasFinished)).toBe(true);
    expect(normalized[0]?.isReady).toBe(false);
  });

  it('applies join diff incrementally', () => {
    const map = new Map<string, LobbyPlayerPresence>();
    const joined = applyPresenceJoinDiff(map, {
      event: 'join',
      key: 'u2',
      newPresences: [samplePlayer({ userId: 'u2', joinedAt: 2 })],
    });
    expect(joined).toHaveLength(1);
    expect(joined[0]?.userId).toBe('u2');
  });

  it('applies leave diff and removes offline players', () => {
    const map = new Map<string, LobbyPlayerPresence>([
      ['u1', samplePlayer({ userId: 'u1', joinedAt: 1 })],
      ['u2', samplePlayer({ userId: 'u2', joinedAt: 2 })],
    ]);
    const remaining = applyPresenceLeaveDiff(map, {
      event: 'leave',
      key: 'u2',
      leftPresences: [{ userId: 'u2', joinedAt: 2 }],
    });
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.userId).toBe('u1');
  });
});
