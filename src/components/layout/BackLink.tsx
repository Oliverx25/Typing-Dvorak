import { useApp } from '@/contexts/AppProvider';
import { Icon } from '@/components/ui';

interface BackLinkProps {
  href?: string;
  label?: string;
}

export default function BackLink({ href = '/', label }: BackLinkProps) {
  const { t } = useApp();
  const text = label ?? t.nav.backToLessons;

  return (
    <nav className="mb-8">
      <a
        href={href}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] no-underline transition hover:text-[var(--color-accent)]"
      >
        <Icon name="chevron-right" size={16} className="rotate-180" />
        {text}
      </a>
    </nav>
  );
}
