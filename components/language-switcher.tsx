'use client';

import { ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/components/i18n-provider';
import { localeCookieName, localeOptions, localeStorageKey } from '@/lib/i18n/config';

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale, t } = useI18n();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value;

    window.localStorage.setItem(localeStorageKey, nextLocale);
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = nextLocale;
    router.refresh();
  };

  return (
    <label className="menu-select-field language-switcher">
      <span className="field-heading">{t('language.label')}</span>
      <select aria-label={t('language.switcherAria')} value={locale} onChange={handleChange}>
        {localeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.nativeLabel}
          </option>
        ))}
      </select>
      <span className="helper-text">{t('shell.languageHelp')}</span>
    </label>
  );
}
