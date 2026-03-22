import { LeafIcon, MoonIcon, SunIcon } from '@/components/ui-icons';

export type ThemeName = 'light' | 'dark' | 'garden';

export type ThemeOption = {
  name: ThemeName;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof SunIcon;
};

export const storageKey = 'skoss-theme';

export const themeOptions: ThemeOption[] = [
  {
    name: 'light',
    label: 'Bakery light',
    shortLabel: 'Light',
    description: 'Warm neutral surfaces for bright kitchens and front-of-house use.',
    icon: SunIcon,
  },
  {
    name: 'dark',
    label: 'Night prep',
    shortLabel: 'Dark',
    description: 'Lower-glare contrast for early starts, overnight prep, and dim spaces.',
    icon: MoonIcon,
  },
  {
    name: 'garden',
    label: 'Garden sage',
    shortLabel: 'Green',
    description: 'Muted sage accents with an organic, kitchen-garden feel.',
    icon: LeafIcon,
  },
];

export function applyThemeState(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(storageKey, theme);
}

export function getThemeOption(theme: ThemeName) {
  return themeOptions.find((option) => option.name === theme) ?? themeOptions[0];
}
