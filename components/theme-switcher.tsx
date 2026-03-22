'use client';

import { applyThemeState, themeOptions } from '@/lib/theme';
import { SparklesIcon } from '@/components/ui-icons';

type ThemeSwitcherProps = {
  variant?: 'compact' | 'panel';
};

export function ThemeSwitcher({ variant = 'compact' }: ThemeSwitcherProps) {
  if (variant === 'panel') {
    return (
      <div className="theme-panel" role="group" aria-label="Appearance theme">
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
                  <strong>{option.label}</strong>
                  <span className="theme-panel-kicker">{option.shortLabel}</span>
                </span>
              </span>
              <span className="helper-text">{option.description}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <details className="theme-switcher">
      <summary className="theme-menu-button" aria-label="Open appearance menu">
        <SparklesIcon className="button-icon" />
      </summary>
      <div className="theme-menu" aria-label="Theme options">
        <div className="theme-menu-header">
          <SparklesIcon className="button-icon" />
          <div>
            <strong>Appearance</strong>
            <p className="helper-text no-margin">Quick switch. Full controls stay in Setup.</p>
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
                    <strong>{option.label}</strong>
                    <span className="theme-menu-caption">{option.description}</span>
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
