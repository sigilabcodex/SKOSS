import type { Destination } from '@/lib/domain/types';
import { getDefaultLineDrafts, weekdayOptions } from '@/lib/server/demo-data';

interface RecurringTemplateFormProps {
  action: (formData: FormData) => void | Promise<void>;
  destinations: Destination[];
  productSuggestions: string[];
  focusDate: string;
}

const lineTypeOptions = [
  { value: 'product_variant', label: 'Structured item' },
  { value: 'draft_product', label: 'Draft item' },
  { value: 'note_item', label: 'Note item' },
] as const;

export function RecurringTemplateForm({
  action,
  destinations,
  productSuggestions,
  focusDate,
}: RecurringTemplateFormProps) {
  const lineDrafts = getDefaultLineDrafts([], 4);

  return (
    <form action={action} className="page-stack">
      <section className="panel form-grid">
        <div className="section-header compact-header">
          <div>
            <p className="eyebrow">Recurring order</p>
            <h2>Capture the kitchen rhythm once</h2>
            <p>
              Keep recurrence explicit: a customer label, a simple daily or weekly rhythm, and the next
              date to generate.
            </p>
          </div>
        </div>

        <div className="grid-two">
          <label>
            Customer or route label
            <input name="customerLabel" placeholder="Cafe Luna" required />
          </label>
          <label>
            Phone or contact
            <input name="customerPhone" placeholder="Optional" />
          </label>
          <label>
            Destination
            <input name="destinationLabel" list="destinations" placeholder="Cafe Luna" />
            <datalist id="destinations">
              {destinations.map((destination) => (
                <option key={destination.id} value={destination.name} />
              ))}
            </datalist>
          </label>
          <label>
            Next occurrence
            <input name="nextOccurrenceDate" type="date" defaultValue={focusDate} required />
          </label>
          <label>
            Recurrence
            <select name="frequency" defaultValue="weekly">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>
        </div>

        <fieldset className="weekday-fieldset">
          <legend>Weekly days</legend>
          <div className="weekday-row">
            {weekdayOptions.map((option) => (
              <label key={option.value} className="weekday-chip">
                <input name="weeklyDays" type="checkbox" value={option.value} defaultChecked={option.value === 'sat'} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          Notes
          <textarea name="notes" placeholder="Packing reminder, standing exception, or handoff note" />
        </label>
      </section>

      <section className="panel">
        <div className="section-header compact-header">
          <div>
            <p className="eyebrow">Recurring lines</p>
            <h2>Keep the repeated demand visible</h2>
            <p>Operators can still use draft names here. Generated orders stay editable later.</p>
          </div>
        </div>

        <div className="line-grid-stack">
          {lineDrafts.map((line, index) => (
            <div key={`template-line-${index}`} className="line-entry-card">
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
                    placeholder="Croissant / Butter"
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
                  <input name="lineNote" defaultValue={line.note} placeholder="Optional note for this recurring line" />
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
          Save recurring template
        </button>
      </div>
    </form>
  );
}
