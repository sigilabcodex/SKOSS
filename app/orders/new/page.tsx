import Link from 'next/link';
import { OrderForm } from '@/components/orders/order-form';
import { createOrderAction } from '@/lib/server/actions';
import { getOrderEditor } from '@/lib/server/demo-data';
import { getServerTranslator } from '@/lib/i18n/server';
import { ArrowRightIcon, OrdersIcon } from '@/components/ui-icons';

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; customerId?: string }>;
}) {
  const params = await searchParams;
  const [view, { t }] = await Promise.all([
    getOrderEditor(undefined, params?.customerId),
    getServerTranslator(),
  ]);

  return (
    <div className="page-stack">
      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">{t('orders.workspace')}</p>
          <h1>{t('orders.newPage.title')}</h1>
          <p>{t('orders.newPage.description')}</p>
        </div>
        <Link href="/orders" className="button-secondary">
          <ArrowRightIcon className="button-icon button-icon-reverse" />
          <span>{t('common.backToOrders')}</span>
        </Link>
      </section>

      {params?.error ? <p className="inline-warning">{params.error}</p> : null}

      <section className="page-context-card">
        <OrdersIcon className="callout-icon" />
        <div>
          <strong>{t('orders.newPage.calloutTitle')}</strong>
          <p className="helper-text no-margin">{t('orders.newPage.calloutBody')}</p>
        </div>
      </section>

      <OrderForm
        action={createOrderAction}
        customers={view.customers}
        customerContextById={view.customerContextById}
        destinations={view.destinations}
        productSuggestions={view.productSuggestions}
        focusDate={view.focusDate}
        initialCustomerId={view.initialCustomerId}
      />
    </div>
  );
}
