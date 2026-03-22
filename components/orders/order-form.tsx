'use client';

import type { Destination, Order } from '@/lib/domain/types';
import { getDefaultLineDrafts, getOrderProgress } from '@/lib/domain/order-helpers';
import { useI18n } from '@/components/i18n-provider';
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

const lineTypeValues = [
  { value: 'product_variant', key: 'structuredItem' },
  { value: 'draft_product', key: 'draftItem' },
  { value: 'note_item', key: 'noteItem' },
] as const;

const sourceOptions = [
  { value: 'manual', key: 'manual' },
  { value: 'whatsapp', key: 'whatsapp' },
  { value: 'phone', key: 'phone' },
  { value: 'walk_in', key: 'walk_in' },
] as const;

const fulfillmentOptions = [
  { value: 'pickup', key: 'pickup' },
  { value: 'own_delivery', key: 'own_delivery' },
  { value: 'app_delivery', key: 'app_delivery' },
] as const;

const statusOptions = ['draft', 'active', 'changed', 'cancelled', 'completed'] as const;

export function OrderForm({ action, destinations, order, productSuggestions, focusDate }: OrderFormProps) {
  const { t } = useI18n();
  const lineDrafts = getDefaultLineDrafts(order?.lines);
  const visibleOnProductionBoard = order?.visibleOnProductionBoard ?? true;
  const changedInKitchen = order?.changedInKitchen ?? order?.status === 'changed';
  const fulfillmentType = order?.fulfillmentType
    ?? ((order?.destinationLabel?.toLowerCase().includes('counter') || order?.destinationLabel?.toLowerCase().includes('pickup'))
      ? 'pickup'
      : order?.destinationLabel
        ? 'own_delivery'
        : 'pickup');
  const progress = order ? getOrderProgress(order) : null;
  const existingStatuses = order?.lines.map((line) => ({
    label: `${line.completedQuantity}/${line.quantity} ${t('status.done').toLowerCase()}`,
    tone: line.lineStatus,
  }));
  const lineTypeOptions = lineTypeValues.map((option) => ({
    value: option.value,
    label: t(`orders.lineEditor.kinds.${option.key}`),
  }));

  return (
    <form action={action} className="page-stack">
      <section className="panel page-stack">
        <div className="section-header compact-header">
          <div>
            <p className="eyebrow">{t('orders.orderForm.eyebrow')}</p>
            <h2>{order ? t('orders.orderForm.editOrder') : t('orders.orderForm.captureFast')}</h2>
            <p className="section-copy">{t('orders.orderForm.intro')}</p>
          </div>
          {order ? (
            <div className="page-stack compact-badge-stack align-end">
              <span className={`badge badge-${order.status}`}>{t(`status.${order.status}`)}</span>
              {order.generatedFromTemplate ? <span className="badge badge-generated">{t('common.recurring')}</span> : <span className="badge badge-manual">{t('common.manual')}</span>}
              {order.templateEdited ? <span className="badge badge-changed">{t('orders.orderForm.editedFromRhythm')}</span> : null}
              {progress && progress.partialLines > 0 ? <span className="badge badge-in_progress">{t('common.partialWork')}</span> : null}
            </div>
          ) : null}
        </div>

        {order && progress ? (
          <div className="stats-grid compact-stats-grid">
            <div className="stat-card">
              <span className="stat-label">{t('orders.orderForm.stats.completed')}</span>
              <strong>{progress.completedQuantity}</strong>
              <span>{t('orders.orderForm.stats.completedHelp')}</span>
            </div>
            <div className="stat-card stat-card-warn">
              <span className="stat-label">{t('orders.orderForm.stats.pending')}</span>
              <strong>{progress.remainingQuantity}</strong>
              <span>{t('orders.orderForm.stats.pendingHelp')}</span>
            </div>
            <div className="stat-card stat-card-info">
              <span className="stat-label">{t('orders.orderForm.stats.inProgress')}</span>
              <strong>{progress.partialLines}</strong>
              <span>{t('orders.orderForm.stats.inProgressHelp')}</span>
            </div>
          </div>
        ) : null}

        <div className="field-section-grid">
          <section className="field-section">
            <div className="field-section-header">
              <div>
                <h3>{t('orders.orderForm.sections.whoAndWhen')}</h3>
                <p className="helper-text">{t('orders.orderForm.sections.whoAndWhenHelp')}</p>
              </div>
              <span className="inline-meta">{t('orders.orderForm.sections.requiredFields')}</span>
            </div>
            <div className="grid-two">
              <label>
                <span className="field-heading">{t('orders.orderForm.fields.customerLabel')} <span className="required-dot">{t('common.required')}</span></span>
                <input
                  name="customerLabel"
                  defaultValue={order?.customerLabel ?? ''}
                  placeholder={t('orders.orderForm.placeholders.customerLabel')}
                  required
                />
                <span className="helper-text">{t('orders.orderForm.fields.customerLabelHelp')}</span>
              </label>
              <label>
                <span className="field-heading">{t('orders.orderForm.fields.customerPhone')} <span className="optional-pill">{t('common.optional')}</span></span>
                <input
                  name="customerPhone"
                  defaultValue={order?.customerPhone ?? ''}
                  placeholder={t('common.optional')}
                />
              </label>
              <label>
                <span className="field-heading">{t('orders.orderForm.fields.destination')} <span className="optional-pill">{t('common.optional')}</span></span>
                <input
                  name="destinationLabel"
                  list="destinations"
                  defaultValue={order?.destinationLabel ?? ''}
                  placeholder={t('orders.orderForm.placeholders.destination')}
                />
                <datalist id="destinations">
                  {destinations.map((destination) => (
                    <option key={destination.id} value={destination.name} />
                  ))}
                </datalist>
              </label>
              <label>
                <span className="field-heading">{t('orders.orderForm.fields.fulfillment')}</span>
                <select name="fulfillmentType" defaultValue={fulfillmentType}>
                  {fulfillmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(`orders.fulfillmentOptions.${option.key}`)}
                    </option>
                  ))}
                </select>
                <span className="helper-text">{t('orders.orderForm.fields.fulfillmentHelp')}</span>
              </label>
              <label>
                <span className="field-heading">{t('orders.orderForm.fields.source')}</span>
                <select name="source" defaultValue={order?.generatedFromTemplate ? 'generated' : order?.source ?? 'manual'}>
                  {sourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(`orders.sources.${option.key}`)}
                    </option>
                  ))}
                  {order?.generatedFromTemplate ? <option value="generated">{t('orders.sources.generated')}</option> : null}
                </select>
              </label>
              <label>
                <span className="field-heading">{t('orders.orderForm.fields.productionDay')} <span className="required-dot">{t('common.required')}</span></span>
                <input name="productionDate" type="date" defaultValue={order?.productionDate ?? focusDate} required />
              </label>
              <label>
                <span className="field-heading">{t('orders.orderForm.fields.dueDay')} <span className="required-dot">{t('common.required')}</span></span>
                <input name="dueDate" type="date" defaultValue={order?.dueDate ?? focusDate} required />
              </label>
            </div>
          </section>

          <section className="field-section">
            <div className="field-section-header">
              <div>
                <h3>{t('orders.orderForm.sections.dispatch')}</h3>
                <p className="helper-text">{t('orders.orderForm.sections.dispatchHelp')}</p>
              </div>
            </div>
            <div className="grid-two">
              <label>
                <span className="field-heading">{t('orders.orderForm.fields.deliveryProvider')} <span className="optional-pill">{t('common.optional')}</span></span>
                <input
                  name="deliveryProvider"
                  defaultValue={order?.deliveryProvider ?? ''}
                  placeholder={t('orders.orderForm.placeholders.deliveryProvider')}
                />
                <span className="helper-text">{t('orders.orderForm.fields.deliveryProviderHelp')}</span>
              </label>
              <label>
                <span className="field-heading">{t('orders.orderForm.fields.deliveryAssignee')} <span className="optional-pill">{t('common.optional')}</span></span>
                <input
                  name="deliveryAssignee"
                  defaultValue={order?.deliveryAssignee ?? ''}
                  placeholder={t('orders.orderForm.placeholders.deliveryAssignee')}
                />
              </label>
            </div>
            <label>
              <span className="field-heading">{t('orders.orderForm.fields.dispatchNotes')} <span className="optional-pill">{t('common.optional')}</span></span>
              <textarea
                name="dispatchNotes"
                defaultValue={order?.dispatchNotes ?? ''}
                placeholder={t('orders.orderForm.placeholders.dispatchNotes')}
              />
            </label>
          </section>

          <section className="field-section">
            <div className="field-section-header">
              <div>
                <h3>{t('orders.orderForm.sections.visibility')}</h3>
                <p className="helper-text">{t('orders.orderForm.sections.visibilityHelp')}</p>
              </div>
            </div>
            <div className="grid-two">
              <label>
                <span className="field-heading">{t('orders.orderForm.fields.orderStatus')}</span>
                <select name="status" defaultValue={order?.status ?? 'active'}>
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {t(`status.${option}`)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-callout form-callout-attention">
                <AlertIcon className="callout-icon" />
                <div>
                  <strong>{t('orders.orderForm.fields.changedCalloutTitle')}</strong>
                  <p className="helper-text no-margin">{t('orders.orderForm.fields.changedCalloutBody')}</p>
                </div>
              </div>
            </div>
            <div className="grid-two">
              <label className="checkbox-row checkbox-row-highlight">
                <input name="changedInKitchen" type="checkbox" defaultChecked={changedInKitchen} />
                <span>
                  <strong>{t('orders.orderForm.fields.kitchenAttentionNeeded')}</strong>
                  <span className="helper-text">{t('orders.orderForm.fields.kitchenAttentionHelp')}</span>
                </span>
              </label>
              <label className="checkbox-row">
                <input
                  name="visibleOnProductionBoard"
                  type="checkbox"
                  defaultChecked={visibleOnProductionBoard}
                />
                <span>
                  <strong>{t('orders.orderForm.fields.showOnBoard')}</strong>
                  <span className="helper-text">{t('orders.orderForm.fields.showOnBoardHelp')}</span>
                </span>
              </label>
            </div>
          </section>
        </div>

        <section className="field-section">
          <div className="field-section-header">
            <div>
              <h3>{t('orders.orderForm.sections.lines')}</h3>
              <p className="helper-text">{t('orders.orderForm.sections.linesHelp')}</p>
            </div>
          </div>
          <LineItemsEditor
            editorId="order-lines-editor"
            initialLines={lineDrafts}
            productSuggestions={productSuggestions}
            lineTypeOptions={lineTypeOptions}
            existingStatuses={existingStatuses}
            sectionLabel={t('orders.orderForm.sections.linesHelp')}
          />
        </section>
      </section>

      <div className="action-row form-footer-row">
        <div className="helper-text action-hint">
          <CheckIcon className="button-icon" />
          <span>{t('orders.orderForm.intro')}</span>
        </div>
        <SubmitButton
          className="button-primary button-reset"
          pendingLabel={order ? t('orders.orderForm.actions.updatingOrder') : t('orders.orderForm.actions.savingOrder')}
          icon={<CheckIcon className="button-icon" />}
        >
          {order ? t('orders.orderForm.actions.updateOrder') : t('orders.orderForm.actions.saveOrder')}
        </SubmitButton>
      </div>
    </form>
  );
}
