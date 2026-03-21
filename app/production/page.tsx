import Link from 'next/link';
import { formatDateLabel, formatStatusLabel } from '@/lib/domain/formatters';
import { getProductionBoard } from '@/lib/server/demo-data';

export default async function ProductionPage() {
  const view = await getProductionBoard();

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <p className="eyebrow">Kitchen workspace</p>
          <h1>Production board</h1>
          <p>
            Demand is grouped by production day and item so the kitchen can see what needs making,
            what changed, and what is already in motion.
          </p>
        </div>
        <Link href="/handoff" className="button-secondary">
          Record WIP
        </Link>
      </section>

      {view.boards.map((board) => (
        <section key={board.productionDate} className="panel page-stack">
          <div className="table-header-row">
            <div>
              <strong>{formatDateLabel(board.productionDate)}</strong>
              <p>
                {board.orders.length} orders · {board.readyCount} ready WIP entries · {board.handoffCount}{' '}
                handoff logs
              </p>
            </div>
            <span>{board.changedOrders.length} changed orders</span>
          </div>

          <div className="card-grid demand-grid">
            {board.groupedDemand.map((item) => (
              <article key={item.label} className="demand-card">
                <div className="order-card-header">
                  <strong>{item.label}</strong>
                  {item.draft ? <span className="badge">draft</span> : null}
                </div>
                <p className="demand-qty">
                  {item.quantity} {item.unit}
                </p>
                <p>
                  {item.orderCount} order lines · {item.destinations.join(', ') || 'No destination yet'}
                </p>
              </article>
            ))}
          </div>

          <div className="grid-two">
            <article className="subpanel">
              <h2>Changed or draft-sensitive demand</h2>
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

            <article className="subpanel">
              <h2>Current WIP snapshot</h2>
              <ul className="stack-list muted-list">
                {board.wipEntries.map((entry) => (
                  <li key={entry.id}>
                    <strong>
                      {entry.referenceLabel} · {entry.quantity} {entry.unit}
                    </strong>
                    <span>
                      {formatStatusLabel(entry.stage)} · {formatStatusLabel(entry.shiftKey)} shift ·{' '}
                      {entry.notes ?? 'No extra note'}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      ))}
    </div>
  );
}
