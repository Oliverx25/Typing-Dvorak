import type { CharStatus } from '@/hooks/useTypingSession';
import { useVirtualizedTeleprompter } from '@/hooks/useVirtualizedTeleprompter';
import {
  TELEPROMPTER_TEXT_CLASS,
  TELEPROMPTER_VIEWPORT_CLASS,
} from '@/hooks/useTeleprompterScroll';
import TypedChar from './TypedChar';
import {
  InlinePacingCursorMarker,
  PacingCursorEdgeHint,
} from './PacingCursorOverlay';

interface TypingTextPrompterProps {
  targetText: string;
  inputLength: number;
  statuses: CharStatus[];
  finished: boolean;
  paused: boolean;
  pacerIndex: number | null;
  ghostIndex: number | null;
}

export default function TypingTextPrompter({
  targetText,
  inputLength,
  statuses,
  finished,
  paused,
  pacerIndex,
  ghostIndex,
}: TypingTextPrompterProps) {
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

  const pacerVisibility = getCursorVisibility(pacerIndex);
  const ghostVisibility = getCursorVisibility(ghostIndex);
  const topSpacerHeight = hiddenLinesAbove * lineHeight;
  const bottomSpacerHeight = hiddenLinesBelow * lineHeight;

  const visibleChars: Array<{ index: number; char: string }> = [];
  for (let i = visibleBounds.from; i < visibleBounds.to; i += 1) {
    visibleChars.push({ index: i, char: targetText[i] ?? '' });
  }

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
        {topSpacerHeight > 0 ? (
          <div aria-hidden="true" style={{ height: topSpacerHeight }} />
        ) : null}

        <p className={TELEPROMPTER_TEXT_CLASS} aria-live="off">
          {visibleChars.map(({ index, char }) => {
            const isCurrent = index === inputLength;
            return (
              <span
                key={index}
                ref={isCurrent ? assignActiveRef : undefined}
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
                />
              </span>
            );
          })}
          {!finished && !paused && inputLength === targetText.length && (
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
