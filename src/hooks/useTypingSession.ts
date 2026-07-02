import { useCallback, useEffect, useRef, useState } from 'react';
import { charToKeyCode } from '../utils/dvorak';
import {
  buildStats,
  pickRandomText,
  TEST_DURATION_SECONDS,
  type TypingStats,
} from '../utils/typing';
import { generateDrillText, generateTestStream } from '../utils/textGenerator';
import { saveSession } from '../utils/storage';
import { playCompleteSound, playCorrectSound, playIncorrectSound } from '../utils/sound';
import type { PracticeMode } from '../utils/settings';
import type { Lesson } from '../utils/lessons';
import { getLessonText } from '../utils/lessons';

export type CharStatus = 'pending' | 'correct' | 'incorrect';

interface UseTypingSessionOptions {
  lessonId: string;
  lessonTitle: string;
  lesson: Lesson;
  mode: PracticeMode;
  sound: boolean;
}

function resolveInitialText(lesson: Lesson): string {
  return getLessonText(
    lesson,
    pickRandomText,
    (charSet) =>
      lesson.generated ? generateDrillText(charSet, 48) : pickRandomText(lesson.texts),
  );
}

export function useTypingSession({
  lessonId,
  lessonTitle,
  lesson,
  mode,
  sound,
}: UseTypingSessionOptions) {
  const isTestMode = mode === 'test';

  const initialRef = useRef<{ text: string; statuses: CharStatus[] } | null>(null);
  if (!initialRef.current) {
    const text = isTestMode
      ? generateTestStream(lesson.charSet ?? 'all')
      : resolveInitialText(lesson);
    initialRef.current = { text, statuses: text.split('').map(() => 'pending' as CharStatus) };
  }

  const [targetText, setTargetText] = useState(initialRef.current.text);
  const [input, setInput] = useState('');
  const [statuses, setStatuses] = useState<CharStatus[]>(initialRef.current.statuses);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<TypingStats | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [wpmDelta, setWpmDelta] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [activeKey, setActiveKey] = useState<string | undefined>();
  const containerRef = useRef<HTMLDivElement>(null);
  const retryButtonRef = useRef<HTMLButtonElement>(null);

  const correctChars = statuses.filter((s) => s === 'correct').length;
  const incorrectChars = statuses.filter((s) => s === 'incorrect').length;
  const liveStats = buildStats(correctChars, incorrectChars, elapsedMs || 1, isTestMode);
  const stats = finished && finalStats ? finalStats : liveStats;

  const progress = isTestMode
    ? (elapsedMs / (TEST_DURATION_SECONDS * 1000)) * 100
    : targetText.length > 0
      ? (input.length / targetText.length) * 100
      : 0;

  const timeRemaining = Math.max(0, TEST_DURATION_SECONDS - Math.floor(elapsedMs / 1000));
  const nextChar = targetText[input.length];
  const targetKey = !finished && nextChar ? charToKeyCode(nextChar) : undefined;

  const finishSession = useCallback(
    (result: TypingStats) => {
      setElapsedMs(result.elapsedSeconds * 1000);
      setFinalStats(result);
      setFinished(true);
      const { isNewRecord: record, previousBest } = saveSession(
        lessonId,
        lessonTitle,
        result,
        mode,
      );
      setIsNewRecord(record);
      setWpmDelta(result.wpm - previousBest);
      if (sound) playCompleteSound();
    },
    [lessonId, lessonTitle, mode, sound],
  );

  const reset = useCallback(() => {
    const text = isTestMode
      ? generateTestStream(lesson.charSet ?? 'all')
      : resolveInitialText(lesson);
    setTargetText(text);
    setInput('');
    setStatuses(text.split('').map(() => 'pending'));
    setStarted(false);
    setFinished(false);
    setFinalStats(null);
    setIsNewRecord(false);
    setWpmDelta(0);
    setStartTime(null);
    setElapsedMs(0);
    setActiveKey(undefined);
    requestAnimationFrame(() => containerRef.current?.focus());
  }, [isTestMode, lesson]);

  useEffect(() => {
    if (!started || finished) return;
    const interval = setInterval(() => {
      if (!startTime) return;
      const elapsed = Date.now() - startTime;
      setElapsedMs(elapsed);
      if (isTestMode && elapsed >= TEST_DURATION_SECONDS * 1000) {
        const result = buildStats(correctChars, incorrectChars, elapsed, true);
        finishSession(result);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [started, finished, startTime, isTestMode, correctChars, incorrectChars, finishSession]);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const prevMode = useRef(mode);
  useEffect(() => {
    if (prevMode.current !== mode) {
      prevMode.current = mode;
      reset();
    }
  }, [mode, reset]);

  useEffect(() => {
    if (!finished) return;
    retryButtonRef.current?.focus();
    const handleRetryKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        reset();
      }
    };
    window.addEventListener('keydown', handleRetryKey);
    return () => window.removeEventListener('keydown', handleRetryKey);
  }, [finished, reset]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (finished) {
      if (e.key === 'Enter') {
        e.preventDefault();
        reset();
      }
      return;
    }

    if (e.key === 'Tab' || e.key.startsWith('Arrow') || e.key === 'Escape') {
      e.preventDefault();
      return;
    }

    if (e.key === 'Backspace') {
      if (isTestMode) {
        e.preventDefault();
        return;
      }
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

    if (sound) {
      if (isCorrect) playCorrectSound();
      else playIncorrectSound();
    }

    const code = charToKeyCode(e.key);
    setActiveKey(code);
    setTimeout(() => setActiveKey(undefined), 150);

    // Extend stream in test mode when nearing end
    if (isTestMode && newInput.length >= targetText.length - 20) {
      setTargetText((prev) => prev + ' ' + generateDrillText(lesson.charSet ?? 'all', 40));
      setStatuses((prev) => [...prev, ...Array(41).fill('pending' as CharStatus)]);
    }

    if (!isTestMode && newInput.length === targetText.length) {
      const finalElapsed = startTime ? Date.now() - startTime : elapsedMs;
      const finalCorrect = isCorrect ? correctChars + 1 : correctChars;
      const finalIncorrect = isCorrect ? incorrectChars : incorrectChars + 1;
      finishSession(buildStats(finalCorrect, finalIncorrect, finalElapsed || 1, false));
    }
  };

  return {
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
  };
}
