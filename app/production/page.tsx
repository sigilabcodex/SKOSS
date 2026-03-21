import Link from 'next/link';
import { formatDateLabel, formatLineProgressLabel, formatShiftKeyLabel, formatStatusLabel } from '@/lib/domain/formatters';
import { getLineStatus, getOrderProgress, getProductionBoard } from '@/lib/server/demo-data';
import { updateOrderLineProgressAction } from '@/lib/server/actions';
import { SubmitButton } from '@/components/submit-button';
import { CheckIcon, HandoffIcon, ProductionIcon } from '@/components/ui-icons';

export default async function ProductionPage() {
  const view = await getProductionBoard();

  return (
    <div className="page-stack">
      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">Kitchen workspace</p>
          <h1>Production board</h1>
          <p>
            Demand now shows what is required, what is already done, what remains open, and which items
            changed after the recurring baseline was generated.
          </p>
        </div>
        <Link href="/handoff" className="button-secondary">
          <HandoffIcon className="button-icon" />
          <span>Record WIP</span>
        </Link>
      </section>

      {view.boards.map((board) => (
        <section key={board.productionDate} className="panel page-stack">
          <div className="table-header-row">
            <div>
              <strong>{formatDateLabel(board.productionDate)}</strong>
              <p>
                {board.boardOrders.length} visible orders · {board.readyCount} ready WIP entries · {board.handoffCount}{' '}
                handoff logs
              </p>
            </div>
            <span className="summary-pill">{board.changedOrders.length} changed / flagged orders</span>
          </div>

          <div className="stats-grid compact-stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total required</span>
              <strong>{board.boardProgress.requiredQuantity}</strong>
              <span>sum of visible grouped demand</span>
            </div>
            <div className="stat-card stat-card-success">
              <span className="stat-label">Already done</span>
              <strong>{board.boardProgress.completedQuantity}</strong>
              <span>quantity marked complete so far</span>
            </div>
            <div className="stat-card stat-card-warn">
              <span className="stat-label">Still pending</span>
              <strong>{board.boardProgress.remainingQuantity}</strong>
              <span>remaining production work</span>
            </div>
            <div className="stat-card stat-card-info">
              <span className="stat-label">Orders in progress</span>
              <strong>{board.boardProgress.partialOrders}</strong>
              <span>orders already partially completed</span>
            </div>
          </div>

          <div className="card-grid demand-grid">
            {board.groupedDemand.map((item) => (
              <article key={item.label} className={`demand-card ${item.remainingQuantity > 0 ? 'demand-card-remaining' : 'demand-card-done'}`}>
                <div className="order-card-header">
                  <strong>{item.label}</strong>
                  <div className="action-cluster wrap-cluster">
                    {item.draft ? <span className="badge badge-draft">draft</span> : null}
                    {item.changed ? <span className="badge badge-changed">changed</span> : null}
                    {item.partial ? <span className="badge badge-in_progress">partial</span> : null}
                  </div>
                </div>
                <p className="demand-qty">
                  {item.completedQuantity}/{item.quantity} {item.unit}
                </p>
                <p>{item.remainingQuantity} remaining · {item.orderCount} order lines</p>
                <p>{item.destinations.join(', ') || 'No destination yet'}</p>
              </article>
            ))}
          </div>

          <div className="grid-two">
            <article className="subpanel page-stack">
              <div className="table-header-row">
                <div>
                  <h2>Changed or draft-sensitive demand</h2>
                  <p>Keep late edits and draft-driven work visible to the kitchen.</p>
                </div>
              </div>
              <ul className="stack-list muted-list">
                {board.changedOrders.map((order) => (
                  <li key={order.id}>
                    <strong>{order.customerLabel}</strong>
                    <span>{order.notes ?? 'Changed order'}</span>
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

            <article className="subpanel page-stack">
              <div className="table-header-row">
                <div>
                  <h2>Current WIP snapshot</h2>
                  <p>Use this as the fast read before moving into production updates.</p>
                </div>
              </div>
              <ul className="stack-list muted-list">
                {board.wipEntries.map((entry) => (
                  <li key={entry.id}>
                    <strong>
                      {entry.referenceLabel} · {entry.quantity} {entry.unit}
                    </strong>
                    <span>
                      {formatStatusLabel(entry.stage)} · {formatShiftKeyLabel(entry.shiftKey)} shift ·{' '}
                      {entry.notes ?? 'No extra note'}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <article className="subpanel page-stack">
            <div className="table-header-row">
              <div>
                <h2>Fast line completion</h2>
                <p>Tap into partial completion without leaving the production view.</p>
              </div>
              <span className="summary-pill">Live updates per line</span>
            </div>
            <div className="line-grid-stack">
              {board.boardOrders.map((order) => {
                const progress = getOrderProgress(order);

                return (
                  <article key={order.id} className={`line-entry-card ${progress.partialLines > 0 ? 'order-card-partial' : ''}`}>
                    <div className="order-card-header">
                      <div>
                        <strong>{order.customerLabel}</strong>
                        <p>
                          {order.destinationLabel ?? 'Destination still open'} · {progress.completedQuantity}/{progress.requiredQuantity || 0} complete
                        </p>
                      </div>
                      <div className="action-cluster wrap-cluster">
                        <span className={`badge badge-${order.status}`}>{formatStatusLabel(order.status)}</span>
                        {order.generatedFromTemplate ? <span className="badge badge-generated">recurring</span> : <span className="badge badge-manual">manual</span>}
                        {order.templateEdited ? <span className="badge badge-changed">edited</span> : null}
                      </div>
                    </div>
                    <div className="line-grid-stack">
                      {order.lines.filter((line) => line.lineType !== 'note_item').map((line) => {
                        const action = updateOrderLineProgressAction.bind(null, order.id, line.id);
                        const lineStatus = getLineStatus(line);

                        return (
                          <form key={line.id} action={action} className="progress-row">
                            <div>
                              <strong>{line.productLabel}</strong>
                              <p>{line.note ?? 'No extra note'}</p>
                            </div>
                            <label>
                              <span className="field-heading">Completed</span>
                              <input
                                name="completedQuantity"
                                type="number"
                                min="0"
                                max={line.quantity}
                                defaultValue={line.completedQuantity}
                              />
                            </label>
                            <div className="page-stack compact-badge-stack">
                              <span className={`badge badge-${lineStatus}`}>{formatStatusLabel(lineStatus)}</span>
                              <span className="field-label progress-label">{formatLineProgressLabel(line)}</span>
                            </div>
                            <SubmitButton
                              className="button-secondary button-reset"
                              pendingLabel="Saving…"
                              icon={<CheckIcon className="button-icon" />}
                            >
                              Save
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

          <div className="grid-two">
            <article className="subpanel page-stack">
              <div className="table-header-row">
                <div>
                  <h2>Recent handoff notes</h2>
                  <p>Surface the latest shift context next to current production demand.</p>
                </div>
              </div>
              <ul className="stack-list muted-list">
                {board.handoffEntries.map((entry) => (
                  <li key={entry.id}>
                    <strong>
                      {formatShiftKeyLabel(entry.shiftKey)} · {formatStatusLabel(entry.state)}
                    </strong>
                    <span>
                      {entry.linkedItemLabel ? `${entry.linkedItemLabel} · ` : ''}
                      {entry.note}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="subpanel page-stack">
              <div className="table-header-row">
                <div>
                  <h2>Hidden from board</h2>
                  <p>Orders saved here stay out of grouped demand but remain visible to operators.</p>
                </div>
              </div>
              <ul className="stack-list muted-list">
                {board.hiddenOrders.map((order) => (
                  <li key={order.id}>
                    <strong>{order.customerLabel}</strong>
                    <span>{order.notes ?? 'Hidden from grouped demand but kept in saved orders.'}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      ))}

      {!view.boards.length ? (
        <section className="page-context-card">
          <ProductionIcon className="callout-icon" />
          <div>
            <strong>No production boards yet.</strong>
            <p className="helper-text no-margin">As soon as visible saved orders exist, grouped demand and fast completion will appear here.</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
