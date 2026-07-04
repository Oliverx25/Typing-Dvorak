import { useCallback, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { Card } from '@/components/ui';
import {
  DVORAK_HOME_VOWELS,
  KEYBOARD_LAYOUTS,
  LAYOUT_IDS,
  type LayoutId,
} from '@/utils/keyboard/layouts';

/** Physical keyboard row stagger — top row flush, each row indented further. */
const ROW_STAGGER_CLASS = [
  'ml-0',
  'ml-[4%] sm:ml-[5%]',
  'ml-[8%] sm:ml-[10%]',
] as const;

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

function VisualKeyboard({ layoutId }: { layoutId: LayoutId }) {
  const layout = KEYBOARD_LAYOUTS[layoutId];
  const isDvorak = layoutId === 'dvorak';

  return (
    <div className="mx-auto w-full max-w-2xl select-none px-1 sm:px-0" aria-hidden="true">
      {layout.rows.map((row, rowIndex) => {
        const highlightHomeRow = isDvorak && row.homeRow;
        const staggerClass = ROW_STAGGER_CLASS[rowIndex] ?? 'ml-0';

        return (
          <div
            key={rowIndex}
            className={[
              'mb-1.5 flex justify-start rounded-xl px-1 py-1',
              staggerClass,
              KEY_TRANSITION,
              highlightHomeRow
                ? 'bg-[var(--color-highlight)]/10 py-1.5 ring-1 ring-[var(--color-highlight)]/25'
                : 'bg-transparent ring-1 ring-transparent',
            ].join(' ')}
          >
            <div className="flex w-full max-w-full gap-0.5 sm:gap-1">
              {row.keys.map((key, keyIndex) => {
                const isVowel = isDvorak && row.homeRow && DVORAK_HOME_VOWELS.has(key);

                return (
                  <div
                    key={keyIndex}
                    className={[
                      'flex h-8 min-w-0 flex-1 items-center justify-center rounded-md border font-mono text-[10px] font-medium uppercase sm:h-10 sm:rounded-lg sm:text-sm',
                      KEY_TRANSITION,
                      isVowel
                        ? 'border-[var(--color-highlight)]/40 bg-[var(--color-highlight)]/20 text-[var(--color-highlight)]'
                        : highlightHomeRow
                          ? 'border-[var(--color-highlight)]/20 bg-[var(--color-surface-elevated)] text-[var(--color-text)]'
                          : 'border-[var(--color-border)] bg-[var(--color-key)] text-[var(--color-text)]',
                    ].join(' ')}
                  >
                    <span className={KEY_TRANSITION}>{key}</span>
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

  const handleLayoutChange = useCallback((next: LayoutId) => {
    if (next === layoutId) return;
    setKeyboardVisible(false);
    window.setTimeout(() => {
      setLayoutId(next);
      setKeyboardVisible(true);
    }, 150);
  }, [layoutId]);

  return (
    <Card as="section" title={t.home.qwertyTitle} description={t.home.qwertyDesc} padding="lg">
      <div className="space-y-8">
        <LayoutToggle active={layoutId} onChange={handleLayoutChange} />
        <div
          className={[
            KEY_TRANSITION,
            keyboardVisible ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        >
          <VisualKeyboard layoutId={layoutId} />
        </div>
        <HighlightCards />
      </div>
    </Card>
  );
}
