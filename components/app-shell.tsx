import type { ReactNode } from 'react';
import { PrimaryNav } from '@/components/primary-nav';
import { ThemeSwitcher } from '@/components/theme-switcher';

export function AppShell({ children }: { children?: ReactNode }) {
  return (
    <div className="shell">
      <header className="shell-header">
        <div className="brand-block">
          <span className="eyebrow no-margin">SKOSS operations</span>
          <strong>Operator-first kitchen workflow</strong>
          <span>Orders, production, WIP, and handoff with clearer daily focus.</span>
        </div>
        <div className="shell-controls">
          <ThemeSwitcher />
          <PrimaryNav />
        </div>
      </header>
      <main className="shell-main">{children}</main>
    </div>
  );
}
