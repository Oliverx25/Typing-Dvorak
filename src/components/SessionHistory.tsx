import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppProvider';
import type { SessionRecord } from '../utils/storage';
import { getSessionHistory } from '../utils/storage';

export default function SessionHistory() {
  const { t } = useApp();
  const [history, setHistory] = useState<SessionRecord[]>([]);

  useEffect(() => {
    setHistory(getSessionHistory().slice(0, 10));
  }, []);

  if (history.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">{t.home.recentSessions}</h2>
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">{t.stats.lesson}</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-text-muted)]">{t.stats.wpm}</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-text-muted)]">{t.stats.accuracy}</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-text-muted)]">{t.stats.date}</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record, i) => (
              <tr key={i} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-3 text-[var(--color-text)]">{record.lessonTitle}</td>
                <td className="px-4 py-3 text-right font-mono text-[var(--color-text)]">{record.wpm}</td>
                <td className="px-4 py-3 text-right font-mono text-[var(--color-text)]">{record.accuracy}%</td>
                <td className="px-4 py-3 text-right text-[var(--color-text-muted)]">
                  {new Date(record.completedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
