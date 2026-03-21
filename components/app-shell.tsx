import type { ReactNode } from 'react';
import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/orders', label: 'Orders' },
  { href: '/production', label: 'Production' },
  { href: '/handoff', label: 'Handoff' },
  { href: '/setup', label: 'Setup' },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <header className="shell-header">
        <div className="brand-block">
          <strong>SKOSS</strong>
          <span>Small Kitchen Operations and Services System</span>
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
