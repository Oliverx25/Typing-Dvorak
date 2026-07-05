import { useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import KeyboardComparator from '@/components/typing/keyboard/KeyboardComparator';
import { Icon } from '@/components/ui';

export default function LearnMoreSection() {
  const { t } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-4 border-t border-[var(--color-border)] pt-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 text-left text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
      >
        <Icon name={open ? 'chevron-down' : 'chevron-right'} size={16} />
        {t.home.learnMoreTitle}
      </button>

      {open && (
        <div className="mt-6">
          <KeyboardComparator />
        </div>
      )}
    </section>
  );
}
