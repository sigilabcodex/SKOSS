import Link from 'next/link';
import type { ReactNode } from 'react';
import { PrimaryNav } from '@/components/primary-nav';
import { UserMenu } from '@/components/user-menu';
import { getServerTranslator } from '@/lib/i18n/server';
import { readStore } from '@/lib/server/store';
import { getCurrentUserContext } from '@/lib/server/auth';

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
          <UserMenu currentUser={currentUser} t={t} />
        </div>
      </header>
      <main className="shell-main">{children}</main>
    </div>
  );
}
