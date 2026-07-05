import type { CharStatus } from '@/hooks/useTypingSession';
import TypedChar from './TypedChar';
import {
  TELEPROMPTER_TEXT_CLASS,
  TELEPROMPTER_VIEWPORT_CLASS,
  useTeleprompterScroll,
} from '@/hooks/useTeleprompterScroll';

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
  const { viewportRef, innerRef, assignActiveRef, offsetY } = useTeleprompterScroll({
    activeIndex: inputLength,
    textLength: targetText.length,
  });

  return (
    <div
      ref={viewportRef}
      className={['relative overflow-hidden', TELEPROMPTER_VIEWPORT_CLASS].join(' ')}
    >
      <div
        ref={innerRef}
        className="relative transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{ transform: `translateY(-${offsetY}px)` }}
      >
        <p className={TELEPROMPTER_TEXT_CLASS} aria-live="off">
          {targetText.split('').map((char, i) => {
            const isCurrent = i === inputLength;
            return (
              <span
                key={i}
                ref={isCurrent ? assignActiveRef : undefined}
                className="relative"
              >
                {pacerIndex === i && i !== inputLength && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-0.5 left-0 top-0 w-0.5 border-b-2 border-amber-500 bg-amber-500/30"
                  />
                )}
                {ghostIndex === i && i !== inputLength && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-0.5 left-0 top-0 w-0.5 bg-gray-400/20 outline-1 outline-gray-500"
                  />
                )}
                <TypedChar
                  char={char}
                  status={statuses[i]}
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
      </div>
    </div>
  );
}
