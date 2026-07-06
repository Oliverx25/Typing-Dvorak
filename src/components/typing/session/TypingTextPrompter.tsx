import { memo, useCallback, useMemo, useRef } from 'react';
import type { CharStatus } from '@/hooks/useTypingSession';
import { useVirtualizedTeleprompter } from '@/hooks/useVirtualizedTeleprompter';
import {
  TELEPROMPTER_TEXT_CLASS,
  TELEPROMPTER_VIEWPORT_CLASS,
} from '@/hooks/useTeleprompterScroll';
import type { CaretAnimation, CaretStyle } from '@/utils/app/settings';
import TypedChar from '@/components/typing/session/TypedChar';
import TypingCaret from '@/components/typing/session/TypingCaret';
import {
  InlinePacingCursorMarker,
  PacingCursorEdgeHint,
} from '@/components/typing/session/PacingCursorOverlay';

interface TypingTextPrompterProps {
  targetText: string;
  inputLength: number;
  statuses: CharStatus[];
  finished: boolean;
  paused: boolean;
  pacerIndex: number | null;
  ghostIndex: number | null;
  caretStyle?: CaretStyle;
  caretAnimation?: CaretAnimation;
}

export default memo(TypingTextPrompter);

function TypingTextPrompter({
  targetText,
  inputLength,
  statuses,
  finished,
  paused,
  pacerIndex,
  ghostIndex,
  caretStyle = 'line',
  caretAnimation = 'blink',
}: TypingTextPrompterProps) {
  const useSmoothCaret = caretAnimation === 'smooth';
  const hideInlineCaret = useSmoothCaret;
  const caretAnchorRef = useRef<HTMLElement | null>(null);

  const {
    viewportRef,
    innerRef,
    assignActiveRef,
    offsetY,
    lineHeight,
    visibleBounds,
    hiddenLinesAbove,
    hiddenLinesBelow,
    getCursorVisibility,
  } = useVirtualizedTeleprompter({
    targetText,
    activeIndex: inputLength,
  });

  const setActiveSpanRef = useCallback(
    (el: HTMLSpanElement | null) => {
      assignActiveRef(el);
      caretAnchorRef.current = el;
    },
    [assignActiveRef],
  );

  const pacerVisibility = getCursorVisibility(pacerIndex);
  const ghostVisibility = getCursorVisibility(ghostIndex);
  const topSpacerHeight = hiddenLinesAbove * lineHeight;
  const bottomSpacerHeight = hiddenLinesBelow * lineHeight;

  const visibleChars = useMemo(() => {
    const chars: Array<{ index: number; char: string }> = [];
    for (let i = visibleBounds.from; i < visibleBounds.to; i += 1) {
      chars.push({ index: i, char: targetText[i] ?? '' });
    }
    return chars;
  }, [targetText, visibleBounds.from, visibleBounds.to]);

  return (
    <div
      ref={viewportRef}
      className={['relative overflow-hidden', TELEPROMPTER_VIEWPORT_CLASS].join(' ')}
    >
      <PacingCursorEdgeHint
        variant="pacer"
        charIndex={pacerIndex}
        visibility={pacerVisibility}
      />
      <PacingCursorEdgeHint
        variant="ghost"
        charIndex={ghostIndex}
        visibility={ghostVisibility}
      />

      <div
        ref={innerRef}
        className="relative transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{ transform: `translateY(-${offsetY}px)` }}
      >
        <TypingCaret
          anchorRef={caretAnchorRef}
          caretStyle={caretStyle}
          caretAnimation={caretAnimation}
          visible={!finished && !paused}
          positionKey={inputLength}
        />
        {topSpacerHeight > 0 ? (
          <div aria-hidden="true" style={{ height: topSpacerHeight }} />
        ) : null}

        <p className={TELEPROMPTER_TEXT_CLASS} aria-live="off">
          {visibleChars.map(({ index, char }) => {
            const isCurrent = index === inputLength;
            return (
              <span
                key={index}
                ref={isCurrent ? setActiveSpanRef : undefined}
                className="relative"
              >
                <InlinePacingCursorMarker
                  variant="pacer"
                  charIndex={pacerIndex}
                  playerIndex={inputLength}
                  index={index}
                  visibility={pacerVisibility}
                />
                <InlinePacingCursorMarker
                  variant="ghost"
                  charIndex={ghostIndex}
                  playerIndex={inputLength}
                  index={index}
                  visibility={ghostVisibility}
                />
                <TypedChar
                  char={char}
                  status={statuses[index]}
                  isCurrent={isCurrent}
                  active={!finished && !paused}
                  hideInlineCaret={hideInlineCaret}
                />
              </span>
            );
          })}
          {!finished && !paused && inputLength === targetText.length && (
            <span ref={setActiveSpanRef} className="inline-block w-0" aria-hidden="true" />
          )}
          {!finished && !paused && inputLength === targetText.length && !hideInlineCaret && (
            <span className="caret-blink ml-px inline-block h-[1.1em] w-0.5 translate-y-0.5 bg-[var(--color-key-target)] align-middle motion-reduce:animate-none" />
          )}
        </p>

        {bottomSpacerHeight > 0 ? (
          <div aria-hidden="true" style={{ height: bottomSpacerHeight }} />
        ) : null}
      </div>
    </div>
  );
}
