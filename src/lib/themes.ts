export type ThemeId = 'classic' | 'royal-gold' | 'aurora' | 'midnight' | 'crimson' | 'emerald';

export type ThemeDef = {
  id: ThemeId;
  label: string;
  description: string;
  animated: boolean;
  coverClass: string;
  coverStyle?: React.CSSProperties;
  ringClass: string;
  avatarBorderClass: string;
  badgeClass: string;
  shimmerClass?: string;
};

import type React from 'react';

export const THEMES: ThemeDef[] = [
  {
    id: 'classic',
    label: 'Classic Navy',
    description: 'Clean navy blue — the default look',
    animated: false,
    coverClass: 'bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950',
    ringClass: '',
    avatarBorderClass: 'border-white',
    badgeClass: 'bg-navy-700 text-white',
  },
  {
    id: 'royal-gold',
    label: 'Royal Gold',
    description: 'Luxurious gold gradient for distinguished profiles',
    animated: false,
    coverClass: 'bg-gradient-to-r from-yellow-800 via-amber-600 to-yellow-700',
    ringClass: 'ring-2 ring-amber-400',
    avatarBorderClass: 'border-amber-300',
    badgeClass: 'bg-amber-900/80 text-amber-100',
  },
  {
    id: 'aurora',
    label: 'Aurora',
    description: 'Animated northern lights gradient effect',
    animated: true,
    coverClass: 'theme-aurora-cover',
    ringClass: 'ring-2 ring-purple-400',
    avatarBorderClass: 'border-purple-300',
    badgeClass: 'bg-purple-900/80 text-purple-100',
    shimmerClass: 'theme-aurora-shimmer',
  },
  {
    id: 'midnight',
    label: 'Midnight Blue',
    description: 'Deep cosmic blue with glowing accents',
    animated: true,
    coverClass: 'theme-midnight-cover',
    ringClass: 'ring-2 ring-blue-500',
    avatarBorderClass: 'border-blue-400',
    badgeClass: 'bg-blue-900/80 text-blue-100',
  },
  {
    id: 'crimson',
    label: 'Crimson',
    description: 'Bold deep red for a powerful presence',
    animated: false,
    coverClass: 'bg-gradient-to-r from-red-900 via-rose-800 to-red-900',
    ringClass: 'ring-2 ring-red-400',
    avatarBorderClass: 'border-red-300',
    badgeClass: 'bg-red-900/80 text-red-100',
  },
  {
    id: 'emerald',
    label: 'Emerald Forest',
    description: 'Fresh green tones, full of life',
    animated: false,
    coverClass: 'bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900',
    ringClass: 'ring-2 ring-emerald-400',
    avatarBorderClass: 'border-emerald-300',
    badgeClass: 'bg-emerald-900/80 text-emerald-100',
  },
];

export function getTheme(themeId: string | null | undefined): ThemeDef {
  return THEMES.find((t) => t.id === themeId) ?? THEMES[0];
}
