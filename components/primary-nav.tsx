'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/i18n-provider';
import { HandoffIcon, HomeIcon, OrdersIcon, ProductionIcon, SetupIcon } from '@/components/ui-icons';

function NavLink({ href, label, active, children }: { href: '/' | '/orders' | '/production' | '/handoff' | '/setup'; label: string; active: boolean; children: ReactNode }) {
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

export function PrimaryNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const isHome = pathname === '/';
  const isOrders = pathname.startsWith('/orders');
  const isProduction = pathname.startsWith('/production');
  const isHandoff = pathname.startsWith('/handoff');
  const isSetup = pathname.startsWith('/setup');

  return (
    <nav className="shell-nav" aria-label={t('common.primaryNav')}>
      <NavLink href="/" label={t('nav.home')} active={isHome}>
        <HomeIcon className="nav-icon" />
      </NavLink>
      <NavLink href="/orders" label={t('nav.orders')} active={isOrders}>
        <OrdersIcon className="nav-icon" />
      </NavLink>
      <NavLink href="/production" label={t('nav.production')} active={isProduction}>
        <ProductionIcon className="nav-icon" />
      </NavLink>
      <NavLink href="/handoff" label={t('nav.handoff')} active={isHandoff}>
        <HandoffIcon className="nav-icon" />
      </NavLink>
      <NavLink href="/setup" label={t('nav.setup')} active={isSetup}>
        <SetupIcon className="nav-icon" />
      </NavLink>
    </nav>
  );
}
