import { DVORAK_ROWS } from '../utils/dvorak';

interface KeyboardProps {
  /** Key currently being held down (brief flash). */
  pressedKey?: string;
  /** Key the user should press next. */
  targetKey?: string;
}

const KEY_UNIT = 44;

function getKeyStyle(key: { width?: number }) {
  const units = key.width ?? 1;
  return {
    flex: `${units} 1 0`,
    minWidth: `${units * KEY_UNIT}px`,
    maxWidth: `${units * KEY_UNIT}px`,
  };
}

function KeyLegend() {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[var(--color-text-muted)]">
      <span className="flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded border-2 border-[var(--color-key-target)] bg-[var(--color-key-target-bg)]" />
        Next key
      </span>
      <span className="flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-[var(--color-key-pressed)] text-white" />
        Pressed
      </span>
      <span className="flex items-center gap-2">
        <span className="relative inline-flex h-5 w-5 items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-key)]">
          <span className="absolute bottom-0.5 h-0.5 w-2.5 rounded-full bg-[var(--color-key-mark)]" />
        </span>
        Home guides (U · H)
      </span>
    </div>
  );
}

export default function Keyboard({ pressedKey, targetKey }: KeyboardProps) {
  return (
    <section className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 sm:p-6">
      <KeyLegend />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-1.5 select-none" aria-hidden="true">
        {DVORAK_ROWS.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex w-full gap-1"
            style={{ paddingLeft: `${(row.indent ?? 0) * (KEY_UNIT * 0.55)}px` }}
          >
            {row.keys.map((key) => {
              const isPressed = pressedKey === key.code;
              const isTarget = !isPressed && targetKey === key.code;

              return (
                <div
                  key={key.code}
                  style={getKeyStyle(key)}
                  className={[
                    'relative flex h-11 items-center justify-center rounded-lg border text-sm font-mono font-medium transition-all duration-75 sm:h-12 sm:text-base',
                    isPressed
                      ? 'z-10 scale-95 border-[var(--color-key-pressed)] bg-[var(--color-key-pressed)] text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]'
                      : isTarget
                        ? 'z-10 border-2 border-[var(--color-key-target)] bg-[var(--color-key-target-bg)] text-[var(--color-key-target)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-key-target)_25%,transparent)] animate-pulse'
                        : 'border-[var(--color-border)] bg-[var(--color-key)] text-[var(--color-text)]',
                  ].join(' ')}
                >
                  <span className={isPressed ? 'opacity-100' : ''}>{key.label}</span>
                  {key.homeRowMark && !isPressed && (
                    <span
                      className={[
                        'absolute bottom-1.5 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full',
                        isTarget
                          ? 'bg-[var(--color-key-target)]'
                          : 'bg-[var(--color-key-mark)]',
                      ].join(' ')}
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
