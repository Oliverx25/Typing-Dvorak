import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  resolvePulseKeyCode,
} from '@/utils/keyboard/keyboardMappings';
import {
  buildStats,
  calculateAccuracy,
  pickRandomText,
  TEST_DURATION_SECONDS,
  type TypingStats,
} from '@/utils/typing/typing';
import { generateDrillText } from '@/utils/typing/textGenerator';
import { saveSession } from '@/utils/progress/storage';
import { getSessionWeakKeys, recordHeatmapKeystroke, recordKeystroke } from '@/utils/stats/keyStats';
import { playCompleteSound, playCorrectSound, playIncorrectSound } from '@/utils/typing/sound';
import { dispatchKeyStatsUpdated, dispatchSessionComplete } from '@/utils/app/events';
import { finalizeSingleplayerAchievements } from '@/utils/achievements/badges';
import { calculateConsistencyScore, accuracyFromKeystrokeLog } from '@/utils/typing/completionMetrics';
import { setRaceSessionExtras } from '@/utils/achievements/raceSessionExtras';
import {
  calculateStableRaceWpm,
  calculateRaceAccuracy,
  scoreIncrementForHit,
} from '@/utils/multiplayer/raceScoring';
import {
  VAMPIRE_MAX_HP,
  applyVampireErrorDamage,
  applyVampireHeal,
  applyVampireScoreDrain,
} from '@/utils/multiplayer/vampireMode';
import type { PracticeMode } from '@/utils/app/settings';
import type { Lesson } from '@/utils/curriculum/lessons';
import type { SessionPersistOptions } from '@/utils/stats/sessionTypes';
import { getLessonText, getLessonTestStream } from '@/utils/curriculum/lessons';
import type { Locale } from '@/i18n';
import { sanitizeCustomText } from '@/utils/progress/customText';
import {
  createInitialTypingCore,
  typingCoreReducer,
  type CharStatus,
} from '@/utils/typing/typingSessionReducer';
import {
  createKeystrokeEntry,
  zenWpmFromChars,
  type KeystrokeLogEntry,
} from '@/utils/typing/keystrokeTelemetry';
import { wordHasUncorrectedErrors } from '@/utils/typing/wordErrors';
import { countRemainingWords } from '@/utils/typing/textBuffer';
import {
  containsDeadKeyPrefix,
  getWordBackspaceCount,
  isDeadKeyActivationKey,
  isDeadKeyPrefix,
  isDuplicateCompositionEcho,
  isWordBackspaceKey,
  segmentInputGraphemes,
  stripCommittedPrefix,
} from '@/utils/typing/hiddenInputComposition';

/** Words left before fetching another practice chunk in timed mode. */
const TEXT_BUFFER_WORD_THRESHOLD = 15;

/** Live WPM / elapsed refresh — 10 fps keeps stats smooth without excess renders. */
const STATS_TICK_MS = 100;

/** Offload heatmap/localStorage writes so keystroke validation stays on the hot path. */
function deferTelemetry(work: () => void): void {
  queueMicrotask(work);
}

export type { CharStatus };


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
  blindMode?: boolean;
  testDurationSeconds?: number;
  /** Fetches the next text chunk for timed free-practice sessions. */
  fetchMoreText?: () => Promise<string | undefined>;
  /** Focus the retry button when the session ends (disable for zen practice). */
  autoFocusRetryButton?: boolean;
}

function resolveInitialText(lesson: Lesson, locale: Locale, customText?: string): string {
  if (customText?.trim()) return sanitizeCustomText(customText).trim();
  return getLessonText(
    lesson,
    pickRandomText,
    (charSet) =>
      lesson.generated ? generateDrillText(charSet, 48) : pickRandomText(lesson.texts),
    locale,
  );
}

