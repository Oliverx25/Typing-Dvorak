import { useState, type ReactNode } from 'react';
import Icon from './Icon';

export interface AccordionItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export default function Accordion({ items, className = '' }: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(items.filter((i) => i.defaultOpen).map((i) => i.id)),
  );

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={['space-y-2', className].join(' ')}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[var(--color-surface)]/50"
            >
              <Icon
                name={isOpen ? 'chevron-down' : 'chevron-right'}
                size={18}
                className="shrink-0 text-[var(--color-text-muted)]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[var(--color-text)]">{item.title}</span>
                  {item.badge}
                </div>
                {item.subtitle && (
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{item.subtitle}</p>
                )}
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-[var(--color-border)] px-4 py-3">{item.children}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
