import { notFound } from 'next/navigation';
import { PrintDocument } from '@/components/printing/print-document';
import { formatDateLabel, formatStatusLabel } from '@/lib/domain/formatters';
import { getOrderEditor } from '@/lib/server/demo-data';
import { getServerTranslator } from '@/lib/i18n/server';
import { createPrintIntent } from '@/lib/printing';

export default async function OrderLabelPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = await params;
  const [view, { t, locale }] = await Promise.all([getOrderEditor(resolvedParams.orderId), getServerTranslator()]);

  if (!view.order) {
    notFound();
  }

  const intent = createPrintIntent({
    artifact: 'simple_label',
    purpose: 'item_identification',
    sourceWorkspace: 'orders',
    title: t('printing.artifacts.simple_label'),
    summary: t('printing.purposes.item_identification'),
    reference: view.order.customerLabel,
  });

  return (
    <PrintDocument
      intent={intent}
      title={t('printing.documents.simpleLabel.title')}
      description={t('printing.documents.simpleLabel.description')}
      backHref={`/orders/${view.order.id}`}
      backLabel={t('printing.actions.backToOrder')}
      printNowLabel={t('printing.actions.printNow')}
      browserFirstBadge={t('printing.browserFirstBadge')}
      browserFirstHelp={t('printing.browserFirstHelp')}
      artifactLabel={t('printing.labels.artifact')}
      purposeLabel={t('printing.labels.purpose')}
      sourceWorkspaceLabel={t('printing.labels.sourceWorkspace')}
      purposeValue={t('printing.purposes.item_identification')}
      sourceWorkspaceValue={t('nav.orders')}
    >
      <section className="print-label-sheet">
        <div className="print-label-card">
          <span className="badge badge-ready">{t('printing.documents.simpleLabel.badge')}</span>
          <h2>{view.order.customerLabel}</h2>
          <p className="print-label-primary">{view.order.destinationLabel ?? t('common.destinationStillOpen')}</p>
          <div className="print-kv-grid compact-print-grid">
            <div>
              <span className="field-label">{t('orders.production')}</span>
              <strong>{formatDateLabel(view.order.productionDate, locale)}</strong>
            </div>
            <div>
              <span className="field-label">{t('orders.fulfillment')}</span>
              <strong>{formatStatusLabel(view.order.fulfillmentType, t)}</strong>
            </div>
            <div>
              <span className="field-label">{t('orders.promise')}</span>
              <strong>{view.order.promisedTime ?? t('common.clear')}</strong>
            </div>
            <div>
              <span className="field-label">{t('printing.documents.shared.lines')}</span>
              <strong>{view.order.lines.filter((line) => line.lineType !== 'note_item').length}</strong>
            </div>
          </div>
          <ul className="print-list compact-print-list">
            {view.order.lines.filter((line) => line.lineType !== 'note_item').map((line) => (
              <li key={line.id}>
                <strong>{line.quantity} {line.unit}</strong>
                <span>{line.productLabel}</span>
              </li>
            ))}
          </ul>
          {view.order.dispatchNotes || view.order.notes ? (
            <p className="helper-text no-margin">{view.order.dispatchNotes ?? view.order.notes}</p>
          ) : null}
        </div>
      </section>
    </PrintDocument>
  );
}
