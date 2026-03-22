import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import './globals.css';
import { AppShell } from '@/components/app-shell';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="skoss-theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
