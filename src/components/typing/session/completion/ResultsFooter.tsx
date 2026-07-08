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
    <footer className="flex w-full flex-wrap items-center justify-between gap-4">
      <button
        type="button"
        onClick={onBackToLessons}
        className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-slate-400 transition hover:text-white"
      >
        <LuArrowLeft size={16} aria-hidden />
        {labels.backToLessons}
      </button>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {showAnalysisToggle ? (
          <button
            type="button"
            onClick={onToggleAnalysis}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-800/50 hover:text-white"
          >
            <Icon name="chart" size={16} />
            {isExpanded ? labels.hideConsistency : labels.showConsistency}
          </button>
        ) : null}

        <button
          ref={retryButtonRef}
          type="button"
          onClick={onRetry}
          className={[
            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-semibold transition',
            hasNextLesson
              ? 'border border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800'
              : 'bg-[var(--color-highlight)] px-6 py-3 text-base text-white shadow-lg shadow-[var(--color-highlight)]/20 hover:bg-[var(--color-highlight-hover)]',
          ].join(' ')}
        >
          {labels.tryAgain}
          {!hasNextLesson ? (
            <kbd className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-xs font-normal text-white/80">
              Enter ↵
            </kbd>
          ) : null}
        </button>

        {hasNextLesson ? (
          <button
            type="button"
            onClick={onNextLesson}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[var(--color-highlight)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-highlight)]/20 transition hover:bg-[var(--color-highlight-hover)]"
          >
            {labels.nextLesson}
            <Icon name="chevron-right" size={16} />
          </button>
        ) : null}
      </div>
    </footer>
  );
}

export default memo(ResultsFooter);
