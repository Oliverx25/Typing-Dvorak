import { useApp } from '@/contexts/AppProvider';
import type { LobbyConnectionStatus } from '@/types/multiplayer';

interface RealtimeReconnectBannerProps {
  status: LobbyConnectionStatus;
  visible: boolean;
}

/** Subtle banner shown while Supabase Realtime reconnects mid-session. */
export default function RealtimeReconnectBanner({ status, visible }: RealtimeReconnectBannerProps) {
  const { t } = useApp();

  if (!visible || (status !== 'reconnecting' && status !== 'connecting')) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-3 pt-3"
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-highlight)]/30 bg-[var(--color-surface-elevated)]/95 px-3.5 py-1.5 text-xs font-medium text-[var(--color-text-muted)] shadow-lg backdrop-blur-sm">
        <span
          className="inline-block size-3.5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-highlight)]"
          aria-hidden="true"
        />
        {t.multiplayer.raceReconnecting}
      </div>
    </div>
  );
}
