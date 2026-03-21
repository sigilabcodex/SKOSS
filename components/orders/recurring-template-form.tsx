import type { Destination } from '@/lib/domain/types';
import { getDefaultLineDrafts, weekdayOptions } from '@/lib/server/demo-data';
import { LineItemsEditor } from '@/components/orders/line-items-editor';
import { SubmitButton } from '@/components/submit-button';
import { CheckIcon, SparklesIcon } from '@/components/ui-icons';

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
      <section className="panel page-stack">
        <div className="section-header compact-header">
          <div>
            <p className="eyebrow">Recurring order</p>
            <h2>Capture the kitchen rhythm once</h2>
            <p className="section-copy">
              Keep recurrence explicit: a customer label, a simple daily or weekly rhythm, and the next
              date to generate.
            </p>
          </div>
          <span className="badge badge-generated">recurring</span>
        </div>

        <div className="field-section-grid">
          <section className="field-section">
            <div className="field-section-header">
              <div>
                <h3>Template basics</h3>
                <p className="helper-text">Set the repeatable demand first, then keep generated orders editable later.</p>
              </div>
            </div>
            <div className="grid-two">
              <label>
                <span className="field-heading">Customer or route label <span className="required-dot">Required</span></span>
                <input name="customerLabel" placeholder="Cafe Luna" required />
              </label>
              <label>
                <span className="field-heading">Phone or contact <span className="optional-pill">Optional</span></span>
                <input name="customerPhone" placeholder="Optional" />
              </label>
              <label>
                <span className="field-heading">Destination <span className="optional-pill">Optional</span></span>
                <input name="destinationLabel" list="destinations" placeholder="Cafe Luna" />
                <datalist id="destinations">
                  {destinations.map((destination) => (
                    <option key={destination.id} value={destination.name} />
                  ))}
                </datalist>
              </label>
              <label>
                <span className="field-heading">Next occurrence <span className="required-dot">Required</span></span>
                <input name="nextOccurrenceDate" type="date" defaultValue={focusDate} required />
              </label>
              <label>
                <span className="field-heading">Recurrence</span>
                <select name="frequency" defaultValue="weekly">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </label>
              <div className="form-callout form-callout-generated">
                <SparklesIcon className="callout-icon" />
                <div>
                  <strong>Generated orders still stay editable later.</strong>
                  <p className="helper-text no-margin">This template defines the baseline, not a locked schedule engine.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="field-section">
            <div className="field-section-header">
              <div>
                <h3>Weekly rhythm</h3>
                <p className="helper-text">Only the selected days should feed future recurring generation.</p>
              </div>
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
          </section>
        </div>

        <section className="field-section">
          <div className="field-section-header">
            <div>
              <h3>Template notes</h3>
              <p className="helper-text">Use this for standing packing reminders or route-level exceptions.</p>
            </div>
          </div>
          <label>
            <span className="field-heading">Notes <span className="optional-pill">Optional</span></span>
            <textarea name="notes" placeholder="Packing reminder, standing exception, or handoff note" />
          </label>
        </section>
      </section>

      <section className="panel page-stack">
        <div className="section-header compact-header">
          <div>
            <p className="eyebrow">Recurring lines</p>
            <h2>Keep the repeated demand visible</h2>
            <p className="section-copy">Operators can still use draft names here. Generated orders stay editable later.</p>
          </div>
        </div>

        <LineItemsEditor
          editorId="recurring-lines-editor"
          initialLines={lineDrafts}
          productSuggestions={productSuggestions}
          lineTypeOptions={lineTypeOptions}
          sectionLabel="Use only the rows needed for the actual rhythm. Add and remove lines as the route evolves."
        />
      </section>

      <div className="action-row form-footer-row">
        <div className="helper-text action-hint">
          <CheckIcon className="button-icon" />
          <span>Saving this template keeps the recurring rhythm visible without forcing a heavy scheduling setup.</span>
        </div>
        <SubmitButton
          className="button-primary button-reset"
          pendingLabel="Saving recurring template…"
          icon={<CheckIcon className="button-icon" />}
        >
          Save recurring template
        </SubmitButton>
      </div>
    </form>
  );
}
