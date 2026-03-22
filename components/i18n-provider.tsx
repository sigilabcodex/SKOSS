'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';
import { AppLocale, AppPreset } from '@/lib/i18n/config';
import { createTranslator, TranslationTree, TranslateValues } from '@/lib/i18n';

type I18nContextValue = {
  locale: AppLocale;
  preset: AppPreset;
  messages: TranslationTree;
  t: (key: string, values?: TranslateValues) => string;
  term: (name: 'workItem' | 'destination', count?: 'one' | 'many') => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  preset,
  messages,
  children,
}: {
  locale: AppLocale;
  preset: AppPreset;
  messages: TranslationTree;
  children: ReactNode;
}) {
  const value = useMemo(() => {
    const translator = createTranslator({ locale, preset });

    return {
      locale,
      preset,
      messages,
      t: translator.t,
      term: translator.term,
    } satisfies I18nContextValue;
  }, [locale, messages, preset]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext) as I18nContextValue | null;

  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }

  return context;
}
