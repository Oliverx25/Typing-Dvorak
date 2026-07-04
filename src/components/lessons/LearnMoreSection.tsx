import { useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import KeyboardComparator from '@/components/typing/KeyboardComparator';
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
        <div className="mt-6 space-y-8">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <h3 className="text-base font-semibold text-[var(--color-text)]">{t.home.homeRowTitle}</h3>
            <p className="mt-3 font-mono text-xl tracking-[0.25em] text-[var(--color-highlight)] sm:text-2xl">
              {t.home.homeRowKeys}
            </p>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">{t.home.homeRowDesc}</p>
          </div>
          <KeyboardComparator />
        </div>
      )}
    </section>
  );
}
