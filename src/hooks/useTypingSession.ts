import { useCallback, useEffect, useRef, useState } from 'react';
import { charToKeyCode } from '../utils/keyboard/dvorak';
import {
  buildStats,
  calculateAccuracy,
  pickRandomText,
  TEST_DURATION_SECONDS,
  type TypingStats,
} from '../utils/typing/typing';
import { generateDrillText, generateTestStream } from '../utils/typing/textGenerator';
import { saveSession } from '../utils/progress/storage';
import { getSessionWeakKeys, recordKeystroke } from '../utils/stats/keyStats';
import { playCompleteSound, playCorrectSound, playIncorrectSound } from '../utils/typing/sound';
import { dispatchKeyStatsUpdated, dispatchSessionComplete } from '../utils/app/events';
import { checkAndUnlockBadges } from '../utils/achievements/badges';
import {
  calculateStableRaceWpm,
  calculateRaceAccuracy,
  scoreIncrementForHit,
} from '../utils/multiplayer/raceScoring';
import type { PracticeMode } from '../utils/app/settings';
import type { Lesson } from '../utils/curriculum/lessons';
import { getLessonText } from '../utils/curriculum/lessons';
import type { Locale } from '../i18n';

export type CharStatus = 'pending' | 'correct' | 'incorrect';

interface UseTypingSessionOptions {
  lessonId: string;
  lessonTitle: string;
  lesson: Lesson;
  mode: PracticeMode;
  sound: boolean;
  locale?: Locale;
  customText?: string;
  /** Multiplayer race: stable WPM + osu-style cumulative score. */
  raceMode?: boolean;
}

function resolveInitialText(lesson: Lesson, locale: Locale, customText?: string): string {
  if (customText?.trim()) return customText.trim();
  return getLessonText(
    lesson,
    pickRandomText,
    (charSet) =>
      lesson.generated ? generateDrillText(charSet, 48) : pickRandomText(lesson.texts),
    locale,
  );
}

