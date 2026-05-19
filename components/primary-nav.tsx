'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/i18n-provider';
import { adminPlaneNavItems, operatorWorkspaceRoutes, type AppPlaneRoute, type OperatorWorkspaceSurface } from '@/lib/application-planes';
import {
  CustomersIcon,
  HandoffIcon,
  HomeIcon,
  OrdersIcon,
  ProductionIcon,
  TimelineIcon,
} from '@/components/ui-icons';
import type { WorkspaceSurface } from '@/lib/domain/types';

type NavItem = {
  key: OperatorWorkspaceSurface;
  href: AppPlaneRoute;
  labelKey: string;
  icon: typeof HomeIcon;
  active: (pathname: string) => boolean;
};

function NavLink({
  href,
  label,
  active,
  children,
  compact = false,
}: {
  href: AppPlaneRoute;
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
    href: operatorWorkspaceRoutes.home,
    labelKey: 'nav.home',
    icon: HomeIcon,
    active: (pathname) => pathname === '/',
  },
  {
    key: 'timeline',
    href: operatorWorkspaceRoutes.timeline,
    labelKey: 'nav.timeline',
    icon: TimelineIcon,
    active: (pathname) => pathname.startsWith('/timeline'),
  },
  {
    key: 'orders',
    href: operatorWorkspaceRoutes.orders,
    labelKey: 'nav.orders',
    icon: OrdersIcon,
    active: (pathname) => pathname.startsWith('/orders'),
  },
  {
    key: 'customers',
    href: operatorWorkspaceRoutes.customers,
    labelKey: 'nav.customers',
    icon: CustomersIcon,
    active: (pathname) => pathname.startsWith('/customers'),
  },
  {
    key: 'production',
    href: operatorWorkspaceRoutes.production,
    labelKey: 'nav.production',
    icon: ProductionIcon,
    active: (pathname) => pathname.startsWith('/production'),
  },
  {
    key: 'handoff',
    href: operatorWorkspaceRoutes.handoff,
    labelKey: 'nav.handoff',
    icon: HandoffIcon,
    active: (pathname) => pathname.startsWith('/handoff'),
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
  const { t } = useI18n();
  const items = navItems.filter((item) => visibleWorkspaces.includes(item.key));
  const showAdminSection = visibleWorkspaces.includes('admin');

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
          {adminPlaneNavItems.map((item) => (
            <NavLink
              key={`${item.href}-${item.labelKey}`}
              href={item.href}
              label={t(item.labelKey)}
              active={item.active(pathname)}
              compact
            />
          ))}
        </nav>
      ) : null}
    </div>
  );
}
