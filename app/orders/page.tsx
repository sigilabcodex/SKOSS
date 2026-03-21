import Link from 'next/link';
import { formatDateLabel, formatStatusLabel } from '@/lib/domain/formatters';
import { getOrdersWorkspace } from '@/lib/server/demo-data';

function OrderCard({
  order,
}: {
  key?: string;
  order: Awaited<ReturnType<typeof getOrdersWorkspace>>['todayOrders'][number];
}) {
  return (
    <article className="order-card">
      <div className="order-card-header">
        <div>
          <strong>{order.customerLabel}</strong>
          <p>{order.destinationLabel ?? 'Destination still open'}</p>
        </div>
        <span className={`badge badge-${order.status}`}>{formatStatusLabel(order.status)}</span>
      </div>
      <div className="order-meta-grid">
        <div>
          <span className="field-label">Source</span>
          <strong>{formatStatusLabel(order.source)}</strong>
        </div>
        <div>
          <span className="field-label">Production</span>
          <strong>{formatDateLabel(order.productionDate)}</strong>
        </div>
        <div>
          <span className="field-label">Contact</span>
          <strong>{order.customerPhone ?? 'Not captured'}</strong>
        </div>
        <div>
          <span className="field-label">Notes</span>
          <strong>{order.notes ? 'Has notes' : 'Clear'}</strong>
        </div>
      </div>
      <ul className="mini-line-list">
        {order.lines.map((line) => (
          <li key={line.id}>
            <span>
              {line.quantity} {line.unit}
            </span>
            <strong>{line.productLabel}</strong>
          </li>
        ))}
      </ul>
      <Link href={`/orders/${order.id}`} className="button-secondary">
        Open order
      </Link>
    </article>
  );
}

export default async function OrdersPage() {
  const view = await getOrdersWorkspace();

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <p className="eyebrow">Sales workspace</p>
          <h1>Orders</h1>
          <p>
            Orders stay workable before setup is perfect. Draft customers, freeform items, and late
            edits are all visible.
          </p>
        </div>
        <Link href="/orders/new" className="button-primary">
          New order
        </Link>
      </section>

      <section className="panel">
        <div className="table-header-row">
          <div>
            <strong>Today</strong>
            <p>{formatDateLabel(view.focusDate)} production focus</p>
          </div>
          <span>{view.todayOrders.length} orders</span>
        </div>
        <div className="card-grid">
          {view.todayOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="table-header-row">
          <div>
            <strong>Upcoming</strong>
            <p>Next production days already visible without switching tools.</p>
          </div>
          <span>{view.upcomingOrders.length} orders</span>
        </div>
        <div className="card-grid">
          {view.upcomingOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </section>
    </div>
  );
}
