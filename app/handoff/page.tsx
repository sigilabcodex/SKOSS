import {
  formatDateLabel,
  formatDateTimeLabel,
  formatShiftKeyLabel,
  formatStatusLabel,
} from '@/lib/domain/formatters';
import { addShiftNoteAction, addWipEntryAction, saveShiftLogAction } from '@/lib/server/actions';
import { getHandoffWorkspace } from '@/lib/server/demo-data';
import { SubmitButton } from '@/components/submit-button';
import { CheckIcon, HandoffIcon } from '@/components/ui-icons';

const shiftOptions = ['night', 'morning', 'afternoon'] as const;
const stageOptions = ['prepared', 'shaped', 'baked', 'ready'] as const;
const handoffStatusOptions = ['open', 'ready_for_handoff', 'acknowledged', 'closed'] as const;
const noteStateOptions = ['info', 'watch', 'blocked', 'done'] as const;

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
      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">WIP + shift handoff</p>
          <h1>Morning review</h1>
          <p>
            Make prepared, shaped, baked, and ready work visible. Leave notes that the next shift can
            understand in seconds.
          </p>
        </div>
      </section>

      {params?.saved ? <p className="inline-success"><CheckIcon className="button-icon" />Saved {params.saved} update.</p> : null}
      {params?.error ? <p className="inline-warning">{params.error}</p> : null}

      <section className="grid-two">
        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{formatDateLabel(view.focusDate)} handoff snapshot</h2>
              <p>Main shift summary and open items for the current focus date.</p>
            </div>
            <span className="summary-pill">Night shift</span>
          </div>
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
            <section className="page-context-card">
              <HandoffIcon className="callout-icon" />
              <div>
                <strong>No handoff summary yet for the focus date.</strong>
                <p className="helper-text no-margin">Save the main handoff card below to create the first visible summary.</p>
              </div>
            </section>
          )}
        </article>

        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>Ready or pending WIP</h2>
              <p>The next shift should be able to scan this list fast on a phone or tablet.</p>
            </div>
            <span className="summary-pill">{focusWip.length} entries</span>
          </div>
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
        <form action={addWipEntryAction} className="panel form-grid compact-form page-stack">
          <div>
            <p className="eyebrow">Add WIP</p>
            <h2>Record what is already in motion</h2>
          </div>
          <label>
            <span className="field-heading">Production day</span>
            <input name="productionDate" type="date" defaultValue={view.focusDate} required />
          </label>
          <label>
            <span className="field-heading">Shift</span>
            <select name="shiftKey" defaultValue="night">
              {shiftOptions.map((option) => (
                <option key={option} value={option}>
                  {formatShiftKeyLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-heading">WIP type</span>
            <select name="wipType" defaultValue="prep">
              <option value="base_dough">Base dough</option>
              <option value="prep">Prep</option>
              <option value="baked_items">Baked items</option>
              <option value="packed_items">Packed items</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            <span className="field-heading">Label</span>
            <input name="referenceLabel" placeholder="Croissant dough" required />
          </label>
          <label>
            <span className="field-heading">Quantity</span>
            <input name="quantity" type="number" min="1" step="1" defaultValue="1" required />
          </label>
          <label>
            <span className="field-heading">Unit</span>
            <input name="unit" defaultValue="batch" />
          </label>
          <label>
            <span className="field-heading">Stage</span>
            <select name="stage" defaultValue="prepared">
              {stageOptions.map((option) => (
                <option key={option} value={option}>
                  {formatStatusLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <label className="line-span-2">
            <span className="field-heading">Notes</span>
            <textarea name="notes" placeholder="What the next shift should know" />
          </label>
          <SubmitButton
            className="button-primary button-reset"
            pendingLabel="Saving WIP…"
            icon={<CheckIcon className="button-icon" />}
          >
            Save WIP
          </SubmitButton>
        </form>

        <form action={saveShiftLogAction} className="panel form-grid compact-form page-stack">
          <div>
            <p className="eyebrow">Shift handoff</p>
            <h2>Update the main handoff card</h2>
          </div>
          <label>
            <span className="field-heading">Production day</span>
            <input name="productionDate" type="date" defaultValue={view.focusDate} required />
          </label>
          <label>
            <span className="field-heading">Shift</span>
            <select name="shiftKey" defaultValue="night">
              {shiftOptions.map((option) => (
                <option key={option} value={option}>
                  {formatShiftKeyLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-heading">Status</span>
            <select name="status" defaultValue={focusLog?.status ?? 'open'}>
              {handoffStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {formatStatusLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <label className="line-span-2">
            <span className="field-heading">Summary</span>
            <textarea name="summary" defaultValue={focusLog?.summary ?? ''} required />
          </label>
          <label className="line-span-2">
            <span className="field-heading">Open items (one per line)</span>
            <textarea name="openItems" defaultValue={focusLog?.openItems.join('\n') ?? ''} />
          </label>
          <label className="line-span-2">
            <span className="field-heading">Handoff note</span>
            <textarea name="handoffNotes" defaultValue={focusLog?.handoffNotes ?? ''} />
          </label>
          <SubmitButton
            className="button-primary button-reset"
            pendingLabel="Saving handoff…"
            icon={<CheckIcon className="button-icon" />}
          >
            Save handoff
          </SubmitButton>
        </form>
      </section>

      <section className="grid-two">
        <form action={addShiftNoteAction} className="panel form-grid compact-form page-stack">
          <div>
            <p className="eyebrow">Shift note</p>
            <h2>Add a quick note to the timeline</h2>
          </div>
          <label>
            <span className="field-heading">Production day</span>
            <input name="productionDate" type="date" defaultValue={view.focusDate} required />
          </label>
          <label>
            <span className="field-heading">Shift</span>
            <select name="shiftKey" defaultValue="morning">
              {shiftOptions.map((option) => (
                <option key={option} value={option}>
                  {formatShiftKeyLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-heading">Worker / role</span>
            <input name="authorLabel" defaultValue="Amanecer" />
          </label>
          <label>
            <span className="field-heading">State</span>
            <select name="state" defaultValue="info">
              {noteStateOptions.map((option) => (
                <option key={option} value={option}>
                  {formatStatusLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <label className="line-span-2">
            <span className="field-heading">Linked item or product</span>
            <input name="linkedItemLabel" placeholder="Mini sweet tray or rack 2 croissants" />
          </label>
          <label className="line-span-2">
            <span className="field-heading">Note</span>
            <textarea name="note" placeholder="Ready trays on rack 1, sweet items still pending" required />
          </label>
          <SubmitButton
            className="button-primary button-reset"
            pendingLabel="Adding note…"
            icon={<CheckIcon className="button-icon" />}
          >
            Add shift note
          </SubmitButton>
        </form>

        <article className="panel page-stack">
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
                        {formatStatusLabel(note.state)}
                        {note.linkedItemLabel ? ` · ${note.linkedItemLabel}` : ''}
                        {` · ${note.note} · ${formatDateTimeLabel(note.createdAt)}`}
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
