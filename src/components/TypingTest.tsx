import { useEffect, useState } from 'react';
import { useApp, getLessonTitle } from '../contexts/AppProvider';
import type { Lesson } from '../utils/lessons';
import { useTypingSession } from '../hooks/useTypingSession';
import Keyboard from './Keyboard';
import StatsBar from './StatsBar';
import CompletionPanel from './CompletionPanel';
import ModeToggle, { ModeDescription } from './ModeToggle';
import PauseOverlay from './PauseOverlay';

interface TypingTestProps {
  lessonId: string;
  lesson: Lesson;
  customText?: string;
}

export default function TypingTest({ lessonId, lesson, customText }: TypingTestProps) {
  const { t, settings } = useApp();
  const lessonTitle = getLessonTitle(t, lesson.titleKey);

  const session = useTypingSession({
    lessonId,
    lessonTitle,
    lesson,
    mode: settings.practiceMode,
    sound: settings.sound,
    locale: settings.locale,
    customText,
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

  const showKeyboard = !settings.blindMode && keyboardOpen;

  return (
    <div className="space-y-6">
      <ModeToggle />
      <ModeDescription />

      <StatsBar
        wpm={stats.wpm}
        accuracy={stats.accuracy}
        elapsedSeconds={stats.elapsedSeconds}
        progress={progress}
        finished={finished}
        started={started}
        isTestMode={isTestMode}
        timeRemaining={timeRemaining}
        paused={paused}
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
          finished ? 'border-[var(--color-correct)]/30' : paused ? 'border-[var(--color-key-target)]/40' : 'border-[var(--color-border)] focus:border-[var(--color-accent)]/50 focus:ring-4 focus:ring-[var(--color-accent)]/10',
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

        <p className="relative font-mono text-xl leading-[2] tracking-wide break-words sm:text-2xl sm:leading-[2.2]" aria-live="off">
          {targetText.split('').map((char, i) => {
            const status = statuses[i];
            const isCurrent = i === input.length;
            let className = 'text-[var(--color-text-muted)]/60';
            if (status === 'correct') className = 'text-[var(--color-correct)]';
            if (status === 'incorrect') className = 'text-[var(--color-incorrect)] underline decoration-wavy decoration-[var(--color-incorrect)]/50';
            if (isCurrent && !finished && !paused) {
              className = 'relative text-[var(--color-key-target)] after:absolute after:-bottom-0.5 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[var(--color-key-target)] after:content-[""] caret-blink motion-reduce:animate-none';
            }
            return (
              <span key={i} className={className}>
                {char === ' ' ? '·' : char}
              </span>
            );
          })}
          {!finished && !paused && input.length === targetText.length && (
            <span className="caret-blink ml-px inline-block h-[1.1em] w-0.5 translate-y-0.5 bg-[var(--color-key-target)] align-middle motion-reduce:animate-none" />
          )}
        </p>

        {!started && !finished && (
          <p className="relative mt-6 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <span className="inline-flex h-2 w-2 rounded-full bg-[var(--color-accent)] animate-pulse motion-reduce:animate-none" />
            {t.lesson.startTyping}
          </p>
        )}

        {paused && !finished && <PauseOverlay onResume={togglePause} />}

        {finished && (
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
      </div>

      {!settings.blindMode && (
        <div className="flex items-center justify-center sm:hidden">
          <button
            type="button"
            onClick={() => setKeyboardOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-sm text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
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

      {settings.blindMode && !finished && (
        <p className="text-center text-xs text-[var(--color-text-muted)]">👁 {t.settings.blindDesc}</p>
      )}

      {isTestMode && started && !finished && (
        <p className="text-center text-xs text-[var(--color-text-muted)]">{t.lesson.pauseHint}</p>
      )}
    </div>
  );
}
