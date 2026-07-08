import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import {
  CUSTOM_TEXT_MAX_LENGTH,
  getCustomText,
  sanitizeCustomText,
  saveCustomText,
} from '@/utils/progress/customText';
import TypingTest from '@/components/typing/session/TypingTest';
import BackLink from '@/components/layout/shell/BackLink';
import { Button, AppErrorBoundary } from '@/components/ui';
import { formFieldMonoResizableClassName } from '@/components/ui/formFieldClasses';
import type { Lesson } from '@/utils/curriculum/lessons';

const CUSTOM_LESSON: Lesson = {
  id: 'custom-practice',
  titleKey: 'customPractice',
  descriptionKey: 'customPractice',
  category: 'sentences',
  difficulty: 2,
  optional: true,
  texts: [''],
};

const MIN_CUSTOM_CHARS = 10;

export default function CustomPracticePage() {
  const { t } = useApp();
  const [text, setText] = useState('');
  const [active, setActive] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // localStorage is client-only — reading it in useState breaks SSR hydration (#418).
  useEffect(() => {
    const saved = getCustomText();
    setText(saved);
    setActive(saved.trim().length >= MIN_CUSTOM_CHARS);
    setHydrated(true);
  }, []);

  const handleStart = () => {
    const cleaned = sanitizeCustomText(text).trim();
    if (cleaned.length < MIN_CUSTOM_CHARS) return;
    saveCustomText(cleaned);
    setText(cleaned);
    setActive(true);
  };

  const handleEditText = () => {
    setActive(false);
    setText(getCustomText());
  };

  const handleFile = (file: File) => {
    setUploadError(false);
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const cleaned = sanitizeCustomText(result);
      if (!cleaned) {
        setUploadError(true);
        return;
      }
      setText(cleaned);
    };
    reader.onerror = () => setUploadError(true);
    reader.readAsText(file);
  };

  if (!hydrated) {
    return (
      <>
        <BackLink />
        <header className="mb-8">
          <div className="h-9 w-64 animate-pulse rounded-lg bg-[var(--color-surface-elevated)]" />
          <div className="mt-2 h-5 w-96 max-w-full animate-pulse rounded bg-[var(--color-surface-elevated)]" />
        </header>
        <div
          className="h-48 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
          role="status"
          aria-busy="true"
        />
      </>
    );
  }

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
            onChange={(e) => setText(sanitizeCustomText(e.target.value))}
            placeholder={t.custom.placeholder}
            rows={8}
            className={`${formFieldMonoResizableClassName} bg-[var(--color-surface-elevated)] p-4`}
          />
          <input
            ref={fileRef}
            type="file"
            accept="text/plain,.txt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[var(--color-text-muted)]">
              {text.trim().length} / {CUSTOM_TEXT_MAX_LENGTH} {t.custom.chars}
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()} size="md">
                {t.custom.uploadTxt}
              </Button>
              <Button type="button" onClick={handleStart} disabled={text.trim().length < MIN_CUSTOM_CHARS} size="md">
                {t.custom.start}
              </Button>
            </div>
          </div>
          {uploadError && (
            <p className="text-xs text-[var(--color-incorrect)]">{t.custom.uploadError}</p>
          )}
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
          onClick={handleEditText}
          className="text-sm text-[var(--color-text-muted)] transition hover:text-[var(--color-highlight)]"
        >
          {t.custom.editText}
        </button>
      </nav>

      <AppErrorBoundary section="typing" resetKeys={[text]}>
        <TypingTest
          key={text.trim()}
          lessonId="custom-practice"
          lesson={CUSTOM_LESSON}
          customText={text}
          hideModeToggle
        />
      </AppErrorBoundary>
    </>
  );
}
