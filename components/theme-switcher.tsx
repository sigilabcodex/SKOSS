'use client';

import { useI18n } from '@/components/i18n-provider';
import { applyThemeState, themeOptions } from '@/lib/theme';
import { SparklesIcon } from '@/components/ui-icons';

type ThemeSwitcherProps = {
  variant?: 'compact' | 'panel';
};

export function ThemeSwitcher({ variant = 'compact' }: ThemeSwitcherProps) {
  const { t } = useI18n();

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
              onClick={() => applyThemeState(option.name)}
              aria-pressed="false"
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
    <details className="theme-switcher">
      <summary className="theme-menu-button" aria-label={t('theme.openMenu')}>
        <SparklesIcon className="button-icon" />
      </summary>
      <div className="theme-menu" aria-label={t('theme.optionsAria')}>
        <div className="theme-menu-header">
          <SparklesIcon className="button-icon" />
          <div>
            <strong>{t('theme.appearance')}</strong>
            <p className="helper-text no-margin">{t('theme.quickSwitch')}</p>
          </div>
        </div>
        <div className="theme-menu-options">
          {themeOptions.map((option) => {
            const Icon = option.icon;

            return (
              <button
                key={option.name}
                type="button"
                className="theme-menu-option"
                data-theme-option={option.name}
                aria-pressed="false"
                onClick={(event) => {
                  applyThemeState(option.name);
                  const details = event.currentTarget.closest('details');

                  if (details instanceof HTMLDetailsElement) {
                    details.open = false;
                  }
                }}
              >
                <span className="theme-menu-option-main">
                  <span className="theme-menu-icon-wrap">
                    <Icon className="button-icon" />
                  </span>
                  <span>
                    <strong>{t(`theme.${option.name}.label`)}</strong>
                    <span className="theme-menu-caption">{t(`theme.${option.name}.description`)}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </details>
  );
}
