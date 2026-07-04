import { useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { Card } from '@/components/ui';
import {
  DVORAK_HOME_VOWELS,
  KEYBOARD_LAYOUTS,
  LAYOUT_IDS,
  type LayoutId,
} from '@/utils/keyboard/layouts';

function LayoutToggle({
  active,
  onChange,
}: {
  active: LayoutId;
  onChange: (layout: LayoutId) => void;
}) {
  const { t } = useApp();

  const labels: Record<LayoutId, string> = {
    qwerty: t.qwerty.qwerty,
    dvorak: t.qwerty.dvorak,
  };

  return (
    <div
      className="mx-auto flex w-full max-w-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1"
      role="tablist"
      aria-label={t.home.qwertyTitle}
    >
      {LAYOUT_IDS.map((id) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          onClick={() => onChange(id)}
          className={[
            'flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition',
            active === id
              ? 'bg-[var(--color-highlight)] text-white shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
          ].join(' ')}
        >
          {labels[id]}
        </button>
      ))}
    </div>
  );
}

function VisualKeyboard({ layoutId }: { layoutId: LayoutId }) {
  const layout = KEYBOARD_LAYOUTS[layoutId];
  const isDvorak = layoutId === 'dvorak';

  return (
    <div className="mx-auto w-full max-w-2xl select-none" aria-hidden="true">
      {layout.rows.map((row, rowIndex) => {
        const highlightHomeRow = isDvorak && row.homeRow;

        return (
          <div
            key={rowIndex}
            className={[
              'mb-1.5 flex justify-center rounded-xl transition-colors',
              highlightHomeRow
                ? 'bg-[var(--color-highlight)]/10 px-1 py-1.5 ring-1 ring-[var(--color-highlight)]/25'
                : '',
            ].join(' ')}
            style={{ paddingLeft: `${(row.indent ?? 0) * 4}%` }}
          >
            <div className="flex w-full gap-0.5 sm:gap-1">
              {row.keys.map((key, keyIndex) => {
                const isVowel = isDvorak && row.homeRow && DVORAK_HOME_VOWELS.has(key);

                return (
                  <div
                    key={`${rowIndex}-${keyIndex}`}
                    className={[
                      'flex h-8 min-w-0 flex-1 items-center justify-center rounded-md border font-mono text-[10px] font-medium uppercase transition-colors sm:h-10 sm:rounded-lg sm:text-sm',
                      isVowel
                        ? 'border-[var(--color-highlight)]/40 bg-[var(--color-highlight)]/20 text-[var(--color-highlight)]'
                        : highlightHomeRow
                          ? 'border-[var(--color-highlight)]/20 bg-[var(--color-surface-elevated)] text-[var(--color-text)]'
                          : 'border-[var(--color-border)] bg-[var(--color-key)] text-[var(--color-text)]',
                    ].join(' ')}
                  >
                    {key}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HighlightCards() {
  const { t } = useApp();

  const highlights = [
    { title: t.qwerty.vowelsTitle, desc: t.qwerty.vowelsDesc },
    { title: t.qwerty.homeRowTitle, desc: t.qwerty.homeRowDesc },
    { title: t.qwerty.alternationTitle, desc: t.qwerty.alternationDesc },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {highlights.map((item) => (
        <Card key={item.title} padding="md" className="h-full">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{item.desc}</p>
        </Card>
      ))}
    </div>
  );
}

export default function KeyboardComparator() {
  const { t } = useApp();
  const [layoutId, setLayoutId] = useState<LayoutId>('qwerty');

  return (
    <Card as="section" title={t.home.qwertyTitle} description={t.home.qwertyDesc} padding="lg">
      <div className="space-y-8">
        <LayoutToggle active={layoutId} onChange={setLayoutId} />
        <VisualKeyboard layoutId={layoutId} />
        <HighlightCards />
      </div>
    </Card>
  );
}
