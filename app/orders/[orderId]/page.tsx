import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrderForm } from '@/components/orders/order-form';
import { SubmitButton } from '@/components/submit-button';
import { formatLineProgressLabel, formatStatusLabel } from '@/lib/domain/formatters';
import { resolveDeliveryProviderLabel } from '@/lib/domain/order-helpers';
import { updateOrderAction, updateOrderLineProgressAction } from '@/lib/server/actions';
import { getLineStatus, getOrderEditor, getOrderProgress } from '@/lib/server/demo-data';
import { getServerTranslator } from '@/lib/i18n/server';
import { ArrowRightIcon, CheckIcon, PrinterIcon } from '@/components/ui-icons';

export default async function EditOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams?: Promise<{ error?: string; saved?: string }>;
}) {
  const resolvedParams = await params;
  const [view, pageParams, { t }] = await Promise.all([
    getOrderEditor(resolvedParams.orderId),
    searchParams,
    getServerTranslator(),
  ]);

  if (!view.order) {
    notFound();
  }

  const order = view.order;
  const action = updateOrderAction.bind(null, order.id);
  const progress = getOrderProgress(order);
  const providerLabel = resolveDeliveryProviderLabel(order);
  const linkedCustomer = order.customerId
    ? view.customers.find((customer) => customer.id === order.customerId) ?? null
    : null;

  return (
    <div className="page-stack">
      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">{t('orders.workspace')}</p>
          <h1>{order.customerLabel}</h1>
          <p>
            {formatStatusLabel(order.fulfillmentType, t)} {t('orders.editPage.descriptionSeparator')} {t('orders.editPage.editDescription')}
          </p>
        </div>
        <div className="action-cluster compact-actions">
          <Link href={`/orders/${order.id}/print`} className="button-secondary" target="_blank" rel="noreferrer">
            <PrinterIcon className="button-icon" />
            <span>{t('printing.actions.orderTicket')}</span>
          </Link>
          <Link href={`/orders/${order.id}/label`} className="button-secondary" target="_blank" rel="noreferrer">
            <PrinterIcon className="button-icon" />
            <span>{t('printing.actions.simpleLabel')}</span>
          </Link>
          <Link href="/orders" className="button-secondary">
            <ArrowRightIcon className="button-icon button-icon-reverse" />
            <span>{t('common.backToOrders')}</span>
          </Link>
        </div>
      </section>

      {pageParams?.saved === '1' ? <p className="inline-success"><CheckIcon className="button-icon" />{t('orders.editPage.saved')}</p> : null}
      {pageParams?.saved === 'progress' ? <p className="inline-success"><CheckIcon className="button-icon" />{t('orders.editPage.progressSaved')}</p> : null}
      {pageParams?.error ? <p className="inline-warning">{pageParams.error}</p> : null}

      <section className="panel page-stack">
        <div className="table-header-row">
          <div>
            <strong>{t('orders.editPage.quickCompletion')}</strong>
            <p>{t('orders.editPage.quickCompletionHelp')}</p>
          </div>
          <span className="summary-pill">
            {progress.completedQuantity}/{progress.requiredQuantity || 0} {t('common.completed').toLowerCase()}
          </span>
        </div>

        <div className="stats-grid compact-stats-grid">
          <div className="stat-card">
            <span className="stat-label">{t('orders.fulfillment')}</span>
            <strong>{formatStatusLabel(order.fulfillmentType, t)}</strong>
            <span>{order.destinationLabel ?? t('common.destinationStillOpen')}</span>
          </div>
          <div className="stat-card stat-card-info">
            <span className="stat-label">{t('orders.provider')}</span>
            <strong>{providerLabel ? (order.deliveryProvider && order.deliveryProvider !== 'other' ? t(`orders.providerOptions.${order.deliveryProvider}`) : providerLabel) : t('common.clear')}</strong>
            <span>{order.deliveryAssignee ?? t('orders.editPage.noDeliveryAssignee')}</span>
          </div>
          <div className="stat-card stat-card-warn">
            <span className="stat-label">{t('orders.promise')}</span>
            <strong>{order.promisedTime ?? t('common.clear')}</strong>
            <span>{order.dispatchNotes ?? t('orders.editPage.noDispatchNotes')}</span>
          </div>
          <div className="stat-card stat-card-neutral">
            <span className="stat-label">{t('orders.editPage.customerMemory')}</span>
            <strong>{linkedCustomer ? linkedCustomer.displayName : t('orders.editPage.noSavedCustomer')}</strong>
            <span>
              {linkedCustomer
                ? (linkedCustomer.phone ?? linkedCustomer.email ?? linkedCustomer.deliveryNote ?? t('orders.editPage.customerMemoryHelp'))
                : (order.customerPhone ?? t('orders.editPage.customerMemoryHelp'))}
            </span>
          </div>
        </div>
        {linkedCustomer ? (
          <p className="helper-text no-margin">
            <Link href={`/customers?customer=${linkedCustomer.id}`} className="inline-link">
              {t('orders.editPage.openCustomer')}
            </Link>
          </p>
        ) : null}

        <div className="line-grid-stack">
          {order.lines.filter((line) => line.lineType !== 'note_item').map((line) => {
            const progressAction = updateOrderLineProgressAction.bind(null, order.id, line.id);
            const lineStatus = getLineStatus(line);

            return (
              <form key={line.id} action={progressAction} className="line-entry-card progress-card">
                <div className="order-card-header">
                  <div>
                    <strong>{line.productLabel}</strong>
                    <p>{line.note ?? t('orders.editPage.noExtraLineNote')}</p>
                  </div>
                  <span className={`badge badge-${lineStatus}`}>{formatStatusLabel(lineStatus, t)}</span>
                </div>
                <div className="line-grid">
                  <label>
                    <span className="field-heading">{t('common.completed')}</span>
                    <input
                      name="completedQuantity"
                      type="number"
                      min="0"
                      max={line.quantity}
                      defaultValue={line.completedQuantity}
                    />
                  </label>
                  <label>
                    <span className="field-heading">{t('common.total')}</span>
                    <input value={`${line.quantity} ${line.unit}`} disabled />
                  </label>
                </div>
                <div className="action-cluster action-cluster-spread align-center">
                  <span className="field-label progress-label">{formatLineProgressLabel(line)}</span>
                  <SubmitButton
                    className="button-primary button-reset"
                    pendingLabel={t('orders.editPage.savingProgress')}
                    icon={<CheckIcon className="button-icon" />}
                  >
                    {t('orders.editPage.saveProgress')}
                  </SubmitButton>
                </div>
              </form>
            );
          })}
        </div>
      </section>

      <OrderForm
        action={action}
        customers={view.customers}
        customerContextById={view.customerContextById}
        destinations={view.destinations}
        order={order}
        productSuggestions={view.productSuggestions}
        focusDate={view.focusDate}
      />
    </div>
  );
}
