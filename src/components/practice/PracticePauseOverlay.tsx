import { useApp } from '@/contexts/AppProvider';

interface PracticePauseOverlayProps {
  onResume: () => void;
}

/** Full-viewport pause UI used only on `/practice`. */
export default function PracticePauseOverlay({ onResume }: PracticePauseOverlayProps) {
  const { t } = useApp();

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md">
      <div className="flex flex-col items-center rounded-xl border border-slate-700 bg-slate-800 p-8 shadow-2xl">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-highlight)]/15 ring-2 ring-[var(--color-highlight)]/25">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="var(--color-highlight)">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">{t.lesson.paused}</h2>
        <p className="mb-6 text-slate-400">{t.lesson.pauseHint}</p>
        <button
          type="button"
          onClick={onResume}
          className="rounded-xl bg-[var(--color-highlight)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-highlight-hover)]"
        >
          {t.lesson.resume}
        </button>
      </div>
    </div>
  );
}
