import { memo, type CSSProperties, type ReactNode } from 'react';
import type { HardwareLayout } from '@/utils/keyboard/keyboardLayouts';
import {
  buildHardwareGrid,
  GRID_COLUMNS,
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
    gridRow: key.rowSpan > 1 ? `${key.row} / span ${key.rowSpan}` : undefined,
  };
}

function baseKeyClassName(variant: GridKeyVariant, isPressed: boolean, isTarget: boolean): string {
  if (variant === 'blind') {
    return [
      'relative flex items-center justify-center rounded-lg border border-[var(--color-border)]/40',
      'bg-slate-700/20 text-[10px] font-medium uppercase tracking-wide text-slate-500/70',
      'dark:bg-slate-800/30 dark:text-slate-500/60',
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

function DefaultGridKey({
  keyDef,
  pressedKey,
  targetKeySet,
  showFingers,
  renderKey,
}: {
  keyDef: GridKeyDef;
  pressedKey?: string;
  targetKeySet: Set<string>;
  showFingers: boolean;
  renderKey?: (state: GridKeyVisualState) => ReactNode;
}) {
  const isPressed = keyDef.code != null && pressedKey === keyDef.code;
  const isTarget = keyDef.code != null && !isPressed && targetKeySet.has(keyDef.code);
  const placement = gridPlacementStyle(keyDef);
  const finger = fingerStyle(keyDef, showFingers, isPressed, isTarget);

  const className = [
    baseKeyClassName(keyDef.variant, isPressed, isTarget),
    keyDef.variant === 'iso-enter' ? 'iso-enter-key' : '',
    keyDef.token === '[space]' ? 'text-xs' : '',
    'h-10 sm:h-11',
  ].join(' ');

  const style: CSSProperties = {
    ...placement,
    ...finger,
  };

  const displayLabel = keyDef.label === 'Space' ? '' : keyDef.label;

  if (renderKey) {
    return <>{renderKey({ key: keyDef, className, style, displayLabel })}</>;
  }

  return (
    <div className={className} style={style}>
      {keyDef.variant === 'iso-enter' ? (
        <>
          <span className="absolute inset-x-0 top-0 flex h-[calc(50%-2px)] items-center justify-center rounded-t-lg border border-b-0 border-[var(--color-border)] bg-[var(--color-key)]/80 text-[var(--color-text-muted)]">
            ↵
          </span>
          <span className="absolute inset-x-0 bottom-0 top-[calc(50%-2px)] flex items-center justify-center rounded-b-lg border border-[var(--color-border)] bg-[var(--color-key)]/80 text-[var(--color-text-muted)]">
            ↵
          </span>
        </>
      ) : (
        displayLabel
      )}

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
}

function OnScreenKeyboard({
  hardwareLayout,
  className = '',
  pressedKey,
  targetKeySet = new Set(),
  showFingers = false,
  renderKey,
}: OnScreenKeyboardProps) {
  const keys = buildHardwareGrid(hardwareLayout);

  return (
    <div
      className={[
        'grid w-full gap-1',
        className,
      ].join(' ')}
      style={{
        gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
        gridTemplateRows: 'repeat(5, minmax(2.5rem, auto))',
      }}
      aria-hidden={renderKey ? undefined : true}
    >
      {keys.map((keyDef) => (
        <DefaultGridKey
          key={keyDef.id}
          keyDef={keyDef}
          pressedKey={pressedKey}
          targetKeySet={targetKeySet}
          showFingers={showFingers}
          renderKey={renderKey}
        />
      ))}
    </div>
  );
}

export default memo(OnScreenKeyboard);
