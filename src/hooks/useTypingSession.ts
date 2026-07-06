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
import { finalizeSingleplayerAchievements } from '../utils/achievements/badges';
import { setRaceSessionExtras } from '../utils/achievements/raceSessionExtras';
import {
  calculateStableRaceWpm,
  calculateRaceAccuracy,
  scoreIncrementForHit,
} from '../utils/multiplayer/raceScoring';
import {
  VAMPIRE_MAX_HP,
  applyVampireErrorDamage,
  applyVampireHeal,
  applyVampireScoreDrain,
} from '../utils/multiplayer/vampireMode';
import type { PracticeMode } from '../utils/app/settings';
import type { Lesson } from '../utils/curriculum/lessons';
import type { SessionPersistOptions } from '../utils/stats/sessionTypes';
import { getLessonText } from '../utils/curriculum/lessons';
import type { Locale } from '../i18n';
import {
  createKeystrokeEntry,
  zenWpmFromChars,
  type KeystrokeLogEntry,
} from '../utils/typing/keystrokeTelemetry';

export type CharStatus = 'pending' | 'correct' | 'incorrect';

export type { KeystrokeLogEntry };

interface UseTypingSessionOptions {
  lessonId: string;
  lessonTitle: string;
  lesson: Lesson;
  mode: PracticeMode;
  sound: boolean;
  locale?: Locale;
  customText?: string;
  raceMode?: boolean;
  scoreMultiplier?: number;
  vampireMode?: boolean;
  suddenDeathMode?: boolean;
  musicPacerEnabled?: boolean;
  sessionPersist?: SessionPersistOptions;
  /** Free-flow canvas — no target text validation. */
  zenMode?: boolean;
  stopOnError?: boolean;
  stopOnWord?: boolean;
}

