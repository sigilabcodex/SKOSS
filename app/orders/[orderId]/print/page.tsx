import { notFound } from 'next/navigation';
import { PrintDocument } from '@/components/printing/print-document';
import { formatDateLabel, formatLineProgressLabel, formatStatusLabel } from '@/lib/domain/formatters';
import { resolveDeliveryProviderLabel } from '@/lib/domain/order-helpers';
import { getOrderEditor, getOrderProgress } from '@/lib/server/demo-data';
import { getServerTranslator } from '@/lib/i18n/server';
import { createPrintIntent } from '@/lib/printing';

export default async function OrderPrintPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = await params;
  const [view, { t, locale }] = await Promise.all([getOrderEditor(resolvedParams.orderId), getServerTranslator()]);

  if (!view.order) {
    notFound();
  }

  const order = view.order;
  const providerLabel = resolveDeliveryProviderLabel(order);
  const progress = getOrderProgress(order);
  const linkedCustomer = order.customerId
    ? view.customers.find((customer) => customer.id === order.customerId) ?? null
    : null;
  const intent = createPrintIntent({
    artifact: 'order_ticket',
    purpose: 'kitchen_execution',
    sourceWorkspace: 'orders',
    title: t('printing.artifacts.order_ticket'),
    summary: t('printing.purposes.kitchen_execution'),
    reference: order.customerLabel,
  });

  return (
    <PrintDocument
      intent={intent}
      title={t('printing.documents.orderTicket.title')}
      description={t('printing.documents.orderTicket.description')}
      backHref={`/orders/${order.id}`}
      backLabel={t('printing.actions.backToOrder')}
      printNowLabel={t('printing.actions.printNow')}
      browserFirstBadge={t('printing.browserFirstBadge')}
      browserFirstHelp={t('printing.browserFirstHelp')}
      artifactLabel={t('printing.labels.artifact')}
      purposeLabel={t('printing.labels.purpose')}
      sourceWorkspaceLabel={t('printing.labels.sourceWorkspace')}
      purposeValue={t('printing.purposes.kitchen_execution')}
      sourceWorkspaceValue={t('nav.orders')}
    >
      <section className="print-meta-grid">
        <div className="print-meta-card">
          <span className="field-label">{t('orders.production')}</span>
          <strong>{formatDateLabel(order.productionDate, locale)}</strong>
        </div>
        <div className="print-meta-card">
          <span className="field-label">{t('orders.fulfillment')}</span>
          <strong>{formatStatusLabel(order.fulfillmentType, t)}</strong>
        </div>
        <div className="print-meta-card">
          <span className="field-label">{t('orders.promise')}</span>
          <strong>{order.promisedTime ?? t('common.clear')}</strong>
        </div>
        <div className="print-meta-card">
          <span className="field-label">{t('orders.completion')}</span>
          <strong>{progress.completedQuantity}/{progress.requiredQuantity || 0}</strong>
        </div>
      </section>

      <section className="print-section-grid">
        <div className="print-block">
          <h2>{order.customerLabel}</h2>
          <div className="print-kv-grid">
            <div>
              <span className="field-label">{t('terms.destination.one')}</span>
              <strong>{order.destinationLabel ?? t('common.destinationStillOpen')}</strong>
            </div>
            <div>
              <span className="field-label">{t('orders.source')}</span>
              <strong>{formatStatusLabel(order.source, t)}</strong>
            </div>
            <div>
              <span className="field-label">{t('orders.provider')}</span>
              <strong>
                {providerLabel
                  ? order.deliveryProvider && order.deliveryProvider !== 'other'
                    ? t(`orders.providerOptions.${order.deliveryProvider}`)
                    : providerLabel
                  : t('common.clear')}
              </strong>
            </div>
            <div>
              <span className="field-label">{t('orders.customerMemory.linked')}</span>
              <strong>{linkedCustomer?.displayName ?? t('orders.editPage.noSavedCustomer')}</strong>
            </div>
            <div>
              <span className="field-label">{t('orders.customerMemory.phone')}</span>
              <strong>{order.customerPhone ?? linkedCustomer?.phone ?? t('common.clear')}</strong>
            </div>
            <div>
              <span className="field-label">{t('orders.assignee')}</span>
              <strong>{order.deliveryAssignee ?? t('common.clear')}</strong>
            </div>
          </div>
        </div>

        <div className="print-block">
          <h2>{t('printing.documents.shared.lines')}</h2>
          <ul className="print-list">
            {order.lines.filter((line) => line.lineType !== 'note_item').map((line) => (
              <li key={line.id}>
                <div>
                  <strong>{line.productLabel}</strong>
                  {line.note ? <p className="helper-text no-margin">{line.note}</p> : null}
                </div>
                <div className="print-line-meta">
                  <span>{formatLineProgressLabel(line)}</span>
                  <span>{formatStatusLabel(line.lineStatus, t)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {order.dispatchNotes || order.notes ? (
        <section className="print-block">
          <h2>{t('printing.documents.shared.notes')}</h2>
          <div className="page-stack compact-gap">
            {order.dispatchNotes ? (
              <p className="no-margin">
                <strong>{t('orders.dispatchNotes')}:</strong> {order.dispatchNotes}
              </p>
            ) : null}
            {order.notes ? (
              <p className="no-margin">
                <strong>{t('orders.notes')}:</strong> {order.notes}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}
      {linkedCustomer?.deliveryNote || linkedCustomer?.address ? (
        <section className="print-block">
          <h2>{t('orders.customerMemory.title')}</h2>
          <div className="page-stack compact-gap">
            {linkedCustomer.address ? (
              <p className="no-margin">
                <strong>{t('customers.fields.address')}:</strong> {linkedCustomer.address}
              </p>
            ) : null}
            {linkedCustomer.deliveryNote ? (
              <p className="no-margin">
                <strong>{t('customers.fields.deliveryNote')}:</strong> {linkedCustomer.deliveryNote}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}
    </PrintDocument>
  );
}
