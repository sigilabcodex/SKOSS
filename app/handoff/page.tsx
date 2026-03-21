import { shiftLogs } from '@/data/demo-fixtures';

export default function HandoffPage() {
  const latest = shiftLogs[0];

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <p className="eyebrow">Shift handoff</p>
          <h1>Morning review</h1>
          <p>Operational briefing should be concise: WIP, open items, changes, and next actions.</p>
        </div>
      </section>

      <section className="grid-two">
        <article className="panel">
          <h2>{latest.shiftKey} shift summary</h2>
          <p>{latest.summary}</p>
          <span className={`badge badge-${latest.status}`}>{latest.status}</span>
        </article>

        <article className="panel">
          <h2>Open items</h2>
          <ul className="stack-list muted-list">
            {latest.openItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel">
        <h2>Handoff note</h2>
        <p>{latest.handoffNotes}</p>
      </section>
    </div>
  );
}
