import { useApp } from '@/contexts/AppProvider';
import { COMPARISON_LETTERS, DVORAK_POSITIONS, isSamePosition } from '@/utils/keyboard/qwerty';
import { Card } from '@/components/ui';

export default function QwertyComparison() {
  const { t } = useApp();

  return (
    <Card
      as="section"
      title={t.home.qwertyTitle}
      description={t.home.qwertyDesc}
      padding="lg"
      bleed
      bodyClassName="overflow-x-auto"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y border-[var(--color-border)] bg-[var(--color-surface)]">
            <th className="px-6 py-3 text-left font-medium text-[var(--color-text-muted)]">{t.qwerty.letter}</th>
            <th className="px-6 py-3 text-center font-medium text-[var(--color-text-muted)]">{t.qwerty.qwerty}</th>
            <th className="px-6 py-3 text-center font-medium text-[var(--color-highlight)]">{t.qwerty.dvorak}</th>
            <th className="px-6 py-3 text-right font-medium text-[var(--color-text-muted)]" />
          </tr>
        </thead>
        <tbody>
          {COMPARISON_LETTERS.map((letter) => {
            const same = isSamePosition(letter);
            const dvorakKey = DVORAK_POSITIONS[letter];
            return (
              <tr key={letter} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-6 py-2 font-mono font-medium uppercase text-[var(--color-text)]">{letter}</td>
                <td className="px-6 py-2 text-center font-mono text-[var(--color-text-muted)]">{letter}</td>
                <td className="px-6 py-2 text-center font-mono font-semibold text-[var(--color-highlight)]">
                  {dvorakKey}
                </td>
                <td className="px-6 py-2 text-right">
                  <span
                    className={[
                      'rounded-full px-2 py-0.5 text-xs',
                      same
                        ? 'bg-[var(--color-border)] text-[var(--color-text-muted)]'
                        : 'bg-[var(--color-key-target)]/15 text-[var(--color-key-target)]',
                    ].join(' ')}
                  >
                    {same ? t.qwerty.same : t.qwerty.moved}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
