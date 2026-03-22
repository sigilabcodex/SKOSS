import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import './globals.css';
import { AppShell } from '@/components/app-shell';
import { I18nProvider } from '@/components/i18n-provider';
import { createTranslator } from '@/lib/i18n';
import { localeCookieName, localeStorageKey, supportedLocales } from '@/lib/i18n/config';
import { getRequestPreferences } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'SKOSS operational slice',
  description: 'Order intake, production board, and shift handoff for the first usable SKOSS workflow.',
};

const themeInitScript = `
(() => {
  const storageKey = 'skoss-theme';
  const savedTheme = window.localStorage.getItem(storageKey);
  document.documentElement.dataset.theme = savedTheme || 'light';
})();
`;

const languageInitScript = `
(() => {
  const storageKey = '${localeStorageKey}';
  const cookieKey = '${localeCookieName}';
  const supported = ${JSON.stringify(supportedLocales)};
  const savedLocale = window.localStorage.getItem(storageKey);

  if (!savedLocale || !supported.includes(savedLocale)) {
    return;
  }

  document.documentElement.lang = savedLocale;
  document.cookie = cookieKey + '=' + savedLocale + '; path=/; max-age=31536000; samesite=lax';
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { locale, preset } = await getRequestPreferences();
  const translator = createTranslator({ locale, preset });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <Script id="skoss-theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <Script id="skoss-language-init" strategy="beforeInteractive">
          {languageInitScript}
        </Script>
        <I18nProvider locale={locale} preset={preset} messages={translator.messages}>
          <AppShell>{children}</AppShell>
        </I18nProvider>
      </body>
    </html>
  );
}
