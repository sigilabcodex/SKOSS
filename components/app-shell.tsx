import type { ReactNode } from 'react';
import Link from 'next/link';

type NavItem = {
  href: Parameters<typeof Link>[0]['href'];
  label: string;
};

const navItems: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/orders', label: 'Orders' },
  { href: '/production', label: 'Production' },
  { href: '/handoff', label: 'WIP / Handoff' },
  { href: '/setup', label: 'Setup' },
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
            <Link key={String(item.href)} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="shell-main">{children}</main>
    </div>
  );
}
