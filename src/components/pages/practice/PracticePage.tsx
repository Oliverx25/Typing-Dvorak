import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '@/contexts/AppProvider';
import TypingTest from '@/components/typing/session/TypingTest';
import { AppErrorBoundary } from '@/components/ui';
import PracticeSettings from '@/components/practice/PracticeSettings';
import PracticeTeleprompterShell from '@/components/practice/PracticeTeleprompterShell';
import ZenTeleprompter from '@/components/practice/ZenTeleprompter';
import LyricsSearch from '@/components/lyrics/LyricsSearch';
import type { Lesson } from '@/utils/curriculum/lessons';
import type { LyricSongResult } from '@/utils/lyrics/types';
import {
  DEFAULT_SANDBOX_CONFIG,
  getSandboxConfig,
  saveSandboxConfig,
  type SandboxConfig,
} from '@/utils/practice/sandboxConfig';
import { generatePracticeText, resolvePracticeLoadingSource } from '@/utils/practice/textGenerator';
import { formatPracticeLyrics, formatPracticeSongTitle } from '@/utils/practice/practiceLyrics';
import { FREE_PRACTICE_LESSON_ID } from '@/utils/stats/sessionClassification';
import type { SessionPersistOptions } from '@/utils/stats/sessionTypes';

const FREE_PRACTICE_LESSON: Lesson = {
  id: FREE_PRACTICE_LESSON_ID,
  titleKey: 'freePractice',
  descriptionKey: 'freePractice',
  category: 'words',
  difficulty: 1,
  optional: true,
  texts: [''],
};

type PracticePhase = 'idle' | 'typing';

