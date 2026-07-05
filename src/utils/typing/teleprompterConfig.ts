/** Visible lines in the teleprompter viewport. */
export const TELEPROMPTER_VISIBLE_LINES = 3;

/** Active line is pinned to this visual row (1 = top). Row 2 keeps one line of context above. */
export const TELEPROMPTER_ACTIVE_LINE_ROW = 2;

export const TELEPROMPTER_TEXT_CLASS =
  'font-mono text-xl leading-[2] tracking-wide break-words sm:text-2xl sm:leading-[2.2]';

/** 3 lines: text-xl * leading-2 = 2.5rem/line; sm:text-2xl * leading-2.2 = 3.3rem/line */
export const TELEPROMPTER_VIEWPORT_CLASS = 'h-[7.5rem] sm:h-[9.9rem]';
