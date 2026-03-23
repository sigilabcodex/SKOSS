import { notFound } from 'next/navigation';
import { PrintDocument } from '@/components/printing/print-document';
import { formatDateLabel, formatShiftKeyLabel, formatStatusLabel } from '@/lib/domain/formatters';
import { getProductionBoard } from '@/lib/server/demo-data';
import { getServerTranslator } from '@/lib/i18n/server';
import { createPrintIntent } from '@/lib/printing';

export default async function ProductionPrintPage({
  searchParams,
}: {
  searchParams?: Promise<{ date?: string }>;
}) {
  const [view, params, { t, locale }] = await Promise.all([getProductionBoard(), searchParams, getServerTranslator()]);
  const requestedDate = params?.date;
  const board = requestedDate
    ? view.boards.find((entry) => entry.productionDate === requestedDate) ?? null
    : view.boards[0] ?? null;

  if (!board) {
    notFound();
  }

  const intent = createPrintIntent({
    artifact: 'production_ticket',
    purpose: 'kitchen_execution',
    sourceWorkspace: 'production',
    title: t('printing.artifacts.production_ticket'),
    summary: formatDateLabel(board.productionDate, locale),
    reference: board.productionDate,
  });

  return (
    <PrintDocument
      intent={intent}
      title={t('printing.documents.productionTicket.title')}
      description={t('printing.documents.productionTicket.description')}
      backHref="/production"
      backLabel={t('printing.actions.backToProduction')}
      printNowLabel={t('printing.actions.printNow')}
      browserFirstBadge={t('printing.browserFirstBadge')}
      browserFirstHelp={t('printing.browserFirstHelp')}
      artifactLabel={t('printing.labels.artifact')}
      purposeLabel={t('printing.labels.purpose')}
      sourceWorkspaceLabel={t('printing.labels.sourceWorkspace')}
      purposeValue={t('printing.purposes.kitchen_execution')}
      sourceWorkspaceValue={t('nav.production')}
    >
      <section className="print-meta-grid">
        <div className="print-meta-card">
          <span className="field-label">{t('production.totalRequired')}</span>
          <strong>{board.boardProgress.requiredQuantity}</strong>
        </div>
        <div className="print-meta-card">
          <span className="field-label">{t('production.alreadyDone')}</span>
          <strong>{board.boardProgress.completedQuantity}</strong>
        </div>
        <div className="print-meta-card">
          <span className="field-label">{t('production.stillPending')}</span>
          <strong>{board.boardProgress.remainingQuantity}</strong>
        </div>
        <div className="print-meta-card">
          <span className="field-label">{t('common.orders')}</span>
          <strong>{board.boardOrders.length}</strong>
        </div>
      </section>

      <section className="print-block">
        <h2>{formatDateLabel(board.productionDate, locale)}</h2>
        <ul className="print-list">
          {board.groupedDemand.map((item) => (
            <li key={item.label}>
              <div>
                <strong>{item.label}</strong>
                <p className="helper-text no-margin">{item.destinations.join(', ') || t('production.noDestinationYet')}</p>
              </div>
              <div className="print-line-meta">
                <span>{item.completedQuantity}/{item.quantity} {item.unit}</span>
                <span>{item.remainingQuantity} {t('production.stillPending').toLowerCase()}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="print-section-grid">
        <div className="print-block">
          <h2>{t('printing.documents.shared.wipSnapshot')}</h2>
          <ul className="print-list compact-print-list">
            {board.wipEntries.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.referenceLabel} · {entry.quantity} {entry.unit}</strong>
                <span>{formatStatusLabel(entry.stage, t)} · {formatShiftKeyLabel(entry.shiftKey, t)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="print-block">
          <h2>{t('printing.documents.shared.recentNotes')}</h2>
          <ul className="print-list compact-print-list">
            {board.handoffEntries.map((entry) => (
              <li key={entry.id}>
                <strong>{formatShiftKeyLabel(entry.shiftKey, t)} · {formatStatusLabel(entry.state, t)}</strong>
                <span>{entry.linkedItemLabel ? `${entry.linkedItemLabel} · ` : ''}{entry.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PrintDocument>
  );
}
