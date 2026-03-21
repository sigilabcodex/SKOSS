import { formatDateLabel, formatDateTimeLabel, formatShiftKeyLabel, formatStatusLabel } from '@/lib/domain/formatters';
import {
  addShiftNoteAction,
  addWipEntryAction,
  saveShiftLogAction,
} from '@/lib/server/actions';
import { getHandoffWorkspace } from '@/lib/server/demo-data';

const shiftOptions = ['night', 'morning', 'afternoon'] as const;
const stageOptions = ['prepared', 'shaped', 'baked', 'ready'] as const;
const handoffStatusOptions = ['open', 'ready_for_handoff', 'acknowledged', 'closed'] as const;

export default async function HandoffPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; saved?: string }>;
}) {
  const [view, params] = await Promise.all([getHandoffWorkspace(), searchParams]);
  const focusLog = view.shiftLogMap.get(`${view.focusDate}:night`);
  const focusWip = view.wipByDate.get(view.focusDate) ?? [];

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <p className="eyebrow">WIP + shift handoff</p>
          <h1>Morning review</h1>
          <p>
            Make prepared, shaped, baked, and ready work visible. Leave notes that the next shift can
            understand in seconds.
          </p>
        </div>
      </section>

      {params?.saved ? <p className="inline-success">Saved {params.saved} update.</p> : null}
      {params?.error ? <p className="inline-warning">{params.error}</p> : null}

      <section className="grid-two">
        <article className="panel">
          <h2>{formatDateLabel(view.focusDate)} handoff snapshot</h2>
          {focusLog ? (
            <div className="page-stack">
              <div>
                <span className={`badge badge-${focusLog.status}`}>{formatStatusLabel(focusLog.status)}</span>
                <p className="top-gap">{focusLog.summary}</p>
              </div>
              <div>
                <strong>Open items</strong>
                <ul className="stack-list muted-list top-gap-small">
                  {focusLog.openItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Handoff note</strong>
                <p className="top-gap-small">{focusLog.handoffNotes || 'No handoff note yet.'}</p>
              </div>
            </div>
          ) : (
            <p>No handoff summary yet for the focus date.</p>
          )}
        </article>

        <article className="panel">
          <h2>Ready or pending WIP</h2>
          <ul className="stack-list muted-list">
            {focusWip.map((entry) => (
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
      </section>

      <section className="grid-two">
        <form action={addWipEntryAction} className="panel form-grid compact-form">
          <div>
            <p className="eyebrow">Add WIP</p>
            <h2>Record what is already in motion</h2>
          </div>
          <label>
            Production day
            <input name="productionDate" type="date" defaultValue={view.focusDate} required />
          </label>
          <label>
            Shift
            <select name="shiftKey" defaultValue="night">
              {shiftOptions.map((option) => (
                <option key={option} value={option}>
                  {formatShiftKeyLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <label>
            WIP type
            <select name="wipType" defaultValue="prep">
              <option value="base_dough">Base dough</option>
              <option value="prep">Prep</option>
              <option value="baked_items">Baked items</option>
              <option value="packed_items">Packed items</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Label
            <input name="referenceLabel" placeholder="Croissant dough" required />
          </label>
          <label>
            Quantity
            <input name="quantity" type="number" min="1" step="1" defaultValue="1" required />
          </label>
          <label>
            Unit
            <input name="unit" defaultValue="batch" />
          </label>
          <label>
            Stage
            <select name="stage" defaultValue="prepared">
              {stageOptions.map((option) => (
                <option key={option} value={option}>
                  {formatStatusLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <label className="line-span-2">
            Notes
            <textarea name="notes" placeholder="What the next shift should know" />
          </label>
          <button type="submit" className="button-primary button-reset">
            Save WIP
          </button>
        </form>

        <form action={saveShiftLogAction} className="panel form-grid compact-form">
          <div>
            <p className="eyebrow">Shift handoff</p>
            <h2>Update the main handoff card</h2>
          </div>
          <label>
            Production day
            <input name="productionDate" type="date" defaultValue={view.focusDate} required />
          </label>
          <label>
            Shift
            <select name="shiftKey" defaultValue="night">
              {shiftOptions.map((option) => (
                <option key={option} value={option}>
                  {formatShiftKeyLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select name="status" defaultValue={focusLog?.status ?? 'open'}>
              {handoffStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {formatStatusLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <label className="line-span-2">
            Summary
            <textarea name="summary" defaultValue={focusLog?.summary ?? ''} required />
          </label>
          <label className="line-span-2">
            Open items (one per line)
            <textarea name="openItems" defaultValue={focusLog?.openItems.join('\n') ?? ''} />
          </label>
          <label className="line-span-2">
            Handoff note
            <textarea name="handoffNotes" defaultValue={focusLog?.handoffNotes ?? ''} />
          </label>
          <button type="submit" className="button-primary button-reset">
            Save handoff
          </button>
        </form>
      </section>

      <section className="grid-two">
        <form action={addShiftNoteAction} className="panel form-grid compact-form">
          <div>
            <p className="eyebrow">Shift note</p>
            <h2>Add a quick note to the timeline</h2>
          </div>
          <label>
            Production day
            <input name="productionDate" type="date" defaultValue={view.focusDate} required />
          </label>
          <label>
            Shift
            <select name="shiftKey" defaultValue="morning">
              {shiftOptions.map((option) => (
                <option key={option} value={option}>
                  {formatShiftKeyLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Worker / role
            <input name="authorLabel" defaultValue="Amanecer" />
          </label>
          <label className="line-span-2">
            Note
            <textarea name="note" placeholder="Ready trays on rack 1, sweet items still pending" required />
          </label>
          <button type="submit" className="button-primary button-reset">
            Add shift note
          </button>
        </form>

        <article className="panel">
          <p className="eyebrow">Timeline</p>
          <h2>Recent handoff activity</h2>
          <div className="list-table">
            {view.shiftLogs.map((log) => (
              <article key={log.id} className="timeline-card">
                <div className="order-card-header">
                  <div>
                    <strong>
                      {formatDateLabel(log.productionDate)} · {formatShiftKeyLabel(log.shiftKey)} shift
                    </strong>
                    <p>{formatDateTimeLabel(log.updatedAt)}</p>
                  </div>
                  <span className={`badge badge-${log.status}`}>{formatStatusLabel(log.status)}</span>
                </div>
                <p>{log.summary}</p>
                <ul className="stack-list muted-list top-gap-small">
                  {log.shiftNotes.map((note) => (
                    <li key={note.id}>
                      <strong>{note.authorLabel}</strong>
                      <span>
                        {note.note} · {formatDateTimeLabel(note.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
