import Link from 'next/link';
import { OrderForm } from '@/components/orders/order-form';
import { createOrderAction } from '@/lib/server/actions';
import { getOrderEditor } from '@/lib/server/demo-data';
import { ArrowRightIcon, OrdersIcon } from '@/components/ui-icons';

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const [view, params] = await Promise.all([getOrderEditor(), searchParams]);

  return (
    <div className="page-stack">
      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">Sales workspace</p>
          <h1>New order</h1>
          <p>Capture demand quickly, even when the customer or item is still just a practical label.</p>
        </div>
        <Link href="/orders" className="button-secondary">
          <ArrowRightIcon className="button-icon button-icon-reverse" />
          <span>Back to orders</span>
        </Link>
      </section>

      {params?.error ? <p className="inline-warning">{params.error}</p> : null}

      <section className="page-context-card">
        <OrdersIcon className="callout-icon" />
        <div>
          <strong>Fast order capture</strong>
          <p className="helper-text no-margin">Required details stay obvious first. Notes, draft labels, and kitchen flags remain close by when they matter.</p>
        </div>
      </section>

      <OrderForm
        action={createOrderAction}
        destinations={view.destinations}
        productSuggestions={view.productSuggestions}
        focusDate={view.focusDate}
      />
    </div>
  );
}
