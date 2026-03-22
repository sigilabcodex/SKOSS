import Link from 'next/link';
import type { ReactNode } from 'react';
import { PrimaryNav } from '@/components/primary-nav';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { LanguageSwitcher } from '@/components/language-switcher';
import { getServerTranslator } from '@/lib/i18n/server';

export async function AppShell({ children }: { children?: ReactNode }) {
  const { t } = await getServerTranslator();

  return (
    <div className="shell">
      <header className="shell-header">
        <Link href="/" className="brand-block" aria-label={t('shell.homeAria')}>
          <span className="brand-kicker">SKOSS</span>
          <strong>{t('shell.brandTitle')}</strong>
        </Link>
        <div className="shell-controls">
          <PrimaryNav />
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </header>
      <main className="shell-main">{children}</main>
    </div>
  );
}
