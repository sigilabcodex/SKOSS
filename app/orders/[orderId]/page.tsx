import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrderForm } from '@/components/orders/order-form';
import { updateOrderAction } from '@/lib/server/actions';
import { getOrderEditor } from '@/lib/server/demo-data';

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

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <p className="eyebrow">Sales workspace</p>
          <h1>{view.order.customerLabel}</h1>
          <p>Edit quantities, notes, or draft items without leaving the workspace.</p>
        </div>
        <Link href="/orders" className="button-secondary">
          Back to orders
        </Link>
      </section>

      {pageParams?.saved ? <p className="inline-success">Order saved and marked visible to production.</p> : null}
      {pageParams?.error ? <p className="inline-warning">{pageParams.error}</p> : null}

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
