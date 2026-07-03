import { getFingerForKey, type Finger } from '../utils/fingers';
import { useApp } from '../contexts/AppProvider';
import HandSilhouette from './HandSilhouette';

interface HandGuideProps {
  targetKey?: string;
}

export default function HandGuide({ targetKey }: HandGuideProps) {
  const { t } = useApp();
  const activeFinger = targetKey ? getFingerForKey(targetKey) : undefined;

  const fingerLabel = (finger: Finger) => t.fingers[finger];

  return (
    <div className="mt-5 flex flex-col items-center gap-3">
      <div className="flex items-end justify-center gap-8 sm:gap-14">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
            {t.typing.leftHand}
          </span>
          <HandSilhouette side="left" activeFinger={activeFinger} />
          {activeFinger && ['lp', 'lr', 'lm', 'li'].includes(activeFinger) && (
            <span className="text-xs font-semibold text-[var(--color-key-target)]">
              {fingerLabel(activeFinger)}
            </span>
          )}
        </div>

        <div className="mb-6 hidden h-16 w-px bg-[var(--color-border)] sm:block" aria-hidden="true" />

        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
            {t.typing.rightHand}
          </span>
          <HandSilhouette side="right" activeFinger={activeFinger} />
          {activeFinger && ['ri', 'rm', 'rr', 'rp'].includes(activeFinger) && (
            <span className="text-xs font-semibold text-[var(--color-key-target)]">
              {fingerLabel(activeFinger)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
