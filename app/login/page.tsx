import { loginAction } from '@/lib/server/actions';
import { getServerTranslator } from '@/lib/i18n/server';
import { readStore } from '@/lib/server/store';
import { detectInstanceGatewayState } from '@/lib/server/instance-entry';
import Link from 'next/link';

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; redirectTo?: string }>;
}) {
  const [{ t }, data, params] = await Promise.all([getServerTranslator(), readStore(), searchParams]);
  const gatewayState = await detectInstanceGatewayState(data);
  const activeUsers = data.users.filter((user) => user.active);
  const redirectTo = params?.redirectTo ?? '/';

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-header">
          <div>
            <p className="eyebrow">{t('login.eyebrow')}</p>
            <h1>{t('login.title')}</h1>
            <p className="lede">{t('login.description')}</p>
          </div>
        </div>
      </section>

      {params?.error ? <p className="inline-warning">{params.error}</p> : null}

      <form action={loginAction} className="panel page-stack">
        <div className="table-header-row">
          <div>
            <h2>{t('login.manualTitle')}</h2>
            <p>{t('login.manualHelp')}</p>
          </div>
          <span className="summary-pill">{activeUsers.length} {t('common.users')}</span>
        </div>
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label>
          <span className="field-heading">{t('login.fields.loginIdentifier')} <span className="setup-required-mark" aria-hidden="true">*</span></span>
          <input name="loginIdentifier" list="login-user-options" placeholder="owner" required />
        </label>
        <label>
          <span className="field-heading">{t('login.fields.password')} <span className="setup-required-mark" aria-hidden="true">*</span></span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <datalist id="login-user-options">
          {activeUsers.map((user) => (
            <option key={user.id} value={user.loginIdentifier}>{user.displayName}</option>
          ))}
        </datalist>
        <button type="submit" className="button-primary">{t('login.submit')}</button>
        <p className="helper-text no-margin">
          Need a different path? <Link href="/entry" className="inline-link">Back to entry gateway</Link> for new setup, restore, or demo mode.
        </p>
        {gatewayState.canRunBootstrap ? (
          <p className="helper-text no-margin">
            Need to initialize this instance first? <Link href="/bootstrap?step=1" className="inline-link">Run first-use wizard</Link>
          </p>
        ) : null}
      </form>
    </div>
  );
}
