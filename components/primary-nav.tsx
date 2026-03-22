'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/i18n-provider';
import {
  HandoffIcon,
  HomeIcon,
  OrdersIcon,
  PreferencesIcon,
  ProductionIcon,
  SetupIcon,
} from '@/components/ui-icons';
import type { WorkspaceSurface } from '@/lib/domain/types';

type NavHref = '/' | '/orders' | '/production' | '/handoff' | '/preferences' | '/setup';

type NavItem = {
  key: WorkspaceSurface;
  href: NavHref;
  labelKey: string;
  icon: typeof HomeIcon;
  active: (pathname: string) => boolean;
};

function NavLink({ href, label, active, children }: { href: NavHref; label: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`shell-nav-link ${active ? 'is-active' : ''}`}
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
    key: 'orders',
    href: '/orders',
    labelKey: 'nav.orders',
    icon: OrdersIcon,
    active: (pathname) => pathname.startsWith('/orders'),
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
    key: 'preferences',
    href: '/preferences',
    labelKey: 'nav.preferences',
    icon: PreferencesIcon,
    active: (pathname) => pathname.startsWith('/preferences'),
  },
  {
    key: 'setup',
    href: '/setup',
    labelKey: 'nav.setup',
    icon: SetupIcon,
    active: (pathname) => pathname.startsWith('/setup'),
  },
];

export function PrimaryNav({ visibleWorkspaces }: { visibleWorkspaces: WorkspaceSurface[] }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const items = navItems.filter((item) => visibleWorkspaces.includes(item.key));

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
