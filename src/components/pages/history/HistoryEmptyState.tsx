import { LuKeyboard } from 'react-icons/lu';
import { useApp } from '@/contexts/AppProvider';

export default function HistoryEmptyState() {
  const { t } = useApp();

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-8 py-16 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/60 text-slate-300">
        <LuKeyboard size={28} aria-hidden />
      </div>
      <h2 className="text-xl font-semibold text-slate-100">{t.history.emptyTitle}</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-400">{t.history.emptyDesc}</p>
      <a
        href="/lessons"
        className="mt-8 inline-flex items-center justify-center rounded-xl bg-[var(--color-highlight)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-highlight)]/20 transition hover:bg-[var(--color-highlight-hover)]"
      >
        {t.history.emptyCta}
      </a>
    </div>
  );
}
