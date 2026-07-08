import { memo } from 'react';
import { LuEye } from 'react-icons/lu';
import { useApp } from '@/contexts/AppProvider';
import { GradeBadge } from '@/components/ui';
import {
  formatHistoryDate,
  formatHistorySessionLabel,
  formatHistorySessionType,
  type HistorySession,
} from '@/utils/history/historySessions';

interface HistorySessionCardProps {
  session: HistorySession;
  onViewDetails: (session: HistorySession) => void;
}

function HistorySessionCard({ session, onViewDetails }: HistorySessionCardProps) {
  const { t, settings } = useApp();
  const locale = settings.locale;
  const title = formatHistorySessionLabel(session, locale);
  const typeLabel = formatHistorySessionType(session, locale);
  const dateLabel = formatHistoryDate(session.completedAt, locale);

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition hover:bg-slate-900 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{dateLabel}</p>
        <p className="mt-1 text-xs text-slate-400">{typeLabel}</p>
        <h3 className="mt-1 truncate text-base font-semibold text-slate-100" title={title}>
          {title}
        </h3>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:justify-center">
        <GradeBadge grade={session.grade} className="h-8 w-8 text-sm" />
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {t.typing.wpm}
          </p>
          <p className="font-mono text-lg font-bold text-slate-100">{session.wpm}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {t.typing.accuracy}
          </p>
          <p className="font-mono text-lg font-bold text-emerald-400">{session.accuracy}%</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onViewDetails(session)}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
      >
        <LuEye size={16} aria-hidden />
        {t.history.viewDetails}
      </button>
    </article>
  );
}

export default memo(HistorySessionCard);
