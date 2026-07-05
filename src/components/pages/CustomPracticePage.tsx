import { useRef, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import {
  CUSTOM_TEXT_MAX_LENGTH,
  getCustomText,
  sanitizeCustomText,
  saveCustomText,
} from '@/utils/progress/customText';
import TypingTest from '@/components/typing/TypingTest';
import BackLink from '@/components/layout/BackLink';
import { Button } from '@/components/ui';
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

export default function CustomPracticePage() {
  const { t } = useApp();
  const [text, setText] = useState(() => getCustomText());
  const [active, setActive] = useState(() => getCustomText().trim().length >= 10);
  const [uploadError, setUploadError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleStart = () => {
    const trimmed = text.trim();
    if (trimmed.length < 10) return;
    saveCustomText(trimmed);
    setActive(true);
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
              <Button type="button" onClick={handleStart} disabled={text.trim().length < 10} size="md">
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
          onClick={() => setActive(false)}
          className="text-sm text-[var(--color-text-muted)] transition hover:text-[var(--color-highlight)]"
        >
          {t.custom.editText}
        </button>
      </nav>

      <TypingTest lessonId="custom-practice" lesson={CUSTOM_LESSON} customText={getCustomText()} />
    </>
  );
}
