import Link from 'next/link';
import type { ReactNode } from 'react';
import { PrimaryNav } from '@/components/primary-nav';
import { ThemeSwitcher } from '@/components/theme-switcher';

export function AppShell({ children }: { children?: ReactNode }) {
  return (
    <div className="shell">
      <header className="shell-header">
        <Link href="/" className="brand-block" aria-label="SKOSS home">
          <span className="brand-kicker">SKOSS</span>
          <strong>Kitchen operations</strong>
        </Link>
        <div className="shell-controls">
          <PrimaryNav />
          <ThemeSwitcher />
        </div>
      </header>
      <main className="shell-main">{children}</main>
    </div>
  );
}
