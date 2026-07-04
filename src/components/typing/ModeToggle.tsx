import { useApp } from '@/contexts/AppProvider';
import type { PracticeMode } from '@/utils/app/settings';

export default function ModeToggle() {
  const { t, settings, setPracticeMode } = useApp();

  return (
    <div className="flex rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1">
      {(['practice', 'test'] as PracticeMode[]).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => setPracticeMode(mode)}
          className={[
            'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition',
            settings.practiceMode === mode
              ? 'bg-[var(--color-highlight)] text-white shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
          ].join(' ')}
        >
          {mode === 'practice' ? t.lesson.practice : t.lesson.test}
        </button>
      ))}
    </div>
  );
}

export function ModeDescription() {
  const { t, settings } = useApp();
  return (
    <p className="mt-2 text-sm text-[var(--color-text-muted)]">
      {settings.practiceMode === 'practice' ? t.lesson.practiceDesc : t.lesson.testDesc}
    </p>
  );
}
