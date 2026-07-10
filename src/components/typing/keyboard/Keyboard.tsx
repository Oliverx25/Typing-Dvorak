import { memo, useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import OnScreenKeyboard from '@/components/typing/keyboard/OnScreenKeyboard';
import {
  eventAdvancesCompositeStep,
  getActiveStepKeys,
  getSequenceStepsForChar,
  isMultiStepChar,
} from '@/utils/keyboard/keyboardMappings';
import { FINGER_CSS_VAR, getFingerForKey, type Finger } from '@/utils/keyboard/fingers';
import { buildHardwareGrid } from '@/utils/keyboard/hardwareGrid';
import HandGuide from '@/components/typing/keyboard/HandGuide';

interface KeyboardProps {
  pressedKey?: string;
  expectedChar?: string;
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

export default memo(Keyboard);

function Keyboard({ pressedKey, expectedChar }: KeyboardProps) {
  const { t, settings } = useApp();
  const showFingers = settings.fingerColors;
  const [sequenceStep, setSequenceStep] = useState(0);

  const activeStepKeys = expectedChar ? getActiveStepKeys(expectedChar, sequenceStep) : [];
  const targetKeySet = new Set(activeStepKeys);
  const multiStep = expectedChar ? isMultiStepChar(expectedChar) : false;

  useEffect(() => {
    setSequenceStep(0);
  }, [expectedChar]);

  useEffect(() => {
    if (!expectedChar || !multiStep) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentStepKeys = getActiveStepKeys(expectedChar, sequenceStep);
      if (!eventAdvancesCompositeStep(e, currentStepKeys)) return;

      setSequenceStep((prev) => {
        const maxStep = getSequenceStepsForChar(expectedChar).length - 1;
        return Math.min(prev + 1, maxStep);
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expectedChar, multiStep, sequenceStep]);

  const allFingers = buildHardwareGrid(settings.hardwareLayout)
    .map((key) => (key.code ? getFingerForKey(key.code) : undefined))
    .filter(Boolean) as Finger[];

  return (
    <section className="hidden w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 p-4 shadow-sm sm:block sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          {t.typing.dvorakLayout}
        </h2>
        <KeyLegend />
      </div>

      {showFingers && <FingerColorBar fingers={allFingers} />}

      <div className="mx-auto w-full max-w-4xl select-none motion-reduce:transition-none">
        <OnScreenKeyboard
          hardwareLayout={settings.hardwareLayout}
          pressedKey={pressedKey}
          targetKeySet={targetKeySet}
          showFingers={showFingers}
        />
      </div>

      <HandGuide targetKeys={activeStepKeys} />
    </section>
  );
}
