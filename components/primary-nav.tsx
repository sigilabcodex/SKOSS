'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/i18n-provider';
import {
  CustomersIcon,
  HandoffIcon,
  HomeIcon,
  OrdersIcon,
  ProductionIcon,
  SetupIcon,
  TimelineIcon,
} from '@/components/ui-icons';
import type { WorkspaceSurface } from '@/lib/domain/types';

type NavHref =
  | '/'
  | '/timeline'
  | '/orders'
  | '/customers'
  | '/production'
  | '/handoff'
  | '/setup';

type NavItem = {
  key: WorkspaceSurface;
  href: NavHref;
  labelKey: string;
  icon: typeof HomeIcon;
  active: (pathname: string) => boolean;
};

type DesktopAdminItem = {
  href:
    | NavHref
    | {
        pathname: '/setup';
        query: { section: string };
        hash: string;
      };
  section?: string;
  labelKey: string;
  active: (pathname: string, section?: string | null) => boolean;
};

function NavLink({
  href,
  label,
  active,
  children,
  compact = false,
}: {
  href:
    | NavHref
    | {
        pathname: '/setup';
        query: { section: string };
        hash: string;
      };
  label: string;
  active: boolean;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`shell-nav-link ${compact ? 'is-compact' : ''} ${active ? 'is-active' : ''}`}
      aria-current={active ? 'page' : undefined}
    >
      {children}
      <span className="nav-label">{label}</span>
    </Link>
  );
}

const navItems: NavItem[] = [
  {
    key: 'home',
    href: '/',
    labelKey: 'nav.home',
    icon: HomeIcon,
    active: (pathname) => pathname === '/',
  },
  {
    key: 'timeline',
    href: '/timeline',
    labelKey: 'nav.timeline',
    icon: TimelineIcon,
    active: (pathname) => pathname.startsWith('/timeline'),
  },
  {
    key: 'orders',
    href: '/orders',
    labelKey: 'nav.orders',
    icon: OrdersIcon,
    active: (pathname) => pathname.startsWith('/orders'),
  },
  {
    key: 'customers',
    href: '/customers',
    labelKey: 'nav.customers',
    icon: CustomersIcon,
    active: (pathname) => pathname.startsWith('/customers'),
  },
  {
    key: 'production',
    href: '/production',
    labelKey: 'nav.production',
    icon: ProductionIcon,
    active: (pathname) => pathname.startsWith('/production'),
  },
  {
    key: 'handoff',
    href: '/handoff',
    labelKey: 'nav.handoff',
    icon: HandoffIcon,
    active: (pathname) => pathname.startsWith('/handoff'),
  },
  {
    key: 'setup',
    href: '/setup',
    labelKey: 'nav.setup',
    icon: SetupIcon,
    active: (pathname) => pathname.startsWith('/setup'),
  },
];

const desktopAdminItems: DesktopAdminItem[] = [
  {
    href: '/customers',
    labelKey: 'nav.customers',
    active: (pathname) => pathname.startsWith('/customers'),
  },
  {
    href: { pathname: '/setup', query: { section: 'users' }, hash: 'users' },
    section: 'users',
    labelKey: 'setup.sections.users',
    active: (pathname, section) => pathname.startsWith('/setup') && section === 'users',
  },
  {
    href: {
      pathname: '/setup',
      query: { section: 'suppliers' },
      hash: 'suppliers',
    },
    section: 'suppliers',
    labelKey: 'setup.sections.suppliers',
    active: (pathname, section) => pathname.startsWith('/setup') && section === 'suppliers',
  },
  {
    href: {
      pathname: '/setup',
      query: { section: 'raw-materials' },
      hash: 'raw-materials',
    },
    section: 'raw-materials',
    labelKey: 'setup.sections.rawMaterials',
    active: (pathname, section) => pathname.startsWith('/setup') && section === 'raw-materials',
  },
  {
    href: {
      pathname: '/setup',
      query: { section: 'recipes' },
      hash: 'recipes',
    },
    section: 'recipes',
    labelKey: 'setup.sections.recipes',
    active: (pathname, section) => pathname.startsWith('/setup') && section === 'recipes',
  },
  {
    href: {
      pathname: '/setup',
      query: { section: 'preferences-system' },
      hash: 'preferences-system',
    },
    section: 'preferences-system',
    labelKey: 'setup.sections.preferencesSystem',
    active: (pathname, section) =>
      pathname.startsWith('/setup') && section === 'preferences-system',
  },
  {
    href: '/setup',
    labelKey: 'nav.setup',
    active: (pathname, section) => pathname.startsWith('/setup') && !section,
  },
];

export function PrimaryNav({
  visibleWorkspaces,
  mode = 'mobile',
}: {
  visibleWorkspaces: WorkspaceSurface[];
  mode?: 'mobile' | 'desktop';
}) {
  const pathname = usePathname();
  const setupSection =
    typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('section');
  const { t } = useI18n();
  const items = navItems.filter((item) => visibleWorkspaces.includes(item.key));
  const showAdminSection = visibleWorkspaces.includes('setup');

  if (mode === 'mobile') {
    return (
      <nav className="shell-nav" aria-label={t('common.primaryNav')}>
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink key={item.key} href={item.href} label={t(item.labelKey)} active={item.active(pathname)}>
              <Icon className="nav-icon" />
            </NavLink>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="shell-sidebar-nav-stack">
      <nav className="shell-nav shell-nav-desktop" aria-label={t('common.primaryNav')}>
        <p className="shell-nav-section-label">{t('shell.sections.operational')}</p>
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink key={item.key} href={item.href} label={t(item.labelKey)} active={item.active(pathname)}>
              <Icon className="nav-icon" />
            </NavLink>
          );
        })}
      </nav>
      {showAdminSection ? (
        <nav className="shell-nav shell-nav-desktop shell-nav-admin" aria-label={t('shell.sections.admin')}>
          <p className="shell-nav-section-label">{t('shell.sections.admin')}</p>
          {desktopAdminItems.map((item) => (
            <NavLink
              key={`${item.href}-${item.labelKey}`}
              href={item.href}
              label={t(item.labelKey)}
              active={item.active(pathname, setupSection)}
              compact
            />
          ))}
        </nav>
      ) : null}
    </div>
  );
}
