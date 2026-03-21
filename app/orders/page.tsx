import Link from 'next/link';
import { formatDateLabel, formatStatusLabel } from '@/lib/domain/formatters';
import { getOrdersWorkspace } from '@/lib/server/demo-data';

function OrderCard({
  order,
}: {
  key?: string;
  order: Awaited<ReturnType<typeof getOrdersWorkspace>>['orders'][number];
}) {
  return (
    <article className="order-card">
      <div className="order-card-header">
        <div>
          <strong>{order.customerLabel}</strong>
          <p>{order.destinationLabel ?? 'Destination still open'}</p>
        </div>
        <div className="page-stack">
          <span className={`badge badge-${order.status}`}>{formatStatusLabel(order.status)}</span>
          {order.visibleOnProductionBoard === false ? <span className="badge">hidden from board</span> : null}
          {order.changedInKitchen ? <span className="badge badge-changed">kitchen attention</span> : null}
        </div>
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
            Saved orders are now the primary source here. Draft customers, freeform items, late edits,
            and board visibility all stay visible.
          </p>
        </div>
        <Link href="/orders/new" className="button-primary">
          New order
        </Link>
      </section>

      {view.orderGroups.map((group) => (
        <section key={group.productionDate} className="panel">
          <div className="table-header-row">
            <div>
              <strong>{formatDateLabel(group.productionDate)}</strong>
              <p>
                {group.productionDate === view.focusDate
                  ? 'Current production focus.'
                  : 'Saved orders grouped by production day.'}
              </p>
            </div>
            <span>{group.orders.length} orders</span>
          </div>
          <div className="card-grid">
            {group.orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
