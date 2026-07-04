import { useEffect, useState } from 'react';

interface SvgIconProps {
  src: string;
  size?: number;
  className?: string;
}

const cache = new Map<string, string>();

/** Inline SVG so `currentColor` strokes/fills inherit from parent text color. */
export default function SvgIcon({ src, size = 20, className = '' }: SvgIconProps) {
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

  const style = { width: size, height: size };

  if (markup) {
    return (
      <span
        role="img"
        aria-hidden="true"
        className={['inline-flex shrink-0', className].join(' ')}
        style={style}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={['inline-block shrink-0', className].join(' ')}
      style={style}
    />
  );
}
