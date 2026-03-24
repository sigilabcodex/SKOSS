import Link from 'next/link';
import {
  formatDateLabel,
  formatLineProgressLabel,
  formatShiftKeyLabel,
  formatStatusLabel,
} from '@/lib/domain/formatters';
import {
  getLineStatus,
  getOrderProgress,
  getProductionBoard,
} from '@/lib/server/demo-data';
import { updateOrderLineProgressAction } from '@/lib/server/actions';
import { getServerTranslator } from '@/lib/i18n/server';
import { SubmitButton } from '@/components/submit-button';
import {
  CheckIcon,
  HandoffIcon,
  PrinterIcon,
  ProductionIcon,
} from '@/components/ui-icons';

function getProviderLabel(
  entry: { deliveryProvider?: string; providerLabel?: string },
  t: (key: string) => string,
) {
  if (!entry.providerLabel) {
    return null;
  }

  if (entry.deliveryProvider && entry.deliveryProvider !== 'other') {
    return t(`orders.providerOptions.${entry.deliveryProvider}`);
  }

  return entry.providerLabel;
}

export default async function ProductionPage() {
  const [view, { t, term, locale }] = await Promise.all([
    getProductionBoard(),
    getServerTranslator(),
  ]);

  const boardSections = [
    { key: 'demand', label: t('production.sectionNav.demand') },
    { key: 'fulfillment', label: t('production.sectionNav.fulfillment') },
    { key: 'handoff', label: t('production.sectionNav.handoff') },
    { key: 'updates', label: t('production.sectionNav.updates') },
  ];

  return (
    <div className="page-stack">
      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">{t('production.workspace')}</p>
          <h1>{t('production.title')}</h1>
          <p>{t('production.description')}</p>
        </div>
        <Link href="/handoff" className="button-secondary">
          <HandoffIcon className="button-icon" />
          <span>{t('production.recordWip')}</span>
        </Link>
      </section>

      {view.boards.map((board) => {
        const sectionIdBase = board.productionDate;

        return (
          <section key={board.productionDate} className="panel page-stack">
            <div className="table-header-row">
              <div>
                <strong>{formatDateLabel(board.productionDate, locale)}</strong>
                <p>
                  {board.boardOrders.length} {t('production.boardSummary')} ·{' '}
                  {board.readyCount} {t('production.readyWipEntries')} ·{' '}
                  {board.handoffCount} {t('production.handoffLogs')}
                </p>
              </div>
              <div className="action-cluster compact-actions">
                <span className="summary-pill">
                  {board.changedOrders.length}{' '}
                  {t('production.changedFlaggedOrders')}
                </span>
                <Link
                  href={{
                    pathname: '/production/print',
                    query: { date: board.productionDate },
                  }}
                  className="button-secondary"
                  target="_blank"
                  rel="noreferrer"
                >
                  <PrinterIcon className="button-icon" />
                  <span>{t('printing.actions.productionTicket')}</span>
                </Link>
              </div>
            </div>

            <div className="filter-pill-row">
              {boardSections.map((section) => (
                <a
                  key={section.key}
                  href={`#${sectionIdBase}-${section.key}`}
                  className="summary-pill"
                >
                  {section.label}
                </a>
              ))}
            </div>

            <div
              className="stats-grid compact-stats-grid"
              id={`${sectionIdBase}-demand`}
            >
              <div className="stat-card">
                <span className="stat-label">
                  {t('production.totalRequired')}
                </span>
                <strong>{board.boardProgress.requiredQuantity}</strong>
                <span>{t('production.totalRequiredHelp')}</span>
              </div>
              <div className="stat-card stat-card-success">
                <span className="stat-label">
                  {t('production.alreadyDone')}
                </span>
                <strong>{board.boardProgress.completedQuantity}</strong>
                <span>{t('production.alreadyDoneHelp')}</span>
              </div>
              <div className="stat-card stat-card-warn">
                <span className="stat-label">
                  {t('production.stillPending')}
                </span>
                <strong>{board.boardProgress.remainingQuantity}</strong>
                <span>{t('production.stillPendingHelp')}</span>
              </div>
              <div className="stat-card stat-card-info">
                <span className="stat-label">
                  {t('production.ordersInProgress')}
                </span>
                <strong>{board.boardProgress.partialOrders}</strong>
                <span>{t('production.ordersInProgressHelp')}</span>
              </div>
            </div>

            <div className="stats-grid compact-stats-grid">
              <div className="stat-card">
                <span className="stat-label">
                  {t('production.fulfillmentSummary.standard')}
                </span>
                <strong>{board.fulfillmentSummary.standard}</strong>
                <span>{t('production.fulfillmentSummary.standardHelp')}</span>
              </div>
              <div className="stat-card stat-card-info">
                <span className="stat-label">
                  {t('production.fulfillmentSummary.pickup')}
                </span>
                <strong>{board.fulfillmentSummary.pickup}</strong>
                <span>{t('production.fulfillmentSummary.pickupHelp')}</span>
              </div>
              <div className="stat-card stat-card-warn">
                <span className="stat-label">
                  {t('production.fulfillmentSummary.own_delivery')}
                </span>
                <strong>{board.fulfillmentSummary.own_delivery}</strong>
                <span>
                  {t('production.fulfillmentSummary.ownDeliveryHelp')}
                </span>
              </div>
              <div className="stat-card stat-card-success">
                <span className="stat-label">
                  {t('production.fulfillmentSummary.app_delivery')}
                </span>
                <strong>{board.fulfillmentSummary.app_delivery}</strong>
                <span>
                  {t('production.fulfillmentSummary.appDeliveryHelp')}
                </span>
              </div>
            </div>

            <div className="card-grid demand-grid">
              {board.groupedDemand.map((item) => (
                <article
                  key={item.label}
                  className={`demand-card ${item.remainingQuantity > 0 ? 'demand-card-remaining' : 'demand-card-done'}`}
                >
                  <div className="order-card-header">
                    <strong>{item.label}</strong>
                    <div className="action-cluster wrap-cluster">
                      {item.draft ? (
                        <span className="badge badge-draft">
                          {t('common.draft')}
                        </span>
                      ) : null}
                      {item.changed ? (
                        <span className="badge badge-changed">
                          {t('common.changed')}
                        </span>
                      ) : null}
                      {item.partial ? (
                        <span className="badge badge-in_progress">
                          {t('common.partial')}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="demand-qty">
                    {item.completedQuantity}/{item.quantity} {item.unit}
                  </p>
                  <p>
                    {item.remainingQuantity}{' '}
                    {t('production.stillPending').toLowerCase()} ·{' '}
                    {item.orderCount} {t('production.orderLines')}
                  </p>
                  <p>
                    {item.destinations.join(', ') ||
                      t('production.noDestinationYet')}
                  </p>
                </article>
              ))}
            </div>

            <div className="grid-two" id={`${sectionIdBase}-fulfillment`}>
              <article className="subpanel page-stack">
                <div className="table-header-row">
                  <div>
                    <h2>{t('production.fulfillmentQueues.pack')}</h2>
                    <p>{t('production.fulfillmentQueues.packHelp')}</p>
                  </div>
                </div>
                <ul className="stack-list muted-list">
                  {board.deliveryPackingQueue.map((order) => {
                    const providerLabel = getProviderLabel(order, t);
                    return (
                      <li key={order.id}>
                        <strong>{order.customerLabel}</strong>
                        <span>
                          {order.destinationLabel ??
                            t('common.destinationStillOpen')}
                          {providerLabel ? ` · ${providerLabel}` : ''}
                          {order.customerPhone
                            ? ` · ${t('orders.customerMemory.phone')}: ${order.customerPhone}`
                            : ''}
                          {order.promisedTime ? ` · ${order.promisedTime}` : ''}
                          {` · ${order.remainingQuantity} ${t('production.fulfillmentQueues.remaining').toLowerCase()}`}
                          {order.deliveryNote ? ` · ${order.deliveryNote}` : ''}
                          {order.dispatchNotes
                            ? ` · ${order.dispatchNotes}`
                            : ''}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </article>

              <article className="subpanel page-stack">
                <div className="table-header-row">
                  <div>
                    <h2>{t('production.fulfillmentQueues.assign')}</h2>
                    <p>{t('production.fulfillmentQueues.assignHelp')}</p>
                  </div>
                </div>
                <ul className="stack-list muted-list">
                  {board.assignmentNeededOrders.map((order) => {
                    const providerLabel = getProviderLabel(order, t);
                    return (
                      <li key={order.id}>
                        <strong>{order.customerLabel}</strong>
                        <span>
                          {order.destinationLabel ??
                            t('common.destinationStillOpen')}
                          {providerLabel ? ` · ${providerLabel}` : ''}
                          {order.customerPhone
                            ? ` · ${t('orders.customerMemory.phone')}: ${order.customerPhone}`
                            : ''}
                          {order.promisedTime ? ` · ${order.promisedTime}` : ''}
                          {order.deliveryNote ? ` · ${order.deliveryNote}` : ''}
                          {order.dispatchNotes
                            ? ` · ${order.dispatchNotes}`
                            : ''}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </article>
            </div>

            <div className="grid-two">
              <article className="subpanel page-stack">
                <div className="table-header-row">
                  <div>
                    <h2>{t('production.fulfillmentQueues.pickup')}</h2>
                    <p>{t('production.fulfillmentQueues.pickupHelp')}</p>
                  </div>
                </div>
                <ul className="stack-list muted-list">
                  {board.pickupReadyOrders.map((order) => (
                    <li key={order.id}>
                      <strong>{order.customerLabel}</strong>
                      <span>
                        {order.destinationLabel ??
                          t('common.destinationStillOpen')}
                        {order.customerPhone
                          ? ` · ${t('orders.customerMemory.phone')}: ${order.customerPhone}`
                          : ''}
                        {order.promisedTime ? ` · ${order.promisedTime}` : ''}
                        {order.dispatchNotes ? ` · ${order.dispatchNotes}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="subpanel page-stack">
                <div className="table-header-row">
                  <div>
                    <h2>{t('production.changedDemand')}</h2>
                    <p>{t('production.changedDemandHelp')}</p>
                  </div>
                </div>
                <ul className="stack-list muted-list">
                  {board.changedOrders.map((order) => (
                    <li key={order.id}>
                      <strong>{order.customerLabel}</strong>
                      <span>{order.notes ?? t('common.changedOrder')}</span>
                    </li>
                  ))}
                  {board.draftLines.map((line) => (
                    <li key={line.id}>
                      <strong>
                        {line.label} · {line.quantity} {line.unit}
                      </strong>
                      <span>
                        {line.customerLabel}: {line.note}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <div className="grid-two" id={`${sectionIdBase}-handoff`}>
              <article className="subpanel page-stack">
                <div className="table-header-row">
                  <div>
                    <h2>{t('production.currentWipSnapshot')}</h2>
                    <p>{t('production.currentWipSnapshotHelp')}</p>
                  </div>
                </div>
                <ul className="stack-list muted-list">
                  {board.wipEntries.map((entry) => (
                    <li key={entry.id}>
                      <strong>
                        {entry.referenceLabel} · {entry.quantity} {entry.unit}
                      </strong>
                      <span>
                        {formatStatusLabel(entry.stage, t)} ·{' '}
                        {formatShiftKeyLabel(entry.shiftKey, t)} ·{' '}
                        {entry.notes ?? t('common.noExtraNote')}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="subpanel page-stack">
                <div className="table-header-row">
                  <div>
                    <h2>{t('production.recentHandoffNotes')}</h2>
                    <p>{t('production.recentHandoffNotesHelp')}</p>
                  </div>
                </div>
                <ul className="stack-list muted-list">
                  {board.handoffEntries.map((entry) => (
                    <li key={entry.id}>
                      <strong>
                        {formatShiftKeyLabel(entry.shiftKey, t)} ·{' '}
                        {formatStatusLabel(entry.state, t)}
                      </strong>
                      <span>
                        {entry.linkedItemLabel
                          ? `${entry.linkedItemLabel} · `
                          : ''}
                        {entry.note}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <article
              className="subpanel page-stack"
              id={`${sectionIdBase}-updates`}
            >
              <div className="table-header-row">
                <div>
                  <h2>{t('production.fastLineCompletion')}</h2>
                  <p>{t('production.fastLineCompletionHelp')}</p>
                </div>
                <span className="summary-pill">
                  {t('production.liveUpdates')}
                </span>
              </div>
              <div className="line-grid-stack">
                {board.boardOrders.map((order) => {
                  const progress = getOrderProgress(order);
                  return (
                    <article
                      key={order.id}
                      className={`line-entry-card ${progress.partialLines > 0 ? 'order-card-partial' : ''}`}
                    >
                      <div className="order-card-header">
                        <div>
                          <strong>{order.customerLabel}</strong>
                          <p>
                            {order.destinationLabel ??
                              t('common.destinationStillOpen')}{' '}
                            · {progress.completedQuantity}/
                            {progress.requiredQuantity || 0}{' '}
                            {t('production.complete')}
                          </p>
                        </div>
                        <div className="action-cluster wrap-cluster">
                          <span className={`badge badge-${order.status}`}>
                            {formatStatusLabel(order.status, t)}
                          </span>
                          <span
                            className={`badge badge-${order.fulfillmentType === 'pickup' ? 'ready' : order.fulfillmentType === 'app_delivery' ? 'in_progress' : 'active'}`}
                          >
                            {formatStatusLabel(order.fulfillmentType, t)}
                          </span>
                          {order.generatedFromTemplate ? (
                            <span className="badge badge-generated">
                              {t('common.recurring')}
                            </span>
                          ) : (
                            <span className="badge badge-manual">
                              {t('common.manual')}
                            </span>
                          )}
                          {order.templateEdited ? (
                            <span className="badge badge-changed">
                              {t('common.edited')}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {order.deliveryAssignee ||
                      order.promisedTime ||
                      order.dispatchNotes ? (
                        <p className="helper-text no-margin">
                          {order.customerId
                            ? `${t('orders.customerMemory.linked')}. `
                            : ''}
                          {order.deliveryAssignee
                            ? `${t('orders.assignee')}: ${order.deliveryAssignee}. `
                            : ''}
                          {order.customerPhone
                            ? `${t('orders.customerMemory.phone')}: ${order.customerPhone}. `
                            : ''}
                          {order.promisedTime
                            ? `${t('orders.promise')}: ${order.promisedTime}. `
                            : ''}
                          {order.dispatchNotes ?? ''}
                        </p>
                      ) : null}
                      <div className="line-grid-stack">
                        {order.lines
                          .filter((line) => line.lineType !== 'note_item')
                          .map((line) => {
                            const action = updateOrderLineProgressAction.bind(
                              null,
                              order.id,
                              line.id,
                            );
                            const lineStatus = getLineStatus(line);
                            return (
                              <form
                                key={line.id}
                                action={action}
                                className="progress-row"
                              >
                                <div>
                                  <strong>{line.productLabel}</strong>
                                  <p>{line.note ?? t('common.noExtraNote')}</p>
                                </div>
                                <label>
                                  <span className="field-heading">
                                    {t('production.completedField')}
                                  </span>
                                  <input
                                    name="completedQuantity"
                                    type="number"
                                    min="0"
                                    max={line.quantity}
                                    defaultValue={line.completedQuantity}
                                  />
                                </label>
                                <div className="page-stack compact-badge-stack">
                                  <span className={`badge badge-${lineStatus}`}>
                                    {formatStatusLabel(lineStatus, t)}
                                  </span>
                                  <span className="field-label progress-label">
                                    {formatLineProgressLabel(line)}
                                  </span>
                                </div>
                                <SubmitButton
                                  className="button-secondary button-reset"
                                  pendingLabel={t('production.saving')}
                                  icon={<CheckIcon className="button-icon" />}
                                >
                                  {t('production.save')}
                                </SubmitButton>
                              </form>
                            );
                          })}
                      </div>
                    </article>
                  );
                })}
              </div>
            </article>

            <article className="subpanel page-stack">
              <div className="table-header-row">
                <div>
                  <h2>{t('production.hiddenFromBoard')}</h2>
                  <p>{t('production.hiddenFromBoardHelp')}</p>
                </div>
              </div>
              <ul className="stack-list muted-list">
                {board.hiddenOrders.map((order) => (
                  <li key={order.id}>
                    <strong>{order.customerLabel}</strong>
                    <span>
                      {order.notes ?? t('production.hiddenOrderHelp')}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        );
      })}

      {!view.boards.length ? (
        <section className="page-context-card">
          <ProductionIcon className="callout-icon" />
          <div>
            <strong>{t('production.emptyTitle')}</strong>
            <p className="helper-text no-margin">{t('production.emptyBody')}</p>
            <p className="helper-text no-margin">
              {t('production.termHint', { items: term('workItem', 'many') })}
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
