import { describe, expect, it } from 'vitest';
import { normalizePlayersForLobbyView } from './presence';
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
});
