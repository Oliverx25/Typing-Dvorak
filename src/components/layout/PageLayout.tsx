import { useApp } from '@/contexts/AppProvider';
import HeaderActions from './HeaderActions';

export default function PageLayout({ children }: { children: React.ReactNode }) {
  const { t } = useApp();

  return (
    <>
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <a href="/lessons" className="flex items-center gap-2 font-semibold text-[var(--color-text)] no-underline hover:text-[var(--color-accent)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-accent)]">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10" />
            </svg>
            {t.siteName}
          </a>
          <HeaderActions />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </>
  );
}
