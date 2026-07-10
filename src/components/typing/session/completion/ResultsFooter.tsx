import { memo, type RefObject } from 'react';
import { LuArrowLeft } from 'react-icons/lu';
import { Icon } from '@/components/ui';

export interface ResultsFooterLabels {
  backToLessons: string;
  showConsistency: string;
  hideConsistency: string;
  tryAgain: string;
  nextLesson: string;
}

interface ResultsFooterProps {
  showAnalysisToggle: boolean;
  isExpanded: boolean;
  hasNextLesson: boolean;
  onToggleAnalysis: () => void;
  onRetry: () => void;
  onBackToLessons: () => void;
  onNextLesson: () => void;
  retryButtonRef?: RefObject<HTMLButtonElement | null>;
  labels: ResultsFooterLabels;
}

function ResultsFooter({
  showAnalysisToggle,
  isExpanded,
  hasNextLesson,
  onToggleAnalysis,
  onRetry,
  onBackToLessons,
  onNextLesson,
  retryButtonRef,
  labels,
}: ResultsFooterProps) {
  return (
    <nav
      className="mt-6 flex w-full flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-800/50"
      aria-label={labels.tryAgain}
    >
      {hasNextLesson ? (
        <button
          type="button"
          onClick={onNextLesson}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-highlight)] py-3 font-medium text-white transition-colors hover:bg-[var(--color-highlight-hover)]"
        >
          {labels.nextLesson}
          <Icon name="chevron-right" size={16} />
        </button>
      ) : null}

      <button
        ref={retryButtonRef}
        type="button"
        onClick={onRetry}
        onKeyDown={(event) => {
          if (event.key === ' ') {
            event.preventDefault();
          }
        }}
        className={[
          'flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium transition-colors',
          hasNextLesson
            ? 'border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700'
            : 'bg-[var(--color-highlight)] text-white shadow-lg shadow-[var(--color-highlight)]/20 hover:bg-[var(--color-highlight-hover)]',
        ].join(' ')}
      >
        {labels.tryAgain}
        {!hasNextLesson ? (
          <kbd className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-xs font-normal text-white/80">
            Enter ↵
          </kbd>
        ) : null}
      </button>

      {showAnalysisToggle ? (
        <button
          type="button"
          onClick={onToggleAnalysis}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-transparent py-3 text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <Icon name="chart" size={16} />
          {isExpanded ? labels.hideConsistency : labels.showConsistency}
        </button>
      ) : null}

      <button
        type="button"
        onClick={onBackToLessons}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-transparent py-3 text-slate-500 transition-colors hover:text-slate-700 dark:hover:text-slate-300"
      >
        <LuArrowLeft size={16} aria-hidden />
        {labels.backToLessons}
      </button>
    </nav>
  );
}

export default memo(ResultsFooter);
