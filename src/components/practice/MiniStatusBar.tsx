import { memo } from 'react';
import { useApp } from '@/contexts/AppProvider';

interface MiniStatusBarProps {
  wpm: number;
  accuracy: number;
  elapsedSeconds: number;
  progress: number;
  started: boolean;
  finished?: boolean;
  isTestMode?: boolean;
  timeRemaining?: number;
  combo: number;
  comboBroke?: boolean;
  onComboBrokeHandled?: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function MiniStatusBar({
  wpm,
  accuracy,
  elapsedSeconds,
  progress,
  started,
  finished = false,
  isTestMode = false,
  timeRemaining = 0,
  combo,
  comboBroke = false,
  onComboBrokeHandled,
}: MiniStatusBarProps) {
  const { t } = useApp();
  const timeValue = isTestMode ? formatTime(timeRemaining) : formatTime(elapsedSeconds);
  const showCombo = combo > 1 || comboBroke;

  return (
    <div className="mb-4 w-full" aria-live="polite" aria-atomic="true">
      <div className="flex flex-row flex-wrap items-center justify-center gap-x-8 gap-y-2 font-mono text-sm text-slate-500">
        <span>
          <span className="uppercase tracking-wider opacity-60">{t.typing.wpm}</span>{' '}
          <span className={started && !finished ? 'text-[var(--color-highlight)]' : 'text-slate-400'}>{wpm}</span>
        </span>
        <span>
          <span className="uppercase tracking-wider opacity-60">{t.typing.accuracy}</span>{' '}
          <span className={accuracy === 100 && finished ? 'text-emerald-500' : 'text-slate-400'}>{accuracy}%</span>
        </span>
        <span>
          <span className="uppercase tracking-wider opacity-60">
            {isTestMode ? t.lesson.timeRemaining : t.typing.time}
          </span>{' '}
          <span className={isTestMode && timeRemaining <= 10 && started ? 'text-red-400' : 'text-slate-400'}>
            {timeValue}
          </span>
        </span>
        {showCombo ? (
          <span
            className={[
              'tabular-nums transition-colors',
              comboBroke ? 'shake text-red-400' : 'text-[var(--color-highlight)]',
            ].join(' ')}
            onAnimationEnd={comboBroke ? onComboBrokeHandled : undefined}
          >
            {t.typing.combo} x{combo}
          </span>
        ) : null}
      </div>

      <div className="relative mx-auto mt-3 h-0.5 w-full max-w-xl overflow-hidden rounded-full bg-slate-800/60">
        <div
          className="h-full rounded-full bg-[var(--color-highlight)]/70 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

export default memo(MiniStatusBar);
