import { describe, expect, it } from 'vitest';
import {
  buildChartPoints,
  formatSessionLabel,
  formatModifierLabels,
  MULTIPLAYER_LESSON_ID,
  parseStoredRaceModifiers,
} from './sessionDisplay';
import type { SessionRecord } from '../progress/storage';
import type { TranslationKey } from '../../i18n';

const t = {
  stats: {
    multiplayerSession: 'Multijugador',
    multiplayerSourceSong: 'Canción',
  },
  multiplayer: {
    customTextMode: 'Texto personalizado',
    systemLesson: 'Lección',
    modifierVampire: 'Vampiro',
    modifierBlindMode: 'Modo ciego',
    modifierHidden: 'Oculto',
  },
} as unknown as TranslationKey;

const getLessonTitle = (_t: TranslationKey, key: string) => key;

describe('sessionDisplay', () => {
  it('shows song title for song races', () => {
    const record: SessionRecord = {
      lessonId: MULTIPLAYER_LESSON_ID,
      lessonTitle: MULTIPLAYER_LESSON_ID,
      wpm: 40,
      accuracy: 95,
      elapsedSeconds: 60,
      mode: 'practice',
      completedAt: new Date().toISOString(),
      multiplayerSource: 'song',
      songTitle: 'Bohemian Rhapsody',
    };

    expect(formatSessionLabel(record, t, getLessonTitle)).toBe('Bohemian Rhapsody');
  });

  it('falls back to generic song label without title', () => {
    const record: SessionRecord = {
      lessonId: MULTIPLAYER_LESSON_ID,
      lessonTitle: MULTIPLAYER_LESSON_ID,
      wpm: 40,
      accuracy: 95,
      elapsedSeconds: 60,
      mode: 'practice',
      completedAt: new Date().toISOString(),
      multiplayerSource: 'song',
    };

    expect(formatSessionLabel(record, t, getLessonTitle)).toBe('Canción');
  });

  it('includes modifier labels in chart points', () => {
    const record: SessionRecord = {
      lessonId: MULTIPLAYER_LESSON_ID,
      lessonTitle: MULTIPLAYER_LESSON_ID,
      wpm: 28,
      accuracy: 90,
      elapsedSeconds: 45,
      mode: 'practice',
      completedAt: '2026-07-05T15:30:00.000Z',
      multiplayerSource: 'song',
      songTitle: 'Test Song',
      raceModifiers: ['vampire', 'blind_mode'],
    };

    const [point] = buildChartPoints([record], t, getLessonTitle);
    expect(point.lessonTitle).toBe('Test Song');
    expect(point.modifierLabels).toEqual(['Vampiro', 'Modo ciego']);
  });

  it('parses stored race modifiers', () => {
    expect(parseStoredRaceModifiers(['vampire', 'invalid'])).toEqual(['vampire']);
    expect(parseStoredRaceModifiers([])).toBeUndefined();
  });

  it('formats modifier labels', () => {
    expect(formatModifierLabels(['hidden'], t)).toEqual(['Oculto']);
  });
});
