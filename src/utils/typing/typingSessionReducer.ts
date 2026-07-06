import type { CharStatus } from '@/hooks/useTypingSession';

export type CharStatus = 'pending' | 'correct' | 'incorrect';

export interface TypingCoreState {
  input: string;
  statuses: CharStatus[];
  combo: number;
  maxCombo: number;
  errorKeystrokes: number;
  comboBroke: boolean;
}

export type TypingCoreAction =
  | { type: 'RESET'; text: string }
  | { type: 'BACKSPACE'; index: number }
  | { type: 'ZEN_CHAR'; char: string }
  | {
      type: 'KEY_HIT';
      char: string;
      status: CharStatus;
      combo: number;
      maxCombo: number;
      errorKeystrokes: number;
      comboBroke: boolean;
    }
  | {
      type: 'STOP_ON_ERROR';
      index: number;
      errorKeystrokes: number;
      comboBroke: boolean;
    }
  | { type: 'EXTEND_TEXT'; extension: string }
  | { type: 'CLEAR_COMBO_BROKE' };

export function createInitialTypingCore(text: string): TypingCoreState {
  return {
    input: '',
    statuses: text.split('').map(() => 'pending' as CharStatus),
    combo: 0,
    maxCombo: 0,
    errorKeystrokes: 0,
    comboBroke: false,
  };
}

export function typingCoreReducer(state: TypingCoreState, action: TypingCoreAction): TypingCoreState {
  switch (action.type) {
    case 'RESET':
      return createInitialTypingCore(action.text);
    case 'BACKSPACE': {
      if (state.input.length === 0) return state;
      const next = [...state.statuses];
      next[state.input.length - 1] = 'pending';
      return { ...state, input: state.input.slice(0, -1), statuses: next };
    }
    case 'ZEN_CHAR':
      return {
        ...state,
        input: state.input + action.char,
        statuses: [...state.statuses, 'correct'],
        combo: state.combo + 1,
        maxCombo: Math.max(state.maxCombo, state.combo + 1),
        comboBroke: false,
      };
    case 'KEY_HIT':
      return {
        input: state.input + action.char,
        statuses: (() => {
          const next = [...state.statuses];
          next[state.input.length] = action.status;
          return next;
        })(),
        combo: action.combo,
        maxCombo: action.maxCombo,
        errorKeystrokes: action.errorKeystrokes,
        comboBroke: action.comboBroke,
      };
    case 'STOP_ON_ERROR': {
      const next = [...state.statuses];
      next[action.index] = 'incorrect';
      return {
        ...state,
        statuses: next,
        errorKeystrokes: action.errorKeystrokes,
        combo: 0,
        comboBroke: action.comboBroke,
      };
    }
    case 'EXTEND_TEXT':
      return {
        ...state,
        statuses: [
          ...state.statuses,
          ...action.extension.split('').map(() => 'pending' as CharStatus),
        ],
      };
    case 'CLEAR_COMBO_BROKE':
      return { ...state, comboBroke: false };
    default:
      return state;
  }
}
