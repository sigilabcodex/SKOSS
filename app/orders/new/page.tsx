import Link from 'next/link';
import { OrderForm } from '@/components/orders/order-form';
import { createOrderAction } from '@/lib/server/actions';
import { getOrderEditor } from '@/lib/server/demo-data';

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const [view, params] = await Promise.all([getOrderEditor(), searchParams]);

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <p className="eyebrow">Sales workspace</p>
          <h1>New order</h1>
          <p>Capture demand quickly, even when the customer or item is still just a practical label.</p>
        </div>
        <Link href="/orders" className="button-secondary">
          Back to orders
        </Link>
      </section>

      {params?.error ? <p className="inline-warning">{params.error}</p> : null}

      <OrderForm
        action={createOrderAction}
        destinations={view.destinations}
        productSuggestions={view.productSuggestions}
        focusDate={view.focusDate}
      />
    </div>
  );
}
