interface TypedCharProps {
  char: string;
  status: 'pending' | 'correct' | 'incorrect';
  isCurrent: boolean;
  active: boolean;
}

export default function TypedChar({ char, status, isCurrent, active }: TypedCharProps) {
  if (char === ' ') {
    return (
      <span
        aria-hidden="true"
        className={[
          'inline-block align-baseline',
          'min-w-[0.55em] h-[1em]',
          spaceClass(status, isCurrent, active),
        ].join(' ')}
      />
    );
  }

  let className = 'text-[var(--color-text-muted)]/60';
  if (status === 'correct') className = 'text-[var(--color-correct)]';
  if (status === 'incorrect') {
    className = 'text-[var(--color-incorrect)] underline decoration-wavy decoration-[var(--color-incorrect)]/50';
  }
  if (isCurrent && active) {
    className =
      'relative text-[var(--color-key-target)] after:absolute after:-bottom-0.5 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[var(--color-key-target)] after:content-[""]';
  }

  return <span className={className}>{char}</span>;
}

function spaceClass(
  status: TypedCharProps['status'],
  isCurrent: boolean,
  active: boolean,
): string {
  if (isCurrent && active) {
    return 'border-b-2 border-[var(--color-key-target)] caret-blink motion-reduce:animate-none';
  }
  if (status === 'correct') {
    return 'border-b border-[var(--color-correct)]/40';
  }
  if (status === 'incorrect') {
    return 'border-b-2 border-dashed border-[var(--color-incorrect)]/70';
  }
  return 'border-b border-[var(--color-border)]/30';
}