export default function PracticePage() {
  const { t } = useApp();
  const [config, setConfig] = useState<SandboxConfig>(DEFAULT_SANDBOX_CONFIG);
  const [phase, setPhase] = useState<PracticePhase>('idle');
  const [isSettingsDirty, setIsSettingsDirty] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [practiceText, setPracticeText] = useState('');
  const [practiceSong, setPracticeSong] = useState<LyricSongResult | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bufferAbortRef = useRef<AbortController | null>(null);

  const BUFFER_WORD_COUNT: SandboxConfig['wordCount'] = 50;

  const isLyricsMode = config.content === 'lyrics';

  const clearLyricsSelection = useCallback(() => {
    setPracticeSong(null);
    setPracticeText('');
  }, []);

  const handleConfigChange = useCallback(
    (partial: Partial<SandboxConfig>) => {
      setConfig((prev) => {
        const next = { ...prev, ...partial };
        saveSandboxConfig(next);
        return next;
      });
      setIsSettingsDirty(true);

      if (partial.content !== undefined && partial.content !== 'lyrics') {
        clearLyricsSelection();
      }
      if (partial.content === 'lyrics') {
        clearLyricsSelection();
      }

      if (phase === 'typing') {
        abortRef.current?.abort();
        setPhase('idle');
        setPracticeText('');
      }
    },
    [phase, clearLyricsSelection],
  );

  const handleSongSelect = useCallback(
    (song: LyricSongResult) => {
      const formatted = formatPracticeLyrics(song.plainLyrics, config);
      setPracticeSong(song);
      setPracticeText(formatted);
      setIsSettingsDirty(true);
      setPhase('idle');
      setIsTyping(false);
    },
    [config],
  );

  const handleReturnToZen = useCallback(() => {
    abortRef.current?.abort();
    setPhase('idle');
    setIsSettingsDirty(true);
    setIsTyping(false);
    if (isLyricsMode) {
      clearLyricsSelection();
    } else {
      setPracticeText('');
    }
    setSessionKey((value) => value + 1);
  }, [isLyricsMode, clearLyricsSelection]);

  const handleStartPractice = useCallback(async () => {
    if (isLoading) return;

    if (isLyricsMode) {
      if (!practiceSong || !practiceText.trim()) return;
      setIsSettingsDirty(false);
      setSessionKey((value) => value + 1);
      setPhase('typing');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    try {
      const text = await generatePracticeText(config, controller.signal);
      if (controller.signal.aborted) return;
      setPracticeText(text);
      setIsSettingsDirty(false);
      setSessionKey((value) => value + 1);
      setPhase('typing');
    } catch {
      if (controller.signal.aborted) return;
      setIsSettingsDirty(true);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [config, isLoading, isLyricsMode, practiceSong, practiceText]);

  const fetchMorePracticeText = useCallback(async () => {
    if (config.mode !== 'time' || isLyricsMode) return undefined;

    bufferAbortRef.current?.abort();
    const controller = new AbortController();
    bufferAbortRef.current = controller;

    try {
      const bufferConfig: SandboxConfig = {
        ...config,
        mode: 'words',
        wordCount: BUFFER_WORD_COUNT,
      };
      return await generatePracticeText(bufferConfig, controller.signal);
    } catch {
      if (controller.signal.aborted) return undefined;
      return undefined;
    }
  }, [config, isLyricsMode]);

  useEffect(() => {
    setConfig(getSandboxConfig());
  }, []);

  useEffect(() => {
    document.body.classList.add('zen-mode-active');
    return () => document.body.classList.remove('zen-mode-active');
  }, []);

  useEffect(() => {
    if (!isLyricsMode || !practiceSong) return;
    setPracticeText(formatPracticeLyrics(practiceSong.plainLyrics, config));
    setIsSettingsDirty(true);
  }, [
    config.includeCaps,
    config.includeNumbers,
    config.includePunctuation,
    isLyricsMode,
    practiceSong,
  ]);

  useEffect(() => {
    if (phase !== 'idle' || !isSettingsDirty || isLoading) return;
    if (isLyricsMode && !practiceSong) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.repeat) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      event.preventDefault();
      void handleStartPractice();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, isSettingsDirty, isLoading, handleStartPractice, isLyricsMode, practiceSong]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      bufferAbortRef.current?.abort();
    };
  }, []);

  const practiceMode = isLyricsMode ? 'practice' : config.mode === 'time' ? 'test' : 'practice';
  const testDurationSeconds =
    !isLyricsMode && config.mode === 'time' ? config.timeSeconds : undefined;

  const loadingHint = useMemo(() => {
    const source = resolvePracticeLoadingSource(config.content);
    if (source === 'github') return t.practice.loadingGitHub;
    if (source === 'translate') return t.practice.loadingTranslate;
    return t.practice.loadingHint;
  }, [config.content, t.practice]);

  const sessionPersist = useMemo((): SessionPersistOptions => {
    if (!practiceSong) {
      return { sessionType: 'practice' };
    }
    return {
      sessionType: 'practice',
      multiplayerSource: 'song',
      songId: practiceSong.id,
      songTitle: formatPracticeSongTitle(practiceSong),
      songCoverUrl: practiceSong.coverArt ?? undefined,
    };
  }, [practiceSong]);

  const dirtyHint =
    isLyricsMode && practiceSong ? t.practice.lyricsDirtyHint : t.practice.dirtyHint;

  const showLyricsSearch = isLyricsMode && phase === 'idle' && !practiceSong;
  const showZenIdle = phase === 'idle' && !showLyricsSearch;

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4">
      <h1 className="sr-only">{t.practice.title}</h1>

      <div
        className={[
          'mb-6 w-full max-w-7xl shrink-0 transition-opacity duration-500',
          isTyping ? 'pointer-events-none opacity-10' : 'opacity-100',
        ].join(' ')}
      >
        <PracticeSettings config={config} onChange={handleConfigChange} />
      </div>

      <div className="flex w-full max-w-7xl flex-1 flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {showLyricsSearch ? (
            <motion.div
              key="practice-lyrics-search"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex w-full flex-col items-center"
            >
              <LyricsSearch onSelect={handleSongSelect} inputId="practice-lyrics-search" />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {showZenIdle ? (
          <PracticeTeleprompterShell variant="idle">
            {isLyricsMode && practiceSong ? (
              <div className="mb-4 flex w-full items-center justify-between gap-3">
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                  {formatPracticeSongTitle(practiceSong)}
                </p>
                <button
                  type="button"
                  onClick={clearLyricsSelection}
                  className="shrink-0 text-xs text-[var(--color-highlight)] transition hover:underline"
                >
                  {t.practice.lyricsChangeSong}
                </button>
              </div>
            ) : null}
            <ZenTeleprompter
              isDirty={isSettingsDirty}
              isLoading={isLoading}
              dirtyHint={dirtyHint}
              loadingHint={loadingHint}
              onStart={() => void handleStartPractice()}
            />
          </PracticeTeleprompterShell>
        ) : null}

        {phase === 'typing' ? (
          <PracticeTeleprompterShell variant="active">
            <AppErrorBoundary
              section="typing"
              resetKeys={[practiceText, sessionKey, config.mode, config.timeSeconds, config.wordCount, practiceSong?.id]}
            >
              <TypingTest
                key={`${sessionKey}-${practiceText.slice(0, 32)}`}
                lessonId={FREE_PRACTICE_LESSON_ID}
                lesson={FREE_PRACTICE_LESSON}
                customText={practiceText}
                practiceMode={practiceMode}
                testDurationSeconds={testDurationSeconds}
                hideModeToggle
                hideKeyboard
                isFreePractice
                zenStatsBar
                onTypingStateChange={setIsTyping}
                onFreePracticeRetry={handleReturnToZen}
                sessionPersist={sessionPersist}
                fetchMoreText={config.mode === 'time' && !isLyricsMode ? fetchMorePracticeText : undefined}
                ariaLabel={t.practice.title}
              />
            </AppErrorBoundary>
          </PracticeTeleprompterShell>
        ) : null}
      </div>
    </div>
  );
}
