'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
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

  const isHome = pathname === '/';
  const isOrders = pathname.startsWith('/orders');
  const isProduction = pathname.startsWith('/production');
  const isHandoff = pathname.startsWith('/handoff');
  const isSetup = pathname.startsWith('/setup');

  return (
    <nav className="shell-nav" aria-label="Primary">
      <NavLink href="/" label="Home" active={isHome}>
        <HomeIcon className="nav-icon" />
      </NavLink>
      <NavLink href="/orders" label="Orders" active={isOrders}>
        <OrdersIcon className="nav-icon" />
      </NavLink>
      <NavLink href="/production" label="Production" active={isProduction}>
        <ProductionIcon className="nav-icon" />
      </NavLink>
      <NavLink href="/handoff" label="WIP / Handoff" active={isHandoff}>
        <HandoffIcon className="nav-icon" />
      </NavLink>
      <NavLink href="/setup" label="Setup" active={isSetup}>
        <SetupIcon className="nav-icon" />
      </NavLink>
    </nav>
  );
}
