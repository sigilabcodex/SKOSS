import Link from 'next/link';
import { formatDateLabel, formatLineProgressLabel, formatStatusLabel, formatTemplateScheduleLabel } from '@/lib/domain/formatters';
import { getOrderProgress, getOrdersWorkspace } from '@/lib/server/demo-data';
import { getServerTranslator } from '@/lib/i18n/server';
import { ArrowRightIcon, CheckIcon, OrdersIcon, SparklesIcon } from '@/components/ui-icons';

async function OrderCard({
  order,
}: {
  key?: string;
  order: Awaited<ReturnType<typeof getOrdersWorkspace>>['orders'][number];
}) {
  const progress = getOrderProgress(order);
  const { t, locale } = await getServerTranslator();

  return (
    <article className={`order-card ${progress.partialLines > 0 ? 'order-card-partial' : ''}`}>
      <div className="order-card-header">
        <div>
          <strong>{order.customerLabel}</strong>
          <p>{order.destinationLabel ?? t('common.destinationStillOpen')}</p>
        </div>
        <div className="page-stack compact-badge-stack align-end">
          <span className={`badge badge-${order.status}`}>{formatStatusLabel(order.status, t)}</span>
          {order.generatedFromTemplate ? <span className="badge badge-generated">{t('common.recurring')}</span> : <span className="badge badge-manual">{t('common.manual')}</span>}
          {order.visibleOnProductionBoard === false ? <span className="badge badge-neutral">{t('orders.hiddenFromBoard')}</span> : null}
          {order.changedInKitchen || order.templateEdited ? <span className="badge badge-changed">{t('common.kitchenAttention')}</span> : null}
          {progress.partialLines > 0 ? <span className="badge badge-in_progress">{t('common.partialWork')}</span> : null}
        </div>
      </div>
      <div className="order-meta-grid">
        <div>
          <span className="field-label">{t('orders.source')}</span>
          <strong>{formatStatusLabel(order.source, t)}</strong>
        </div>
        <div>
          <span className="field-label">{t('orders.fulfillment')}</span>
          <strong>{formatStatusLabel(order.fulfillmentType, t)}</strong>
        </div>
        <div>
          <span className="field-label">{t('orders.production')}</span>
          <strong>{formatDateLabel(order.productionDate, locale)}</strong>
        </div>
        <div>
          <span className="field-label">{t('orders.completion')}</span>
          <strong>{progress.completedQuantity}/{progress.requiredQuantity || 0} {t('common.ready').toLowerCase()}</strong>
        </div>
        <div>
          <span className="field-label">{t('orders.notes')}</span>
          <strong>{order.dispatchNotes || order.notes ? t('common.hasNotes') : t('common.clear')}</strong>
        </div>
      </div>
      {order.deliveryProvider || order.deliveryAssignee ? (
        <p className="helper-text no-margin">
          {order.deliveryProvider ? `${t('orders.provider')}: ${order.deliveryProvider}. ` : ''}
          {order.deliveryAssignee ? `${t('orders.assignee')}: ${order.deliveryAssignee}.` : ''}
        </p>
      ) : null}
      <ul className="mini-line-list">
        {order.lines.map((line) => (
          <li key={line.id}>
            <span>{formatLineProgressLabel(line)}</span>
            <strong>{line.productLabel}</strong>
          </li>
        ))}
      </ul>
      <Link href={`/orders/${order.id}`} className="button-secondary">
        <span>{t('common.openOrder')}</span>
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
  const [view, params, { t, locale }] = await Promise.all([getOrdersWorkspace(), searchParams, getServerTranslator()]);

  return (
    <div className="page-stack">
      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">{t('orders.workspace')}</p>
          <h1>{t('orders.title')}</h1>
          <p>{t('orders.description')}</p>
        </div>
        <div className="action-cluster">
          <Link href="/orders/templates/new" className="button-secondary">
            <SparklesIcon className="button-icon" />
            <span>{t('orders.newRecurringTemplate')}</span>
          </Link>
          <Link href="/orders/new" className="button-primary">
            <OrdersIcon className="button-icon" />
            <span>{t('orders.newOrder')}</span>
          </Link>
        </div>
      </section>

      {params?.saved === 'template' ? (
        <p className="inline-success">
          <CheckIcon className="button-icon" />
          {t('orders.recurringSaved')}
        </p>
      ) : null}

      <section className="panel page-stack">
        <div className="table-header-row">
          <div>
            <strong>{t('orders.recurringDemand')}</strong>
            <p>{t('orders.recurringDemandHelp')}</p>
          </div>
          <span className="summary-pill">{view.recurringTemplates.length} {t('common.templates')}</span>
        </div>
        <div className="card-grid recurring-grid">
          {view.recurringTemplates.map((template) => (
            <article key={template.id} className="subpanel page-stack">
              <div className="order-card-header">
                <div>
                  <strong>{template.customerLabel}</strong>
                  <p>{template.destinationLabel ?? t('common.destinationStillOpen')}</p>
                </div>
                <span className="badge badge-generated">{t('common.recurring')}</span>
              </div>
              <p>
                {formatTemplateScheduleLabel(template, t)} · {t('orders.nextUp')} {formatDateLabel(template.nextOccurrenceDate, locale)}
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
              <strong>{formatDateLabel(group.productionDate, locale)}</strong>
              <p>
                {group.productionDate === view.focusDate
                  ? t('orders.currentProductionFocus')
                  : t('orders.savedOrdersByDay')}
              </p>
            </div>
            <span className="summary-pill">{group.orders.length} {t('common.orders')}</span>
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