export function useTypingSession({
  lessonId,
  lessonTitle,
  lesson,
  mode,
  sound,
  locale = 'en',
  customText,
  raceMode = false,
}: UseTypingSessionOptions) {
  const isTestMode = mode === 'test';

  const initialRef = useRef<{ text: string; statuses: CharStatus[] } | null>(null);
  if (!initialRef.current) {
    const text = isTestMode
      ? generateTestStream(lesson.charSet ?? 'all')
      : resolveInitialText(lesson, locale, customText);
    initialRef.current = { text, statuses: text.split('').map(() => 'pending' as CharStatus) };
  }

  const [targetText, setTargetText] = useState(initialRef.current.text);
  const [input, setInput] = useState('');
  const [statuses, setStatuses] = useState<CharStatus[]>(initialRef.current.statuses);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finalStats, setFinalStats] = useState<TypingStats | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [wpmDelta, setWpmDelta] = useState(0);
  const [sessionWeakKeys, setSessionWeakKeys] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [activeKey, setActiveKey] = useState<string | undefined>();
  const [errorKeystrokes, setErrorKeystrokes] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [comboBroke, setComboBroke] = useState(false);
  const [raceScore, setRaceScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const retryButtonRef = useRef<HTMLButtonElement>(null);
  const sessionMissesRef = useRef<Record<string, number>>({});
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedMsRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  const correctChars = statuses.filter((s) => s === 'correct').length;
  const liveStats = raceMode
    ? {
        wpm: calculateStableRaceWpm(correctChars, elapsedMs),
        accuracy: calculateRaceAccuracy(correctChars, errorKeystrokes),
        correctChars,
        incorrectChars: errorKeystrokes,
        elapsedSeconds: Math.round(elapsedMs / 1000),
      }
    : buildStats(
        correctChars,
        errorKeystrokes,
        elapsedMs || 1,
        isTestMode,
      );
  const stats = finished && finalStats ? finalStats : liveStats;

  const progress = isTestMode
    ? (elapsedMs / (TEST_DURATION_SECONDS * 1000)) * 100
    : targetText.length > 0
      ? (input.length / targetText.length) * 100
      : 0;

  const timeRemaining = Math.max(0, TEST_DURATION_SECONDS - Math.floor(elapsedMs / 1000));
  const nextChar = targetText[input.length];
  const targetKey = !finished && !paused && nextChar ? charToKeyCode(nextChar) : undefined;

  const maxComboRef = useRef(0);
  maxComboRef.current = maxCombo;

  const finishSession = useCallback(
    (result: TypingStats) => {
      const sessionMaxCombo = maxComboRef.current;
      const weak = getSessionWeakKeys(sessionMissesRef.current);
      setSessionWeakKeys(weak);
      setElapsedMs(result.elapsedSeconds * 1000);
      setFinalStats(result);
      setFinished(true);
      setPaused(false);

      const { isNewRecord: record, previousBest } = saveSession(
        lessonId,
        lessonTitle,
        result,
        mode,
        sessionMaxCombo,
      );
      setIsNewRecord(record);
      setWpmDelta(result.wpm - previousBest);

      dispatchSessionComplete();
      dispatchKeyStatsUpdated();
      checkAndUnlockBadges({
        accuracy: result.accuracy,
        wpm: result.wpm,
        lessonId,
        maxCombo: sessionMaxCombo,
      });
      if (sound) playCompleteSound();
    },
    [lessonId, lessonTitle, mode, sound, raceMode],
  );

  const togglePause = useCallback(() => {
    if (!isTestMode || !started || finished) return;
    setPaused((prev) => {
      if (!prev) {
        pausedAtRef.current = Date.now();
        return true;
      }
      if (pausedAtRef.current) {
        totalPausedMsRef.current += Date.now() - pausedAtRef.current;
        pausedAtRef.current = null;
      }
      return false;
    });
  }, [isTestMode, started, finished]);

  const reset = useCallback(() => {
    sessionMissesRef.current = {};
    totalPausedMsRef.current = 0;
    pausedAtRef.current = null;
    startTimeRef.current = null;
    const text = isTestMode
      ? generateTestStream(lesson.charSet ?? 'all')
      : resolveInitialText(lesson, locale, customText);
    setTargetText(text);
    setInput('');
    setStatuses(text.split('').map(() => 'pending'));
    setStarted(false);
    setFinished(false);
    setPaused(false);
    setFinalStats(null);
    setIsNewRecord(false);
    setWpmDelta(0);
    setSessionWeakKeys([]);
    setStartTime(null);
    setElapsedMs(0);
    setActiveKey(undefined);
    setErrorKeystrokes(0);
    setCombo(0);
    setMaxCombo(0);
    setComboBroke(false);
    setRaceScore(0);
    requestAnimationFrame(() => containerRef.current?.focus());
  }, [isTestMode, lesson, locale, customText]);

  useEffect(() => {
    if (!started || finished || paused) return;
    const interval = setInterval(() => {
      if (!startTime) return;
      const elapsed = Date.now() - startTime - totalPausedMsRef.current;
      setElapsedMs(elapsed);
      if (isTestMode && elapsed >= TEST_DURATION_SECONDS * 1000) {
        const result = buildStats(correctChars, errorKeystrokes, elapsed, true);
        finishSession(result);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [started, finished, paused, startTime, isTestMode, correctChars, errorKeystrokes, finishSession]);

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

    if (isTestMode && e.key === 'Escape') {
      e.preventDefault();
      togglePause();
      return;
    }

    if (paused) return;

    if (e.key.startsWith('Arrow')) {
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

    const expected = targetText[input.length];
    if (expected === undefined) return;

    let typedChar: string | null = null;
    if (e.key === 'Enter' && expected === '\n') typedChar = '\n';
    else if (e.key === 'Tab' && expected === '\t') typedChar = '\t';
    else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      return;
    } else if (e.key.length !== 1) {
      return;
    } else {
      typedChar = e.key;
    }

    e.preventDefault();

    if (!started) {
      const now = Date.now();
      startTimeRef.current = now;
      setStarted(true);
      setStartTime(now);
    }

    const isCorrect = typedChar === expected;
    const newInput = input + typedChar;
    const nextErrors = isCorrect ? errorKeystrokes : errorKeystrokes + 1;

    setInput(newInput);
    setStatuses((prev) => {
      const next = [...prev];
      next[input.length] = isCorrect ? 'correct' : 'incorrect';
      return next;
    });

    recordKeystroke(typedChar, isCorrect);
    const nextCorrect = isCorrect ? correctChars + 1 : correctChars;
    const nextCombo = isCorrect ? combo + 1 : 0;
    const nextAccuracy = calculateAccuracy(nextCorrect, nextErrors);

    if (isCorrect) {
      setComboBroke(false);
      setCombo((prev) => {
        const next = prev + 1;
        setMaxCombo((max) => (next > max ? next : max));
        return next;
      });
      if (raceMode) {
        setRaceScore((prev) => prev + scoreIncrementForHit(nextCombo, nextAccuracy));
      }
    } else {
      setErrorKeystrokes((n) => n + 1);
      sessionMissesRef.current[typedChar] = (sessionMissesRef.current[typedChar] ?? 0) + 1;
      setCombo((prev) => {
        if (prev > 0) setComboBroke(true);
        return 0;
      });
    }

    if (sound) {
      if (isCorrect) playCorrectSound();
      else playIncorrectSound();
    }

    const code = charToKeyCode(typedChar);
    setActiveKey(code);
    setTimeout(() => setActiveKey(undefined), 150);

    if (isTestMode && newInput.length >= targetText.length - 20) {
      const extension = ' ' + generateDrillText(lesson.charSet ?? 'all', 40);
      setTargetText((prev) => prev + extension);
      setStatuses((prev) => [...prev, ...extension.split('').map(() => 'pending' as CharStatus)]);
    }

    if (!isTestMode && newInput.length === targetText.length) {
      const finalElapsed = startTime
        ? Date.now() - startTime - totalPausedMsRef.current
        : elapsedMs;
      const finalCorrect = isCorrect ? correctChars + 1 : correctChars;
      const finalErrors = isCorrect ? errorKeystrokes : errorKeystrokes + 1;
      finishSession(buildStats(finalCorrect, finalErrors, finalElapsed || 1, isTestMode));
    }
  };

  return {
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
    startTime,
    elapsedMs,
    clearComboBroke: () => setComboBroke(false),
    containerRef,
    retryButtonRef,
    reset,
    handleKeyDown,
    togglePause,
  };
}
