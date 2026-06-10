import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import { skossBootstrapRoutes, skossinaRoutes } from '@/lib/application-planes';
import {
  launchDemoModeAction,
  recoverLocalAdminAccessAction,
  resetLocalRuntimeDataAction,
  resetLocalUsersAndCredentialsAction,
  restoreInstanceFromBackupAction,
} from '@/lib/server/actions';
import { getCurrentUserContext } from '@/lib/server/auth';
import { detectInstanceGatewayState } from '@/lib/server/instance-entry';
import { getServerTranslator } from '@/lib/i18n/server';
import { readAppData } from '@/lib/server/persistence';
import { getRuntimeMode, isNonProductionMode } from '@/lib/server/runtime-mode';

function getEntryCopy(locale: string) {
  if (locale === 'es') {
    return {
      eyebrow: 'Entrada de instancia',
      title: 'Elige cómo iniciar',
      lede: 'Elige una ruta clara: instalación nueva, abrir instancia existente, restaurar respaldo o explorar demo de forma segura.',
      initializedTitle: 'Esta instancia de SKOSS ya está inicializada',
      initializedBody: 'La instalación inicial está bloqueada para proteger datos existentes. Puedes abrir, recuperar o restaurar esta instancia.',
      newTitle: 'Iniciar una cocina nueva',
      newBody: 'Crea la cuenta admin, define datos base y termina la configuración opcional después.',
      newAction: 'Iniciar activación guiada',
      newDisabled: 'Activación guiada no disponible',
      demoTitle: 'Probar entorno demo',
      demoBody: 'Abre un espacio de práctica claramente marcado. No finaliza la configuración real.',
      restoreTitle: 'Restaurar desde respaldo',
      restoreBody: 'Importa un respaldo JSON para recuperar una instancia existente.',
      openTitle: 'Abrir instancia existente',
      openBody: 'Continúa con usuarios y espacios de trabajo ya existentes.',
      openDisabled: 'Inicio de sesión no disponible',
      recoverTitle: 'Recuperar acceso',
      recoverBody: 'Si perdiste acceso admin, puedes restablecer credenciales localmente en modo no productivo.',
      recoverAction: 'Restablecer acceso admin local',
      toolsTitle: 'Herramientas locales de desarrollo',
      toolsBody: 'Solo para pruebas locales. Son acciones destructivas.',
    };
  }

  return {
    eyebrow: 'Instance gateway',
    title: 'Choose your start path',
    lede: 'Pick one clear path: new installation, open existing workspace, restore backup, or explore demo safely.',
    initializedTitle: 'This SKOSS instance is already initialized',
    initializedBody: 'New setup is disabled to protect existing data. You can open, recover, or restore this instance instead.',
    newTitle: 'Start a new kitchen',
    newBody: 'Create your admin account, set workspace basics, then continue optional setup later.',
    newAction: 'Start guided activation',
    newDisabled: 'Guided activation unavailable',
    demoTitle: 'Try demo environment',
    demoBody: 'Open a clearly marked safe workspace for training and evaluation. This does not finalize real setup.',
    restoreTitle: 'Restore from backup',
    restoreBody: 'Import a JSON backup to recover an existing instance.',
    openTitle: 'Open existing instance',
    openBody: 'Continue with existing users and role workspaces.',
    openDisabled: 'Sign in unavailable',
    recoverTitle: 'Recover access',
    recoverBody: 'If admin access is lost, you can reset local credentials in non-production mode.',
    recoverAction: 'Reset local admin access',
    toolsTitle: 'Local developer tools',
    toolsBody: 'For local testing only. These actions are destructive.',
  };
}

