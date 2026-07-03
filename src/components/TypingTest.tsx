import { useApp, getLessonTitle } from '../contexts/AppProvider';
import type { Lesson } from '../utils/lessons';
import { useTypingSession } from '../hooks/useTypingSession';
import Keyboard from './Keyboard';
import StatsBar from './StatsBar';
import CompletionPanel from './CompletionPanel';
import ModeToggle, { ModeDescription } from './ModeToggle';

interface TypingTestProps {
  lessonId: string;
  lesson: Lesson;
}

export default function TypingTest({ lessonId, lesson }: TypingTestProps) {
  const { t, settings } = useApp();
  const lessonTitle = getLessonTitle(t, lesson.titleKey);

  const session = useTypingSession({
    lessonId,
    lessonTitle,
    lesson,
    mode: settings.practiceMode,
    sound: settings.sound,
  });

  const {
    targetText,
    input,
    statuses,
    started,
    finished,
    stats,
    progress,
    timeRemaining,
    targetKey,
    activeKey,
    isNewRecord,
    wpmDelta,
    isTestMode,
    containerRef,
    retryButtonRef,
    reset,
    handleKeyDown,
  } = session;

  const showKeyboard = !settings.blindMode;

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
      />

      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={() => !finished && containerRef.current?.focus()}
        role="textbox"
        aria-label={lessonTitle}
        aria-readonly="true"
        className={[
          'relative min-h-[160px] cursor-text overflow-hidden rounded-2xl border-2 bg-[var(--color-surface-elevated)] p-6 outline-none transition-all duration-300 sm:min-h-[180px] sm:p-8',
          finished ? 'border-[var(--color-correct)]/30' : 'border-[var(--color-border)] focus:border-[var(--color-accent)]/50 focus:ring-4 focus:ring-[var(--color-accent)]/10',
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
            if (isCurrent && !finished) {
              className = 'relative text-[var(--color-key-target)] after:absolute after:-bottom-0.5 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[var(--color-key-target)] after:content-[""] caret-blink motion-reduce:animate-none';
            }
            return (
              <span key={i} className={className}>
                {char === ' ' ? '·' : char}
              </span>
            );
          })}
          {!finished && input.length === targetText.length && (
            <span className="caret-blink ml-px inline-block h-[1.1em] w-0.5 translate-y-0.5 bg-[var(--color-key-target)] align-middle motion-reduce:animate-none" />
          )}
        </p>

        {!started && !finished && (
          <p className="relative mt-6 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <span className="inline-flex h-2 w-2 rounded-full bg-[var(--color-accent)] animate-pulse motion-reduce:animate-none" />
            {t.lesson.startTyping}
          </p>
        )}

        {finished && (
          <CompletionPanel
            wpm={stats.wpm}
            accuracy={stats.accuracy}
            elapsedSeconds={stats.elapsedSeconds}
            isNewRecord={isNewRecord}
            wpmDelta={wpmDelta}
            onRetry={reset}
            retryButtonRef={retryButtonRef}
          />
        )}
      </div>

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
    </div>
  );
}
