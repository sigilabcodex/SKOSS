import { MonitorIcon, MoonIcon, SunIcon } from '@/components/ui-icons';
import type { ThemeName } from '@/lib/domain/types';

export type ThemeOption = {
  name: ThemeName;
  icon: typeof SunIcon;
};

export const storageKey = 'skoss-theme';
export const themeCookieName = 'skoss-theme';

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
    name: 'system',
    icon: MonitorIcon,
  },
];

export function resolveThemePreference(value: string | undefined, fallback: ThemeName = 'system'): ThemeName {
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value;
  }

  if (value === 'garden') {
    return 'system';
  }

  return fallback;
}

export function resolveAppliedTheme(theme: ThemeName) {
  if (theme === 'system' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return theme === 'system' ? 'light' : theme;
}

export function getStoredThemePreference() {
  if (typeof document === 'undefined') {
    return 'system' as ThemeName;
  }

  return resolveThemePreference(
    document.documentElement.dataset.themePreference
      ?? window.localStorage.getItem(storageKey)
      ?? document.cookie
        .split('; ')
        .find((entry) => entry.startsWith(themeCookieName + '='))
        ?.split('=')[1],
  );
}

export function applyThemeState(theme: ThemeName) {
  const resolvedTheme = resolveAppliedTheme(theme);

  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.themePreference = theme;
  window.localStorage.setItem(storageKey, theme);
  document.cookie = `${themeCookieName}=${theme}; path=/; max-age=31536000; samesite=lax`;
}

export function getThemeOption(theme: ThemeName) {
  return themeOptions.find((option) => option.name === theme) ?? themeOptions[0];
}
