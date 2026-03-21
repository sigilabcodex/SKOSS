import type { Route } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';

type NavItem = {
  href: Route;
  label: string;
};

const navItems: NavItem[] = [
  { href: '/' as Route, label: 'Home' },
  { href: '/orders' as Route, label: 'Orders' },
  { href: '/production' as Route, label: 'Production' },
  { href: '/handoff' as Route, label: 'WIP / Handoff' },
  { href: '/setup' as Route, label: 'Setup' },
];

export function AppShell({ children }: { children?: ReactNode }) {
  return (
    <div className="shell">
      <header className="shell-header">
        <div className="brand-block">
          <strong>SKOSS</strong>
          <span>Operator-first kitchen workflow</span>
        </div>
        <nav className="shell-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="shell-main">{children}</main>
    </div>
  );
}
