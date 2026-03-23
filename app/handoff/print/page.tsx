import { PrintDocument } from '@/components/printing/print-document';
import { formatDateLabel, formatDateTimeLabel, formatShiftKeyLabel, formatStatusLabel } from '@/lib/domain/formatters';
import { getHandoffWorkspace } from '@/lib/server/demo-data';
import { getServerTranslator } from '@/lib/i18n/server';
import { createPrintIntent } from '@/lib/printing';

export default async function HandoffPrintPage() {
  const [view, { t, locale }] = await Promise.all([getHandoffWorkspace(), getServerTranslator()]);
  const focusLog = view.shiftLogMap.get(`${view.focusDate}:night`);
  const focusWip = view.wipByDate.get(view.focusDate) ?? [];
  const recentNotes = (focusLog?.shiftNotes ?? []).slice().sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const intent = createPrintIntent({
    artifact: 'handoff_slip',
    purpose: 'shift_handoff',
    sourceWorkspace: 'handoff',
    title: t('printing.artifacts.handoff_slip'),
    summary: formatDateLabel(view.focusDate, locale),
    reference: view.focusDate,
  });

  return (
    <PrintDocument
      intent={intent}
      title={t('printing.documents.handoffSlip.title')}
      description={t('printing.documents.handoffSlip.description')}
      backHref="/handoff"
      backLabel={t('printing.actions.backToHandoff')}
      printNowLabel={t('printing.actions.printNow')}
      browserFirstBadge={t('printing.browserFirstBadge')}
      browserFirstHelp={t('printing.browserFirstHelp')}
      artifactLabel={t('printing.labels.artifact')}
      purposeLabel={t('printing.labels.purpose')}
      sourceWorkspaceLabel={t('printing.labels.sourceWorkspace')}
      purposeValue={t('printing.purposes.shift_handoff')}
      sourceWorkspaceValue={t('nav.handoff')}
    >
      <section className="print-meta-grid">
        <div className="print-meta-card">
          <span className="field-label">{t('printing.documents.shared.handoffDay')}</span>
          <strong>{formatDateLabel(view.focusDate, locale)}</strong>
        </div>
        <div className="print-meta-card">
          <span className="field-label">{t('printing.documents.shared.wipSnapshot')}</span>
          <strong>{focusWip.length}</strong>
        </div>
        <div className="print-meta-card">
          <span className="field-label">{t('printing.documents.shared.openItems')}</span>
          <strong>{focusLog?.openItems.length ?? 0}</strong>
        </div>
        <div className="print-meta-card">
          <span className="field-label">{t('printing.documents.shared.fulfillmentWatch')}</span>
          <strong>{view.focusOrders.length}</strong>
        </div>
      </section>

      <section className="print-section-grid">
        <div className="print-block">
          <h2>{t('printing.documents.shared.shiftSummary')}</h2>
          {focusLog ? (
            <div className="page-stack compact-gap">
              <p className="no-margin"><strong>{formatStatusLabel(focusLog.status, t)}</strong> · {focusLog.summary}</p>
              <div>
                <strong>{t('printing.documents.shared.openItems')}</strong>
                <ul className="print-list compact-print-list top-gap-small">
                  {focusLog.openItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <p className="no-margin"><strong>{t('handoff.handoffNote')}:</strong> {focusLog.handoffNotes || t('handoff.noHandoffNote')}</p>
            </div>
          ) : (
            <p className="no-margin">{t('handoff.noSummaryBody')}</p>
          )}
        </div>

        <div className="print-block">
          <h2>{t('printing.documents.shared.wipSnapshot')}</h2>
          <ul className="print-list compact-print-list">
            {focusWip.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.referenceLabel} · {entry.quantity} {entry.unit}</strong>
                <span>{formatStatusLabel(entry.stage, t)} · {formatShiftKeyLabel(entry.shiftKey, t)} · {entry.notes ?? t('common.noExtraNote')}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="print-section-grid">
        <div className="print-block">
          <h2>{t('printing.documents.shared.fulfillmentWatch')}</h2>
          <ul className="print-list compact-print-list">
            {view.focusOrders.map((order) => (
              <li key={order.id}>
                <strong>{order.customerLabel}</strong>
                <span>
                  {formatStatusLabel(order.fulfillmentType, t)}
                  {order.destinationLabel ? ` · ${order.destinationLabel}` : ''}
                  {order.customerPhone ? ` · ${t('orders.customerMemory.phone')}: ${order.customerPhone}` : ''}
                  {order.deliveryAssignee ? ` · ${order.deliveryAssignee}` : ''}
                  {order.promisedTime ? ` · ${order.promisedTime}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="print-block">
          <h2>{t('printing.documents.shared.recentNotes')}</h2>
          <ul className="print-list compact-print-list">
            {recentNotes.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.authorLabel} · {formatDateTimeLabel(entry.createdAt, locale)}</strong>
                <span>{formatStatusLabel(entry.state, t)}{entry.linkedItemLabel ? ` · ${entry.linkedItemLabel}` : ''} · {entry.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PrintDocument>
  );
}
