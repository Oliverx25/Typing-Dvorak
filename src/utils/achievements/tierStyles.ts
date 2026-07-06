import type { AchievementTier } from '@/utils/achievements/achievements.config';

export interface TierStyle {
  icon: string;
  border: string;
  borderUnlocked: string;
  glow: string;
  labelKey: 'tierBronze' | 'tierSilver' | 'tierGold' | 'tierDiamond';
}

export const TIER_STYLES: Record<AchievementTier, TierStyle> = {
  1: {
    icon: 'text-amber-700',
    border: 'border-amber-900/50',
    borderUnlocked: 'border-amber-700/40',
    glow: '',
    labelKey: 'tierBronze',
  },
  2: {
    icon: 'text-slate-300',
    border: 'border-slate-500/50',
    borderUnlocked: 'border-slate-400/40',
    glow: '',
    labelKey: 'tierSilver',
  },
  3: {
    icon: 'text-yellow-400',
    border: 'border-yellow-500/50',
    borderUnlocked: 'border-yellow-400/40',
    glow: '',
    labelKey: 'tierGold',
  },
  4: {
    icon: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]',
    border: 'border-cyan-500/50',
    borderUnlocked: 'border-cyan-400/40',
    glow: 'shadow-[0_0_20px_rgba(34,211,238,0.15)]',
    labelKey: 'tierDiamond',
  },
};

export const SPECIAL_ACHIEVEMENT_STYLE = {
  icon: 'text-[var(--color-highlight)]',
  border: 'border-[var(--color-highlight)]/35',
  borderUnlocked: 'border-[var(--color-highlight)]/45',
  glow: 'shadow-[0_0_16px_color-mix(in_srgb,var(--color-highlight)_18%,transparent)]',
};