export default async function EntryGatewayPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; saved?: string; recoveryUser?: string }>;
}) {
  const [data, { currentUser }, { t, locale }, params] = await Promise.all([
    readAppData(),
    getCurrentUserContext(),
    getServerTranslator(),
    searchParams,
  ]);

  const state = await detectInstanceGatewayState(data);

  if (currentUser && state.hasAdminUser && state.hasInstance && !state.onboardingIncomplete) {
    redirect(skossinaRoutes.home);
  }
  const copy = getEntryCopy(locale);
  const runtimeMode = getRuntimeMode();
  const isDeveloperMode = runtimeMode === 'demo';

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-header">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p className="lede">{copy.lede}</p>
          </div>
          <div className="subpanel page-stack">
            <strong>{t('language.label')}</strong>
            <LanguageSwitcher />
            <p className="helper-text no-margin">Language remains available later from user preferences.</p>
          </div>
        </div>
      </section>

      {params?.error ? <p className="inline-warning">{params.error}</p> : null}
      {params?.saved === 'restored' ? <p className="inline-success">Backup restored. Continue with sign-in.</p> : null}
      {params?.saved === 'recovered' ? (
        <p className="inline-success">
          Local admin access reset for <strong>{params.recoveryUser ?? 'admin'}</strong>. Temporary password: <code className="inline-code">skoss-local-admin</code>.
        </p>
      ) : null}
      {params?.saved === 'users-reset' ? <p className="inline-success">Local users reset from seed data.</p> : null}
      {params?.saved === 'runtime-reset' ? <p className="inline-success">Local runtime data reset from seed data.</p> : null}

      {state.hasInstance ? (
        <section className="panel page-stack">
          <h2>{copy.initializedTitle}</h2>
          <p>{copy.initializedBody}</p>
        </section>
      ) : null}

      <section className="page-stack">
        <article className="panel page-stack">
          <h2>{copy.newTitle}</h2>
          <p>{copy.newBody}</p>
          {state.canRunBootstrap ? (
            <Link className="button-primary" href={skossBootstrapRoutes.bootstrapStart}>
              {copy.newAction}
            </Link>
          ) : (
            <button className="button-primary" disabled type="button">
              {copy.newDisabled}
            </button>
          )}
          {!state.canRunBootstrap ? <p className="helper-text">This instance is already initialized. Use Setup for ongoing configuration.</p> : null}
        </article>

        <article className="subpanel page-stack">
          <h2>{copy.demoTitle}</h2>
          <p>{copy.demoBody}</p>
          <form action={launchDemoModeAction}>
            <button type="submit" className="button-secondary" disabled={!isNonProductionMode()}>
              Launch demo workspace
            </button>
          </form>
          <p className="helper-text">Demo sessions are resettable and safe for training.</p>
          {!isNonProductionMode() ? <p className="helper-text">Demo launch is disabled in production mode.</p> : null}
        </article>

        <article className="subpanel page-stack">
          <h2>{copy.restoreTitle}</h2>
          <p>{copy.restoreBody} Use backups from the same SKOSS version when possible.</p>
          <form action={restoreInstanceFromBackupAction} className="inline-form-grid">
            <input type="file" name="backupFile" accept="application/json" required />
            <button type="submit" className="button-secondary">Restore backup</button>
          </form>
          <p className="helper-text">Restoring replaces current runtime instance data. Creating an export is still a manual maintainer step for first-deploy rehearsal.</p>
          {state.backupAvailable ? <p className="helper-text">Detected backup files in data/backups.</p> : null}
        </article>

        <article className="subpanel page-stack">
          <h2>{copy.openTitle}</h2>
          <p>{copy.openBody}</p>
          {state.canOpenExistingInstance ? (
            <Link className="button-secondary" href="/login?redirectTo=/">
              Sign in
            </Link>
          ) : (
            <button className="button-secondary" disabled type="button">
              {copy.openDisabled}
            </button>
          )}
          {!state.canOpenExistingInstance ? <p className="helper-text">No active users detected yet.</p> : null}
          {state.onboardingIncomplete ? <p className="helper-text">Setup appears incomplete. Resume guided activation first.</p> : null}
        </article>

        <article className="subpanel page-stack">
          <h2>{copy.recoverTitle}</h2>
          <p>{copy.recoverBody}</p>
          <form action={recoverLocalAdminAccessAction}>
            <button type="submit" className="button-secondary" disabled={!isNonProductionMode()}>
              {copy.recoverAction}
            </button>
          </form>
          {isNonProductionMode() ? (
            <p className="helper-text">Local fallback is enabled in non-production mode only. TODO: add production-safe recovery flow.</p>
          ) : (
            <p className="helper-text">Recovery action is disabled in production mode.</p>
          )}
        </article>
      </section>

      {isDeveloperMode ? (
        <section className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{copy.toolsTitle}</h2>
              <p className="helper-text">{copy.toolsBody}</p>
            </div>
            <span className="summary-pill">Developer mode</span>
          </div>
          <div className="inline-action-row">
            <form action={resetLocalRuntimeDataAction}>
              <button type="submit" className="button-secondary">Reset runtime data</button>
            </form>
            <form action={resetLocalUsersAndCredentialsAction}>
              <button type="submit" className="button-secondary">Reset users/admin credentials</button>
            </form>
            <form action={launchDemoModeAction}>
              <button type="submit" className="button-secondary">Reload demo data</button>
            </form>
          </div>
          <p className="inline-warning">These actions are destructive and intended only for local development and testing.</p>
        </section>
      ) : null}

      <section className="panel page-stack">
        <h2>Learn / help / documentation</h2>
        <p>Quick links for first-time orientation and pilot flow context.</p>
        <ul className="stack-list">
          <li><Link href="https://github.com/sigilabcodex/SKOSS#readme" target="_blank">README overview</Link></li>
          <li><Link href="https://github.com/sigilabcodex/SKOSS/blob/main/docs/first-deploy-rehearsal.md" target="_blank">First deploy rehearsal checklist</Link></li>
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
