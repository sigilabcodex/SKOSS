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
            <p className="eyebrow">Instance gateway</p>
            <h1>Choose your start path</h1>
            <p className="lede">
              Pick one clear path: new installation, open existing workspace, restore backup, or explore demo safely.
            </p>
          </div>
        </div>
      </section>

      {params?.error ? <p className="inline-warning">{params.error}</p> : null}
      {params?.saved === 'restored' ? <p className="inline-success">Backup restored. Continue with sign-in.</p> : null}

      <section className="page-stack">
        <article className="panel page-stack">
          <h2>Start a new kitchen</h2>
          <p>Create your admin account, set workspace basics, then continue with optional setup at your own pace.</p>
          {state.canRunBootstrap ? (
            <Link className="button-primary" href="/bootstrap?step=1">
              Start guided activation
            </Link>
          ) : (
            <button className="button-primary" disabled type="button">
              Guided activation unavailable
            </button>
          )}
          {!state.canRunBootstrap ? <p className="helper-text">This instance is already initialized. Use Setup for ongoing configuration.</p> : null}
        </article>

        <article className="subpanel page-stack">
          <h2>Try demo environment</h2>
          <p>Open a clearly marked safe workspace for training and evaluation. This does not finalize real setup.</p>
          <form action={launchDemoModeAction}>
            <button type="submit" className="button-secondary" disabled={!isNonProductionMode()}>
              Launch demo workspace
            </button>
          </form>
          <p className="helper-text">Demo sessions are resettable and safe for training.</p>
          {!isNonProductionMode() ? <p className="helper-text">Demo launch is disabled in production mode.</p> : null}
        </article>

        <article className="subpanel page-stack">
          <h2>Restore from backup</h2>
          <p>Import a JSON backup to recover an existing instance. Use backups from the same SKOSS version when possible.</p>
          <form action={restoreInstanceFromBackupAction} className="inline-form-grid">
            <input type="file" name="backupFile" accept="application/json" required />
            <button type="submit" className="button-secondary">Restore backup</button>
          </form>
          <p className="helper-text">Restoring replaces current runtime instance data.</p>
          {state.backupAvailable ? <p className="helper-text">Detected backup files in data/backups.</p> : null}
        </article>

        <article className="subpanel page-stack">
          <h2>Open existing instance</h2>
          <p>Continue with existing users and role workspaces.</p>
          {state.canOpenExistingInstance ? (
            <Link className="button-secondary" href="/login?redirectTo=/">
              Sign in
            </Link>
          ) : (
            <button className="button-secondary" disabled type="button">
              Sign in unavailable
            </button>
          )}
          {!state.canOpenExistingInstance ? <p className="helper-text">No active users detected yet.</p> : null}
          {state.onboardingIncomplete ? <p className="helper-text">Setup appears incomplete. Resume guided activation first.</p> : null}
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
