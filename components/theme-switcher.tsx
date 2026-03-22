'use client';

import { useState } from 'react';
import type { ThemeName } from '@/lib/domain/types';
import { useI18n } from '@/components/i18n-provider';
import { applyThemeState, getStoredThemePreference, themeOptions } from '@/lib/theme';

type ThemeSwitcherProps = {
  variant?: 'menu' | 'panel';
};

export function ThemeSwitcher({ variant = 'menu' }: ThemeSwitcherProps) {
  const { t } = useI18n();
  const [activeTheme, setActiveTheme] = useState<ThemeName>(getStoredThemePreference());

  const handleThemeChange = (theme: (typeof themeOptions)[number]['name']) => {
    applyThemeState(theme);
    setActiveTheme(theme);
  };

  if (variant === 'panel') {
    return (
      <div className="theme-panel" role="group" aria-label={t('theme.groupAria')}>
        {themeOptions.map((option) => {
          const Icon = option.icon;

          return (
            <button
              key={option.name}
              type="button"
              className="theme-panel-option"
              data-theme-option={option.name}
              onClick={() => handleThemeChange(option.name)}
              aria-pressed={activeTheme === option.name}
            >
              <span className="theme-panel-header">
                <span className="theme-panel-icon-wrap">
                  <Icon className="button-icon" />
                </span>
                <span>
                  <strong>{t(`theme.${option.name}.label`)}</strong>
                  <span className="theme-panel-kicker">{t(`theme.${option.name}.shortLabel`)}</span>
                </span>
              </span>
              <span className="helper-text">{t(`theme.${option.name}.description`)}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="menu-preference-block page-stack">
      <div>
        <span className="field-heading">{t('theme.appearance')}</span>
        <p className="helper-text no-margin">{t('shell.appearanceHelp')}</p>
      </div>
      <div className="theme-segmented-control" role="group" aria-label={t('theme.groupAria')}>
        {themeOptions.map((option) => {
          const Icon = option.icon;

          return (
            <button
              key={option.name}
              type="button"
              className="theme-segmented-option"
              data-theme-option={option.name}
              aria-pressed={activeTheme === option.name}
              onClick={() => handleThemeChange(option.name)}
            >
              <Icon className="button-icon" />
              <span>{t(`theme.${option.name}.shortLabel`)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
