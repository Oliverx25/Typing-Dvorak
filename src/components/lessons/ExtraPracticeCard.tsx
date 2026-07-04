import { useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { getCustomText, saveCustomText } from '@/utils/progress/customText';
import { Button } from '@/components/ui';
import { formFieldMonoClassName } from '@/components/ui/formFieldClasses';

export default function ExtraPracticeCard() {
  const { t } = useApp();
  const [text, setText] = useState(() => getCustomText() ?? '');

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip.trim()) setText(clip);
    } catch {
      /* clipboard denied — user can type manually */
    }
  };

  const handleStart = () => {
    const trimmed = text.trim();
    if (trimmed.length < 10) return;
    saveCustomText(trimmed);
    window.location.href = '/practice/custom';
  };

  return (
    <section className="mb-10">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
        {t.home.extraPractice}
      </h2>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.custom.placeholder}
          rows={3}
          className={`${formFieldMonoClassName} focus:border-[var(--color-highlight)]/50 focus:ring-[var(--color-highlight)]/15`}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={handlePaste}>
            {t.home.pasteText}
          </Button>
          <Button
            type="button"
            variant="highlight"
            size="sm"
            onClick={handleStart}
            disabled={text.trim().length < 10}
          >
            {t.custom.start}
          </Button>
        </div>
      </div>
    </section>
  );
}
