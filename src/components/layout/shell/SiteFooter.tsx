import { useApp } from '@/contexts/AppProvider';

export default function SiteFooter() {
  const { t } = useApp();

  return (
    <footer data-zen-fade className="mt-auto shrink-0 border-t border-[var(--color-border)] py-6 text-center text-sm text-[var(--color-text-muted)]">
      <p>{t.footer}</p>
    </footer>
  );
}
