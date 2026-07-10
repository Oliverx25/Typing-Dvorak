import { memo, type CSSProperties, type ReactNode } from 'react';
import type { HardwareLayout, OsPreference } from '@/utils/keyboard/keyboardLayouts';
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
  osPreference?: OsPreference;
  className?: string;
  pressedKey?: string;
  targetKeySet?: Set<string>;
  showFingers?: boolean;
  renderKey?: (state: GridKeyVisualState) => ReactNode;
}

function resolveDisplayLabel(token: string, label: string, osPreference: OsPreference): string {
  if (token === '[cmd]') return osPreference === 'Mac' ? '⌘' : 'Win';
  if (token === '[opt]') return osPreference === 'Mac' ? '⌥' : 'Alt';
  if (label === 'Space') return '';
  return label;
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
    return 'pointer-events-none border-0 bg-transparent opacity-0';
  }

  if (variant === 'blind') {
    return [
      'relative flex items-center justify-center rounded-lg border text-[10px] font-medium uppercase tracking-wide',
      modifierSurfaceClass(isPressed, isTarget, true),
    ].join(' ');
  }

  if (variant === 'iso-enter') {
    return [
      'relative z-10 flex items-start justify-center rounded-t-lg border font-mono text-sm font-medium sm:text-base',
      modifierSurfaceClass(isPressed, isTarget, false),
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

function IsoEnterKey({
  className,
  style,
  finger,
  isTarget,
  bootCols = 5,
  topCols = 6,
}: {
  className: string;
  style: CSSProperties;
  finger?: CSSProperties;
  isTarget: boolean;
  bootCols?: number;
  topCols?: number;
}) {
  return (
    <div className={className} style={{ ...style, ...finger }}>
      <span className="mt-2">↵</span>
      <div
        className={[
          'absolute top-[calc(100%+0.25rem)] right-0 flex h-10 items-center justify-center rounded-b-lg border border-t-0 sm:h-11',
          'border-[var(--color-border)] bg-[var(--color-key)]/80',
          isTarget
            ? 'border-[var(--color-key-target)] bg-[var(--color-key-target-bg)] text-[var(--color-key-target)]'
            : 'text-[var(--color-text-muted)]',
        ].join(' ')}
        style={{ width: `calc(${(bootCols / topCols) * 100}% + ${bootCols - 1}px)` }}
        aria-hidden="true"
      />
    </div>
  );
}

function DefaultGridKey({
  keyDef,
  osPreference,
  pressedKey,
  targetKeySet,
  showFingers,
  renderKey,
}: {
  keyDef: GridKeyDef;
  osPreference: OsPreference;
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
    keyDef.token === '[space]' ? 'text-xs' : '',
    'h-10 sm:h-11',
  ].join(' ');

  const style: CSSProperties = {
    ...placement,
    ...finger,
  };

  const displayLabel = resolveDisplayLabel(keyDef.token, keyDef.label, osPreference);

  if (renderKey) {
    if (keyDef.variant === 'gap') {
      return <div key={keyDef.id} className={className} style={style} aria-hidden="true" />;
    }
    return <>{renderKey({ key: keyDef, className, style, displayLabel })}</>;
  }

  if (keyDef.variant === 'gap') {
    return <div className={className} style={style} aria-hidden="true" />;
  }

  if (keyDef.variant === 'iso-enter') {
    return (
      <IsoEnterKey
        className={className}
        style={style}
        finger={finger}
        isTarget={isTarget}
        bootCols={keyDef.isoBootCols}
        topCols={keyDef.colSpan}
      />
    );
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
}

function OnScreenKeyboard({
  hardwareLayout,
  osPreference = 'Mac',
  className = '',
  pressedKey,
  targetKeySet = new Set(),
  showFingers = false,
  renderKey,
}: OnScreenKeyboardProps) {
  const keys = buildHardwareGrid(hardwareLayout);

  return (
    <div
      className={['grid w-full grid-cols-[repeat(60,_minmax(0,_1fr))] gap-1 rounded-lg bg-slate-800/40 p-2', className].join(
        ' ',
      )}
      style={{ gridTemplateRows: 'repeat(5, minmax(2.5rem, auto))' }}
      aria-hidden={renderKey ? undefined : true}
    >
      {keys.map((keyDef) => (
        <DefaultGridKey
          key={keyDef.id}
          keyDef={keyDef}
          osPreference={osPreference}
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
