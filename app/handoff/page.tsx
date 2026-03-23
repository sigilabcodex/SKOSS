import {
  formatDateLabel,
  formatDateTimeLabel,
  formatShiftKeyLabel,
  formatStatusLabel,
} from '@/lib/domain/formatters';
import { addShiftNoteAction, addWipEntryAction, saveShiftLogAction } from '@/lib/server/actions';
import { getHandoffWorkspace } from '@/lib/server/demo-data';
import { getServerTranslator } from '@/lib/i18n/server';
import { SubmitButton } from '@/components/submit-button';
import Link from 'next/link';
import { CheckIcon, HandoffIcon, PrinterIcon } from '@/components/ui-icons';

const shiftOptions = ['night', 'morning', 'afternoon'] as const;
const stageOptions = ['prepared', 'shaped', 'baked', 'ready'] as const;
const handoffStatusOptions = ['open', 'ready_for_handoff', 'acknowledged', 'closed'] as const;
const noteStateOptions = ['info', 'watch', 'blocked', 'done'] as const;

function getProviderLabel(entry: { deliveryProvider?: string; providerLabel?: string }, t: (key: string) => string) {
  if (!entry.providerLabel) {
    return null;
  }

  if (entry.deliveryProvider && entry.deliveryProvider !== 'other') {
    return t(`orders.providerOptions.${entry.deliveryProvider}`);
  }

  return entry.providerLabel;
}

