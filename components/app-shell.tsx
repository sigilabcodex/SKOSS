import Link from 'next/link';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { PrimaryNav } from '@/components/primary-nav';
import { UserMenu } from '@/components/user-menu';
import { getApplicationPlane, skossinaRoutes } from '@/lib/application-planes';
import { getServerTranslator } from '@/lib/i18n/server';
import { readPersistence } from '@/lib/server/persistence';
import { getCurrentUserContext } from '@/lib/server/auth';
import { getRuntimeModeLabel, isNonProductionMode } from '@/lib/server/runtime-mode';

export async function AppShell({ children }: { children?: ReactNode }) {
  const [{ t }, persistence] = await Promise.all([getServerTranslator(), readPersistence()]);
  const data = persistence.raw;
  const workspace = persistence.instance.getWorkspace();
  const { currentUser, visibleWorkspaces } = await getCurrentUserContext(data);
  const showNonProductionBanner = isNonProductionMode();
  const runtimeModeLabel = getRuntimeModeLabel();
  const headerStore = await headers();
  const requestPath =
    headerStore.get('next-url')
    ?? headerStore.get('x-invoke-path')
    ?? headerStore.get('x-matched-path')
    ?? '';
  const plane = getApplicationPlane(requestPath);

  if (plane === 'bootstrap') {
    return (
      <div className="shell onboarding-shell">
        {showNonProductionBanner ? (
          <div className="runtime-banner" role="status">
            {runtimeModeLabel} · non-production data only
          </div>
        ) : null}
        <main className="shell-main onboarding-shell-main">{children}</main>
      </div>
    );
  }

  return (
    <div className="shell">
      {showNonProductionBanner ? (
        <div className="runtime-banner" role="status">
          {runtimeModeLabel} · non-production data only
        </div>
      ) : null}
      <header className="shell-header">
        <Link href={skossinaRoutes.home} className="brand-block" aria-label={t('shell.homeAria')}>
          <span className="brand-kicker">SKOSS</span>
          <strong>{workspace.name}</strong>
          <span className="brand-subtitle">{t('shell.brandTitle')}</span>
        </Link>
        <div className="shell-controls">
          <div className="shell-mobile-nav">
            <PrimaryNav visibleWorkspaces={visibleWorkspaces} />
          </div>
          <UserMenu currentUser={currentUser} t={t} />
        </div>
      </header>
      <div className="shell-body">
        <aside className="shell-sidebar">
          <PrimaryNav visibleWorkspaces={visibleWorkspaces} mode="desktop" />
        </aside>
        <main className="shell-main">{children}</main>
      </div>
    </div>
  );
}
