import Link from 'next/link';
import { orders } from '@/data/demo-fixtures';
import { formatDateLabel } from '@/lib/domain/formatters';

export default function OrdersPage() {
  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <p className="eyebrow">Sales workspace</p>
          <h1>Orders</h1>
          <p>Upcoming demand stays visible even when customers or catalog items are still draft.</p>
        </div>
        <Link href="/orders/new" className="button-primary">
          New order
        </Link>
      </section>

      <section className="panel">
        <div className="table-header-row">
          <span>{orders.length} active examples</span>
          <span>Production date focus: 2026-03-28</span>
        </div>
        <div className="list-table">
          {orders.map((order) => (
            <article key={order.id} className="list-row">
              <div>
                <strong>{order.customerLabel}</strong>
                <p>{order.notes}</p>
              </div>
              <div>
                <span className={`badge badge-${order.status}`}>{order.status}</span>
                <p>{order.source}</p>
              </div>
              <div>
                <strong>{formatDateLabel(order.productionDate)}</strong>
                <p>{order.destinationLabel ?? 'No destination yet'}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
