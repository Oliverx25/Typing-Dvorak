import { useEffect, useState } from 'react';

interface BadgeIconProps {
  src: string;
  size?: number;
  className?: string;
  /** When true, icon color comes from Tailwind text-* classes on className. */
  inheritColor?: boolean;
}

const cache = new Map<string, string>();

/**
 * Loads a badge SVG inline so its `currentColor` strokes/fills inherit the
 * app accent color and adapt to light/dark themes. Falls back to <img> on SSR.
 */
export default function BadgeIcon({ src, size = 18, className = '', inheritColor = false }: BadgeIconProps) {
  const [markup, setMarkup] = useState<string | null>(() => cache.get(src) ?? null);

  useEffect(() => {
    if (markup) return;
    let cancelled = false;
    fetch(src)
      .then((res) => res.text())
      .then((text) => {
        if (cancelled) return;
        cache.set(src, text);
        setMarkup(text);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [src, markup]);

  const style = inheritColor
    ? { width: size, height: size }
    : { width: size, height: size, color: 'var(--color-highlight)' };

  if (markup) {
    return (
      <span
        role="img"
        aria-hidden="true"
        className={['inline-flex', className].join(' ')}
        style={style}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    );
  }

  return <span aria-hidden="true" className={['inline-block', className].join(' ')} style={style} />;
}
