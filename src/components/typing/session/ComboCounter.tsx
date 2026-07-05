import { useEffect, useRef } from 'react';

interface ComboCounterProps {
  combo: number;
  broke: boolean;
  onBrokeHandled: () => void;
  label: string;
}

export default function ComboCounter({ combo, broke, onBrokeHandled, label }: ComboCounterProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!broke) return;
    const node = ref.current;
    if (!node) {
      onBrokeHandled();
      return;
    }
    const handleEnd = () => onBrokeHandled();
    node.addEventListener('animationend', handleEnd, { once: true });
    return () => node.removeEventListener('animationend', handleEnd);
  }, [broke, onBrokeHandled]);

  const active = combo > 1;

  return (
    <div
      ref={ref}
      aria-live="polite"
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-sm font-semibold transition-all duration-300',
        broke ? 'shake' : '',
        active
          ? 'border-[var(--color-highlight)]/40 bg-[var(--color-highlight)]/10 text-[var(--color-highlight)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]',
      ].join(' ')}
    >
      <span className="text-[11px] font-medium uppercase tracking-wide opacity-70">{label}</span>
      <span className="tabular-nums">x{combo}</span>
    </div>
  );
}
