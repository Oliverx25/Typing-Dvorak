import { getFingerForKey, FINGER_CSS_VAR, type Finger } from '@/utils/keyboard/fingers';
import { useApp } from '@/contexts/AppProvider';

interface HandGuideProps {
  targetKey?: string;
}

function FingerSlot({
  finger,
  label,
  active,
}: {
  finger: Finger;
  label: string;
  active: boolean;
}) {
  return (
    <div
      className={[
        'flex flex-col items-center gap-1 transition-all duration-150',
        active ? 'scale-110' : 'opacity-50',
      ].join(' ')}
    >
      <div
        className={[
          'h-10 w-7 rounded-t-full rounded-b-md border-2 sm:h-12 sm:w-8',
          active
            ? 'border-[var(--color-key-target)] shadow-[0_0_12px_color-mix(in_srgb,var(--color-key-target)_50%,transparent)]'
            : 'border-[var(--color-border)]',
        ].join(' ')}
        style={{
          background: active
            ? `color-mix(in srgb, var(${FINGER_CSS_VAR[finger]}) 60%, var(--color-key-target-bg))`
            : `color-mix(in srgb, var(${FINGER_CSS_VAR[finger]}) 20%, var(--color-key))`,
        }}
      />
      <span
        className={[
          'text-[9px] sm:text-[10px]',
          active ? 'font-semibold text-[var(--color-key-target)]' : 'text-[var(--color-text-muted)]',
        ].join(' ')}
      >
        {label}
      </span>
    </div>
  );
}

function ThumbBar({ active }: { active: boolean }) {
  return (
    <div
      className={[
        'h-3 w-24 rounded-full transition-all duration-150 sm:w-28',
        active
          ? 'bg-[var(--color-key-target)] shadow-[0_0_14px_color-mix(in_srgb,var(--color-key-target)_55%,transparent)]'
          : 'bg-[var(--color-border)]',
      ].join(' ')}
      aria-hidden="true"
    />
  );
}

export default function HandGuide({ targetKey }: HandGuideProps) {
  const { t } = useApp();
  const isSpace = targetKey === 'Space';
  const activeFinger = !isSpace && targetKey ? getFingerForKey(targetKey) : undefined;

  const left: { finger: Finger; label: string }[] = [
    { finger: 'lp', label: t.fingers.lp },
    { finger: 'lr', label: t.fingers.lr },
    { finger: 'lm', label: t.fingers.lm },
    { finger: 'li', label: t.fingers.li },
  ];

  const right: { finger: Finger; label: string }[] = [
    { finger: 'ri', label: t.fingers.ri },
    { finger: 'rm', label: t.fingers.rm },
    { finger: 'rr', label: t.fingers.rr },
    { finger: 'rp', label: t.fingers.rp },
  ];

  return (
    <div className="mt-4 flex items-end justify-center gap-6 sm:gap-10">
      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
          {t.typing.leftHand}
        </span>
        <div className="flex items-end gap-1 sm:gap-2">
          {left.map(({ finger, label }) => (
            <FingerSlot key={finger} finger={finger} label={label} active={activeFinger === finger} />
          ))}
        </div>
        <ThumbBar active={isSpace} />
        {isSpace && (
          <span className="text-[9px] font-semibold text-[var(--color-key-target)] sm:text-[10px]">
            {t.typing.thumb}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
          {t.typing.rightHand}
        </span>
        <div className="flex items-end gap-1 sm:gap-2">
          {right.map(({ finger, label }) => (
            <FingerSlot key={finger} finger={finger} label={label} active={activeFinger === finger} />
          ))}
        </div>
        <ThumbBar active={isSpace} />
      </div>
    </div>
  );
}
