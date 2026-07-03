import { useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { getCustomText, saveCustomText } from '@/utils/customText';
import TypingTest from '@/components/typing/TypingTest';
import BackLink from '@/components/layout/BackLink';
import { Button } from '@/components/ui';
import type { Lesson } from '@/utils/lessons';

const CUSTOM_LESSON: Lesson = {
  id: 'custom-practice',
  titleKey: 'customPractice',
  descriptionKey: 'customPractice',
  category: 'sentences',
  difficulty: 2,
  optional: true,
  texts: [''],
};

export default function CustomPracticePage() {
  const { t } = useApp();
  const [text, setText] = useState(() => getCustomText());
  const [active, setActive] = useState(() => getCustomText().trim().length >= 10);

  const handleStart = () => {
    const trimmed = text.trim();
    if (trimmed.length < 10) return;
    saveCustomText(trimmed);
    setActive(true);
  };

  if (!active) {
    return (
      <>
        <BackLink />

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">{t.custom.title}</h1>
          <p className="mt-2 text-[var(--color-text-muted)]">{t.custom.desc}</p>
        </header>

        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.custom.placeholder}
            rows={8}
            className="w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 font-mono text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-muted)]">
              {text.trim().length} / 2000 {t.custom.chars}
            </span>
            <Button type="button" onClick={handleStart} disabled={text.trim().length < 10} size="md">
              {t.custom.start}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <nav className="mb-8 flex items-center justify-between">
        <BackLink />
        <button
          type="button"
          onClick={() => setActive(false)}
          className="text-sm text-[var(--color-text-muted)] transition hover:text-[var(--color-accent)]"
        >
          {t.custom.editText}
        </button>
      </nav>

      <TypingTest lessonId="custom-practice" lesson={CUSTOM_LESSON} customText={getCustomText()} />
    </>
  );
}
