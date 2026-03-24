'use client';

import type { Destination } from '@/lib/domain/types';
import { getDefaultLineDrafts, getOrderLineTypeLabelKey, orderLineTypeValues, weekdayOptions } from '@/lib/domain/order-helpers';
import { formatWeekdayLabel } from '@/lib/domain/formatters';
import { useI18n } from '@/components/i18n-provider';
import { LineItemsEditor } from '@/components/orders/line-items-editor';
import { SubmitButton } from '@/components/submit-button';
import { CheckIcon, SparklesIcon } from '@/components/ui-icons';

interface RecurringTemplateFormProps {
  action: (formData: FormData) => void | Promise<void>;
  destinations: Destination[];
  productSuggestions: string[];
  focusDate: string;
}

export function RecurringTemplateForm({
  action,
  destinations,
  productSuggestions,
  focusDate,
}: RecurringTemplateFormProps) {
  const { t } = useI18n();
  const lineDrafts = getDefaultLineDrafts([], 4);
  const lineTypeOptions = orderLineTypeValues.map((option) => ({
    value: option,
    label: t(`orders.lineEditor.kinds.${getOrderLineTypeLabelKey(option)}`),
  }));

  return (
    <form action={action} className="page-stack">
      <section className="panel page-stack">
        <div className="section-header compact-header">
          <div>
            <p className="eyebrow">{t('orders.recurringForm.eyebrow')}</p>
            <h2>{t('orders.recurringForm.title')}</h2>
            <p className="section-copy">{t('orders.recurringForm.intro')}</p>
          </div>
          <span className="badge badge-generated">{t('common.recurring')}</span>
        </div>

        <div className="field-section-grid">
          <section className="field-section">
            <div className="field-section-header">
              <div>
                <h3>{t('orders.recurringForm.basics')}</h3>
                <p className="helper-text">{t('orders.recurringForm.basicsHelp')}</p>
              </div>
            </div>
            <div className="grid-two">
              <label>
                <span className="field-heading">{t('orders.recurringForm.customerOrRoute')} <span className="setup-required-mark" aria-hidden="true">*</span></span>
                <input name="customerLabel" placeholder={t('orders.recurringForm.placeholders.customerOrRoute')} required />
              </label>
              <label>
                <span className="field-heading">{t('orders.orderForm.fields.customerPhone')} <span className="optional-pill">{t('common.optional')}</span></span>
                <input name="customerPhone" placeholder={t('common.optional')} />
              </label>
              <label>
                <span className="field-heading">{t('orders.orderForm.fields.destination')} <span className="optional-pill">{t('common.optional')}</span></span>
                <input name="destinationLabel" list="destinations" placeholder={t('orders.recurringForm.placeholders.customerOrRoute')} />
                <datalist id="destinations">
                  {destinations.map((destination) => (
                    <option key={destination.id} value={destination.name} />
                  ))}
                </datalist>
              </label>
              <label>
                <span className="field-heading">{t('orders.recurringForm.nextOccurrence')} <span className="setup-required-mark" aria-hidden="true">*</span></span>
                <input name="nextOccurrenceDate" type="date" defaultValue={focusDate} required />
              </label>
              <label>
                <span className="field-heading">{t('orders.recurringForm.recurrence')}</span>
                <select name="frequency" defaultValue="weekly">
                  <option value="daily">{t('orders.recurringForm.frequency.daily')}</option>
                  <option value="weekly">{t('orders.recurringForm.frequency.weekly')}</option>
                </select>
              </label>
              <div className="form-callout form-callout-generated">
                <SparklesIcon className="callout-icon" />
                <div>
                  <strong>{t('orders.recurringForm.generatedCalloutTitle')}</strong>
                  <p className="helper-text no-margin">{t('orders.recurringForm.generatedCalloutBody')}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="field-section">
            <div className="field-section-header">
              <div>
                <h3>{t('orders.recurringForm.weeklyRhythm')}</h3>
                <p className="helper-text">{t('orders.recurringForm.weeklyRhythmHelp')}</p>
              </div>
            </div>
            <fieldset className="weekday-fieldset">
              <legend>{t('orders.recurringForm.weeklyDays')}</legend>
              <div className="weekday-row">
                {weekdayOptions.map((option) => (
                  <label key={option.value} className="weekday-chip">
                    <input name="weeklyDays" type="checkbox" value={option.value} defaultChecked={option.value === 'sat'} />
                    <span>{formatWeekdayLabel(option.value, t)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>
        </div>

        <section className="field-section">
          <div className="field-section-header">
            <div>
              <h3>{t('orders.recurringForm.notes')}</h3>
              <p className="helper-text">{t('orders.recurringForm.notesHelp')}</p>
            </div>
          </div>
          <label>
            <span className="field-heading">{t('orders.orderForm.fields.dispatchNotes')} <span className="optional-pill">{t('common.optional')}</span></span>
            <textarea name="notes" placeholder={t('orders.recurringForm.placeholders.notes')} />
          </label>
        </section>
      </section>

      <section className="panel page-stack">
        <div className="section-header compact-header">
          <div>
            <p className="eyebrow">{t('orders.recurringForm.recurringLinesEyebrow')}</p>
            <h2>{t('orders.recurringForm.recurringLinesTitle')}</h2>
            <p className="section-copy">{t('orders.recurringForm.recurringLinesBody')}</p>
          </div>
        </div>

        <LineItemsEditor
          editorId="recurring-lines-editor"
          initialLines={lineDrafts}
          productSuggestions={productSuggestions}
          lineTypeOptions={lineTypeOptions}
          sectionLabel={t('orders.recurringForm.lineSectionLabel')}
        />
      </section>

      <div className="action-row form-footer-row">
        <div className="helper-text action-hint">
          <CheckIcon className="button-icon" />
          <span>{t('orders.recurringForm.footerHint')}</span>
        </div>
        <SubmitButton
          className="button-primary button-reset"
          pendingLabel={t('orders.recurringForm.saving')}
          icon={<CheckIcon className="button-icon" />}
        >
          {t('orders.recurringForm.save')}
        </SubmitButton>
      </div>
    </form>
  );
}
