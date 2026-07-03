import { useApp } from '../contexts/AppProvider';

export default function SiteFooter() {
  const { t } = useApp();

  return (
    <footer className="border-t border-[var(--color-border)] py-6 text-center text-sm text-[var(--color-text-muted)]">
      <p>{t.footer}</p>
    </footer>
  );
}
