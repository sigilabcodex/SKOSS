import Link from 'next/link';
import { formatDateLabel } from '@/lib/domain/formatters';
import { getWorkspaceSummary } from '@/lib/server/demo-data';

type QuickLink = {
  href: Parameters<typeof Link>[0]['href'];
  title: string;
  description: string;
};

const quickLinks: QuickLink[] = [
  {
    href: '/orders',
    title: 'Order intake + list',
    description: 'Capture demand with draft customers, draft items, and quick edits.',
  },
  {
    href: '/production',
    title: 'Production board',
    description: 'See grouped demand by production day, item, and late changes.',
  },
  {
    href: '/handoff',
    title: 'WIP + handoff',
    description: 'Record prep state, shift notes, and what the next shift needs to know.',
  },
  {
    href: '/setup',
    title: 'Light setup',
    description: 'Review the minimal structure that supports the operational slice.',
  },
];

export default async function HomePage() {
  const summary = await getWorkspaceSummary();

  return (
    <div className="page-stack">
      <section className="hero-card">
        <p className="eyebrow">First operational slice</p>
        <h1>{summary.workspace.name}</h1>
        <p className="lede">
          SKOSS now runs the first real loop: order intake, visible orders, grouped production, and
          WIP handoff for a Kalali-style bakery rhythm.
        </p>
        <div className="stats-grid">
          <div>
            <strong>{summary.ordersToday}</strong>
            <span>orders on {formatDateLabel(summary.focusDate)}</span>
          </div>
          <div>
            <strong>{summary.changedOrders}</strong>
            <span>orders marked changed for kitchen visibility</span>
          </div>
          <div>
            <strong>{summary.readyWip}</strong>
            <span>WIP entries already ready for the next shift</span>
          </div>
        </div>
      </section>

      <section className="grid-cards">
        {quickLinks.map((link) => (
          <Link key={String(link.href)} href={link.href} className="panel-link">
            <h2>{link.title}</h2>
            <p>{link.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
