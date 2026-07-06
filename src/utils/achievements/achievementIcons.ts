import type { IconType } from 'react-icons';
import {
  LuAward,
  LuCalendar,
  LuCode,
  LuFlame,
  LuMusic,
  LuSwords,
  LuTarget,
  LuZap,
} from 'react-icons/lu';
import type { CatalogCategory, CatalogTier } from '@/utils/achievements/catalogTypes';

const CATEGORY_ICONS: Record<CatalogCategory, IconType> = {
  velocidad: LuZap,
  precision: LuTarget,
  multijugador: LuSwords,
  riesgo: LuFlame,
  tecnica: LuCode,
  resistencia: LuCalendar,
  musica: LuMusic,
  rangos: LuAward,
};

export function getCategoryIcon(category: CatalogCategory): IconType {
  return CATEGORY_ICONS[category] ?? LuAward;
}

export interface TierVisualStyle {
  border: string;
  borderUnlocked: string;
  icon: string;
  glow: string;
  bar: string;
}

export const TIER_VISUALS: Record<CatalogTier, TierVisualStyle> = {
  bronce: {
    border: 'border-orange-700/30',
    borderUnlocked: 'border-orange-700/40',
    icon: 'text-orange-400',
    glow: '',
    bar: 'bg-orange-500',
  },
  plata: {
    border: 'border-slate-500/30',
    borderUnlocked: 'border-slate-500/40',
    icon: 'text-slate-300',
    glow: '',
    bar: 'bg-slate-400',
  },
  oro: {
    border: 'border-amber-500/30',
    borderUnlocked: 'border-amber-500/40',
    icon: 'text-amber-400',
    glow: '',
    bar: 'bg-amber-400',
  },
  diamante: {
    border: 'border-cyan-500/30',
    borderUnlocked: 'border-cyan-500/40',
    icon: 'text-cyan-400',
    glow: 'shadow-[0_0_10px_rgba(6,182,212,0.15)]',
    bar: 'bg-cyan-400',
  },
  especial: {
    border: 'border-purple-500/30',
    borderUnlocked: 'border-purple-400/40',
    icon: 'text-purple-300',
    glow: 'bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20',
    bar: 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400',
  },
};

