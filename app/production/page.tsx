import { getProductionDayView } from '@/lib/server/demo-data';
import { formatDateLabel } from '@/lib/domain/formatters';

export default function ProductionPage() {
  const view = getProductionDayView('2026-03-28');

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <p className="eyebrow">Kitchen workspace</p>
          <h1>Production day</h1>
          <p>
            Grouped demand, visible draft lines, and practical WIP all appear together for the
            selected production date.
          </p>
        </div>
        <span className="status-note">Last updated: {view.lastUpdated}</span>
      </section>

      <section className="grid-two">
        <article className="panel">
          <h2>Grouped demand for {formatDateLabel(view.productionDate)}</h2>
          <ul className="stack-list">
            {view.groupedDemand.map((item) => (
              <li key={item.label}>
                <strong>{item.label}</strong>
                <span>
                  {item.quantity} {item.unit}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>Unresolved draft lines</h2>
          <ul className="stack-list muted-list">
            {view.draftLines.map((item) => (
              <li key={item.id}>
                <strong>{item.label}</strong>
                <span>{item.note}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel">
        <h2>WIP snapshot</h2>
        <div className="list-table">
          {view.wipEntries.map((entry) => (
            <article key={entry.id} className="list-row">
              <div>
                <strong>{entry.referenceLabel}</strong>
                <p>{entry.notes}</p>
              </div>
              <div>
                <span className={`badge badge-${entry.status}`}>{entry.status}</span>
              </div>
              <div>
                <strong>
                  {entry.quantity} {entry.unit}
                </strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
