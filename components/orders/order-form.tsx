import { getDefaultLineDrafts } from '@/lib/server/demo-data';
import type { Destination, Order } from '@/lib/domain/types';

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

export function OrderForm({ action, destinations, order, productSuggestions, focusDate }: OrderFormProps) {
  const lineDrafts = getDefaultLineDrafts(order?.lines);

  return (
    <form action={action} className="page-stack">
      <section className="panel form-grid">
        <div className="section-header compact-header">
          <div>
            <p className="eyebrow">Order intake</p>
            <h2>{order ? 'Edit order' : 'Capture order fast'}</h2>
            <p>
              Save now, refine later. Draft customers, draft products, and notes stay visible to the
              kitchen.
            </p>
          </div>
        </div>

        <div className="grid-two">
          <label>
            Customer or draft label
            <input
              name="customerLabel"
              defaultValue={order?.customerLabel ?? ''}
              placeholder="Sofía birthday"
              required
            />
          </label>
          <label>
            Phone or contact
            <input
              name="customerPhone"
              defaultValue={order?.customerPhone ?? ''}
              placeholder="Optional"
            />
          </label>
          <label>
            Source
            <select name="source" defaultValue={order?.source ?? 'manual'}>
              {sourceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Destination
            <input
              name="destinationLabel"
              list="destinations"
              defaultValue={order?.destinationLabel ?? ''}
              placeholder="Front Counter"
            />
            <datalist id="destinations">
              {destinations.map((destination) => (
                <option key={destination.id} value={destination.name} />
              ))}
            </datalist>
          </label>
          <label>
            Production day
            <input name="productionDate" type="date" defaultValue={order?.productionDate ?? focusDate} required />
          </label>
          <label>
            Due / delivery day
            <input name="dueDate" type="date" defaultValue={order?.dueDate ?? focusDate} required />
          </label>
        </div>

        <label>
          Order notes
          <textarea
            name="notes"
            defaultValue={order?.notes ?? ''}
            placeholder="Pickup note, late change, decoration detail, or route reminder"
          />
        </label>
      </section>

      <section className="panel">
        <div className="section-header compact-header">
          <div>
            <p className="eyebrow">Order lines</p>
            <h2>Structured when available, draft when needed</h2>
            <p>Leave blank rows empty. Suggested catalog names are available, but freeform text always works.</p>
          </div>
        </div>

        <div className="line-grid-stack">
          {lineDrafts.map((line, index) => (
            <div key={`${line.productLabel}-${index}`} className="line-entry-card">
              <div className="line-entry-top">
                <strong>Line {index + 1}</strong>
              </div>
              <div className="line-grid">
                <label>
                  Kind
                  <select name="lineType" defaultValue={line.lineType}>
                    {lineTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="line-span-2">
                  Item name
                  <input
                    name="productLabel"
                    list="product-suggestions"
                    defaultValue={line.productLabel}
                    placeholder="Country Loaf / 800g or Mini sweet tray"
                  />
                </label>
                <label>
                  Qty
                  <input name="quantity" type="number" min="0" step="1" defaultValue={line.quantity} />
                </label>
                <label>
                  Unit
                  <input name="unit" defaultValue={line.unit} placeholder="pieces" />
                </label>
                <label className="line-span-2">
                  Note
                  <input
                    name="lineNote"
                    defaultValue={line.note}
                    placeholder="Optional line note, packing reminder, or exception"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <datalist id="product-suggestions">
          {productSuggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </section>

      <div className="action-row">
        <button type="submit" className="button-primary button-reset">
          {order ? 'Save changes' : 'Save order'}
        </button>
      </div>
    </form>
  );
}
