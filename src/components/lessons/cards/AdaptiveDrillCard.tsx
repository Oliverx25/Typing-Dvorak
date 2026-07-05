import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { getWeakestKeys, hasKeyStats, getKeyStats } from '@/utils/stats/keyStats';
import { SESSION_COMPLETE_EVENT, KEY_STATS_UPDATED_EVENT } from '@/utils/app/events';

export default function AdaptiveDrillCard() {
  const { t } = useApp();
  const [weakKeys, setWeakKeys] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);

  const refresh = () => {
    const stats = getKeyStats();
    if (!hasKeyStats(stats)) {
      setVisible(false);
      return;
    }
    const weak = getWeakestKeys(5, stats);
    setWeakKeys(weak.map((w) => w.label));
    setVisible(weak.length > 0);
  };

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener(SESSION_COMPLETE_EVENT, handler);
    window.addEventListener(KEY_STATS_UPDATED_EVENT, handler);
    return () => {
      window.removeEventListener(SESSION_COMPLETE_EVENT, handler);
      window.removeEventListener(KEY_STATS_UPDATED_EVENT, handler);
    };
  }, []);

  if (!visible) return null;

  return (
    <a
      href="/lesson/adaptive-drill"
      className="mb-8 block rounded-xl border border-[var(--color-key-target)]/40 bg-gradient-to-br from-[var(--color-key-target)]/8 to-[var(--color-highlight)]/5 p-5 no-underline transition hover:shadow-md hover:ring-2 hover:ring-[var(--color-key-target)]/20"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-key-target)]/15 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-key-target)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            {t.home.adaptiveLabel}
          </span>
          <h3 className="mt-2 text-lg font-semibold text-[var(--color-text)]">{t.home.adaptiveTitle}</h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t.home.adaptiveDesc}</p>
        </div>
        <div className="flex gap-1.5">
          {weakKeys.map((key) => (
            <kbd
              key={key}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-surface)] font-mono text-sm font-bold text-[var(--color-incorrect)]"
            >
              {key}
            </kbd>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-[var(--color-highlight)]">{t.home.startLesson} →</p>
    </a>
  );
}
