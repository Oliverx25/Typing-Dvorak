import { useCallback, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { Card } from '@/components/ui';
import {
  COMPARATOR_LAYOUTS,
  DVORAK_HOME_VOWELS,
  HOME_ROW_INDEX,
  LAYOUT_IDS,
  type LayoutId,
} from '@/utils/keyboard/layouts';
import type { KeyDef } from '@/utils/keyboard/dvorak';

const KEY_TRANSITION = 'transition-all duration-300 ease-in-out motion-reduce:transition-none';

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
            'flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold',
            KEY_TRANSITION,
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

function ComparatorKey({
  keyDef,
  highlightHomeRow,
  isDvorak,
}: {
  keyDef: KeyDef;
  highlightHomeRow: boolean;
  isDvorak: boolean;
}) {
  const isSpace = keyDef.code === 'Space';
  const isVowel = isDvorak && highlightHomeRow && DVORAK_HOME_VOWELS.has(keyDef.label.toLowerCase());

  return (
    <div
      className={[
        'flex items-center justify-center rounded-md border font-mono font-medium uppercase',
        KEY_TRANSITION,
        isSpace
          ? 'h-8 text-[9px] tracking-widest sm:h-9 sm:text-[10px]'
          : 'h-8 text-[10px] sm:h-10 sm:rounded-lg sm:text-xs',
        isVowel
          ? 'border-[var(--color-highlight)]/40 bg-[var(--color-highlight)]/20 text-[var(--color-highlight)]'
          : highlightHomeRow
            ? 'border-[var(--color-highlight)]/20 bg-[var(--color-surface-elevated)] text-[var(--color-text)]'
            : 'border-[var(--color-border)] bg-[var(--color-key)] text-[var(--color-text)]',
      ].join(' ')}
    >
      <span className={KEY_TRANSITION}>{keyDef.label}</span>
    </div>
  );
}

function VisualKeyboard({ layoutId }: { layoutId: LayoutId }) {
  const rows = COMPARATOR_LAYOUTS[layoutId];
  const isDvorak = layoutId === 'dvorak';

  return (
    <div className="mx-auto w-full max-w-3xl select-none px-1 sm:px-0" aria-hidden="true">
      {rows.map((row, rowIndex) => {
        const highlightHomeRow = isDvorak && rowIndex === HOME_ROW_INDEX;
        const totalUnits = row.keys.reduce((sum, key) => sum + (key.width ?? 1), 0);

        return (
          <div
            key={rowIndex}
            className={[
              'mb-1 flex w-full justify-center rounded-xl px-0.5 py-0.5',
              KEY_TRANSITION,
              highlightHomeRow
                ? 'bg-[var(--color-highlight)]/10 py-1 ring-1 ring-[var(--color-highlight)]/25'
                : 'bg-transparent ring-1 ring-transparent',
            ].join(' ')}
            style={{ paddingLeft: `${(row.indent ?? 0) * 2.5}%` }}
          >
            <div className="flex w-full gap-0.5 sm:gap-1">
              {row.keys.map((keyDef) => {
                const widthPct = ((keyDef.width ?? 1) / totalUnits) * 100;

                return (
                  <div key={keyDef.code} style={{ width: `${widthPct}%` }} className="min-w-0">
                    <ComparatorKey
                      keyDef={keyDef}
                      highlightHomeRow={highlightHomeRow}
                      isDvorak={isDvorak}
                    />
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
  const [keyboardVisible, setKeyboardVisible] = useState(true);

  const handleLayoutChange = useCallback(
    (next: LayoutId) => {
      if (next === layoutId) return;
      setKeyboardVisible(false);
      window.setTimeout(() => {
        setLayoutId(next);
        setKeyboardVisible(true);
      }, 150);
    },
    [layoutId],
  );

  return (
    <Card as="section" title={t.home.qwertyTitle} description={t.home.qwertyDesc} padding="lg">
      <div className="space-y-8">
        <LayoutToggle active={layoutId} onChange={handleLayoutChange} />
        <div className={[KEY_TRANSITION, keyboardVisible ? 'opacity-100' : 'opacity-0'].join(' ')}>
          <VisualKeyboard layoutId={layoutId} />
        </div>
        <HighlightCards />
      </div>
    </Card>
  );
}