function resolveSessionText(
  lesson: Lesson,
  locale: Locale,
  isTestMode: boolean,
  zenMode: boolean,
  customText?: string,
): string {
  if (zenMode) return '';
  if (customText?.trim()) return sanitizeCustomText(customText).trim();
  if (isTestMode) return getLessonTestStream(lesson, locale);
  return resolveInitialText(lesson, locale, customText);
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
  blindMode = false,
  testDurationSeconds = TEST_DURATION_SECONDS,
  fetchMoreText,
  autoFocusRetryButton = true,
}: UseTypingSessionOptions) {
  const effectiveStopOnError = raceMode ? false : stopOnError;
  const effectiveStopOnWord = raceMode ? false : stopOnWord;

  const isTestMode = mode === 'test' && !zenMode;
  const durationMs = testDurationSeconds * 1000;

  const initialRef = useRef<{ text: string; statuses: CharStatus[] } | null>(null);
  if (!initialRef.current) {
    const text = resolveSessionText(lesson, locale, isTestMode, zenMode, customText);
    initialRef.current = { text, statuses: text.split('').map(() => 'pending' as CharStatus) };
  }

  const [targetText, setTargetText] = useState(initialRef.current.text);
  const [core, dispatch] = useReducer(
    typingCoreReducer,
    initialRef.current.text,
    createInitialTypingCore,
  );
  const { input, statuses, combo, maxCombo, errorKeystrokes, comboBroke } = core;
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
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const retryButtonRef = useRef<HTMLButtonElement>(null);
  const sessionMissesRef = useRef<Record<string, number>>({});
  const sessionSavedRef = useRef(false);
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedMsRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const earlyBurstMaxRef = useRef(0);
  const errorRecoveryMaxRef = useRef(0);
  const errorIndexHistoryRef = useRef<Set<number>>(new Set());
  const sessionHadErrorRef = useRef(false);
  const rhythmLockBrokenRef = useRef(false);
  const vampireHpRef = useRef(VAMPIRE_MAX_HP);
  vampireHpRef.current = vampireHp;
  const isFetchingMoreRef = useRef(false);
  const fetchMoreTextRef = useRef(fetchMoreText);
  fetchMoreTextRef.current = fetchMoreText;
  const targetTextRef = useRef(targetText);
  targetTextRef.current = targetText;
  const inputLengthRef = useRef(input.length);
  inputLengthRef.current = input.length;
  const inputRef = useRef(input);
  inputRef.current = input;
  const statusesRef = useRef(statuses);
  statusesRef.current = statuses;
  const backspaceHandledRef = useRef(false);
  const isComposingRef = useRef(false);
  const deadKeyActiveRef = useRef(false);
  const deadKeyActivationRef = useRef(false);
  const ignoreNextInputRef = useRef(false);
  const lastCompositionCommitRef = useRef<string | null>(null);

  const focusHiddenInput = useCallback(() => {
    requestAnimationFrame(() => hiddenInputRef.current?.focus());
  }, []);

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
    ? (elapsedMs / durationMs) * 100
    : targetText.length > 0
      ? (input.length / targetText.length) * 100
      : 0;

  const timeRemaining = Math.max(0, testDurationSeconds - Math.floor(elapsedMs / 1000));
  const nextChar = !finished && !paused ? targetText[input.length] : undefined;

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

  const maybeFetchMoreText = useCallback((typedLength: number) => {
    const fetchFn = fetchMoreTextRef.current;
    if (!fetchFn || !isTestMode || finished || !started || paused) return;
    if (isFetchingMoreRef.current) return;

    const timeLeft = testDurationSeconds - Math.floor(elapsedMs / 1000);
    if (timeLeft <= 0) return;
    if (countRemainingWords(targetTextRef.current, typedLength) >= TEXT_BUFFER_WORD_THRESHOLD) return;

    isFetchingMoreRef.current = true;
    void fetchFn()
      .then((chunk) => {
        isFetchingMoreRef.current = false;
        if (!chunk?.trim()) return;
        const extension = ` ${chunk.trim()}`;
        setTargetText((prev) => prev + extension);
        dispatch({ type: 'EXTEND_TEXT', extension });
      })
      .catch(() => {
        isFetchingMoreRef.current = false;
      });
  }, [elapsedMs, finished, isTestMode, paused, started, testDurationSeconds]);

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
      const keystrokeLog = [...keystrokeLogRef.current];

      // Single source of truth: corrected (amber) keystrokes penalize accuracy in
      // every mode. Zen stays at 100% by design (no-pressure practice).
      const gradedResult: TypingStats =
        zenMode || keystrokeLog.length === 0
          ? result
          : { ...result, accuracy: accuracyFromKeystrokeLog(keystrokeLog) };

      setSessionWeakKeys(weak);
      setElapsedMs(gradedResult.elapsedSeconds * 1000);
      setFinalStats(gradedResult);
      setFinished(true);
      setPaused(false);
      setKeystrokeLogSnapshot(keystrokeLog);

      const { isNewRecord: record, previousBest, record: savedRecord } = saveSession(
        persistLessonId,
        persistLessonTitle,
        gradedResult,
        mode,
        sessionMaxCombo,
        {
          multiplayerSource: sessionPersist?.multiplayerSource,
          songId: sessionPersist?.songId,
          songTitle: sessionPersist?.songTitle,
          songCoverUrl: sessionPersist?.songCoverUrl,
          raceModifiers: sessionPersist?.raceModifiers,
          sessionType: sessionPersist?.sessionType,
          scoreOverride: raceMode ? raceScoreRef.current : sessionPersist?.scoreOverride,
          gradeOverride: sessionPersist?.gradeOverride,
          totalMultiplier: sessionPersist?.totalMultiplier ?? (raceMode ? scoreMultiplier : undefined),
          blindMode: !raceMode && blindMode,
          telemetry: {
            keystrokeLog,
            consistency: calculateConsistencyScore(keystrokeLog),
            troubleKeys: weak,
            correctChars: result.correctChars,
            incorrectChars: result.incorrectChars,
            elapsedMs: result.elapsedSeconds * 1000,
            stopOnError: effectiveStopOnError,
          },
        },
      );
      setIsNewRecord(record);
      setWpmDelta(gradedResult.wpm - previousBest);

      const sessionExtras = {
        earlyBurstWpm: earlyBurstMaxRef.current,
        errorRecoveryCombo: errorRecoveryMaxRef.current,
        avgWpm: gradedResult.wpm,
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

      dispatchSessionComplete(savedRecord);
      dispatchKeyStatsUpdated();

      if (sound) playCompleteSound();
    },
    [lessonId, lessonTitle, mode, sound, sessionPersist, raceMode, scoreMultiplier, vampireMode, musicPacerEnabled, blindMode, effectiveStopOnError, zenMode],
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
      requestAnimationFrame(() => hiddenInputRef.current?.focus());
      return false;
    });
  }, [isTestMode, started, finished]);

  const reset = useCallback(() => {
    sessionMissesRef.current = {};
    sessionSavedRef.current = false;
    totalPausedMsRef.current = 0;
    pausedAtRef.current = null;
    startTimeRef.current = null;
    const text = resolveSessionText(lesson, locale, isTestMode, zenMode, customText);
    setTargetText(text);
    dispatch({ type: 'RESET', text });
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
    errorIndexHistoryRef.current.clear();
    sessionHadErrorRef.current = false;
    rhythmLockBrokenRef.current = false;
    isComposingRef.current = false;
    deadKeyActiveRef.current = false;
    deadKeyActivationRef.current = false;
    ignoreNextInputRef.current = false;
    lastCompositionCommitRef.current = null;
    if (vampireDamageTimerRef.current !== null) {
      window.clearTimeout(vampireDamageTimerRef.current);
      vampireDamageTimerRef.current = null;
    }
    if (activeKeyTimerRef.current !== null) {
      window.clearTimeout(activeKeyTimerRef.current);
      activeKeyTimerRef.current = null;
    }
    requestAnimationFrame(() => hiddenInputRef.current?.focus());
  }, [isTestMode, lesson, locale, customText, zenMode]);

  useEffect(() => {
    if (!started || finished || paused) return;
    const interval = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current - totalPausedMsRef.current;
      setElapsedMs(elapsed);
      // Require at least 1s of typing before sampling burst WPM to avoid spikes on first keystrokes.
      if (elapsed >= 1000 && elapsed <= 5000) {
        const burstWpm = raceMode
          ? calculateStableRaceWpm(correctCharsRef.current, elapsed)
          : buildStats(
              correctCharsRef.current,
              errorKeystrokesRef.current,
              elapsed,
              isTestMode,
            ).wpm;
        earlyBurstMaxRef.current = Math.max(earlyBurstMaxRef.current, burstWpm);
      }
      if (isTestMode && elapsed >= durationMs) {
        finishSession(
          buildStats(correctCharsRef.current, errorKeystrokesRef.current, elapsed, true),
        );
      }
      if (isTestMode && fetchMoreTextRef.current) {
        maybeFetchMoreText(inputLengthRef.current);
      }
    }, STATS_TICK_MS);
    return () => clearInterval(interval);
  }, [started, finished, paused, isTestMode, finishSession, raceMode, durationMs, maybeFetchMoreText]);

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
    hiddenInputRef.current?.focus();
  }, []);

  const prevMode = useRef(mode);
  useEffect(() => {
    if (prevMode.current !== mode) {
      prevMode.current = mode;
      reset();
    }
  }, [mode, reset]);

  const sessionConfigRef = useRef<string | null>(null);
  useEffect(() => {
    const fingerprint = [
      lessonId,
      mode,
      customText ?? '',
      raceMode ? '1' : '0',
      vampireMode ? '1' : '0',
      suddenDeathMode ? '1' : '0',
      zenMode ? '1' : '0',
      String(scoreMultiplier),
      musicPacerEnabled ? '1' : '0',
    ].join('\0');

    if (sessionConfigRef.current !== null && sessionConfigRef.current !== fingerprint) {
      reset();
    }
    sessionConfigRef.current = fingerprint;
  }, [
    lessonId,
    mode,
    customText,
    raceMode,
    vampireMode,
    suddenDeathMode,
    zenMode,
    scoreMultiplier,
    musicPacerEnabled,
    reset,
  ]);

  useEffect(() => {
    if (!finished || !autoFocusRetryButton) return;
    retryButtonRef.current?.focus();
  }, [autoFocusRetryButton, finished]);

  useEffect(() => {
    if (!finished) return;
    const handleRetryKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        reset();
      }
    };
    window.addEventListener('keydown', handleRetryKey);
    return () => window.removeEventListener('keydown', handleRetryKey);
  }, [finished, reset]);

  const submitTypedCharacter = useCallback(
    (typedChar: string) => {
      if (zenMode) {
        if (!started) {
          const now = Date.now();
          startTimeRef.current = now;
          setStarted(true);
          setStartTime(now);
        }

        dispatch({ type: 'ZEN_CHAR', char: typedChar });
        setTargetText(input + typedChar);

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

        deferTelemetry(() => recordKeystroke(typedChar, true));

        if (sound) playCorrectSound();
        const pulseCode = resolvePulseKeyCode(typedChar);
        if (pulseCode) pulseActiveKey(pulseCode);
        return;
      }

      const expected = targetText[input.length];
      if (expected === undefined) return;

      if (
        effectiveStopOnWord &&
        typedChar === ' ' &&
        wordHasUncorrectedErrors(input, statuses, errorIndexHistoryRef.current)
      ) {
        return;
      }

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

      if (!isCorrect && effectiveStopOnError) {
        const nextErrors = errorKeystrokesRef.current + 1;
        dispatch({
          type: 'STOP_ON_ERROR',
          errorKeystrokes: nextErrors,
          comboBroke: combo > 0,
        });
        sessionHadErrorRef.current = true;
        errorIndexHistoryRef.current.add(input.length);
        sessionMissesRef.current[typedChar] = (sessionMissesRef.current[typedChar] ?? 0) + 1;
        if (combo > 0 && musicPacerEnabled) rhythmLockBrokenRef.current = true;
        deferTelemetry(() => recordHeatmapKeystroke(expected, typedChar, false));
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

      if (isCorrect) {
        correctCharsCountRef.current += 1;
        dispatch({
          type: 'KEY_HIT',
          char: typedChar,
          status: 'correct',
          combo: nextCombo,
          maxCombo: Math.max(maxCombo, nextCombo),
          errorKeystrokes: errorKeystrokesRef.current,
          comboBroke: false,
        });
        if (raceMode) {
          setRaceScore(
            (prev) => prev + Math.round(scoreIncrementForHit(nextCombo, nextAccuracy) * scoreMultiplier),
          );
        }
        if (vampireMode) {
          applyVampireCorrect(nextCombo);
        }
        if (sessionHadErrorRef.current) {
          errorRecoveryMaxRef.current = Math.max(errorRecoveryMaxRef.current, nextCombo);
        }
      } else {
        dispatch({
          type: 'KEY_HIT',
          char: typedChar,
          status: 'incorrect',
          combo: 0,
          maxCombo,
          errorKeystrokes: nextErrors,
          comboBroke: combo > 0,
        });
        sessionHadErrorRef.current = true;
        errorIndexHistoryRef.current.add(input.length);
        sessionMissesRef.current[typedChar] = (sessionMissesRef.current[typedChar] ?? 0) + 1;
        if (suddenDeathMode) {
          requestAnimationFrame(() => forceFinishEarly());
        } else if (vampireMode) {
          applyVampireHit();
        }
        if (combo > 0 && musicPacerEnabled) rhythmLockBrokenRef.current = true;
      }

      deferTelemetry(() => recordHeatmapKeystroke(expected, typedChar, isCorrect));

      if (sound) {
        if (isCorrect) playCorrectSound();
        else playIncorrectSound();
      }

      const pulseCode = resolvePulseKeyCode(typedChar);
      if (pulseCode) pulseActiveKey(pulseCode);

      if (isTestMode && newInput.length >= targetText.length - 20) {
        if (fetchMoreTextRef.current) {
          maybeFetchMoreText(newInput.length);
        } else {
          const extension = ` ${generateDrillText(lesson.charSet ?? 'all', 40)}`;
          setTargetText((prev) => prev + extension);
          dispatch({ type: 'EXTEND_TEXT', extension });
        }
      }

      if (!isTestMode && newInput.length === targetText.length) {
        const finalElapsed = startTimeRef.current
          ? Date.now() - startTimeRef.current - totalPausedMsRef.current
          : elapsedMs;
        const finalCorrect = correctCharsCountRef.current;
        const finalErrors = errorKeystrokesRef.current;
        finishSession(buildStats(finalCorrect, finalErrors, finalElapsed || 1, isTestMode));
      }
    },
    [
      zenMode,
      started,
      input,
      targetText,
      statuses,
      effectiveStopOnWord,
      sound,
      effectiveStopOnError,
      combo,
      maxCombo,
      musicPacerEnabled,
      suddenDeathMode,
      vampireMode,
      applyVampireHit,
      raceMode,
      scoreMultiplier,
      applyVampireCorrect,
      forceFinishEarly,
      isTestMode,
      maybeFetchMoreText,
      lesson,
      elapsedMs,
      finishSession,
      pulseActiveKey,
    ],
  );

  const resetHiddenInputImeState = useCallback((inputEl: HTMLInputElement) => {
    isComposingRef.current = false;
    deadKeyActiveRef.current = false;
    deadKeyActivationRef.current = false;
    ignoreNextInputRef.current = false;
    lastCompositionCommitRef.current = null;
    inputEl.value = '';
  }, []);

  const hasPendingAccentInHiddenInput = useCallback((inputEl: HTMLInputElement) => {
    return (
      deadKeyActiveRef.current ||
      deadKeyActivationRef.current ||
      isComposingRef.current ||
      containsDeadKeyPrefix(inputEl.value)
    );
  }, []);

  const executeBackspace = useCallback(
    (inputEl: HTMLInputElement, mode: 'character' | 'word') => {
      if (backspaceHandledRef.current) return;
      backspaceHandledRef.current = true;
      queueMicrotask(() => {
        backspaceHandledRef.current = false;
      });

      const pendingAccent = hasPendingAccentInHiddenInput(inputEl);
      resetHiddenInputImeState(inputEl);

      const currentInput = inputRef.current;
      if (currentInput.length === 0) return;

      const deleteCount = Math.min(
        pendingAccent || mode === 'character'
          ? 1
          : getWordBackspaceCount(currentInput),
        currentInput.length,
      );
      if (deleteCount <= 0) return;

      const currentStatuses = statusesRef.current;
      const startIndex = currentInput.length - deleteCount;
      for (let i = startIndex; i < currentInput.length; i++) {
        if (currentStatuses[i] === 'correct') {
          correctCharsCountRef.current = Math.max(0, correctCharsCountRef.current - 1);
        }
      }

      const newInput = currentInput.slice(0, -deleteCount);
      inputRef.current = newInput;
      inputLengthRef.current = newInput.length;
      dispatch({ type: 'BACKSPACE', count: deleteCount });
      if (zenMode) {
        setTargetText(newInput);
      }
    },
    [zenMode, hasPendingAccentInHiddenInput, resetHiddenInputImeState],
  );

  const clearHiddenInputBuffer = useCallback((el?: HTMLInputElement | null) => {
    if (isComposingRef.current || deadKeyActiveRef.current) return;
    const target = el ?? hiddenInputRef.current;
    if (target) target.value = '';
  }, []);

  const commitInputText = useCallback(
    (text: string, inputEl?: HTMLInputElement) => {
      for (const char of segmentInputGraphemes(text)) {
        submitTypedCharacter(char);
      }
      clearHiddenInputBuffer(inputEl);
    },
    [submitTypedCharacter, clearHiddenInputBuffer],
  );

  const finalizeDeadKeyCommit = useCallback(
    (text: string, inputEl: HTMLInputElement) => {
      for (const char of segmentInputGraphemes(text)) {
        submitTypedCharacter(char);
      }
      lastCompositionCommitRef.current = text;
      ignoreNextInputRef.current = true;
      deadKeyActivationRef.current = false;
      inputEl.value = '';
    },
    [submitTypedCharacter],
  );

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
    if (deadKeyActivationRef.current) {
      deadKeyActiveRef.current = false;
    }
  }, []);

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      isComposingRef.current = false;
      deadKeyActiveRef.current = false;

      const inputEl = e.currentTarget;
      if (finished || paused) {
        inputEl.value = '';
        deadKeyActivationRef.current = false;
        lastCompositionCommitRef.current = null;
        ignoreNextInputRef.current = false;
        return;
      }

      if (e.data && deadKeyActivationRef.current) {
        finalizeDeadKeyCommit(e.data, inputEl);
        return;
      }

      if (e.data) {
        for (const char of segmentInputGraphemes(e.data)) {
          submitTypedCharacter(char);
        }
      }

      deadKeyActivationRef.current = false;
      inputEl.value = '';
    },
    [finished, paused, submitTypedCharacter, finalizeDeadKeyCommit],
  );

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const inputEl = e.currentTarget;
      const value = inputEl.value;

      if (ignoreNextInputRef.current) {
        ignoreNextInputRef.current = false;
        const committed = lastCompositionCommitRef.current;
        lastCompositionCommitRef.current = null;

        if (!value) {
          inputEl.value = '';
          return;
        }

        if (committed) {
          if (isDuplicateCompositionEcho(value, committed)) {
            inputEl.value = '';
            return;
          }

          const remainder = stripCommittedPrefix(value, committed);
          if (remainder === null) {
            inputEl.value = '';
            return;
          }
          if (remainder !== value) {
            commitInputText(remainder, inputEl);
            return;
          }
        }

        // Fresh next keystroke — fall through to normal processing.
      }

      if (isComposingRef.current) {
        return;
      }

      if (finished || paused) {
        clearHiddenInputBuffer(inputEl);
        return;
      }

      if (!value) return;

      if (deadKeyActiveRef.current) {
        if (isDeadKeyPrefix(value)) return;

        const graphemes = segmentInputGraphemes(value);
        const stillHasPrefix = graphemes.some((char) => isDeadKeyPrefix(char));
        if (stillHasPrefix && graphemes.length > 1) return;

        deadKeyActiveRef.current = false;
        if (deadKeyActivationRef.current) {
          finalizeDeadKeyCommit(value, inputEl);
          return;
        }
        commitInputText(value, inputEl);
        return;
      }

      if (isDeadKeyPrefix(value)) {
        deadKeyActiveRef.current = true;
        deadKeyActivationRef.current = true;
        return;
      }

      commitInputText(value, inputEl);
    },
    [finished, paused, commitInputText, clearHiddenInputBuffer, finalizeDeadKeyCommit],
  );

  const executeBackspaceRef = useRef(executeBackspace);
  executeBackspaceRef.current = executeBackspace;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onBeforeInput = (event: Event) => {
      if (finished || paused) return;
      const inputEvent = event as InputEvent;
      const target = inputEvent.target;
      if (!(target instanceof HTMLInputElement) || target !== hiddenInputRef.current) return;

      if (inputEvent.inputType === 'deleteWordBackward') {
        event.preventDefault();
        executeBackspaceRef.current(target, 'word');
        return;
      }

      if (inputEvent.inputType === 'deleteContentBackward') {
        event.preventDefault();
        executeBackspaceRef.current(target, 'character');
      }
    };

    container.addEventListener('beforeinput', onBeforeInput, true);
    return () => container.removeEventListener('beforeinput', onBeforeInput, true);
  }, [finished, paused]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        const mode = isWordBackspaceKey(e.nativeEvent) ? 'word' : 'character';
        executeBackspace(e.currentTarget, mode);
        return;
      }

      if (isDeadKeyActivationKey(e.nativeEvent)) {
        deadKeyActivationRef.current = true;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        const expected = targetText[input.length];
        if (expected === '\t') {
          submitTypedCharacter('\t');
          clearHiddenInputBuffer(e.currentTarget);
        }
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const expected = targetText[input.length];
        if (expected === '\n') {
          submitTypedCharacter('\n');
          clearHiddenInputBuffer(e.currentTarget);
        }
      }
    },
    [
      finished,
      zenMode,
      input,
      elapsedMs,
      finishSession,
      isTestMode,
      togglePause,
      paused,
      started,
      targetText,
      reset,
      submitTypedCharacter,
      executeBackspace,
      startTime,
      clearHiddenInputBuffer,
    ],
  );

  const clearComboBroke = useCallback(() => dispatch({ type: 'CLEAR_COMBO_BROKE' }), []);

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
    nextChar,
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
    errorIndexHistory: errorIndexHistoryRef.current,
    zenMode,
    clearComboBroke,
    containerRef,
    hiddenInputRef,
    retryButtonRef,
    reset,
    handleInput,
    handleInputKeyDown,
    handleCompositionStart,
    handleCompositionEnd,
    focusHiddenInput,
    togglePause,
  };
}
