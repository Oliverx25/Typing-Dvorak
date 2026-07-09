import type { ReactNode } from 'react';

interface HoverTooltipProps {
  title: string;
  description?: string;
  /** Fixed width class, defaults to w-48. */
  widthClass?: string;
  children?: ReactNode;
}

/** Custom hover tooltip with intentional reveal delay — replaces native title attributes. */
export default function HoverTooltip({
  title,
  description,
  widthClass = 'w-48',
  children,
}: HoverTooltipProps) {
  return (
    <div
      className={[
        'pointer-events-none absolute bottom-full left-1/2 z-50 mb-2',
        widthClass,
        '-translate-x-1/2 origin-bottom rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg',
        'dark:border-slate-700 dark:bg-slate-900',
        'scale-95 opacity-0 transition-all duration-200',
        'group-hover:scale-100 group-hover:opacity-100 group-hover:delay-150',
      ].join(' ')}
    >
      <p className="whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-200">{title}</p>
      {description ? (
        <p className="mt-1 text-center text-xs leading-tight text-slate-500 dark:text-slate-400">{description}</p>
      ) : null}
      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-200 dark:border-t-slate-700" />
      <div className="absolute left-1/2 top-full -mt-px -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-slate-900" />
      {children}
    </div>
  );
}
