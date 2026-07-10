import type { LyricSongResult } from '@/utils/lyrics/types';
import { sanitizeLyrics } from '@/utils/lyrics/sanitizeLyrics';
import { formatPracticeText } from '@/utils/practice/textGenerator';
import type { SandboxConfig } from '@/utils/practice/sandboxConfig';

/** Display title for practice lyrics sessions (history / analytics). */
export function formatPracticeSongTitle(song: Pick<LyricSongResult, 'artist' | 'title'>): string {
  return `${song.artist} - ${song.title}`;
}

/** Sanitizes raw API lyrics and applies practice modifier toggles. */
export function formatPracticeLyrics(
  rawLyrics: string,
  config: Pick<SandboxConfig, 'includeCaps' | 'includeNumbers' | 'includePunctuation'>,
): string {
  const sanitized = sanitizeLyrics(rawLyrics);
  return formatPracticeText(sanitized, config, 'lyrics');
}
