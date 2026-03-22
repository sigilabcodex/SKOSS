import Link from 'next/link';
import { formatDateLabel } from '@/lib/domain/formatters';
import { getWorkspaceSummary } from '@/lib/server/demo-data';
import { ArrowRightIcon, HandoffIcon, OrdersIcon, ProductionIcon, SetupIcon, SparklesIcon } from '@/components/ui-icons';

type QuickLink = {
  href: Parameters<typeof Link>[0]['href'];
  title: string;
  description: string;
  icon: typeof OrdersIcon;
};

const quickLinks: QuickLink[] = [
  {
    href: '/orders',
    title: 'Order intake + list',
    description: 'Capture demand with recurring templates, draft customers, draft items, and quick edits.',
    icon: OrdersIcon,
  },
  {
    href: '/production',
    title: 'Production board',
    description: 'See required vs completed demand, line progress, and late changes in one board.',
    icon: ProductionIcon,
  },
  {
    href: '/handoff',
    title: 'WIP + handoff',
    description: 'Record prep state, shift notes, and what the next shift needs to know.',
    icon: HandoffIcon,
  },
  {
    href: '/setup',
    title: 'Light setup',
    description: 'Review the minimal structure that supports the operational slice.',
    icon: SetupIcon,
  },
];

export default async function HomePage() {
  const summary = await getWorkspaceSummary();

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-header">
          <div>
            <p className="eyebrow">First operational slice</p>
            <h1>{summary.workspace.name}</h1>
            <p className="lede">
              SKOSS now covers a practical kitchen loop: order intake, recurring generation, grouped production,
              partial completion, WIP handoff, and a lightweight operational data layer for fulfillment and buying memory.
            </p>
          </div>
          <div className="hero-note">
            <SparklesIcon className="callout-icon" />
            <div>
              <strong>Focus date</strong>
              <p className="helper-text no-margin">{formatDateLabel(summary.focusDate)} is the current shared operational view.</p>
            </div>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Orders today</span>
            <strong>{summary.ordersToday}</strong>
            <span>orders on {formatDateLabel(summary.focusDate)}</span>
          </div>
          <div className="stat-card stat-card-warn">
            <span className="stat-label">Kitchen attention</span>
            <strong>{summary.changedOrders}</strong>
            <span>orders marked changed or edited from the recurring baseline</span>
          </div>
          <div className="stat-card stat-card-success">
            <span className="stat-label">Ready WIP</span>
            <strong>{summary.readyWip}</strong>
            <span>WIP entries already ready for the next shift</span>
          </div>
          <div className="stat-card stat-card-info">
            <span className="stat-label">Recurring templates</span>
            <strong>{summary.recurringTemplates}</strong>
            <span>active recurring templates feeding the next demand</span>
          </div>
          <div className="stat-card stat-card-neutral">
            <span className="stat-label">Partial orders</span>
            <strong>{summary.partialOrders}</strong>
            <span>orders already partially completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Supplier prices</span>
            <strong>{summary.procurementPrices}</strong>
            <span>{summary.suppliers} suppliers · {summary.rawMaterials} raw materials in the new ops layer</span>
          </div>
        </div>
      </section>

      <section className="grid-cards">
        {quickLinks.map((link) => {
          const Icon = link.icon;

          return (
            <Link key={String(link.href)} href={link.href} className="panel-link">
              <div className="panel-link-header">
                <div className="panel-link-icon-wrap">
                  <Icon className="panel-link-icon" />
                </div>
                <ArrowRightIcon className="panel-link-arrow" />
              </div>
              <h2>{link.title}</h2>
              <p>{link.description}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
