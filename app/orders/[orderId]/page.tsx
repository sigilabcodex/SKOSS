import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrderForm } from '@/components/orders/order-form';
import { SubmitButton } from '@/components/submit-button';
import { formatLineProgressLabel, formatStatusLabel } from '@/lib/domain/formatters';
import { updateOrderAction, updateOrderLineProgressAction } from '@/lib/server/actions';
import { getLineStatus, getOrderEditor, getOrderProgress } from '@/lib/server/demo-data';
import { ArrowRightIcon, CheckIcon } from '@/components/ui-icons';

export default async function EditOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams?: Promise<{ error?: string; saved?: string }>;
}) {
  const resolvedParams = await params;
  const [view, pageParams] = await Promise.all([
    getOrderEditor(resolvedParams.orderId),
    searchParams,
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
          <p className="eyebrow">Sales workspace</p>
          <h1>{view.order.customerLabel}</h1>
          <p>Edit quantities, notes, recurrence-generated demand, or quick completion updates without leaving the workspace.</p>
        </div>
        <Link href="/orders" className="button-secondary">
          <ArrowRightIcon className="button-icon button-icon-reverse" />
          <span>Back to orders</span>
        </Link>
      </section>

      {pageParams?.saved === '1' ? <p className="inline-success"><CheckIcon className="button-icon" />Order saved and marked visible to production.</p> : null}
      {pageParams?.saved === 'progress' ? <p className="inline-success"><CheckIcon className="button-icon" />Line completion updated.</p> : null}
      {pageParams?.error ? <p className="inline-warning">{pageParams.error}</p> : null}

      <section className="panel page-stack">
        <div className="table-header-row">
          <div>
            <strong>Quick completion</strong>
            <p>Update partial work per line without opening a separate kitchen-only screen.</p>
          </div>
          <span className="summary-pill">
            {progress.completedQuantity}/{progress.requiredQuantity || 0} completed
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
                    <p>{line.note ?? 'No extra line note'}</p>
                  </div>
                  <span className={`badge badge-${lineStatus}`}>{formatStatusLabel(lineStatus)}</span>
                </div>
                <div className="line-grid">
                  <label>
                    <span className="field-heading">Completed</span>
                    <input
                      name="completedQuantity"
                      type="number"
                      min="0"
                      max={line.quantity}
                      defaultValue={line.completedQuantity}
                    />
                  </label>
                  <label>
                    <span className="field-heading">Total</span>
                    <input value={`${line.quantity} ${line.unit}`} disabled />
                  </label>
                </div>
                <div className="action-cluster action-cluster-spread align-center">
                  <span className="field-label progress-label">{formatLineProgressLabel(line)}</span>
                  <SubmitButton
                    className="button-primary button-reset"
                    pendingLabel="Saving progress…"
                    icon={<CheckIcon className="button-icon" />}
                  >
                    Save progress
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
