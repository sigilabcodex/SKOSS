import Link from 'next/link';
import { formatDateLabel, formatLineProgressLabel, formatStatusLabel, formatTemplateScheduleLabel } from '@/lib/domain/formatters';
import { getOrderProgress, getOrdersWorkspace } from '@/lib/server/demo-data';
import { ArrowRightIcon, CheckIcon, OrdersIcon, SparklesIcon } from '@/components/ui-icons';

function OrderCard({
  order,
}: {
  key?: string;
  order: Awaited<ReturnType<typeof getOrdersWorkspace>>['orders'][number];
}) {
  const progress = getOrderProgress(order);

  return (
    <article className={`order-card ${progress.partialLines > 0 ? 'order-card-partial' : ''}`}>
      <div className="order-card-header">
        <div>
          <strong>{order.customerLabel}</strong>
          <p>{order.destinationLabel ?? 'Destination still open'}</p>
        </div>
        <div className="page-stack compact-badge-stack align-end">
          <span className={`badge badge-${order.status}`}>{formatStatusLabel(order.status)}</span>
          {order.generatedFromTemplate ? <span className="badge badge-generated">recurring</span> : <span className="badge badge-manual">manual</span>}
          {order.visibleOnProductionBoard === false ? <span className="badge badge-neutral">hidden from board</span> : null}
          {order.changedInKitchen || order.templateEdited ? <span className="badge badge-changed">kitchen attention</span> : null}
          {progress.partialLines > 0 ? <span className="badge badge-in_progress">partial work</span> : null}
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
          <span className="field-label">Completion</span>
          <strong>{progress.completedQuantity}/{progress.requiredQuantity || 0} ready</strong>
        </div>
        <div>
          <span className="field-label">Notes</span>
          <strong>{order.notes ? 'Has notes' : 'Clear'}</strong>
        </div>
      </div>
      <ul className="mini-line-list">
        {order.lines.map((line) => (
          <li key={line.id}>
            <span>{formatLineProgressLabel(line)}</span>
            <strong>{line.productLabel}</strong>
          </li>
        ))}
      </ul>
      <Link href={`/orders/${order.id}`} className="button-secondary">
        <span>Open order</span>
        <ArrowRightIcon className="button-icon" />
      </Link>
    </article>
  );
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const [view, params] = await Promise.all([getOrdersWorkspace(), searchParams]);

  return (
    <div className="page-stack">
      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">Sales workspace</p>
          <h1>Orders</h1>
          <p>
            Manual orders, generated recurring orders, partial completion, and kitchen-visible changes
            all stay in one touch-friendly list.
          </p>
        </div>
        <div className="action-cluster">
          <Link href="/orders/templates/new" className="button-secondary">
            <SparklesIcon className="button-icon" />
            <span>New recurring template</span>
          </Link>
          <Link href="/orders/new" className="button-primary">
            <OrdersIcon className="button-icon" />
            <span>New order</span>
          </Link>
        </div>
      </section>

      {params?.saved === 'template' ? (
        <p className="inline-success">
          <CheckIcon className="button-icon" />
          Recurring template saved. Upcoming orders will generate automatically.
        </p>
      ) : null}

      <section className="panel page-stack">
        <div className="table-header-row">
          <div>
            <strong>Recurring demand</strong>
            <p>Keep the next repeated work visible without adding a scheduling engine.</p>
          </div>
          <span className="summary-pill">{view.recurringTemplates.length} templates</span>
        </div>
        <div className="card-grid recurring-grid">
          {view.recurringTemplates.map((template) => (
            <article key={template.id} className="subpanel page-stack">
              <div className="order-card-header">
                <div>
                  <strong>{template.customerLabel}</strong>
                  <p>{template.destinationLabel ?? 'Destination still open'}</p>
                </div>
                <span className="badge badge-generated">recurring</span>
              </div>
              <p>
                {formatTemplateScheduleLabel(template)} · next up {formatDateLabel(template.nextOccurrenceDate)}
              </p>
              <ul className="mini-line-list">
                {template.lines.map((line) => (
                  <li key={line.id}>
                    <span>
                      {line.quantity} {line.unit}
                    </span>
                    <strong>{line.productLabel}</strong>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {view.orderGroups.map((group) => (
        <section key={group.productionDate} className="panel page-stack">
          <div className="table-header-row">
            <div>
              <strong>{formatDateLabel(group.productionDate)}</strong>
              <p>
                {group.productionDate === view.focusDate
                  ? 'Current production focus.'
                  : 'Saved orders grouped by production day.'}
              </p>
            </div>
            <span className="summary-pill">{group.orders.length} orders</span>
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
