import { useCallback, useEffect, useRef, useState } from 'react';
import Keyboard from './Keyboard';
import StatsBar from './StatsBar';
import { charToKeyCode } from '../utils/dvorak';
import { buildStats, pickRandomText } from '../utils/typing';
import { saveSession } from '../utils/storage';

interface TypingTestProps {
  lessonId: string;
  lessonTitle: string;
  texts: string[];
}

type CharStatus = 'pending' | 'correct' | 'incorrect';

export default function TypingTest({ lessonId, lessonTitle, texts }: TypingTestProps) {
  const initialRef = useRef<{ text: string; statuses: CharStatus[] } | null>(null);
  if (!initialRef.current) {
    const text = pickRandomText(texts);
    initialRef.current = {
      text,
      statuses: text.split('').map(() => 'pending'),
    };
  }

  const [targetText, setTargetText] = useState(initialRef.current.text);
  const [input, setInput] = useState('');
  const [statuses, setStatuses] = useState<CharStatus[]>(initialRef.current.statuses);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [activeKey, setActiveKey] = useState<string | undefined>();
  const [lastKey, setLastKey] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const correctChars = statuses.filter((s) => s === 'correct').length;
  const incorrectChars = statuses.filter((s) => s === 'incorrect').length;
  const stats = buildStats(correctChars, incorrectChars, elapsedMs || 1);
  const progress = targetText.length > 0 ? (input.length / targetText.length) * 100 : 0;

  const nextChar = targetText[input.length];
  const highlightKey = nextChar ? charToKeyCode(nextChar) : undefined;

  useEffect(() => {
    if (!started || finished) return;
    const interval = setInterval(() => {
      if (startTime) setElapsedMs(Date.now() - startTime);
    }, 100);
    return () => clearInterval(interval);
  }, [started, finished, startTime]);

  useEffect(() => {
    containerRef.current?.focus();
    inputRef.current?.focus();
  }, []);

  const reset = useCallback(
    (newText?: string) => {
      const text = newText ?? pickRandomText(texts);
      setTargetText(text);
      setInput('');
      setStatuses(text.split('').map(() => 'pending'));
      setStarted(false);
      setFinished(false);
      setStartTime(null);
      setElapsedMs(0);
      setActiveKey(undefined);
      setLastKey(undefined);
      inputRef.current?.focus();
    },
    [texts],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (finished) return;

    if (e.key === 'Tab' || e.key.startsWith('Arrow') || e.key === 'Escape') {
      e.preventDefault();
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (input.length === 0) return;
      const newInput = input.slice(0, -1);
      setInput(newInput);
      setStatuses((prev) => {
        const next = [...prev];
        next[newInput.length] = 'pending';
        return next;
      });
      return;
    }

    if (e.key.length !== 1) return;
    e.preventDefault();

    if (!started) {
      setStarted(true);
      setStartTime(Date.now());
    }

    const expected = targetText[input.length];
    if (expected === undefined) return;

    const isCorrect = e.key === expected;
    const newInput = input + e.key;

    setInput(newInput);
    setStatuses((prev) => {
      const next = [...prev];
      next[input.length] = isCorrect ? 'correct' : 'incorrect';
      return next;
    });

    const code = charToKeyCode(e.key);
    setActiveKey(code);
    setLastKey(code);
    setTimeout(() => setActiveKey(undefined), 120);

    if (newInput.length === targetText.length) {
      const finalElapsed = startTime ? Date.now() - startTime : elapsedMs;
      const finalCorrect = (isCorrect ? correctChars + 1 : correctChars);
      const finalIncorrect = (isCorrect ? incorrectChars : incorrectChars + 1);
      const finalStats = buildStats(finalCorrect, finalIncorrect, finalElapsed || 1);
      setElapsedMs(finalElapsed);
      setFinished(true);
      saveSession(lessonId, lessonTitle, finalStats);
    }
  };

  return (
    <div className="space-y-8">
      <StatsBar
        wpm={stats.wpm}
        accuracy={stats.accuracy}
        elapsedSeconds={stats.elapsedSeconds}
        progress={progress}
      />

      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={() => inputRef.current?.focus()}
        className="relative cursor-text rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      >
        <input
          ref={inputRef}
          type="text"
          className="absolute opacity-0 pointer-events-none"
          aria-hidden="true"
          tabIndex={-1}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        <p className="font-mono text-xl leading-relaxed tracking-wide break-words">
          {targetText.split('').map((char, i) => {
            const status = statuses[i];
            const isCurrent = i === input.length;

            let color = 'text-[var(--color-text-muted)]';
            if (status === 'correct') color = 'text-[var(--color-correct)]';
            if (status === 'incorrect') color = 'text-[var(--color-incorrect)] underline decoration-wavy';
            if (isCurrent && !finished) color = 'text-[var(--color-text)] bg-[var(--color-accent)]/20 rounded-sm';

            return (
              <span key={i} className={color}>
                {char}
              </span>
            );
          })}
        </p>

        {!started && !finished && (
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            Click here or start typing to begin...
          </p>
        )}
      </div>

      {finished && (
        <div className="rounded-xl border border-[var(--color-correct)]/30 bg-[var(--color-correct)]/10 p-6 text-center">
          <h3 className="text-lg font-semibold text-[var(--color-text)]">Lesson complete!</h3>
          <p className="mt-2 text-[var(--color-text-muted)]">
            {stats.wpm} WPM · {stats.accuracy}% accuracy · {stats.elapsedSeconds}s
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-4 rounded-lg bg-[var(--color-accent)] px-6 py-2.5 font-medium text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            Try again
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <Keyboard activeKey={activeKey ?? lastKey} highlightKey={highlightKey} />
      </div>
    </div>
  );
}
