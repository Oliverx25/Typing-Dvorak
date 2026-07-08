import { useMemo } from 'react';
import { calculateGrade } from '@/utils/grading';
import { focusRingCardClassName } from '@/utils/a11y/focusRing';
import { resolveRaceKeystrokeDistribution } from '@/utils/multiplayer/raceScoring';
import { MULTIPLAYER_LESSON_ID } from '@/utils/stats/sessionDisplay';
import { getSessionHistory } from '@/utils/progress/storage';
import GlassCardBackground from '@/components/multiplayer/race/results/GlassCardBackground';
import GradeDonut from '@/components/multiplayer/race/results/GradeDonut';
import RaceResultCardHeader from '@/components/multiplayer/race/results/RaceResultCardHeader';
import RaceResultScoreSection from '@/components/multiplayer/race/results/RaceResultScoreSection';
import RaceResultStatsGrid from '@/components/multiplayer/race/results/RaceResultStatsGrid';
import RaceResultCardCompact from '@/components/multiplayer/race/results/RaceResultCardCompact';
import type { RaceParticipantProgress } from '@/types/multiplayer';
import type { RaceModifier } from '@/utils/multiplayer/roomConfig';
import type { TypingDifficulty } from '@/utils/lyrics/types';

export interface RaceResultCardLabels {
  title: string;
  youLabel: string;
  winnerLabel: string;
  wpmLabel: string;
  accuracyLabel: string;
  comboLabel: string;
  scoreLabel: string;
  maxComboLabel: string;
  finishedLabel: string;
  correctLabel: string;
  correctedLabel: string;
  errorsLabel: string;
  rankLabel: string;
}

interface RaceResultCardProps {
  entry: RaceParticipantProgress;
  rank: number;
  isActive: boolean;
  isSelf: boolean;
  labels: RaceResultCardLabels;
  totalMultiplier: number;
  raceCharCount: number;
  modifiers: RaceModifier[];
  trackTitle?: string | null;
  trackArtist?: string | null;
  trackCoverUrl?: string | null;
  songDifficulty?: TypingDifficulty | null;
  raceStartedAt?: number | null;
  onActivate: () => void;
}

export default function RaceResultCard({
  entry,
  rank,
  isActive,
  isSelf,
  labels,
  totalMultiplier,
  raceCharCount,
  modifiers,
  trackTitle,
  trackArtist,
  trackCoverUrl,
  songDifficulty,
  raceStartedAt,
  onActivate,
}: RaceResultCardProps) {
  const grade = calculateGrade(entry.accuracy, totalMultiplier);
  const isWinner = rank === 1;

  const keystrokeLog = useMemo(() => {
    if (!isSelf || !raceStartedAt) return null;
    const record = getSessionHistory().find(
      (session) =>
        session.lessonId === MULTIPLAYER_LESSON_ID &&
        new Date(session.completedAt).getTime() >= raceStartedAt &&
        session.keystrokeLog?.length,
    );
    return record?.keystrokeLog ?? null;
  }, [isSelf, raceStartedAt]);

  const distribution = useMemo(
    () =>
      resolveRaceKeystrokeDistribution(
        entry.accuracy,
        entry.percentage,
        raceCharCount,
        entry.finished ?? false,
        keystrokeLog,
      ),
    [entry.accuracy, entry.percentage, entry.finished, raceCharCount, keystrokeLog],
  );

  if (!isActive) {
    return (
      <RaceResultCardCompact
        entry={entry}
        rank={rank}
        grade={grade}
        isSelf={isSelf}
        rankLabel={labels.rankLabel}
        youLabel={labels.youLabel}
        accuracyLabel={labels.accuracyLabel}
        maxComboLabel={labels.maxComboLabel}
        wpmLabel={labels.wpmLabel}
        scoreLabel={labels.scoreLabel}
        coverUrl={trackCoverUrl}
        onActivate={onActivate}
      />
    );
  }

  return (
    <article
      className={[
        'relative z-10 w-full scale-100 overflow-visible rounded-2xl opacity-100 shadow-2xl shadow-black/40',
        'origin-center transition-all duration-300 ease-out will-change-transform',
        focusRingCardClassName,
      ].join(' ')}
      aria-current="true"
    >
      <GlassCardBackground coverUrl={trackCoverUrl} />

      <div className="relative z-10">
        <RaceResultCardHeader
          rank={rank}
          winnerLabel={labels.winnerLabel}
          isWinner={isWinner}
          playerName={entry.name}
          isSelf={isSelf}
          youLabel={labels.youLabel}
          trackTitle={trackTitle}
          trackArtist={trackArtist}
          fallbackTitle={labels.title}
          avatarUrl={entry.avatarUrl}
          initials={entry.initials}
          avatarSource={entry.avatarSource}
        />

        <div className="flex flex-col items-center px-4 py-4">
          <GradeDonut grade={grade} accuracy={entry.accuracy} />
        </div>

        <RaceResultScoreSection
          score={entry.score}
          scoreLabel={labels.scoreLabel}
          difficulty={songDifficulty}
          modifiers={modifiers}
        />

        <RaceResultStatsGrid
          stats={{
            accuracy: entry.accuracy,
            maxCombo: entry.maxCombo,
            wpm: entry.wpm,
            pureCorrect: distribution.pureCorrect,
            corrected: distribution.corrected,
            errors: distribution.errors,
          }}
          accuracyLabel={labels.accuracyLabel}
          maxComboLabel={labels.maxComboLabel}
          wpmLabel={labels.wpmLabel}
          correctLabel={labels.correctLabel}
          correctedLabel={labels.correctedLabel}
          errorsLabel={labels.errorsLabel}
        />

        <footer className="border-t border-white/10 px-5 py-3 text-center text-xs text-white/40">
          {entry.finished ? labels.finishedLabel : `${Math.round(entry.percentage)}%`} ·{' '}
          {entry.combo} {labels.comboLabel}
        </footer>
      </div>
    </article>
  );
}
