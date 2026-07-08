import type { Locale } from '@/i18n';
import { getTranslations, t as translate } from '@/i18n';
import { getLessonTitleById } from '@/i18n/lessons';
import type { TypingSessionRow } from '@/services/supabase/queries';
import type { SessionRecord } from '@/utils/progress/storage';
import type { PracticeMode } from '@/utils/app/settings';
import type { RaceTextSource } from '@/utils/stats/sessionTypes';
import type { RaceModifier } from '@/utils/multiplayer/roomConfig.types';
import { calculateGrade } from '@/utils/grading';
import { MULTIPLAYER_LESSON_ID, parseStoredRaceModifiers } from '@/utils/stats/sessionDisplay';
import { getSessionHistory } from '@/utils/progress/storage';
import type { SessionTelemetryData } from '@/services/supabase/queries';
import type { KeystrokeLogEntry } from '@/utils/typing/keystrokeTelemetry';
import { isCloudSessionId } from '@/utils/history/sessionTelemetry';

export interface HistorySession {
  id: string;
  lessonId: string;
  lessonTitle: string;
  wpm: number;
  accuracy: number;
  elapsedSeconds: number;
  mode: PracticeMode;
  completedAt: string;
  grade?: string;
  score?: number;
  maxCombo?: number;
  multiplayerSource?: RaceTextSource;
  songTitle?: string;
  raceModifiers?: RaceModifier[];
}

export function mapCloudSessionRow(row: TypingSessionRow): HistorySession {
  const isMultiplayer = row.lesson_id === MULTIPLAYER_LESSON_ID;

  return {
    id: row.id,
    lessonId: row.lesson_id,
    lessonTitle: isMultiplayer ? MULTIPLAYER_LESSON_ID : row.lesson_id,
    wpm: row.wpm,
    accuracy: Number(row.accuracy),
    elapsedSeconds: 0,
    mode: row.mode === 'test' ? 'test' : 'practice',
    completedAt: row.created_at,
    grade: row.grade ?? calculateGrade(Number(row.accuracy)),
    score: row.score ?? undefined,
    maxCombo: row.max_combo ?? undefined,
    multiplayerSource: (row.race_source as RaceTextSource | null) ?? undefined,
    songTitle: row.song_title ?? undefined,
    raceModifiers: parseStoredRaceModifiers(row.race_modifiers),
  };
}

export function mapLocalSessionRecord(record: SessionRecord, index: number): HistorySession {
  return {
    id: `${record.completedAt}-${index}`,
    lessonId: record.lessonId,
    lessonTitle: record.lessonTitle,
    wpm: record.wpm,
    accuracy: record.accuracy,
    elapsedSeconds: record.elapsedSeconds,
    mode: record.mode,
    completedAt: record.completedAt,
    grade: record.grade,
    score: record.score,
    maxCombo: record.maxCombo,
    multiplayerSource: record.multiplayerSource,
    songTitle: record.songTitle,
    raceModifiers: record.raceModifiers,
  };
}

export function formatHistorySessionLabel(session: HistorySession, locale: Locale): string {
  const t = getTranslations(locale);

  if (session.lessonId === MULTIPLAYER_LESSON_ID) {
    const source = session.multiplayerSource ?? 'lesson';
    if (source === 'song') return session.songTitle?.trim() || t.stats.multiplayerSourceSong;
    if (source === 'custom') return t.multiplayer.customTextMode;
    return t.multiplayer.systemLesson;
  }

  if (session.lessonTitle.includes('.') || /^[a-zA-Z_]+$/.test(session.lessonTitle)) {
    return getLessonTitleById(session.lessonId, locale);
  }

  return session.lessonTitle;
}

export function formatHistorySessionType(session: HistorySession, locale: Locale): string {
  const t = getTranslations(locale);
  if (session.lessonId === MULTIPLAYER_LESSON_ID) return t.history.typeMultiplayer;
  if (session.mode === 'test') return t.history.typeTest;
  return t.history.typeLesson;
}

export function formatHistoryDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  const now = new Date();
  const time = date.toLocaleTimeString(locale === 'es' ? 'es-MX' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000);

  if (dayDiff === 0) {
    return `${translate(locale, 'history.today')}, ${time}`;
  }
  if (dayDiff === 1) {
    return `${translate(locale, 'history.yesterday')}, ${time}`;
  }

  return date.toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getLocalSessionTelemetry(completedAt: string): SessionTelemetryData | null {
  const record = getSessionHistory().find((session) => session.completedAt === completedAt);
  if (!record?.keystrokeLog?.length) return null;

  return {
    keystrokeLog: record.keystrokeLog,
    consistency: record.consistency ?? null,
    troubleKeys: record.troubleKeys ?? [],
  };
}

export function resolveSessionAnalyticsMetrics(
  session: HistorySession,
  telemetry: SessionTelemetryData | null,
): {
  correctChars: number;
  incorrectChars: number;
  elapsedMs: number;
  keystrokeLog: KeystrokeLogEntry[];
  weakKeys: string[];
  stopOnError: boolean;
} {
  const local = getSessionHistory().find((entry) => entry.completedAt === session.completedAt);
  const estimated = estimateCharsFromSession(session);
  const keystrokeLog = telemetry?.keystrokeLog ?? local?.keystrokeLog ?? [];

  return {
    correctChars: local?.correctChars ?? estimated.correctChars,
    incorrectChars: local?.incorrectChars ?? estimated.incorrectChars,
    elapsedMs: local?.elapsedMs ?? estimated.elapsedMs,
    keystrokeLog,
    weakKeys: telemetry?.troubleKeys ?? local?.troubleKeys ?? [],
    stopOnError: local?.stopOnError ?? false,
  };
}

export { isCloudSessionId };

export function estimateCharsFromSession(session: HistorySession): {
  correctChars: number;
  incorrectChars: number;
  elapsedMs: number;
} {
  const elapsedMs = Math.max(session.elapsedSeconds, 1) * 1000;
  const totalChars = Math.max(5, Math.round((session.wpm * elapsedMs) / 12_000));
  const correctChars = Math.round(totalChars * (session.accuracy / 100));
  return {
    correctChars,
    incorrectChars: Math.max(0, totalChars - correctChars),
    elapsedMs: elapsedMs || 60_000,
  };
}
