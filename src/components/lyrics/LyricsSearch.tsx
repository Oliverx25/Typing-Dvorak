import LyricsSearchPanel, { type LyricsSearchPanelProps } from '@/components/lyrics/LyricsSearchPanel';

/** Inline lyrics search — shared with multiplayer via LyricsSearchPanel. */
export default function LyricsSearch(props: Omit<LyricsSearchPanelProps, 'variant'>) {
  return <LyricsSearchPanel {...props} variant="inline" autoFocus />;
}
