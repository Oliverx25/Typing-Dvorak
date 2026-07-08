import { memo } from 'react';
import type { CharStatus } from '@/hooks/useTypingSession';

interface TypedCharProps {
  char: string;
  status: CharStatus;
  isCurrent: boolean;
  active: boolean;
  wasCorrected?: boolean;
  needsCorrection?: boolean;
  hideInlineCaret?: boolean;
}

const ENTER_GLYPH = '↵';
const TAB_GLYPH = '⇥';

export default memo(TypedChar);

function TypedChar({
  char,
  status,
  isCurrent,
  active,
  wasCorrected = false,
  needsCorrection = false,
  hideInlineCaret = false,
}: TypedCharProps) {
  if (char === ' ') {
    return (
      <span
        aria-hidden="true"
        className={[
          'inline-block align-baseline',
          'min-w-[0.55em] h-[1em]',
          spaceClass(status, isCurrent, active, wasCorrected, needsCorrection, hideInlineCaret),
        ].join(' ')}
      />
    );
  }

  if (char === '\n') {
    return (
      <>
        <span
          aria-label="Enter"
          className={glyphClass(status, isCurrent, active, wasCorrected, needsCorrection, hideInlineCaret)}
        >
          {ENTER_GLYPH}
        </span>
        <br />
      </>
    );
  }

  if (char === '\t') {
    return (
      <span
        aria-label="Tab"
        className={[
          'inline-block min-w-[4ch] text-center align-baseline font-mono text-[0.82em] tracking-tight',
          glyphClass(status, isCurrent, active, wasCorrected, needsCorrection, hideInlineCaret),
        ].join(' ')}
      >
        {TAB_GLYPH}
      </span>
    );
  }

  return (
    <span className={charClass(status, isCurrent, active, wasCorrected, needsCorrection, hideInlineCaret)}>
      {char}
    </span>
  );
}

function charClass(
  status: CharStatus,
  isCurrent: boolean,
  active: boolean,
  wasCorrected: boolean,
  needsCorrection: boolean,
  hideInlineCaret: boolean,
): string {
  let className = 'text-[var(--color-text-muted)]/60';

  if (status === 'incorrect') {
    className = 'text-red-500 bg-red-500/20 underline decoration-wavy decoration-red-500/50';
  } else if (wasCorrected) {
    className = 'text-amber-400';
  } else if (needsCorrection) {
    className = 'text-amber-400/90';
  } else if (status === 'correct') {
    className = 'text-emerald-400';
  }

  if (isCurrent && active && !hideInlineCaret) {
    const cursorColor = needsCorrection ? 'after:bg-amber-400' : 'after:bg-[var(--color-key-target)]';
    const textColor = needsCorrection ? 'text-amber-400' : 'text-[var(--color-key-target)]';
    className = [
      'relative',
      textColor,
      `${cursorColor} after:absolute after:-bottom-0.5 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:content-[""]`,
    ].join(' ');
  }

  return className;
}

function glyphClass(
  status: CharStatus,
  isCurrent: boolean,
  active: boolean,
  wasCorrected: boolean,
  needsCorrection: boolean,
  hideInlineCaret = false,
): string {
  return charClass(status, isCurrent, active, wasCorrected, needsCorrection, hideInlineCaret);
}

function spaceClass(
  status: CharStatus,
  isCurrent: boolean,
  active: boolean,
  wasCorrected: boolean,
  needsCorrection: boolean,
  hideInlineCaret = false,
): string {
  if (isCurrent && active && !hideInlineCaret) {
    const borderColor = needsCorrection ? 'border-amber-400' : 'border-[var(--color-key-target)]';
    return `border-b-2 ${borderColor} caret-blink motion-reduce:animate-none`;
  }
  if (status === 'incorrect') {
    return 'border-b-2 border-dashed border-red-500/70 bg-red-500/10';
  }
  if (wasCorrected) {
    return 'border-b border-amber-400/50';
  }
  if (needsCorrection) {
    return 'border-b border-amber-400/40';
  }
  if (status === 'correct') {
    return 'border-b border-emerald-400/40';
  }
  return 'border-b border-[var(--color-border)]/30';
}
