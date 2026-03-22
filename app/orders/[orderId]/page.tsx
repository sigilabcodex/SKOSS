import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrderForm } from '@/components/orders/order-form';
import { SubmitButton } from '@/components/submit-button';
import { formatLineProgressLabel, formatStatusLabel } from '@/lib/domain/formatters';
import { updateOrderAction, updateOrderLineProgressAction } from '@/lib/server/actions';
import { getLineStatus, getOrderEditor, getOrderProgress } from '@/lib/server/demo-data';
import { getServerTranslator } from '@/lib/i18n/server';
import { ArrowRightIcon, CheckIcon } from '@/components/ui-icons';

export default async function EditOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams?: Promise<{ error?: string; saved?: string }>;
}) {
  const resolvedParams = await params;
  const [view, pageParams, { t }] = await Promise.all([
    getOrderEditor(resolvedParams.orderId),
    searchParams,
    getServerTranslator(),
  ]);

  if (!view.order) {
    notFound();
  }

  const action = updateOrderAction.bind(null, view.order.id);
  const progress = getOrderProgress(view.order);

  return (
    <div className="page-stack">
      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">{t('orders.workspace')}</p>
          <h1>{view.order.customerLabel}</h1>
          <p>
            {formatStatusLabel(view.order.fulfillmentType, t)} {t('orders.editPage.descriptionSeparator')} {t('orders.editPage.editDescription')}
          </p>
        </div>
        <Link href="/orders" className="button-secondary">
          <ArrowRightIcon className="button-icon button-icon-reverse" />
          <span>{t('common.backToOrders')}</span>
        </Link>
      </section>

      {pageParams?.saved === '1' ? <p className="inline-success"><CheckIcon className="button-icon" />{t('orders.editPage.saved')}</p> : null}
      {pageParams?.saved === 'progress' ? <p className="inline-success"><CheckIcon className="button-icon" />{t('orders.editPage.progressSaved')}</p> : null}
      {pageParams?.error ? <p className="inline-warning">{pageParams.error}</p> : null}

      <section className="panel page-stack">
        <div className="table-header-row">
          <div>
            <strong>{t('orders.editPage.quickCompletion')}</strong>
            <p>{t('orders.editPage.quickCompletionHelp')}</p>
          </div>
          <span className="summary-pill">
            {progress.completedQuantity}/{progress.requiredQuantity || 0} {t('common.completed').toLowerCase()}
          </span>
        </div>

        <div className="line-grid-stack">
          {view.order.lines.filter((line) => line.lineType !== 'note_item').map((line) => {
            const progressAction = updateOrderLineProgressAction.bind(null, view.order!.id, line.id);
            const lineStatus = getLineStatus(line);

            return (
              <form key={line.id} action={progressAction} className="line-entry-card progress-card">
                <div className="order-card-header">
                  <div>
                    <strong>{line.productLabel}</strong>
                    <p>{line.note ?? t('orders.editPage.noExtraLineNote')}</p>
                  </div>
                  <span className={`badge badge-${lineStatus}`}>{formatStatusLabel(lineStatus, t)}</span>
                </div>
                <div className="line-grid">
                  <label>
                    <span className="field-heading">{t('common.completed')}</span>
                    <input
                      name="completedQuantity"
                      type="number"
                      min="0"
                      max={line.quantity}
                      defaultValue={line.completedQuantity}
                    />
                  </label>
                  <label>
                    <span className="field-heading">{t('common.total')}</span>
                    <input value={`${line.quantity} ${line.unit}`} disabled />
                  </label>
                </div>
                <div className="action-cluster action-cluster-spread align-center">
                  <span className="field-label progress-label">{formatLineProgressLabel(line)}</span>
                  <SubmitButton
                    className="button-primary button-reset"
                    pendingLabel={t('orders.editPage.savingProgress')}
                    icon={<CheckIcon className="button-icon" />}
                  >
                    {t('orders.editPage.saveProgress')}
                  </SubmitButton>
                </div>
              </form>
            );
          })}
        </div>
      </section>

      <OrderForm
        action={action}
        destinations={view.destinations}
        order={view.order}
        productSuggestions={view.productSuggestions}
        focusDate={view.focusDate}
      />
    </div>
  );
}
