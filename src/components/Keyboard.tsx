import { DVORAK_ROWS } from '../utils/dvorak';

interface KeyboardProps {
  activeKey?: string;
  highlightKey?: string;
}

export default function Keyboard({ activeKey, highlightKey }: KeyboardProps) {
  return (
    <div className="flex flex-col gap-1.5 select-none" aria-hidden="true">
      {DVORAK_ROWS.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-1"
          style={{ paddingLeft: `${(row.indent ?? 0) * 12}px` }}
        >
          {row.keys.map((key) => {
            const isActive = activeKey === key.code;
            const isHighlight = highlightKey === key.code;

            return (
              <div
                key={key.code}
                className={[
                  'flex h-10 items-center justify-center rounded-md border text-sm font-mono transition-all duration-100',
                  key.width ? `flex-[${key.width}] min-w-[${key.width * 40}px]` : 'min-w-10 flex-1 max-w-10',
                  isActive
                    ? 'border-[var(--color-key-active)] bg-[var(--color-key-active)] text-white scale-95'
                    : isHighlight
                      ? 'border-[var(--color-key-highlight)] bg-[var(--color-key-highlight)] text-white'
                      : 'border-[var(--color-border)] bg-[var(--color-key)] text-[var(--color-text)]',
                ].join(' ')}
                style={key.width ? { flex: key.width, minWidth: `${key.width * 40}px` } : undefined}
              >
                {key.label}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
