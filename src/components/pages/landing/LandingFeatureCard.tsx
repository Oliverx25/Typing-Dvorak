import type { ReactNode } from 'react';
import type { HighlightThemeId } from '@/utils/app/highlightTheme';
import { HIGHLIGHT_THEMES } from '@/utils/app/highlightTheme';

interface LandingFeatureCardProps {
  title: string;
  description: string;
  accent: HighlightThemeId;
  icon: ReactNode;
}

export default function LandingFeatureCard({
  title,
  description,
  accent,
  icon,
}: LandingFeatureCardProps) {
  const swatch = HIGHLIGHT_THEMES[accent].swatch;

  return (
    <article
      className="rounded-2xl border bg-[var(--color-surface-elevated)] p-6 transition-all duration-300"
      style={{
        borderColor: `${swatch}40`,
        boxShadow: `inset 0 0 0 1px ${swatch}18`,
      }}
    >
      <div
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
        style={{
          backgroundColor: `${swatch}26`,
          color: swatch,
        }}
      >
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">{description}</p>
    </article>
  );
}
