import Link from 'next/link';
import { RecurringTemplateForm } from '@/components/orders/recurring-template-form';
import { createRecurringTemplateAction } from '@/lib/server/actions';
import { getRecurringTemplateEditor } from '@/lib/server/demo-data';
import { getServerTranslator } from '@/lib/i18n/server';
import { ArrowRightIcon, SparklesIcon } from '@/components/ui-icons';

export default async function NewRecurringTemplatePage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const [view, params, { t }] = await Promise.all([getRecurringTemplateEditor(), searchParams, getServerTranslator()]);

  return (
    <div className="page-stack">
      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">{t('orders.workspace')}</p>
          <h1>{t('orders.recurringPage.title')}</h1>
          <p>{t('orders.recurringPage.description')}</p>
        </div>
        <Link href="/orders" className="button-secondary">
          <ArrowRightIcon className="button-icon button-icon-reverse" />
          <span>{t('common.backToOrders')}</span>
        </Link>
      </section>

      {params?.error ? <p className="inline-warning">{params.error}</p> : null}

      <section className="page-context-card">
        <SparklesIcon className="callout-icon" />
        <div>
          <strong>{t('orders.recurringPage.calloutTitle')}</strong>
          <p className="helper-text no-margin">{t('orders.recurringPage.calloutBody')}</p>
        </div>
      </section>

      <RecurringTemplateForm
        action={createRecurringTemplateAction}
        destinations={view.destinations}
        productSuggestions={view.productSuggestions}
        focusDate={view.focusDate}
      />
    </div>
  );
}