function wordHasUncorrectedErrors(input: string, statuses: CharStatus[]): boolean {
  const start = Math.max(0, input.lastIndexOf(' ') + 1);
  for (let i = start; i < input.length; i += 1) {
    if (statuses[i] === 'incorrect') return true;
  }
  return false;
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
  scoreMultiplier = 1,
  vampireMode = false,
  suddenDeathMode = false,
  musicPacerEnabled = false,
  sessionPersist,
  zenMode = false,
  stopOnError = false,
  stopOnWord = false,
}: UseTypingSessionOptions) {
  const isTestMode = mode === 'test' && !zenMode;

  const initialRef = useRef<{ text: string; statuses: CharStatus[] } | null>(null);
  if (!initialRef.current) {
    const text = zenMode
      ? ''
      : isTestMode
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
  const [vampireHp, setVampireHp] = useState(VAMPIRE_MAX_HP);
  const [vampireDamaged, setVampireDamaged] = useState(false);
  const [keystrokeLogSnapshot, setKeystrokeLogSnapshot] = useState<KeystrokeLogEntry[]>([]);
  const keystrokeLogRef = useRef<KeystrokeLogEntry[]>([]);
  const lastKeystrokeTsRef = useRef<number | null>(null);
  const activeKeyTimerRef = useRef<number | null>(null);
  const correctCharsCountRef = useRef(0);
  const vampireEliminatedRef = useRef(false);
  const vampireDamageTimerRef = useRef<number | null>(null);
  const consecutiveMissesRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const retryButtonRef = useRef<HTMLButtonElement>(null);
  const sessionMissesRef = useRef<Record<string, number>>({});
  const sessionSavedRef = useRef(false);
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedMsRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const earlyBurstMaxRef = useRef(0);
  const errorRecoveryMaxRef = useRef(0);
  const sessionHadErrorRef = useRef(false);
  const rhythmLockBrokenRef = useRef(false);
  const vampireHpRef = useRef(VAMPIRE_MAX_HP);
  vampireHpRef.current = vampireHp;

  const correctChars = correctCharsCountRef.current;
  const liveStats = zenMode
    ? {
        wpm: zenWpmFromChars(input.length, elapsedMs || 1),
        accuracy: 100,
        correctChars: input.length,
        incorrectChars: 0,
        elapsedSeconds: Math.round(elapsedMs / 1000),
      }
    : raceMode
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

  const pulseActiveKey = useCallback((code: string) => {
    setActiveKey(code);
    if (activeKeyTimerRef.current !== null) {
      window.clearTimeout(activeKeyTimerRef.current);
    }
    activeKeyTimerRef.current = window.setTimeout(() => {
      setActiveKey(undefined);
      activeKeyTimerRef.current = null;
    }, 150);
  }, []);

  const maxComboRef = useRef(0);
  maxComboRef.current = maxCombo;
  const raceScoreRef = useRef(0);
  raceScoreRef.current = raceScore;
  const correctCharsRef = useRef(0);
  correctCharsRef.current = correctChars;
  const errorKeystrokesRef = useRef(0);
  errorKeystrokesRef.current = errorKeystrokes;

  const finishSession = useCallback(
    (result: TypingStats) => {
      if (sessionSavedRef.current) return;
      sessionSavedRef.current = true;

      const persistLessonId = sessionPersist?.lessonId ?? lessonId;
      const persistLessonTitle = sessionPersist?.lessonTitle ?? lessonTitle;

      const sessionMaxCombo = maxComboRef.current;
      const weak = getSessionWeakKeys(sessionMissesRef.current);
      setSessionWeakKeys(weak);
      setElapsedMs(result.elapsedSeconds * 1000);
      setFinalStats(result);
      setFinished(true);
      setPaused(false);
      setKeystrokeLogSnapshot([...keystrokeLogRef.current]);

      const { isNewRecord: record, previousBest, record: savedRecord } = saveSession(
        persistLessonId,
        persistLessonTitle,
        result,
        mode,
        sessionMaxCombo,
        {
          multiplayerSource: sessionPersist?.multiplayerSource,
          songId: sessionPersist?.songId,
          songTitle: sessionPersist?.songTitle,
          raceModifiers: sessionPersist?.raceModifiers,
          scoreOverride: raceMode ? raceScoreRef.current : sessionPersist?.scoreOverride,
          gradeOverride: sessionPersist?.gradeOverride,
          totalMultiplier: sessionPersist?.totalMultiplier ?? (raceMode ? scoreMultiplier : undefined),
        },
      );
      setIsNewRecord(record);
      setWpmDelta(result.wpm - previousBest);

      dispatchSessionComplete(savedRecord);
      dispatchKeyStatsUpdated();

      const sessionExtras = {
        earlyBurstWpm: earlyBurstMaxRef.current,
        errorRecoveryCombo: errorRecoveryMaxRef.current,
        avgWpm: result.wpm,
        vampireHpPercentEnd: vampireMode
          ? Math.round((vampireHpRef.current / VAMPIRE_MAX_HP) * 100)
          : undefined,
        rhythmLockBroken: musicPacerEnabled ? rhythmLockBrokenRef.current : undefined,
      };

      if (raceMode) {
        setRaceSessionExtras(sessionExtras);
      } else {
        finalizeSingleplayerAchievements(savedRecord, sessionExtras);
      }

      if (sound) playCompleteSound();
    },
    [lessonId, lessonTitle, mode, sound, sessionPersist, raceMode, scoreMultiplier, vampireMode, musicPacerEnabled],
  );

  const forceFinishEarly = useCallback(() => {
    if (vampireEliminatedRef.current || sessionSavedRef.current) return;
    vampireEliminatedRef.current = true;
    const elapsed = startTimeRef.current
      ? Date.now() - startTimeRef.current - totalPausedMsRef.current
      : elapsedMs;
    finishSession(
      buildStats(
        correctCharsRef.current,
        errorKeystrokesRef.current,
        Math.max(elapsed, 1),
        isTestMode,
      ),
    );
  }, [elapsedMs, finishSession, isTestMode]);

  const applyVampireHit = useCallback(() => {
    consecutiveMissesRef.current += 1;
    const streak = consecutiveMissesRef.current;

    setVampireHp((prev) => {
      const next = applyVampireErrorDamage(prev, streak);
      if (next <= 0) {
        requestAnimationFrame(() => forceFinishEarly());
      }
      return next;
    });
    if (raceMode) {
      setRaceScore((prev) => applyVampireScoreDrain(prev));
    }
    setVampireDamaged(true);
    if (vampireDamageTimerRef.current !== null) {
      window.clearTimeout(vampireDamageTimerRef.current);
    }
    vampireDamageTimerRef.current = window.setTimeout(() => {
      setVampireDamaged(false);
      vampireDamageTimerRef.current = null;
    }, 350);
  }, [forceFinishEarly, raceMode]);

  const applyVampireCorrect = useCallback((comboAfterHit: number) => {
    consecutiveMissesRef.current = 0;
    setVampireHp((prev) => applyVampireHeal(prev, comboAfterHit));
  }, []);

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
    sessionSavedRef.current = false;
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
    setVampireHp(VAMPIRE_MAX_HP);
    setVampireDamaged(false);
    keystrokeLogRef.current = [];
    setKeystrokeLogSnapshot([]);
    lastKeystrokeTsRef.current = null;
    correctCharsCountRef.current = 0;
    consecutiveMissesRef.current = 0;
    vampireEliminatedRef.current = false;
    earlyBurstMaxRef.current = 0;
    errorRecoveryMaxRef.current = 0;
    sessionHadErrorRef.current = false;
    rhythmLockBrokenRef.current = false;
    if (vampireDamageTimerRef.current !== null) {
      window.clearTimeout(vampireDamageTimerRef.current);
      vampireDamageTimerRef.current = null;
    }
    if (activeKeyTimerRef.current !== null) {
      window.clearTimeout(activeKeyTimerRef.current);
      activeKeyTimerRef.current = null;
    }
    requestAnimationFrame(() => containerRef.current?.focus());
  }, [isTestMode, lesson, locale, customText]);

  useEffect(() => {
    if (!started || finished || paused) return;
    const interval = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current - totalPausedMsRef.current;
      setElapsedMs(elapsed);
      if (elapsed <= 5000) {
        const burstWpm = raceMode
          ? calculateStableRaceWpm(correctCharsRef.current, elapsed)
          : buildStats(
              correctCharsRef.current,
              errorKeystrokesRef.current,
              Math.max(elapsed, 1),
              isTestMode,
            ).wpm;
        earlyBurstMaxRef.current = Math.max(earlyBurstMaxRef.current, burstWpm);
      }
      if (isTestMode && elapsed >= TEST_DURATION_SECONDS * 1000) {
        finishSession(
          buildStats(correctCharsRef.current, errorKeystrokesRef.current, elapsed, true),
        );
      }
    }, 100);
    return () => clearInterval(interval);
  }, [started, finished, paused, isTestMode, finishSession, raceMode]);

  useEffect(
    () => () => {
      if (activeKeyTimerRef.current !== null) {
        window.clearTimeout(activeKeyTimerRef.current);
      }
      if (vampireDamageTimerRef.current !== null) {
        window.clearTimeout(vampireDamageTimerRef.current);
      }
    },
    [],
  );

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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (finished) {
      if (e.key === 'Enter') {
        e.preventDefault();
        reset();
      }
      return;
    }

    if (zenMode && e.key === 'Escape') {
      e.preventDefault();
      if (!started || input.length === 0) return;
      const elapsed = startTime
        ? Date.now() - startTime - totalPausedMsRef.current
        : elapsedMs;
      finishSession({
        wpm: zenWpmFromChars(input.length, Math.max(elapsed, 1)),
        accuracy: 100,
        correctChars: input.length,
        incorrectChars: 0,
        elapsedSeconds: Math.round(Math.max(elapsed, 1) / 1000),
      });
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
      const removedIndex = input.length - 1;
      if (statuses[removedIndex] === 'correct') {
        correctCharsCountRef.current = Math.max(0, correctCharsCountRef.current - 1);
      }
      const newInput = input.slice(0, -1);
      setInput(newInput);
      setStatuses((prev) => {
        const next = [...prev];
        next[newInput.length] = 'pending';
        return next;
      });
      if (zenMode) {
        setTargetText(newInput);
      }
      return;
    }

    // --- Zen mode: free-flow buffer, no target validation ---
    if (zenMode) {
      if (e.key.length !== 1) return;
      e.preventDefault();

      if (!started) {
        const now = Date.now();
        startTimeRef.current = now;
        setStarted(true);
        setStartTime(now);
      }

      const typedChar = e.key;
      const nextInput = input + typedChar;
      setInput(nextInput);
      setTargetText(nextInput);
      setStatuses((prev) => [...prev, 'correct']);

      const entry = createKeystrokeEntry(
        input.length,
        typedChar,
        typedChar,
        true,
        lastKeystrokeTsRef.current,
      );
      lastKeystrokeTsRef.current = entry.timestamp;
      keystrokeLogRef.current.push(entry);
      correctCharsCountRef.current += 1;

      recordKeystroke(typedChar, true);
      setCombo((prev) => {
        const next = prev + 1;
        setMaxCombo((max) => (next > max ? next : max));
        return next;
      });

      if (sound) playCorrectSound();
      pulseActiveKey(charToKeyCode(typedChar));
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

    if (stopOnWord && typedChar === ' ' && wordHasUncorrectedErrors(input, statuses)) {
      e.preventDefault();
      return;
    }

    e.preventDefault();

    if (!started) {
      const now = Date.now();
      startTimeRef.current = now;
      setStarted(true);
      setStartTime(now);
    }

    const isCorrect = typedChar === expected;

    const logEntry = createKeystrokeEntry(
      input.length,
      expected,
      typedChar,
      isCorrect,
      lastKeystrokeTsRef.current,
    );
    lastKeystrokeTsRef.current = logEntry.timestamp;
    keystrokeLogRef.current.push(logEntry);

    if (!isCorrect && stopOnError) {
      setErrorKeystrokes((n) => n + 1);
      sessionHadErrorRef.current = true;
      sessionMissesRef.current[typedChar] = (sessionMissesRef.current[typedChar] ?? 0) + 1;
      setStatuses((prev) => {
        const next = [...prev];
        next[input.length] = 'incorrect';
        return next;
      });
      setCombo((prev) => {
        if (prev > 0) {
          setComboBroke(true);
          if (musicPacerEnabled) rhythmLockBrokenRef.current = true;
        }
        return 0;
      });
      recordKeystroke(typedChar, false);
      if (sound) playIncorrectSound();
      if (suddenDeathMode) {
        requestAnimationFrame(() => forceFinishEarly());
      } else if (vampireMode) {
        applyVampireHit();
      }
      return;
    }

    const newInput = input + typedChar;
    const nextErrors = isCorrect ? errorKeystrokesRef.current : errorKeystrokesRef.current + 1;
    const nextCorrect = isCorrect
      ? correctCharsCountRef.current + 1
      : correctCharsCountRef.current;
    const nextCombo = isCorrect ? combo + 1 : 0;
    const nextAccuracy = calculateAccuracy(nextCorrect, nextErrors);

    setInput(newInput);
    setStatuses((prev) => {
      const next = [...prev];
      next[input.length] = isCorrect ? 'correct' : 'incorrect';
      return next;
    });

    if (isCorrect) {
      correctCharsCountRef.current += 1;
      setComboBroke(false);
      setCombo((prev) => {
        const next = prev + 1;
        setMaxCombo((max) => (next > max ? next : max));
        if (sessionHadErrorRef.current) {
          errorRecoveryMaxRef.current = Math.max(errorRecoveryMaxRef.current, next);
        }
        return next;
      });
      if (raceMode) {
        setRaceScore(
          (prev) => prev + Math.round(scoreIncrementForHit(nextCombo, nextAccuracy) * scoreMultiplier),
        );
      }
      if (vampireMode) {
        applyVampireCorrect(nextCombo);
      }
    } else {
      setErrorKeystrokes((n) => n + 1);
      sessionHadErrorRef.current = true;
      sessionMissesRef.current[typedChar] = (sessionMissesRef.current[typedChar] ?? 0) + 1;
      if (suddenDeathMode) {
        requestAnimationFrame(() => forceFinishEarly());
      } else if (vampireMode) {
        applyVampireHit();
      }
      setCombo((prev) => {
        if (prev > 0) {
          setComboBroke(true);
          if (musicPacerEnabled) rhythmLockBrokenRef.current = true;
        }
        return 0;
      });
    }

    if (sound) {
      if (isCorrect) playCorrectSound();
      else playIncorrectSound();
    }

    const code = charToKeyCode(typedChar);
    pulseActiveKey(code);

    if (isTestMode && newInput.length >= targetText.length - 20) {
      const extension = ' ' + generateDrillText(lesson.charSet ?? 'all', 40);
      setTargetText((prev) => prev + extension);
      setStatuses((prev) => [...prev, ...extension.split('').map(() => 'pending' as CharStatus)]);
    }

    if (!isTestMode && newInput.length === targetText.length) {
      const finalElapsed = startTimeRef.current
        ? Date.now() - startTimeRef.current - totalPausedMsRef.current
        : elapsedMs;
      const finalCorrect = correctCharsCountRef.current;
      const finalErrors = errorKeystrokesRef.current;
      finishSession(buildStats(finalCorrect, finalErrors, finalElapsed || 1, isTestMode));
    }
  }, [
    finished,
    zenMode,
    input,
    elapsedMs,
    finishSession,
    isTestMode,
    togglePause,
    paused,
    statuses,
    stopOnWord,
    targetText,
    started,
    sound,
    stopOnError,
    suddenDeathMode,
    vampireMode,
    applyVampireHit,
    combo,
    raceMode,
    scoreMultiplier,
    applyVampireCorrect,
    musicPacerEnabled,
    forceFinishEarly,
    lesson,
    pulseActiveKey,
  ]);

  const clearComboBroke = useCallback(() => setComboBroke(false), []);

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
    vampireHp,
    vampireDamaged,
    errorKeystrokes,
    startTime,
    elapsedMs,
    keystrokeLog: keystrokeLogSnapshot,
    zenMode,
    clearComboBroke,
    containerRef,
    retryButtonRef,
    reset,
    handleKeyDown,
    togglePause,
  };
}
