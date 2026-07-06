import { describe, expect, it } from 'vitest';
import {
  createInitialTypingCore,
  typingCoreReducer,
} from './typingSessionReducer';

describe('typingCoreReducer', () => {
  it('resets to pending statuses for new text', () => {
    const state = createInitialTypingCore('ab');
    const next = typingCoreReducer(
      { ...state, input: 'a', statuses: ['correct', 'pending'], combo: 2, maxCombo: 2 },
      { type: 'RESET', text: 'xy' },
    );
    expect(next.input).toBe('');
    expect(next.statuses).toEqual(['pending', 'pending']);
    expect(next.combo).toBe(0);
  });

  it('batches key hit state in one transition', () => {
    const state = createInitialTypingCore('hi');
    const next = typingCoreReducer(state, {
      type: 'KEY_HIT',
      char: 'h',
      status: 'correct',
      combo: 1,
      maxCombo: 1,
      errorKeystrokes: 0,
      comboBroke: false,
    });
    expect(next.input).toBe('h');
    expect(next.statuses[0]).toBe('correct');
    expect(next.combo).toBe(1);
  });
});
