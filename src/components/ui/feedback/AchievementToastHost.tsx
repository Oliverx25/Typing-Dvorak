import { useCallback, useEffect, useRef, useState } from 'react';
import { LuAward, LuX } from 'react-icons/lu';
import { useApp } from '@/contexts/AppProvider';
import {
  ACHIEVEMENTS_UNLOCKED_EVENT,
  type AchievementUnlockDetail,
} from '@/utils/app/events';
import { getCategoryIcon, TIER_VISUALS } from '@/utils/achievements/achievementIcons';
import type { AchievementToastItem } from '@/utils/achievements/achievementNotifications';

interface ActiveToast extends AchievementToastItem {
  id: string;
}

const TOAST_LIFETIME_MS = 5500;
const STAGGER_MS = 180;

function tierLabel(
  tier: AchievementToastItem['tier'],
  t: ReturnType<typeof useApp>['t'],
): string {
  switch (tier) {
    case 'bronce':
      return t.achievements.tierBronze;
    case 'plata':
      return t.achievements.tierSilver;
    case 'oro':
      return t.achievements.tierGold;
    case 'diamante':
      return t.achievements.tierDiamond;
    case 'especial':
      return t.achievements.tierSpecial;
    default:
      return tier;
  }
}

export default function AchievementToastHost() {
  const { t } = useApp();
  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer != null) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const enqueueToasts = useCallback(
    (items: AchievementUnlockDetail[]) => {
      if (items.length === 0) return;

      const incoming: ActiveToast[] = items.map((item, index) => ({
        ...item,
        id: `${item.slug}-${Date.now()}-${index}`,
      }));

      incoming.forEach((toast, index) => {
        window.setTimeout(() => {
          setToasts((prev) => [...prev, toast]);
          const timer = window.setTimeout(() => dismissToast(toast.id), TOAST_LIFETIME_MS);
          timersRef.current.set(toast.id, timer);
        }, index * STAGGER_MS);
      });
    },
    [dismissToast],
  );

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<AchievementUnlockDetail[]>).detail ?? [];
      enqueueToasts(detail);
    };

    window.addEventListener(ACHIEVEMENTS_UNLOCKED_EVENT, handler);
    const timers = timersRef.current;
    return () => {
      window.removeEventListener(ACHIEVEMENTS_UNLOCKED_EVENT, handler);
      for (const timer of timers.values()) {
        window.clearTimeout(timer);
      }
      timers.clear();
    };
  }, [enqueueToasts]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(100vw-2rem,22rem)] flex-col gap-2"
      aria-live="polite"
      aria-label={t.achievements.toastRegionLabel}
    >
      {toasts.map((toast) => {
        const CategoryIcon = getCategoryIcon(toast.category);
        const tierStyle = TIER_VISUALS[toast.tier];

        return (
          <div
            key={toast.id}
            className={[
              'pointer-events-auto flex items-start gap-3 rounded-xl border bg-[var(--color-surface-elevated)] p-3 shadow-lg shadow-black/25',
              'animate-[slide-in-right_0.35s_ease-out]',
              tierStyle.borderUnlocked,
            ].join(' ')}
            role="status"
          >
            <div
              className={[
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-[var(--color-surface)]',
                tierStyle.border,
              ].join(' ')}
            >
              <CategoryIcon className={`h-5 w-5 ${tierStyle.icon}`} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                <LuAward className="h-3.5 w-3.5 text-[var(--color-highlight)]" aria-hidden="true" />
                {t.achievements.toastUnlocked}
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-[var(--color-text)]">
                {toast.title}
              </p>
              <p className={`mt-0.5 text-xs font-medium ${tierStyle.icon}`}>
                {tierLabel(toast.tier, t)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 rounded-md p-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
              aria-label={t.achievements.toastDismiss}
            >
              <LuX className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
