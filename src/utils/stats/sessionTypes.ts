/** Origin of text used in a multiplayer race (song support reserved for later). */
export type RaceTextSource = 'lesson' | 'custom' | 'song';

export interface SessionPersistOptions {
  lessonId?: string;
  lessonTitle?: string;
  multiplayerSource?: RaceTextSource;
}
