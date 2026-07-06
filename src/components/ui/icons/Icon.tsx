import type { IconType } from 'react-icons';
import type { SVGProps } from 'react';
import {
  LuAward,
  LuBookOpen,
  LuCamera,
  LuChartLine,
  LuCheck,
  LuChevronDown,
  LuChevronRight,
  LuChevronUp,
  LuChrome,
  LuCrown,
  LuDroplet,
  LuEyeOff,
  LuFlame,
  LuFlashlight,
  LuGauge,
  LuGhost,
  LuGithub,
  LuKeyboard,
  LuLock,
  LuLogIn,
  LuLogOut,
  LuMoon,
  LuMusic,
  LuRefreshCw,
  LuRewind,
  LuSearch,
  LuSettings,
  LuSkull,
  LuSparkles,
  LuStar,
  LuSun,
  LuTarget,
  LuTimer,
  LuTrophy,
  LuUser,
  LuX,
  LuZap,
} from 'react-icons/lu';

export type IconName =
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-right'
  | 'star'
  | 'star-filled'
  | 'github'
  | 'google'
  | 'lock'
  | 'chart'
  | 'keyboard'
  | 'log-out'
  | 'user'
  | 'camera'
  | 'trophy'
  | 'settings'
  | 'sun'
  | 'moon'
  | 'flame'
  | 'search'
  | 'music-note'
  | 'x'
  | 'check'
  | 'refresh'
  | 'timer'
  | 'speed'
  | 'max-score'
  | 'skull'
  | 'blind-mode'
  | 'flashlight'
  | 'double-time'
  | 'rhythm-lock'
  | 'vampire'
  | 'hidden'
  | 'half-time'
  | 'join'
  | 'zap'
  | 'target'
  | 'book-open'
  | 'award'
  | 'crown'
  | 'sparkles';

const ICONS: Record<IconName, IconType> = {
  'chevron-down': LuChevronDown,
  'chevron-up': LuChevronUp,
  'chevron-right': LuChevronRight,
  star: LuStar,
  'star-filled': LuStar,
  github: LuGithub,
  google: LuChrome,
  lock: LuLock,
  chart: LuChartLine,
  keyboard: LuKeyboard,
  'log-out': LuLogOut,
  user: LuUser,
  camera: LuCamera,
  trophy: LuTrophy,
  settings: LuSettings,
  sun: LuSun,
  moon: LuMoon,
  flame: LuFlame,
  search: LuSearch,
  'music-note': LuMusic,
  x: LuX,
  check: LuCheck,
  refresh: LuRefreshCw,
  timer: LuTimer,
  speed: LuGauge,
  'max-score': LuStar,
  skull: LuSkull,
  'blind-mode': LuEyeOff,
  flashlight: LuFlashlight,
  'double-time': LuZap,
  'rhythm-lock': LuMusic,
  vampire: LuDroplet,
  hidden: LuGhost,
  'half-time': LuRewind,
  join: LuLogIn,
  zap: LuZap,
  target: LuTarget,
  'book-open': LuBookOpen,
  award: LuAward,
  crown: LuCrown,
  sparkles: LuSparkles,
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export default function Icon({ name, size = 16, className = '', ...props }: IconProps) {
  const Component = ICONS[name];
  const filled = name === 'star-filled';

  return (
    <Component
      size={size}
      className={[className, filled ? 'fill-current' : ''].filter(Boolean).join(' ')}
      aria-hidden="true"
      {...props}
    />
  );
}
