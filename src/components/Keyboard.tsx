import { DVORAK_ROWS } from '../utils/dvorak';
import { FINGER_CSS_VAR, getFingerForKey, type Finger } from '../utils/fingers';
import { useApp } from '../contexts/AppProvider';
import HandGuide from './HandGuide';

interface KeyboardProps {
  pressedKey?: string;
  targetKey?: string;
}

function KeyLegend() {
  const { t, settings } = useApp();

  return (
    <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-[11px] text-[var(--color-text-muted)]">
      <span className="flex items-center gap-1.5">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded border-2 border-[var(--color-key-target)] bg-[var(--color-key-target-bg)]" />
        {t.typing.nextKey}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-flex h-4 w-4 rounded bg-[var(--color-key-pressed)]" />
        {t.typing.pressed}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="relative inline-flex h-4 w-4 rounded border border-[var(--color-border)] bg-[var(--color-key)]">
          <span className="absolute bottom-0.5 left-1/2 h-0.5 w-2 -translate-x-1/2 rounded-full bg-[var(--color-key-mark)]" />
        </span>
        {t.typing.homeGuides}
      </span>
      {settings.fingerColors && (
        <span className="hidden text-[var(--color-text-muted)] sm:inline">{t.typing.fingers} ↓</span>
      )}
    </div>
  );
}

function FingerColorBar({ fingers }: { fingers: Finger[] }) {
  const { t } = useApp();
  const unique = [...new Set(fingers)];
  return (
    <div className="mb-3 hidden flex-wrap justify-center gap-2 sm:flex">
      {unique.map((f) => (
        <span key={f} className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: `var(${FINGER_CSS_VAR[f]})` }} />
          {t.fingers[f]}
        </span>
      ))}
    </div>
  );
}

export default function Keyboard({ pressedKey, targetKey }: KeyboardProps) {
  const { t, settings } = useApp();
  const showFingers = settings.fingerColors;

  const allFingers = DVORAK_ROWS.flatMap((r) =>
    r.keys.map((k) => getFingerForKey(k.code)).filter(Boolean),
  ) as Finger[];

  return (
    <section className="hidden w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 p-4 shadow-sm sm:block sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          {t.typing.dvorakLayout}
        </h2>
        <KeyLegend />
      </div>

      {showFingers && <FingerColorBar fingers={allFingers} />}

      <div className="mx-auto w-full max-w-3xl select-none motion-reduce:transition-none" aria-hidden="true">
        {DVORAK_ROWS.map((row, rowIndex) => {
          const totalUnits = row.keys.reduce((s, k) => s + (k.width ?? 1), 0);
          return (
            <div
              key={rowIndex}
              className="mb-1 flex w-full justify-center"
              style={{ paddingLeft: `${(row.indent ?? 0) * 2.5}%` }}
            >
              <div className="flex w-full gap-0.5">
                {row.keys.map((key) => {
                  const isPressed = pressedKey === key.code;
                  const isTarget = !isPressed && targetKey === key.code;
                  const finger = showFingers ? getFingerForKey(key.code) : undefined;
                  const widthPct = ((key.width ?? 1) / totalUnits) * 100;

                  return (
                    <div
                      key={key.code}
                      style={{
                        width: `${widthPct}%`,
                        ...(finger && !isPressed && !isTarget
                          ? { background: `color-mix(in srgb, var(${FINGER_CSS_VAR[finger]}) 25%, var(--color-key))` }
                          : {}),
                      }}
                      className={[
                        'relative flex h-10 items-center justify-center rounded-lg border font-mono text-sm font-medium transition-all duration-75 motion-reduce:animate-none sm:h-11 sm:text-base',
                        isPressed
                          ? 'z-10 scale-95 border-[var(--color-key-pressed)] bg-[var(--color-key-pressed)] text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]'
                          : isTarget
                            ? 'z-10 border-2 border-[var(--color-key-target)] bg-[var(--color-key-target-bg)] text-[var(--color-key-target)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-key-target)_25%,transparent)] animate-pulse motion-reduce:animate-none'
                            : 'border-[var(--color-border)] bg-[var(--color-key)] text-[var(--color-text)]',
                      ].join(' ')}
                    >
                      {key.label}
                      {key.homeRowMark && !isPressed && (
                        <span
                          className={[
                            'absolute bottom-1 left-1/2 h-1 w-3 -translate-x-1/2 rounded-full sm:w-4',
                            isTarget ? 'bg-[var(--color-key-target)]' : 'bg-[var(--color-key-mark)]',
                          ].join(' ')}
                        />
                      )}
                      {isTarget && (
                        <span className="absolute -top-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-b-4 border-x-transparent border-b-[var(--color-key-target)]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <HandGuide targetKey={targetKey} />
    </section>
  );
}