export default async function HandoffPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; saved?: string }>;
}) {
  const [view, params, { t, locale, term }] = await Promise.all([getHandoffWorkspace(), searchParams, getServerTranslator()]);
  const focusLog = view.shiftLogMap.get(`${view.focusDate}:night`);
  const focusWip = view.wipByDate.get(view.focusDate) ?? [];

  return (
    <div className="page-stack">
      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">{t('handoff.eyebrow')}</p>
          <h1>{t('handoff.title')}</h1>
          <p>{t('handoff.description')}</p>
        </div>
        <Link href="/handoff/print" className="button-secondary" target="_blank" rel="noreferrer">
          <PrinterIcon className="button-icon" />
          <span>{t('printing.actions.handoffSlip')}</span>
        </Link>
      </section>

      {params?.saved ? <p className="inline-success"><CheckIcon className="button-icon" />{t('handoff.savedUpdate', { item: params.saved })}</p> : null}
      {params?.error ? <p className="inline-warning">{params.error}</p> : null}

      <section className="grid-two">
        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{formatDateLabel(view.focusDate, locale)} {t('handoff.snapshotTitle')}</h2>
              <p>{t('handoff.snapshotHelp')}</p>
            </div>
            <span className="summary-pill">{t('handoff.nightShift')}</span>
          </div>
          {focusLog ? (
            <div className="page-stack">
              <div>
                <span className={`badge badge-${focusLog.status}`}>{formatStatusLabel(focusLog.status, t)}</span>
                <p className="top-gap">{focusLog.summary}</p>
              </div>
              <div>
                <strong>{t('handoff.openItems')}</strong>
                <ul className="stack-list muted-list top-gap-small">
                  {focusLog.openItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>{t('handoff.handoffNote')}</strong>
                <p className="top-gap-small">{focusLog.handoffNotes || t('handoff.noHandoffNote')}</p>
              </div>
            </div>
          ) : (
            <section className="page-context-card">
              <HandoffIcon className="callout-icon" />
              <div>
                <strong>{t('handoff.noSummaryTitle')}</strong>
                <p className="helper-text no-margin">{t('handoff.noSummaryBody')}</p>
              </div>
            </section>
          )}
        </article>

        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('handoff.readyOrPendingWip')}</h2>
              <p>{t('handoff.readyOrPendingWipHelp')}</p>
            </div>
            <span className="summary-pill">{focusWip.length} {t('common.entries')}</span>
          </div>
          <ul className="stack-list muted-list">
            {focusWip.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.referenceLabel} · {entry.quantity} {entry.unit}</strong>
                <span>{formatStatusLabel(entry.stage, t)} · {formatShiftKeyLabel(entry.shiftKey, t)} · {entry.notes ?? t('common.noExtraNote')}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid-two">
        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('handoff.fulfillmentWatch.pack')}</h2>
              <p>{t('handoff.fulfillmentWatch.packHelp')}</p>
            </div>
            <span className="summary-pill">{view.packingWatch.length}</span>
          </div>
          <ul className="stack-list muted-list">
            {view.packingWatch.map((order) => {
              const providerLabel = getProviderLabel(order, t);
              return (
                <li key={order.id}>
                  <strong>{order.customerLabel}</strong>
                  <span>
                    {formatStatusLabel(order.fulfillmentType, t)}
                    {order.destinationLabel ? ` · ${order.destinationLabel}` : ''}
                    {providerLabel ? ` · ${providerLabel}` : ''}
                    {order.promisedTime ? ` · ${order.promisedTime}` : ''}
                    {` · ${order.remainingQuantity} ${t('handoff.fulfillmentWatch.remaining').toLowerCase()}`}
                    {order.dispatchNotes ? ` · ${order.dispatchNotes}` : ''}
                  </span>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('handoff.fulfillmentWatch.assign')}</h2>
              <p>{t('handoff.fulfillmentWatch.assignHelp')}</p>
            </div>
            <span className="summary-pill">{view.assignmentWatch.length}</span>
          </div>
          <ul className="stack-list muted-list">
            {view.assignmentWatch.map((order) => (
              <li key={order.id}>
                <strong>{order.customerLabel}</strong>
                <span>
                  {order.destinationLabel ?? t('common.destinationStillOpen')}
                  {order.promisedTime ? ` · ${order.promisedTime}` : ''}
                  {order.dispatchNotes ? ` · ${order.dispatchNotes}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid-two">
        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('handoff.fulfillmentWatch.pickup')}</h2>
              <p>{t('handoff.fulfillmentWatch.pickupHelp')}</p>
            </div>
            <span className="summary-pill">{view.pickupWatch.length}</span>
          </div>
          <ul className="stack-list muted-list">
            {view.pickupWatch.map((order) => (
              <li key={order.id}>
                <strong>{order.customerLabel}</strong>
                <span>
                  {order.destinationLabel ?? t('common.destinationStillOpen')}
                  {order.promisedTime ? ` · ${order.promisedTime}` : ''}
                  {order.dispatchNotes ? ` · ${order.dispatchNotes}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('handoff.fulfillmentWatch.all')}</h2>
              <p>{t('handoff.fulfillmentWatch.allHelp')}</p>
            </div>
            <span className="summary-pill">{view.focusOrders.length} {t('common.orders')}</span>
          </div>
          <ul className="stack-list muted-list">
            {view.focusOrders.map((order) => (
              <li key={order.id}>
                <strong>{order.customerLabel}</strong>
                <span>
                  {formatStatusLabel(order.fulfillmentType, t)}
                  {order.destinationLabel ? ` · ${order.destinationLabel}` : ''}
                  {order.deliveryAssignee ? ` · ${order.deliveryAssignee}` : ''}
                  {order.promisedTime ? ` · ${order.promisedTime}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid-two">
        <form action={addWipEntryAction} className="panel form-grid compact-form page-stack">
          <div>
            <p className="eyebrow">{t('handoff.addWip')}</p>
            <h2>{t('handoff.recordMotion')}</h2>
          </div>
          <label>
            <span className="field-heading">{t('handoff.fields.productionDay')}</span>
            <input name="productionDate" type="date" defaultValue={view.focusDate} required />
          </label>
          <label>
            <span className="field-heading">{t('handoff.fields.shift')}</span>
            <select name="shiftKey" defaultValue="night">
              {shiftOptions.map((option) => (
                <option key={option} value={option}>{formatShiftKeyLabel(option, t)}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-heading">{t('handoff.fields.wipType')}</span>
            <select name="wipType" defaultValue="prep">
              <option value="base_dough">{t('handoff.wipTypes.base_dough')}</option>
              <option value="prep">{t('handoff.wipTypes.prep')}</option>
              <option value="baked_items">{t('handoff.wipTypes.baked_items')}</option>
              <option value="packed_items">{t('handoff.wipTypes.packed_items')}</option>
              <option value="other">{t('handoff.wipTypes.other')}</option>
            </select>
          </label>
          <label>
            <span className="field-heading">{t('handoff.fields.label')}</span>
            <input name="referenceLabel" placeholder={t('handoff.placeholders.wipLabel')} required />
          </label>
          <label>
            <span className="field-heading">{t('handoff.fields.quantity')}</span>
            <input name="quantity" type="number" min="1" step="1" defaultValue="1" required />
          </label>
          <label>
            <span className="field-heading">{t('handoff.fields.unit')}</span>
            <input name="unit" defaultValue="batch" />
          </label>
          <label>
            <span className="field-heading">{t('handoff.fields.stage')}</span>
            <select name="stage" defaultValue="prepared">
              {stageOptions.map((option) => (
                <option key={option} value={option}>{formatStatusLabel(option, t)}</option>
              ))}
            </select>
          </label>
          <label className="line-span-2">
            <span className="field-heading">{t('handoff.fields.notes')}</span>
            <textarea name="notes" placeholder={t('handoff.placeholders.wipNotes')} />
          </label>
          <SubmitButton className="button-primary button-reset" pendingLabel={t('handoff.savingWip')} icon={<CheckIcon className="button-icon" />}>
            {t('handoff.saveWip')}
          </SubmitButton>
        </form>

        <form action={saveShiftLogAction} className="panel form-grid compact-form page-stack">
          <div>
            <p className="eyebrow">{t('handoff.shiftHandoff')}</p>
            <h2>{t('handoff.updateCard')}</h2>
          </div>
          <label>
            <span className="field-heading">{t('handoff.fields.productionDay')}</span>
            <input name="productionDate" type="date" defaultValue={view.focusDate} required />
          </label>
          <label>
            <span className="field-heading">{t('handoff.fields.shift')}</span>
            <select name="shiftKey" defaultValue="night">
              {shiftOptions.map((option) => (
                <option key={option} value={option}>{formatShiftKeyLabel(option, t)}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-heading">{t('handoff.fields.status')}</span>
            <select name="status" defaultValue={focusLog?.status ?? 'open'}>
              {handoffStatusOptions.map((option) => (
                <option key={option} value={option}>{formatStatusLabel(option, t)}</option>
              ))}
            </select>
          </label>
          <label className="line-span-2">
            <span className="field-heading">{t('handoff.fields.summary')}</span>
            <textarea name="summary" defaultValue={focusLog?.summary ?? ''} required />
          </label>
          <label className="line-span-2">
            <span className="field-heading">{t('handoff.fields.openItems')}</span>
            <textarea name="openItems" defaultValue={focusLog?.openItems.join('\n') ?? ''} />
          </label>
          <label className="line-span-2">
            <span className="field-heading">{t('handoff.fields.handoffNote')}</span>
            <textarea name="handoffNotes" defaultValue={focusLog?.handoffNotes ?? ''} />
          </label>
          <SubmitButton className="button-primary button-reset" pendingLabel={t('handoff.savingHandoff')} icon={<CheckIcon className="button-icon" />}>
            {t('handoff.saveHandoff')}
          </SubmitButton>
        </form>
      </section>

      <section className="grid-two">
        <form action={addShiftNoteAction} className="panel form-grid compact-form page-stack">
          <div>
            <p className="eyebrow">{t('handoff.shiftNote')}</p>
            <h2>{t('handoff.addQuickNote')}</h2>
          </div>
          <label>
            <span className="field-heading">{t('handoff.fields.productionDay')}</span>
            <input name="productionDate" type="date" defaultValue={view.focusDate} required />
          </label>
          <label>
            <span className="field-heading">{t('handoff.fields.shift')}</span>
            <select name="shiftKey" defaultValue="morning">
              {shiftOptions.map((option) => (
                <option key={option} value={option}>{formatShiftKeyLabel(option, t)}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-heading">{t('handoff.fields.workerRole')}</span>
            <input name="authorLabel" defaultValue={t('handoff.placeholders.noteAuthor')} />
          </label>
          <label>
            <span className="field-heading">{t('handoff.fields.state')}</span>
            <select name="state" defaultValue="info">
              {noteStateOptions.map((option) => (
                <option key={option} value={option}>{formatStatusLabel(option, t)}</option>
              ))}
            </select>
          </label>
          <label className="line-span-2">
            <span className="field-heading">{t('handoff.fields.linkedItem')}</span>
            <input name="linkedItemLabel" placeholder={t('handoff.placeholders.linkedItem')} />
          </label>
          <label className="line-span-2">
            <span className="field-heading">{t('handoff.fields.note')}</span>
            <textarea name="note" placeholder={t('handoff.placeholders.note')} required />
          </label>
          <SubmitButton className="button-primary button-reset" pendingLabel={t('handoff.addingNote')} icon={<CheckIcon className="button-icon" />}>
            {t('handoff.addShiftNote')}
          </SubmitButton>
        </form>

        <article className="panel page-stack">
          <p className="eyebrow">{t('handoff.timeline')}</p>
          <h2>{t('handoff.recentActivity')}</h2>
          <div className="list-table">
            {view.shiftLogs.map((log) => (
              <article key={log.id} className="timeline-card">
                <div className="order-card-header">
                  <div>
                    <strong>{formatDateLabel(log.productionDate, locale)} · {formatShiftKeyLabel(log.shiftKey, t)}</strong>
                    <p>{formatDateTimeLabel(log.updatedAt, locale)}</p>
                  </div>
                  <span className={`badge badge-${log.status}`}>{formatStatusLabel(log.status, t)}</span>
                </div>
                <p>{log.summary}</p>
                <ul className="stack-list muted-list top-gap-small">
                  {log.shiftNotes.map((note) => (
                    <li key={note.id}>
                      <strong>{note.authorLabel}</strong>
                      <span>{formatStatusLabel(note.state, t)}{note.linkedItemLabel ? ` · ${note.linkedItemLabel}` : ''}{` · ${note.note} · ${formatDateTimeLabel(note.createdAt, locale)}`}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="helper-text no-margin">{t('handoff.termHint', { destinations: term('destination', 'many') })}</p>
        </article>
      </section>
    </div>
  );
}
