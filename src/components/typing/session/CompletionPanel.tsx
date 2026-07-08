import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { t as translate } from '@/i18n';
import type { KeystrokeLogEntry } from '@/hooks/useTypingSession';
import { useModalTransition } from '@/hooks/useModalTransition';
import { GradeScoreRing } from '@/components/ui';
import { calculateGrade } from '@/utils/grading';
import { calculateMaxScore } from '@/utils/multiplayer/raceScoring';
import { getNextRoadmapLessonId } from '@/utils/curriculum/roadmapChapters';
import SessionAnalyticsPanel from '@/components/typing/session/completion/SessionAnalyticsPanel';
import ResultsFooter from '@/components/typing/session/completion/ResultsFooter';

interface CompletionPanelProps {
  lessonId: string;
  wpm: number;
  accuracy: number;
  elapsedSeconds: number;
  elapsedMs: number;
  correctChars: number;
  incorrectChars: number;
  maxCombo?: number;
  isNewRecord?: boolean;
  wpmDelta?: number;
  weakKeys?: string[];
  keystrokeLog?: KeystrokeLogEntry[];
  stopOnError?: boolean;
  onRetry: () => void;
  retryButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function CompletionPanel({
  lessonId,
  wpm,
  accuracy,
  elapsedSeconds,
  elapsedMs,
  correctChars,
  incorrectChars,
  maxCombo = 0,
  isNewRecord = false,
  wpmDelta = 0,
  weakKeys = [],
  keystrokeLog = [],
  stopOnError = false,
  onRetry,
  retryButtonRef,
}: CompletionPanelProps) {
  const { t, settings } = useApp();
  const { requestClose, backdropClassName, panelClassName } = useModalTransition(onRetry);
  const [isExpanded, setIsExpanded] = useState(false);
  const isPerfect = accuracy === 100;
  const grade = calculateGrade(accuracy);
  const score = calculateMaxScore(wpm, accuracy, maxCombo);
  const maxScore = Math.max(calculateMaxScore(wpm, 100, maxCombo), score, 1);
  const hasGraph = keystrokeLog.length > 2;
  const nextLessonId = useMemo(() => getNextRoadmapLessonId(lessonId), [lessonId]);
  const hasNextLesson = nextLessonId != null;
  const showExpandedLayout = isExpanded && hasGraph;

  const footerLabels = useMemo(
    () => ({
      backToLessons: t.completion.backToLessons,
      showConsistency: t.completion.showConsistency,
      hideConsistency: t.completion.hideConsistency,
      tryAgain: t.completion.tryAgain,
      nextLesson: t.completion.nextLesson,
    }),
    [t.completion],
  );

  const analyticsLabels = useMemo(
    () => ({
      consistencyTitle: t.completion.consistencyTitle,
      rawWpm: t.completion.rawWpm,
      consistency: t.completion.consistency,
      troubleKeys: t.completion.troubleKeys,
      noTroubleKeys: t.completion.noTroubleKeys,
      distribution: {
        title: t.completion.keystrokeDistribution,
        correct: t.completion.keystrokesCorrect,
        corrected: t.completion.keystrokesCorrected,
        errors: t.completion.keystrokesErrors,
        notApplicable: t.completion.keystrokesErrorsNa,
      },
    }),
    [t.completion],
  );

  const handleToggleAnalysis = useCallback(() => {
    setIsExpanded((value) => !value);
  }, []);

  const handleBackToLessons = useCallback(() => {
    window.location.href = '/lessons';
  }, []);

  const handleNextLesson = useCallback(() => {
    if (!nextLessonId) return;
    window.location.href = `/lesson/${nextLessonId}`;
  }, [nextLessonId]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const summaryColumn = (
    <div className={showExpandedLayout ? 'flex h-full flex-col md:col-span-5' : ''}>
      <div className="flex flex-col items-center py-1">
        <GradeScoreRing
          score={score}
          maxScore={maxScore}
          finalGrade={grade}
          scoreLabel={t.completion.gradeEarned}
          animateKey={`${score}-${grade}`}
          size="md"
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-border)]">
        <div className="bg-[var(--color-surface-elevated)] px-2 py-3 text-center sm:px-3 sm:py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            {t.typing.wpm}
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-[var(--color-text)] sm:text-xl">{wpm}</p>
        </div>
        <div className="bg-[var(--color-surface-elevated)] px-2 py-3 text-center sm:px-3 sm:py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            {t.typing.accuracy}
          </p>
          <p
            className={[
              'mt-1 font-mono text-lg font-bold sm:text-xl',
              accuracy === 100 ? 'text-[var(--color-correct)]' : 'text-[var(--color-text)]',
            ].join(' ')}
          >
            {accuracy}%
          </p>
        </div>
        <div className="bg-[var(--color-surface-elevated)] px-2 py-3 text-center sm:px-3 sm:py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            {t.typing.time}
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-[var(--color-text)] sm:text-xl">
            {formatTime(elapsedSeconds)}
          </p>
        </div>
      </div>

      {weakKeys.length > 0 && !showExpandedLayout ? (
        <div className="mt-4 rounded-xl border border-[var(--color-incorrect)]/20 bg-[var(--color-incorrect)]/5 px-4 py-3 text-left">
          <p className="text-center text-xs font-medium text-[var(--color-text-muted)]">
            {t.completion.weakKeys}
          </p>
          <div className="mt-2.5 flex justify-center gap-2">
            {weakKeys.map((key) => (
              <kbd
                key={key}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-[var(--color-incorrect)]/25 bg-[var(--color-surface)] font-mono text-base font-semibold text-[var(--color-incorrect)]"
              >
                {key === ' ' ? '␣' : key}
              </kbd>
            ))}
          </div>
          <p className="mt-2 text-center text-[10px] text-[var(--color-text-muted)]">
            {t.completion.weakKeysHint}
          </p>
        </div>
      ) : null}

      <ResultsFooter
        showAnalysisToggle={hasGraph}
        isExpanded={isExpanded}
        hasNextLesson={hasNextLesson}
        onToggleAnalysis={handleToggleAnalysis}
        onRetry={requestClose}
        onBackToLessons={handleBackToLessons}
        onNextLesson={handleNextLesson}
        retryButtonRef={retryButtonRef}
        labels={footerLabels}
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-title"
    >
      <div
        className={`absolute inset-0 bg-[var(--color-surface)]/60 backdrop-blur-sm motion-reduce:backdrop-blur-none ${backdropClassName}`}
        aria-hidden="true"
      />

      <div
        className={[
          panelClassName,
          'relative flex w-full flex-col overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/95 shadow-2xl shadow-black/30 backdrop-blur-md motion-reduce:animate-none',
          'transition-[max-width] duration-500 ease-in-out',
          showExpandedLayout ? 'max-w-5xl' : 'max-w-sm',
        ].join(' ')}
      >
        <header
          className={[
            'border-b border-[var(--color-border)] px-5 py-4 text-center',
            isPerfect ? 'bg-[var(--color-correct)]/5' : 'bg-[var(--color-highlight)]/5',
          ].join(' ')}
        >
          {isNewRecord ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-key-target)]">
              {t.completion.newRecord}
            </p>
          ) : null}

          <h2 id="completion-title" className="mt-1 text-xl font-bold tracking-tight text-[var(--color-text)]">
            {isPerfect ? t.completion.perfect : t.completion.complete}
          </h2>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {isPerfect ? t.completion.perfectDesc : t.completion.keepGoing}
          </p>

          {wpmDelta > 0 && !isNewRecord ? (
            <p className="mt-1 text-xs text-[var(--color-correct)]">
              {translate(settings.locale, 'completion.improved', { delta: wpmDelta })}
            </p>
          ) : null}
        </header>

        <div
          className={[
            'px-5 py-5',
            showExpandedLayout ? 'grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8' : '',
          ].join(' ')}
        >
          {summaryColumn}

          {showExpandedLayout ? (
            <div className="min-w-0 md:col-span-7">
              <SessionAnalyticsPanel
                wpm={wpm}
                correctChars={correctChars}
                incorrectChars={incorrectChars}
                elapsedMs={elapsedMs}
                keystrokeLog={keystrokeLog}
                weakKeys={weakKeys}
                stopOnError={stopOnError}
                labels={analyticsLabels}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
