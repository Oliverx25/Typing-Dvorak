import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import TypingTest from '@/components/typing/session/TypingTest';
import { AppErrorBoundary } from '@/components/ui';
import PracticeSettings from '@/components/practice/PracticeSettings';
import PracticeTeleprompterShell from '@/components/practice/PracticeTeleprompterShell';
import ZenTeleprompter from '@/components/practice/ZenTeleprompter';
import type { Lesson } from '@/utils/curriculum/lessons';
import {
  getSandboxConfig,
  saveSandboxConfig,
  type SandboxConfig,
} from '@/utils/practice/sandboxConfig';
import { generatePracticeText, resolvePracticeLoadingSource } from '@/utils/practice/textGenerator';
import { FREE_PRACTICE_LESSON_ID } from '@/utils/stats/sessionClassification';

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
  const [config, setConfig] = useState<SandboxConfig>(() => getSandboxConfig());
  const [phase, setPhase] = useState<PracticePhase>('idle');
  const [isSettingsDirty, setIsSettingsDirty] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [practiceText, setPracticeText] = useState('');
  const [sessionKey, setSessionKey] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const handleConfigChange = useCallback(
    (partial: Partial<SandboxConfig>) => {
      setConfig((prev) => {
        const next = { ...prev, ...partial };
        saveSandboxConfig(next);
        return next;
      });
      setIsSettingsDirty(true);
      if (phase === 'typing') {
        abortRef.current?.abort();
        setPhase('idle');
        setPracticeText('');
      }
    },
    [phase],
  );

  const handleReturnToZen = useCallback(() => {
    abortRef.current?.abort();
    setPhase('idle');
    setIsSettingsDirty(true);
    setPracticeText('');
    setSessionKey((value) => value + 1);
  }, []);

  const handleStartPractice = useCallback(async () => {
    if (isLoading) return;

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
    } catch (error) {
      if (controller.signal.aborted) return;
      console.warn('[practice] text generation failed:', error);
      setIsSettingsDirty(true);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [config, isLoading]);

  useEffect(() => {
    if (phase !== 'idle' || !isSettingsDirty || isLoading) return;

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
  }, [phase, isSettingsDirty, isLoading, handleStartPractice]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const practiceMode = config.mode === 'time' ? 'test' : 'practice';
  const testDurationSeconds = config.mode === 'time' ? config.timeSeconds : undefined;

  const loadingHint = useMemo(() => {
    const source = resolvePracticeLoadingSource(config.content);
    if (source === 'github') return t.practice.loadingGitHub;
    if (source === 'translate') return t.practice.loadingTranslate;
    return t.practice.loadingHint;
  }, [config.content, t.practice]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-100px)] w-full max-w-4xl flex-col items-center justify-center px-4">
      <h1 className="sr-only">{t.practice.title}</h1>

      <PracticeSettings config={config} onChange={handleConfigChange} />

      {phase === 'idle' ? (
        <PracticeTeleprompterShell variant="idle">
          <ZenTeleprompter
            isDirty={isSettingsDirty}
            isLoading={isLoading}
            dirtyHint={t.practice.dirtyHint}
            loadingHint={loadingHint}
            onStart={() => void handleStartPractice()}
          />
        </PracticeTeleprompterShell>
      ) : (
        <PracticeTeleprompterShell variant="active">
          <AppErrorBoundary
            section="typing"
            resetKeys={[practiceText, sessionKey, config.mode, config.timeSeconds, config.wordCount]}
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
              onFreePracticeRetry={handleReturnToZen}
              sessionPersist={{ sessionType: 'practice' }}
              ariaLabel={t.practice.title}
            />
          </AppErrorBoundary>
        </PracticeTeleprompterShell>
      )}
    </div>
  );
}
