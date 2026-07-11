import { memo, useMemo, type CSSProperties, type ReactNode } from 'react';
import type { HardwareLayout } from '@/utils/keyboard/keyboardLayouts';
import {
  buildHardwareGrid,
  type GridKeyDef,
  type GridKeyVariant,
} from '@/utils/keyboard/hardwareGrid';
import { FINGER_CSS_VAR, getFingerForKey, type Finger } from '@/utils/keyboard/fingers';
import { isThumbKey } from '@/utils/keyboard/keyboardMappings';

export interface GridKeyVisualState {
  key: GridKeyDef;
  className: string;
  style: CSSProperties;
  displayLabel: string;
}

interface OnScreenKeyboardProps {
  hardwareLayout: HardwareLayout;
  className?: string;
  pressedKey?: string;
  targetKeySet?: Set<string>;
  showFingers?: boolean;
  renderKey?: (state: GridKeyVisualState) => ReactNode;
}

function gridPlacementStyle(key: GridKeyDef): CSSProperties {
  return {
    gridColumn: `${key.colStart} / span ${key.colSpan}`,
    gridRow: key.row,
  };
}

function modifierSurfaceClass(isPressed: boolean, isTarget: boolean, isBlind: boolean): string {
  if (isBlind) {
    return 'border-[var(--color-border)]/40 bg-slate-700/20 text-slate-500/70 dark:bg-slate-800/30 dark:text-slate-500/60';
  }
  if (isPressed) {
    return 'border-[var(--color-key-pressed)] bg-[var(--color-key-pressed)] text-white';
  }
  if (isTarget) {
    return 'border-2 border-[var(--color-key-target)] bg-[var(--color-key-target-bg)] text-[var(--color-key-target)]';
  }
  return 'border-[var(--color-border)] bg-[var(--color-key)]/80 text-[var(--color-text-muted)]';
}

function baseKeyClassName(
  variant: GridKeyVariant,
  isPressed: boolean,
  isTarget: boolean,
): string {
  if (variant === 'gap') {
    return '';
  }

  if (variant === 'blind') {
    return [
      'relative flex items-center justify-center rounded-lg border text-[10px] font-medium uppercase tracking-wide',
      modifierSurfaceClass(isPressed, isTarget, true),
    ].join(' ');
  }

  return [
    'relative flex items-center justify-center rounded-lg border font-mono text-sm font-medium transition-all duration-75 motion-reduce:animate-none sm:text-base',
    isPressed
      ? 'z-10 scale-95 border-[var(--color-key-pressed)] bg-[var(--color-key-pressed)] text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]'
      : isTarget
        ? 'z-10 border-2 border-[var(--color-key-target)] bg-[var(--color-key-target-bg)] text-[var(--color-key-target)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-key-target)_25%,transparent)] animate-pulse motion-reduce:animate-none'
        : variant === 'modifier'
          ? 'border-[var(--color-border)] bg-[var(--color-key)]/80 text-[var(--color-text-muted)]'
          : 'border-[var(--color-border)] bg-[var(--color-key)] text-[var(--color-text)]',
  ].join(' ');
}

function fingerStyle(
  key: GridKeyDef,
  showFingers: boolean,
  isPressed: boolean,
  isTarget: boolean,
): CSSProperties | undefined {
  if (!showFingers || !key.code || isPressed || isTarget) return undefined;

  if (isThumbKey(key.code)) {
    return { background: 'color-mix(in srgb, var(--color-key-mark) 35%, var(--color-key))' };
  }

  const finger: Finger | undefined = getFingerForKey(key.code);
  if (!finger) return undefined;
  return {
    background: `color-mix(in srgb, var(${FINGER_CSS_VAR[finger]}) 25%, var(--color-key))`,
  };
}

const GridKeyCell = memo(function GridKeyCell({
  keyDef,
  isPressed,
  isTarget,
  showFingers,
  renderKey,
}: {
  keyDef: GridKeyDef;
  isPressed: boolean;
  isTarget: boolean;
  showFingers: boolean;
  renderKey?: (state: GridKeyVisualState) => ReactNode;
}) {
  const placement = gridPlacementStyle(keyDef);
  const finger = fingerStyle(keyDef, showFingers, isPressed, isTarget);

  const className = [
    baseKeyClassName(keyDef.variant, isPressed, isTarget),
    keyDef.token === '[space]' ? 'text-xs' : '',
    keyDef.variant !== 'gap' ? 'h-10 sm:h-11' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const style: CSSProperties = {
    ...placement,
    ...finger,
  };

  const displayLabel =
    keyDef.token === '[enter-iso-bottom]' || keyDef.label === 'Space' ? '' : keyDef.label;

  if (renderKey) {
    if (keyDef.variant === 'gap') {
      return <div key={keyDef.id} style={style} aria-hidden="true" />;
    }
    return <>{renderKey({ key: keyDef, className, style, displayLabel })}</>;
  }

  if (keyDef.variant === 'gap') {
    return <div style={style} aria-hidden="true" />;
  }

  return (
    <div className={className} style={style}>
      {displayLabel}

      {keyDef.homeRowMark && !isPressed ? (
        <span
          className={[
            'absolute bottom-1 left-1/2 h-1 w-3 -translate-x-1/2 rounded-full sm:w-4',
            isTarget ? 'bg-[var(--color-key-target)]' : 'bg-[var(--color-key-mark)]',
          ].join(' ')}
        />
      ) : null}

      {isTarget ? (
        <span className="absolute -top-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-b-4 border-x-transparent border-b-[var(--color-key-target)]" />
      ) : null}
    </div>
  );
});

function OnScreenKeyboard({
  hardwareLayout,
  className = '',
  pressedKey,
  targetKeySet = new Set(),
  showFingers = false,
  renderKey,
}: OnScreenKeyboardProps) {
  const keys = useMemo(() => buildHardwareGrid(hardwareLayout), [hardwareLayout]);

  return (
    <div
      className={['grid w-full grid-cols-[repeat(60,_minmax(0,_1fr))] gap-1 rounded-lg bg-slate-800/40 p-2', className].join(
        ' ',
      )}
      style={{ gridTemplateRows: 'repeat(5, minmax(2.5rem, auto))' }}
      aria-hidden={renderKey ? undefined : true}
    >
      {keys.map((keyDef) => {
        const isPressed = keyDef.code != null && pressedKey === keyDef.code;
        const isTarget = keyDef.code != null && !isPressed && targetKeySet.has(keyDef.code);
        return (
          <GridKeyCell
            key={keyDef.id}
            keyDef={keyDef}
            isPressed={isPressed}
            isTarget={isTarget}
            showFingers={showFingers}
            renderKey={renderKey}
          />
        );
      })}
    </div>
  );
}

export default memo(OnScreenKeyboard);
