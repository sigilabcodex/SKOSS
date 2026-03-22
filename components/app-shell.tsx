import Link from 'next/link';
import type { ReactNode } from 'react';
import { logoutAction } from '@/lib/server/actions';
import { PrimaryNav } from '@/components/primary-nav';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { LanguageSwitcher } from '@/components/language-switcher';
import { getServerTranslator } from '@/lib/i18n/server';
import { readStore } from '@/lib/server/store';
import { getCurrentUserContext } from '@/lib/server/auth';
import { UserIcon } from '@/components/ui-icons';

export async function AppShell({ children }: { children?: ReactNode }) {
  const [{ t }, data] = await Promise.all([getServerTranslator(), readStore()]);
  const { currentUser, visibleWorkspaces } = await getCurrentUserContext(data);

  return (
    <div className="shell">
      <header className="shell-header">
        <Link href="/" className="brand-block" aria-label={t('shell.homeAria')}>
          <span className="brand-kicker">SKOSS</span>
          <strong>{data.workspace.name}</strong>
          <span className="brand-subtitle">{t('shell.brandTitle')}</span>
        </Link>
        <div className="shell-controls">
          <PrimaryNav visibleWorkspaces={visibleWorkspaces} />
          <div className="shell-user-cluster">
            {currentUser ? (
              <>
                <Link href="/preferences" className="shell-user-card">
                  <UserIcon className="shell-user-icon" />
                  <span>
                    <strong>{currentUser.displayName}</strong>
                    <span className="shell-user-meta">{t(`roles.${currentUser.role}.label`)}</span>
                  </span>
                </Link>
                <Link href="/login" className="shell-inline-link">{t('shell.switchUser')}</Link>
                <form action={logoutAction}>
                  <button type="submit" className="shell-inline-button">{t('shell.logout')}</button>
                </form>
              </>
            ) : (
              <Link href="/login" className="shell-inline-link">{t('shell.login')}</Link>
            )}
          </div>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </header>
      <main className="shell-main">{children}</main>
    </div>
  );
}
