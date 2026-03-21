'use client';

import { LeafIcon, MoonIcon, SunIcon } from '@/components/ui-icons';

type ThemeName = 'light' | 'dark' | 'garden';

type ThemeOption = {
  name: ThemeName;
  label: string;
  icon: typeof SunIcon;
};

const themeOptions: ThemeOption[] = [
  { name: 'light', label: 'Light', icon: SunIcon },
  { name: 'dark', label: 'Dark', icon: MoonIcon },
  { name: 'garden', label: 'Green', icon: LeafIcon },
];

const storageKey = 'skoss-theme';

function applyThemeState(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(storageKey, theme);

  document.querySelectorAll<HTMLButtonElement>('[data-theme-option]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.themeOption === theme));
  });
}

export function ThemeSwitcher() {
  return (
    <div className="theme-switcher" role="group" aria-label="Theme switcher">
      {themeOptions.map((option) => {
        const Icon = option.icon;

        return (
          <button
            key={option.name}
            type="button"
            className="theme-chip"
            data-theme-option={option.name}
            onClick={() => applyThemeState(option.name)}
            aria-pressed="false"
          >
            <Icon className="button-icon" />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
