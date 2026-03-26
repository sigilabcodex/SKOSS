import Link from 'next/link';
import { redirect } from 'next/navigation';
import { launchDemoModeAction, restoreInstanceFromBackupAction } from '@/lib/server/actions';
import { getCurrentUserContext } from '@/lib/server/auth';
import { detectInstanceGatewayState } from '@/lib/server/instance-entry';
import { getServerTranslator } from '@/lib/i18n/server';
import { readStore } from '@/lib/server/store';
import { isNonProductionMode } from '@/lib/server/runtime-mode';

export default async function EntryGatewayPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; saved?: string }>;
}) {
  const [data, { currentUser }, { t }, params] = await Promise.all([
    readStore(),
    getCurrentUserContext(),
    getServerTranslator(),
    searchParams,
  ]);

  const state = await detectInstanceGatewayState(data);

  if (currentUser && state.hasAdminUser && state.hasInstance && !state.onboardingIncomplete) {
    redirect('/');
  }

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-header">
          <div>
            <p className="eyebrow">Instance entry gateway</p>
            <h1>What do you want to do right now?</h1>
            <p className="lede">
              Start setup, open demo data, restore from backup, or continue into an existing kitchen without
              forcing one linear onboarding path.
            </p>
          </div>
        </div>
      </section>

      {params?.error ? <p className="inline-warning">{params.error}</p> : null}
      {params?.saved === 'restored' ? <p className="inline-success">Backup restored. Continue with sign-in.</p> : null}
      {params?.saved === 'bootstrap-complete' ? <p className="inline-success">Bootstrap complete. Sign in with your admin username.</p> : null}

      <section className="grid-two">
        <article className="panel page-stack">
          <h2>Start a new kitchen</h2>
          <p>Run first-use bootstrap with dedicated onboarding screens for admin, workspace basics, team, shifts, imports, and launch.</p>
          {state.canRunBootstrap ? (
            <Link className="button-primary" href="/bootstrap?step=1">
              Run first-use wizard
            </Link>
          ) : (
            <button className="button-primary" disabled type="button">
              First-use wizard unavailable
            </button>
          )}
          {!state.canRunBootstrap ? <p className="helper-text">Bootstrap is locked after instance initialization is completed.</p> : null}
        </article>

        <article className="panel page-stack">
          <h2>Explore demo environment</h2>
          <p>Load seeded sample data for safe testing with non-production labels and reset support.</p>
          <form action={launchDemoModeAction}>
            <button type="submit" className="button-secondary" disabled={!isNonProductionMode()}>
              Launch demo workspace
            </button>
          </form>
          {!isNonProductionMode() ? <p className="helper-text">Demo launch is disabled in production mode.</p> : null}
        </article>

        <article className="panel page-stack">
          <h2>Restore from backup</h2>
          <p>Import a JSON backup file to restore instance data. Keep this minimal and reversible for pilot use.</p>
          <form action={restoreInstanceFromBackupAction} className="inline-form-grid">
            <input type="file" name="backupFile" accept="application/json" required />
            <button type="submit" className="button-secondary">Restore backup</button>
          </form>
          {state.backupAvailable ? <p className="helper-text">Detected backup files in data/backups.</p> : null}
        </article>

        <article className="panel page-stack">
          <h2>Open existing instance</h2>
          <p>Continue with existing users and role workspaces.</p>
          <Link className="button-secondary" href="/login?redirectTo=/">
            Sign in
          </Link>
          {!state.canOpenExistingInstance ? <p className="helper-text">No active users detected yet.</p> : null}
        </article>
      </section>

      <section className="panel page-stack">
        <h2>Learn / help / documentation</h2>
        <p>Quick links for first-time orientation and pilot flow context.</p>
        <ul className="stack-list">
          <li><Link href="https://github.com/sigilabcodex/SKOSS#readme" target="_blank">README overview</Link></li>
          <li><Link href="https://github.com/sigilabcodex/SKOSS/blob/main/docs/pilot-deployment-plan.md" target="_blank">Pilot deployment workflow</Link></li>
          <li><Link href="https://github.com/sigilabcodex/SKOSS/blob/main/docs/local-testing-and-demo-mode.md" target="_blank">Local testing and demo mode</Link></li>
        </ul>
      </section>

      <section className="page-context-card">
        <div>
          <strong>{t('shell.brandTitle')}</strong>
          <p className="helper-text no-margin">
            Detected state: instance {state.hasInstance ? 'ready' : 'missing'} · admin {state.hasAdminUser ? 'present' : 'missing'} ·
            onboarding {state.onboardingIncomplete ? 'in progress' : 'completed'} · demo {state.demoModeActive ? 'active' : 'off'}.
          </p>
        </div>
      </section>
    </div>
  );
}
