import { loginAction } from '@/lib/server/actions';
import { getServerTranslator } from '@/lib/i18n/server';
import { readStore } from '@/lib/server/store';

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; redirectTo?: string }>;
}) {
  const [{ t }, data, params] = await Promise.all([getServerTranslator(), readStore(), searchParams]);
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
        <p className="helper-text">{t('login.demoPasswordHint')}</p>
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label>
          <span className="field-heading">{t('login.fields.loginIdentifier')} <span className="setup-required-mark" aria-hidden="true">*</span></span>
          <input name="loginIdentifier" list="login-user-options" placeholder="lucia@example.com" required />
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
      </form>
    </div>
  );
}
