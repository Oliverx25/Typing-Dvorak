import { memo } from 'react';
import UserAvatar from '@/components/auth/profile/UserAvatar';
import type { AvatarSource } from '@/utils/user/userDisplay';

interface RaceResultCardHeaderProps {
  rank: number;
  winnerLabel: string;
  isWinner: boolean;
  playerName: string;
  isSelf: boolean;
  youLabel: string;
  trackTitle?: string | null;
  trackArtist?: string | null;
  fallbackTitle: string;
  avatarUrl: string | null;
  initials: string;
  avatarSource: AvatarSource;
}

function RaceResultCardHeader({
  rank,
  winnerLabel,
  isWinner,
  playerName,
  isSelf,
  youLabel,
  trackTitle,
  trackArtist,
  fallbackTitle,
  avatarUrl,
  initials,
  avatarSource,
}: RaceResultCardHeaderProps) {
  const displayTitle = trackTitle?.trim() || fallbackTitle;
  const displayArtist = trackArtist?.trim() || null;

  return (
    <header className="relative px-5 pt-10 text-center">
      <div className="absolute -top-6 left-1/2 z-20 -translate-x-1/2 rounded-full border-2 border-slate-800 shadow-lg shadow-black/40">
        <UserAvatar
          avatarUrl={avatarUrl}
          initials={initials}
          avatarSource={avatarSource}
          size={48}
        />
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-300/90">
        {isWinner ? winnerLabel : `#${rank}`}
      </p>

      <p className="mt-2 truncate text-xs text-white/50">
        {playerName}
        {isSelf ? (
          <span className="ml-1 text-white/40">({youLabel})</span>
        ) : null}
      </p>

      <h2 className="mt-3 truncate text-lg font-bold tracking-tight text-white">
        {displayTitle}
      </h2>
      {displayArtist ? (
        <p className="mt-0.5 truncate text-sm text-slate-400">{displayArtist}</p>
      ) : null}
    </header>
  );
}

export default memo(RaceResultCardHeader);
