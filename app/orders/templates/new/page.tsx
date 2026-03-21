import Link from 'next/link';
import { RecurringTemplateForm } from '@/components/orders/recurring-template-form';
import { createRecurringTemplateAction } from '@/lib/server/actions';
import { getRecurringTemplateEditor } from '@/lib/server/demo-data';
import { ArrowRightIcon, SparklesIcon } from '@/components/ui-icons';

export default async function NewRecurringTemplatePage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const [view, params] = await Promise.all([getRecurringTemplateEditor(), searchParams]);

  return (
    <div className="page-stack">
      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">Sales workspace</p>
          <h1>New recurring template</h1>
          <p>Capture a repeatable order rhythm once, then let SKOSS generate the dated orders ahead.</p>
        </div>
        <Link href="/orders" className="button-secondary">
          <ArrowRightIcon className="button-icon button-icon-reverse" />
          <span>Back to orders</span>
        </Link>
      </section>

      {params?.error ? <p className="inline-warning">{params.error}</p> : null}

      <section className="page-context-card">
        <SparklesIcon className="callout-icon" />
        <div>
          <strong>Recurring demand should stay lightweight.</strong>
          <p className="helper-text no-margin">This template creates useful repeated work without turning the workflow into a heavy scheduling system.</p>
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
