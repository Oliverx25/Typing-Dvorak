import { useMemo } from 'react';
import { useApp } from '@/contexts/AppProvider';
import BackLink from '@/components/layout/shell/BackLink';
import TypingTest from '@/components/typing/session/TypingTest';
import { AppErrorBoundary } from '@/components/ui';
import type { Lesson } from '@/utils/curriculum/lessons';
import { getSandboxConfig } from '@/utils/practice/sandboxConfig';
import { buildSandboxText } from '@/utils/practice/sandboxText';

const SANDBOX_LESSON: Lesson = {
  id: 'sandbox-practice',
  titleKey: 'sandboxPractice',
  descriptionKey: 'sandboxPractice',
  category: 'words',
  difficulty: 3,
  optional: true,
  texts: [''],
};

export default function SandboxPracticePage() {
  const { t } = useApp();
  const config = useMemo(() => getSandboxConfig(), []);
  const text = useMemo(() => buildSandboxText(config), [config]);
  const practiceMode = config.mode === 'time' ? 'test' : 'practice';
  const testDurationSeconds = config.mode === 'time' ? config.timeSeconds : undefined;

  return (
    <>
      <BackLink />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">{t.sandbox.title}</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">{t.sandbox.sessionDesc}</p>
      </header>

      <AppErrorBoundary section="typing" resetKeys={[text, config.mode, config.timeSeconds]}>
        <TypingTest
          key={`${text}-${config.mode}-${config.timeSeconds}-${config.wordCount}`}
          lessonId="sandbox-practice"
          lesson={SANDBOX_LESSON}
          customText={text}
          practiceMode={practiceMode}
          testDurationSeconds={testDurationSeconds}
          hideModeToggle
        />
      </AppErrorBoundary>
    </>
  );
}
