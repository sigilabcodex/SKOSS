import Link from 'next/link';
import { formatDateLabel, formatLineProgressLabel, formatStatusLabel } from '@/lib/domain/formatters';
import { inferFulfillmentType, resolveDeliveryProviderLabel } from '@/lib/domain/order-helpers';
import { getOrderProgress, getOrdersWorkspace } from '@/lib/server/demo-data';
import { getServerTranslator } from '@/lib/i18n/server';
import { ArrowRightIcon, CheckIcon, OrdersIcon, SparklesIcon } from '@/components/ui-icons';

function getTranslatedProviderLabel(
  order: { deliveryProvider?: string; deliveryProviderLabel?: string },
  t: (key: string) => string,
) {
  const providerLabel = resolveDeliveryProviderLabel(order);

  if (!providerLabel) {
    return null;
  }

  if (order.deliveryProvider === 'other' && order.deliveryProviderLabel) {
    return order.deliveryProviderLabel;
  }

  return order.deliveryProvider ? t(`orders.providerOptions.${order.deliveryProvider}`) : providerLabel;
}

async function OrderCard({
  order,
  customers,
}: {
  key?: string;
  order: Awaited<ReturnType<typeof getOrdersWorkspace>>['orders'][number];
  customers: Awaited<ReturnType<typeof getOrdersWorkspace>>['customers'];
}) {
  const progress = getOrderProgress(order);
  const { t, locale } = await getServerTranslator();
  const providerLabel = getTranslatedProviderLabel(order, t);
  const linkedCustomer = order.customerId ? customers.find((customer) => customer.id === order.customerId) ?? null : null;

  return (
    <article className={`order-card ${progress.partialLines > 0 ? 'order-card-partial' : ''}`}>
      <div className="order-card-header">
        <div>
          <strong>{linkedCustomer ? (
            <Link href={`/customers?customer=${linkedCustomer.id}`} className="inline-link">
              {order.customerLabel}
            </Link>
          ) : order.customerLabel}</strong>
          <p>{order.destinationLabel ?? t('common.destinationStillOpen')}</p>
        </div>
        <div className="page-stack compact-badge-stack align-end">
          <span className={`badge badge-${order.status}`}>{formatStatusLabel(order.status, t)}</span>
          <span className={`badge badge-${order.fulfillmentType === 'pickup' ? 'ready' : order.fulfillmentType === 'app_delivery' ? 'in_progress' : 'active'}`}>
            {formatStatusLabel(order.fulfillmentType, t)}
          </span>
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
          <span className="field-label">{t('orders.promise')}</span>
          <strong>{order.promisedTime || t('common.clear')}</strong>
        </div>
        <div>
          <span className="field-label">{t('orders.notes')}</span>
          <strong>{order.dispatchNotes || order.notes ? t('common.hasNotes') : t('common.clear')}</strong>
        </div>
      </div>
      {providerLabel || order.deliveryAssignee || order.dispatchNotes ? (
        <div className="page-stack top-gap-small">
          {providerLabel || order.deliveryAssignee ? (
            <p className="helper-text no-margin">
              {providerLabel ? `${t('orders.provider')}: ${providerLabel}. ` : ''}
              {order.deliveryAssignee ? `${t('orders.assignee')}: ${order.deliveryAssignee}.` : ''}
            </p>
          ) : null}
          {order.dispatchNotes ? <p className="helper-text no-margin">{order.dispatchNotes}</p> : null}
        </div>
      ) : null}
      {linkedCustomer || order.customerPhone ? (
        <p className="helper-text no-margin">
          {linkedCustomer ? `${t('orders.customerMemory.linked')}: ${linkedCustomer.displayName}. ` : ''}
          {order.customerPhone ? `${t('orders.customerMemory.phone')}: ${order.customerPhone}. ` : ''}
          {linkedCustomer?.deliveryNote ? `${t('orders.customerMemory.deliveryNote')}: ${linkedCustomer.deliveryNote}` : ''}
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
          <Link href="/admin/setup?section=products#products" className="button-secondary">
            <span>Confirm products</span>
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
          {view.recurringTemplates.length === 0 ? (
            <p className="empty-state">No recurring templates yet. Start with one-time orders; recurring demand can be added after the daily flow is working.</p>
          ) : null}
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
                {formatStatusLabel(inferFulfillmentType(template.destinationLabel), t)} · {t('orders.nextUp')} {formatDateLabel(template.nextOccurrenceDate, locale)}
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

      {view.orderGroups.length === 0 ? (
        <section className="page-context-card">
          <OrdersIcon className="callout-icon" />
          <div>
            <strong>No orders yet</strong>
            <p className="helper-text no-margin">Create the first real order to make the production board and handoff views useful.</p>
            <div className="inline-action-row top-gap-small">
              <Link href="/orders/new" className="button-primary compact-button">Create first order</Link>
              <Link href="/customers" className="button-secondary compact-button">Confirm customers</Link>
              <Link href="/admin/setup?section=products#products" className="button-secondary compact-button">Confirm products</Link>
            </div>
          </div>
        </section>
      ) : null}

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
              <OrderCard key={order.id} order={order} customers={view.customers} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
