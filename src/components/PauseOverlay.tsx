import { useApp } from '../contexts/AppProvider';

interface PauseOverlayProps {
  onResume: () => void;
}

export default function PauseOverlay({ onResume }: PauseOverlayProps) {
  const { t } = useApp();

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[var(--color-surface)]/80 backdrop-blur-sm">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)]/15 ring-2 ring-[var(--color-accent)]/25">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="var(--color-accent)">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[var(--color-text)]">{t.lesson.paused}</h3>
        <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{t.lesson.pauseHint}</p>
        <button
          type="button"
          onClick={onResume}
          className="mt-6 rounded-xl bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
        >
          {t.lesson.resume}
        </button>
      </div>
    </div>
  );
}
