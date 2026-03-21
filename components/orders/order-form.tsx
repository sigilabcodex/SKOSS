import type { Destination, Order } from '@/lib/domain/types';
import { getDefaultLineDrafts, getOrderProgress } from '@/lib/server/demo-data';
import { LineItemsEditor } from '@/components/orders/line-items-editor';
import { SubmitButton } from '@/components/submit-button';
import { AlertIcon, CheckIcon } from '@/components/ui-icons';

interface OrderFormProps {
  action: (formData: FormData) => void | Promise<void>;
  destinations: Destination[];
  order?: Order | null;
  productSuggestions: string[];
  focusDate: string;
}

const lineTypeOptions = [
  { value: 'product_variant', label: 'Structured item' },
  { value: 'draft_product', label: 'Draft item' },
  { value: 'note_item', label: 'Note item' },
] as const;

const sourceOptions = [
  { value: 'manual', label: 'Manual' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone', label: 'Phone' },
  { value: 'walk_in', label: 'Walk-in' },
] as const;

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'changed', label: 'Changed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
] as const;

export function OrderForm({ action, destinations, order, productSuggestions, focusDate }: OrderFormProps) {
  const lineDrafts = getDefaultLineDrafts(order?.lines);
  const visibleOnProductionBoard = order?.visibleOnProductionBoard ?? true;
  const changedInKitchen = order?.changedInKitchen ?? order?.status === 'changed';
  const progress = order ? getOrderProgress(order) : null;
  const existingStatuses = order?.lines.map((line) => ({
    label: `${line.completedQuantity}/${line.quantity} done`,
    tone: line.lineStatus,
  }));

  return (
    <form action={action} className="page-stack">
      <section className="panel page-stack">
        <div className="section-header compact-header">
          <div>
            <p className="eyebrow">Order intake</p>
            <h2>{order ? 'Edit order' : 'Capture order fast'}</h2>
            <p className="section-copy">
              Save now, refine later. Draft customers, draft products, and notes stay visible to the
              kitchen without slowing the operator down.
            </p>
          </div>
          {order ? (
            <div className="page-stack compact-badge-stack align-end">
              <span className={`badge badge-${order.status}`}>{order.status.replaceAll('_', ' ')}</span>
              {order.generatedFromTemplate ? <span className="badge badge-generated">recurring</span> : <span className="badge badge-manual">manual</span>}
              {order.templateEdited ? <span className="badge badge-changed">edited from rhythm</span> : null}
              {progress && progress.partialLines > 0 ? <span className="badge badge-in_progress">partial work</span> : null}
            </div>
          ) : null}
        </div>

        {order && progress ? (
          <div className="stats-grid compact-stats-grid">
            <div className="stat-card">
              <span className="stat-label">Completed</span>
              <strong>{progress.completedQuantity}</strong>
              <span>pieces / units already finished</span>
            </div>
            <div className="stat-card stat-card-warn">
              <span className="stat-label">Still pending</span>
              <strong>{progress.remainingQuantity}</strong>
              <span>remaining before handoff or delivery</span>
            </div>
            <div className="stat-card stat-card-info">
              <span className="stat-label">In progress</span>
              <strong>{progress.partialLines}</strong>
              <span>lines already partially completed</span>
            </div>
          </div>
        ) : null}

        <div className="field-section-grid">
          <section className="field-section">
            <div className="field-section-header">
              <div>
                <h3>Who and when</h3>
                <p className="helper-text">Keep the practical customer label and key dates easy to scan.</p>
              </div>
              <span className="inline-meta">Required fields marked</span>
            </div>
            <div className="grid-two">
              <label>
                <span className="field-heading">Customer or draft label <span className="required-dot">Required</span></span>
                <input
                  name="customerLabel"
                  defaultValue={order?.customerLabel ?? ''}
                  placeholder="Sofía birthday"
                  required
                />
                <span className="helper-text">Use the name the team will actually recognize today.</span>
              </label>
              <label>
                <span className="field-heading">Phone or contact <span className="optional-pill">Optional</span></span>
                <input
                  name="customerPhone"
                  defaultValue={order?.customerPhone ?? ''}
                  placeholder="Optional"
                />
              </label>
              <label>
                <span className="field-heading">Destination <span className="optional-pill">Optional</span></span>
                <input
                  name="destinationLabel"
                  list="destinations"
                  defaultValue={order?.destinationLabel ?? ''}
                  placeholder="Front counter"
                />
                <datalist id="destinations">
                  {destinations.map((destination) => (
                    <option key={destination.id} value={destination.name} />
                  ))}
                </datalist>
              </label>
              <label>
                <span className="field-heading">Source</span>
                <select name="source" defaultValue={order?.generatedFromTemplate ? 'generated' : order?.source ?? 'manual'}>
                  {sourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  {order?.generatedFromTemplate ? <option value="generated">Generated</option> : null}
                </select>
              </label>
              <label>
                <span className="field-heading">Production day <span className="required-dot">Required</span></span>
                <input name="productionDate" type="date" defaultValue={order?.productionDate ?? focusDate} required />
              </label>
              <label>
                <span className="field-heading">Due / delivery day <span className="required-dot">Required</span></span>
                <input name="dueDate" type="date" defaultValue={order?.dueDate ?? focusDate} required />
              </label>
            </div>
          </section>

          <section className="field-section">
            <div className="field-section-header">
              <div>
                <h3>Kitchen visibility</h3>
                <p className="helper-text">Use these toggles only when they help the next shift act faster.</p>
              </div>
            </div>
            <div className="grid-two">
              <label>
                <span className="field-heading">Order status</span>
                <select name="status" defaultValue={order?.status ?? 'active'}>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-callout form-callout-attention">
                <AlertIcon className="callout-icon" />
                <div>
                  <strong>Use “Changed” when kitchen work should double-check this order.</strong>
                  <p className="helper-text no-margin">This keeps last-minute edits obvious on boards and cards.</p>
                </div>
              </div>
            </div>
            <div className="grid-two">
              <label className="checkbox-row checkbox-row-highlight">
                <input name="changedInKitchen" type="checkbox" defaultChecked={changedInKitchen} />
                <span>
                  <strong>Kitchen attention needed</strong>
                  <span className="helper-text">Flag late changes, substitutions, or anything the shift should not miss.</span>
                </span>
              </label>
              <label className="checkbox-row">
                <input
                  name="visibleOnProductionBoard"
                  type="checkbox"
                  defaultChecked={visibleOnProductionBoard}
                />
                <span>
                  <strong>Show on production board</strong>
                  <span className="helper-text">Turn off only when the order should stay saved but not grouped into active demand.</span>
                </span>
              </label>
            </div>
          </section>
        </div>

        <section className="field-section">
          <div className="field-section-header">
            <div>
              <h3>Notes and exceptions</h3>
              <p className="helper-text">Keep handoff details close to the order instead of hiding them elsewhere.</p>
            </div>
          </div>
          <label>
            <span className="field-heading">Order notes <span className="optional-pill">Optional</span></span>
            <textarea
              name="notes"
              defaultValue={order?.notes ?? ''}
              placeholder="Pickup note, late change, decoration detail, or route reminder"
            />
          </label>
        </section>
      </section>

      <section className="panel page-stack">
        <div className="section-header compact-header">
          <div>
            <p className="eyebrow">Order lines</p>
            <h2>Structured when available, draft when needed</h2>
            <p className="section-copy">
              Suggested catalog names help when they exist, but freeform labels still work so order
              capture never blocks.
            </p>
          </div>
        </div>

        <LineItemsEditor
          editorId="order-lines-editor"
          initialLines={lineDrafts}
          productSuggestions={productSuggestions}
          lineTypeOptions={lineTypeOptions}
          existingStatuses={existingStatuses}
          sectionLabel="Add, remove, or reorder the visible rows based on what the operator needs now."
        />
      </section>

      <div className="action-row form-footer-row">
        <div className="helper-text action-hint">
          <CheckIcon className="button-icon" />
          <span>Saving keeps this order visible to the team and preserves draft details for later cleanup.</span>
        </div>
        <SubmitButton
          className="button-primary button-reset"
          pendingLabel={order ? 'Saving changes…' : 'Saving order…'}
          icon={<CheckIcon className="button-icon" />}
        >
          {order ? 'Save changes' : 'Save order'}
        </SubmitButton>
      </div>
    </form>
  );
}
