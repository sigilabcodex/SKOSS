import Link from 'next/link';
import { logoutAction } from '@/lib/server/actions';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ChevronDownIcon, UserIcon } from '@/components/ui-icons';
import type { User } from '@/lib/domain/types';

type UserMenuProps = {
  currentUser?: User | null;
  t: (key: string, values?: Record<string, string | number>) => string;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function UserMenu({ currentUser, t }: UserMenuProps) {
  if (!currentUser) {
    return <Link href="/login" className="shell-inline-link">{t('shell.login')}</Link>;
  }

  const initials = getInitials(currentUser.displayName) || currentUser.displayName.slice(0, 1).toUpperCase();

  return (
    <details className="user-menu">
      <summary className="user-menu-trigger" aria-label={t('shell.userMenuAria')}>
        <span className="user-menu-avatar" aria-hidden="true">{initials}</span>
        <span className="user-menu-trigger-copy">
          <strong>{currentUser.displayName}</strong>
        </span>
        <ChevronDownIcon className="user-menu-chevron" />
      </summary>

      <div className="user-menu-panel">
        <section className="user-menu-section page-stack">
          <div className="user-menu-section-header">
            <p className="eyebrow">{t('shell.sessionSection')}</p>
            <p className="helper-text no-margin">{t('shell.sessionHelp')}</p>
          </div>

          <div className="user-menu-identity-card">
            <span className="user-menu-identity-icon">
              <UserIcon className="button-icon" />
            </span>
            <div>
              <strong>{currentUser.displayName}</strong>
              <span className="shell-user-meta">{t(`roles.${currentUser.role}.label`)}</span>
              <span className="helper-text">{currentUser.loginIdentifier}</span>
            </div>
          </div>

          <div className="user-menu-actions">
            <Link href="/login" className="shell-inline-link">{t('shell.switchUser')}</Link>
            <form action={logoutAction}>
              <button type="submit" className="shell-inline-button">{t('shell.logout')}</button>
            </form>
          </div>
        </section>

        <section className="user-menu-section page-stack">
          <div className="user-menu-section-header">
            <p className="eyebrow">{t('shell.preferencesSection')}</p>
            <p className="helper-text no-margin">{t('shell.preferencesHelp')}</p>
          </div>

          <LanguageSwitcher />
          <ThemeSwitcher variant="menu" />

          <Link href="/preferences" className="inline-link">{t('shell.openPreferences')}</Link>
        </section>
      </div>
    </details>
  );
}
