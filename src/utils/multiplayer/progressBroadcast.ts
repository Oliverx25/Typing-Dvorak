import type { RaceProgressPayload } from '@/types/multiplayer';

export const PROGRESS_BROADCAST_INTERVAL_MS = 500;

type SendProgress = (payload: RaceProgressPayload) => Promise<void>;

/**
 * Trailing throttle for race progress — coalesces rapid keystrokes into
 * at most one WebSocket broadcast every {@link PROGRESS_BROADCAST_INTERVAL_MS}.
 */
export class ThrottledProgressBroadcaster {
  private pending: RaceProgressPayload | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private lastSentAt = 0;

  constructor(
    private readonly send: SendProgress,
    private readonly intervalMs = PROGRESS_BROADCAST_INTERVAL_MS,
  ) {}

  queue(payload: RaceProgressPayload, force = false): void {
    if (force || payload.finished) {
      void this.flushNow(payload);
      return;
    }

    this.pending = payload;
    if (this.timer !== null) return;

    const elapsed = Date.now() - this.lastSentAt;
    const delay = Math.max(0, this.intervalMs - elapsed);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flushPending();
    }, delay);
  }

  dispose(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.pending = null;
  }

  private async flushPending(): Promise<void> {
    if (!this.pending) return;
    const payload = this.pending;
    this.pending = null;
    await this.flushNow(payload);
  }

  private async flushNow(payload: RaceProgressPayload): Promise<void> {
    this.pending = null;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    try {
      await this.send(payload);
      this.lastSentAt = Date.now();
    } catch (error) {
      console.warn('[multiplayer] progress broadcast failed:', error);
    }
  }
}
