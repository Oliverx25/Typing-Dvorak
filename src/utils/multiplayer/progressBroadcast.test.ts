import { describe, expect, it, vi } from 'vitest';
import { ThrottledProgressBroadcaster } from '@/utils/multiplayer/progressBroadcast';
import type { RaceProgressPayload } from '@/types/multiplayer';

const basePayload = (overrides: Partial<RaceProgressPayload> = {}): RaceProgressPayload => ({
  userId: 'u1',
  wpm: 40,
  percentage: 10,
  accuracy: 98,
  maxCombo: 3,
  combo: 3,
  score: 120,
  updatedAt: Date.now(),
  finished: false,
  ...overrides,
});

describe('ThrottledProgressBroadcaster', () => {
  it('coalesces rapid updates into a single send', async () => {
    vi.useFakeTimers();
    const send = vi.fn().mockResolvedValue(undefined);
    const broadcaster = new ThrottledProgressBroadcaster(send, 500);

    broadcaster.queue(basePayload({ percentage: 1 }));
    broadcaster.queue(basePayload({ percentage: 2 }));
    broadcaster.queue(basePayload({ percentage: 3 }));

    expect(send).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(500);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0]?.[0]?.percentage).toBe(3);

    broadcaster.dispose();
    vi.useRealTimers();
  });

  it('sends immediately when finished', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const broadcaster = new ThrottledProgressBroadcaster(send, 500);

    broadcaster.queue(basePayload({ finished: true, percentage: 100 }), true);

    await Promise.resolve();
    expect(send).toHaveBeenCalledTimes(1);
    broadcaster.dispose();
  });
});
