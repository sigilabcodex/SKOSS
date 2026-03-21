import type { Route } from 'next';
import Link from 'next/link';
import { getWorkspaceSummary } from '@/lib/server/demo-data';

const quickLinks = [
  {
    href: '/orders',
    title: 'Sales workspace',
    description: 'Capture ad hoc and recurring demand without blocking on full setup.',
  },
  {
    href: '/production',
    title: 'Kitchen workspace',
    description: 'Review grouped demand, WIP, and changed items for the production day.',
  },
  {
    href: '/handoff',
    title: 'Shift handoff',
    description: 'See open items, WIP, and cross-shift notes before the next push of work.',
  },
  {
    href: '/setup',
    title: 'Setup workspace',
    description: 'Keep products, destinations, recurring templates, and users lightweight.',
  },
] satisfies ReadonlyArray<{
  href: Route;
  title: string;
  description: string;
}>;

export default function HomePage() {
  const summary = getWorkspaceSummary();

  return (
    <div className="page-stack">
      <section className="hero-card">
        <p className="eyebrow">v0 convergence foundation</p>
        <h1>{summary.workspace.name}</h1>
        <p className="lede">
          SKOSS v0 is converging on one boring, portable path: a single mobile-first web app
          for order intake, production review, WIP, and handoff.
        </p>
        <div className="stats-grid">
          <div>
            <strong>{summary.ordersToday}</strong>
            <span>orders for the production day</span>
          </div>
          <div>
            <strong>{summary.changedOrders}</strong>
            <span>changed orders needing visibility</span>
          </div>
          <div>
            <strong>{summary.readyWip}</strong>
            <span>WIP entries already ready</span>
          </div>
        </div>
      </section>

      <section className="grid-cards">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href} className="panel-link">
            <h2>{link.title}</h2>
            <p>{link.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
