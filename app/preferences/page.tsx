import Link from 'next/link';
import { redirect } from 'next/navigation';
import { saveUserPreferencesAction } from '@/lib/server/actions';
import { getServerTranslator } from '@/lib/i18n/server';
import { getCurrentUserContext } from '@/lib/server/auth';

import { themeOptions } from '@/lib/theme';
const workspaceOptions = ['orders', 'production', 'handoff', 'preferences', 'setup'] as const;

export default async function PreferencesPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; saved?: string }>;
}) {
  const [{ t }, { currentUser }] = await Promise.all([getServerTranslator(), getCurrentUserContext()]);
  const params = await searchParams;

  if (!currentUser) {
    redirect('/login');
  }

  return (
    <div className="page-stack">
      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">{t('preferences.workspace')}</p>
          <h1>{t('preferences.title')}</h1>
          <p>{t('preferences.description')}</p>
        </div>
      </section>

      {params?.saved === 'preferences' ? <p className="inline-success">{t('preferences.saved')}</p> : null}
      {params?.error ? <p className="inline-warning">{params.error}</p> : null}

      <section className="grid-two">
        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('preferences.currentUserTitle')}</h2>
              <p>{t('preferences.currentUserHelp')}</p>
            </div>
            <span className="summary-pill">{t(`roles.${currentUser.role}.label`)}</span>
          </div>
          <ul className="stack-list compact-list">
            <li>
              <strong>{currentUser.displayName}</strong>
              <span>{currentUser.loginIdentifier}</span>
            </li>
            <li>
              <strong>{t('preferences.defaultWorkspace')}</strong>
              <span>{t(`nav.${currentUser.preferences?.defaultWorkspace ?? currentUser.defaultWorkspace}`)}</span>
            </li>
            <li>
              <strong>{t('preferences.settingsBoundaryTitle')}</strong>
              <span>{t('preferences.settingsBoundaryBody')}</span>
            </li>
          </ul>
          <Link href="/login" className="inline-link">{t('preferences.switchUser')}</Link>
        </article>

        <form action={saveUserPreferencesAction} className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('preferences.formTitle')}</h2>
              <p>{t('preferences.formHelp')}</p>
            </div>
            <span className="summary-pill">{t('nav.preferences')}</span>
          </div>
          <label>
            <span className="field-heading">{t('preferences.fields.language')} <span className="setup-required-mark" aria-hidden="true">*</span></span>
            <select name="locale" defaultValue={currentUser.preferences?.locale ?? 'en'}>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="pt">Português</option>
            </select>
          </label>
          <label>
            <span className="field-heading">{t('preferences.fields.theme')} <span className="setup-required-mark" aria-hidden="true">*</span></span>
            <select name="theme" defaultValue={currentUser.preferences?.theme ?? 'system'}>
              {themeOptions.map((option) => (
                <option key={option.name} value={option.name}>{t(`theme.${option.name}.label`)}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-heading">{t('preferences.fields.defaultWorkspace')} <span className="setup-required-mark" aria-hidden="true">*</span></span>
            <select name="defaultWorkspace" defaultValue={currentUser.preferences?.defaultWorkspace ?? currentUser.defaultWorkspace}>
              {workspaceOptions.map((workspace) => (
                <option key={workspace} value={workspace}>{t(`nav.${workspace}`)}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="button-primary">{t('preferences.saveAction')}</button>
        </form>
      </section>

      <section className="page-context-card">
        <div>
          <strong>{t('preferences.settingsBoundaryTitle')}</strong>
          <p className="helper-text no-margin">{t('preferences.settingsBoundaryBody')}</p>
        </div>
      </section>
    </div>
  );
}
