import { useEffect, useState } from 'react';
import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import type { Lesson } from '@/utils/curriculum/lessons';
import { useTypingSession } from '@/hooks/useTypingSession';
import Keyboard from './Keyboard';
import StatsBar from './StatsBar';
import CompletionPanel from './CompletionPanel';
import ModeToggle, { ModeDescription } from './ModeToggle';
import PauseOverlay from './PauseOverlay';
import TypedChar from './TypedChar';
import ComboCounter from './ComboCounter';

import type { PracticeMode } from '@/utils/app/settings';
import { calculateMaxScore } from '@/utils/multiplayer/raceScoring';

export interface TypingProgressUpdate {
  wpm: number;
  percentage: number;
  accuracy: number;
  maxCombo: number;
  combo: number;
  score: number;
}

interface TypingTestProps {
  lessonId: string;
  lesson: Lesson;
  customText?: string;
  practiceMode?: PracticeMode;
  blindModeOverride?: boolean;
  hideModeToggle?: boolean;
  hideCompletionPanel?: boolean;
  ariaLabel?: string;
  raceMode?: boolean;
  onProgressChange?: (update: TypingProgressUpdate, force?: boolean) => void;
}

export default function TypingTest({
  lessonId,
  lesson,
  customText,
  practiceMode,
  blindModeOverride,
  hideModeToggle = false,
  hideCompletionPanel = false,
  ariaLabel,
  raceMode = false,
  onProgressChange,
}: TypingTestProps) {
  const { t, settings } = useApp();
  const lessonTitle = ariaLabel ?? getLessonTitle(t, lesson.titleKey);
  const effectiveBlindMode = blindModeOverride ?? settings.blindMode;
  const effectiveMode = practiceMode ?? settings.practiceMode;

  const session = useTypingSession({
    lessonId,
    lessonTitle,
    lesson,
    mode: effectiveMode,
    sound: settings.sound,
    locale: settings.locale,
    customText,
    raceMode,
  });

  const {
    targetText,
    input,
    statuses,
    started,
    finished,
    paused,
    stats,
    progress,
    timeRemaining,
    targetKey,
    activeKey,
    isNewRecord,
    wpmDelta,
    sessionWeakKeys,
    isTestMode,
    combo,
    maxCombo,
    comboBroke,
    raceScore,
    errorKeystrokes,
    clearComboBroke,
    containerRef,
    retryButtonRef,
    reset,
    handleKeyDown,
    togglePause,
  } = session;

  const [keyboardOpen, setKeyboardOpen] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    setKeyboardOpen(!mq.matches);
    const handler = (e: MediaQueryListEvent) => setKeyboardOpen(!e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!onProgressChange || !started || paused) return;

    const score = raceMode
      ? raceScore
      : calculateMaxScore(stats.wpm, stats.accuracy, maxCombo);

    const update: TypingProgressUpdate = {
      wpm: stats.wpm,
      percentage: progress,
      accuracy: stats.accuracy,
      maxCombo,
      combo,
      score,
    };

    onProgressChange(update, finished);
    if (finished) return;

    const interval = window.setInterval(() => {
      onProgressChange({
        wpm: stats.wpm,
        percentage: progress,
        accuracy: stats.accuracy,
        maxCombo,
        combo,
        score: raceMode
          ? raceScore
          : calculateMaxScore(stats.wpm, stats.accuracy, maxCombo),
      });
    }, 500);

    return () => window.clearInterval(interval);
  }, [
    onProgressChange,
    started,
    paused,
    finished,
    stats.wpm,
    stats.accuracy,
    maxCombo,
    combo,
    raceScore,
    raceMode,
    progress,
  ]);

  const showKeyboard = !effectiveBlindMode && keyboardOpen;

  return (
    <div className="space-y-6">
      {!hideModeToggle ? (
        <>
          <ModeToggle />
          <ModeDescription />
        </>
      ) : null}

      <StatsBar
        wpm={stats.wpm}
        accuracy={stats.accuracy}
        elapsedSeconds={stats.elapsedSeconds}
        progress={progress}
        finished={finished}
        started={started}
        isTestMode={isTestMode}
        timeRemaining={timeRemaining}
        errors={raceMode ? errorKeystrokes : undefined}
      />

      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={() => !finished && !paused && containerRef.current?.focus()}
        role="textbox"
        aria-label={lessonTitle}
        aria-readonly="true"
        className={[
          'relative min-h-[160px] cursor-text overflow-hidden rounded-2xl border-2 bg-[var(--color-surface-elevated)] p-6 outline-none transition-all duration-300 sm:min-h-[180px] sm:p-8',
          finished ? 'border-[var(--color-correct)]/30' : paused ? 'border-[var(--color-key-target)]/40' : 'border-[var(--color-border)] focus:border-[var(--color-highlight)]/50 focus:ring-4 focus:ring-[var(--color-highlight)]/10',
        ].join(' ')}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'linear-gradient(to bottom, black, transparent)',
          }}
          aria-hidden="true"
        />

        {(started || combo > 0) && !finished && (
          <div className="absolute top-3 right-3 z-10">
            <ComboCounter
              combo={combo}
              broke={comboBroke}
              onBrokeHandled={clearComboBroke}
              label={t.typing.combo}
            />
          </div>
        )}

        <p className="relative font-mono text-xl leading-[2] tracking-wide break-words sm:text-2xl sm:leading-[2.2]" aria-live="off">
          {targetText.split('').map((char, i) => (
            <span key={i}>
              <TypedChar
                char={char}
                status={statuses[i]}
                isCurrent={i === input.length}
                active={!finished && !paused}
              />
            </span>
          ))}
          {!finished && !paused && input.length === targetText.length && (
            <span className="caret-blink ml-px inline-block h-[1.1em] w-0.5 translate-y-0.5 bg-[var(--color-key-target)] align-middle motion-reduce:animate-none" />
          )}
        </p>

        {!started && !finished && (
          <p className="relative mt-6 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <span className="inline-flex h-2 w-2 rounded-full bg-[var(--color-highlight)] animate-pulse motion-reduce:animate-none" />
            {t.lesson.startTyping}
          </p>
        )}

        {paused && !finished && <PauseOverlay onResume={togglePause} />}
      </div>

      {finished && !hideCompletionPanel && (
        <CompletionPanel
          wpm={stats.wpm}
          accuracy={stats.accuracy}
          elapsedSeconds={stats.elapsedSeconds}
          isNewRecord={isNewRecord}
          wpmDelta={wpmDelta}
          weakKeys={sessionWeakKeys}
          onRetry={reset}
          retryButtonRef={retryButtonRef}
        />
      )}

      {!effectiveBlindMode && (
        <div className="flex items-center justify-center sm:hidden">
          <button
            type="button"
            onClick={() => setKeyboardOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-sm text-[var(--color-text-muted)] transition hover:border-[var(--color-highlight)] hover:text-[var(--color-highlight)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001" />
            </svg>
            {keyboardOpen ? t.typing.hideKeyboard : t.typing.showKeyboard}
          </button>
        </div>
      )}

      {showKeyboard && (
        <div className={['transition-all duration-500', finished ? 'pointer-events-none opacity-40 grayscale-[30%]' : 'opacity-100'].join(' ')}>
          <div className="overflow-x-auto">
            <Keyboard pressedKey={activeKey} targetKey={targetKey} />
          </div>
        </div>
      )}

      {effectiveBlindMode && !finished && (
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-[var(--color-text-muted)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
          {t.settings.blindDesc}
        </p>
      )}

      {isTestMode && started && !finished && (
        <p className="text-center text-xs text-[var(--color-text-muted)]">{t.lesson.pauseHint}</p>
      )}
    </div>
  );
}
