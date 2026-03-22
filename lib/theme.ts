import { LeafIcon, MoonIcon, SunIcon } from '@/components/ui-icons';

export type ThemeName = 'light' | 'dark' | 'garden';

export type ThemeOption = {
  name: ThemeName;
  icon: typeof SunIcon;
};

export const storageKey = 'skoss-theme';

export const themeOptions: ThemeOption[] = [
  {
    name: 'light',
    icon: SunIcon,
  },
  {
    name: 'dark',
    icon: MoonIcon,
  },
  {
    name: 'garden',
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
