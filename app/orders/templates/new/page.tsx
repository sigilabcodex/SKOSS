import Link from 'next/link';
import { RecurringTemplateForm } from '@/components/orders/recurring-template-form';
import { createRecurringTemplateAction } from '@/lib/server/actions';
import { getRecurringTemplateEditor } from '@/lib/server/demo-data';

export default async function NewRecurringTemplatePage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const [view, params] = await Promise.all([getRecurringTemplateEditor(), searchParams]);

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <p className="eyebrow">Sales workspace</p>
          <h1>New recurring template</h1>
          <p>Capture a repeatable order rhythm once, then let SKOSS generate the dated orders ahead.</p>
        </div>
        <Link href="/orders" className="button-secondary">
          Back to orders
        </Link>
      </section>

      {params?.error ? <p className="inline-warning">{params.error}</p> : null}

      <RecurringTemplateForm
        action={createRecurringTemplateAction}
        destinations={view.destinations}
        productSuggestions={view.productSuggestions}
        focusDate={view.focusDate}
      />
    </div>
  );
}
