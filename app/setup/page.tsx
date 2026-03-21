import { formatDateLabel, formatTemplateScheduleLabel } from '@/lib/domain/formatters';
import { getSetupWorkspace } from '@/lib/server/demo-data';
import { SetupIcon, SparklesIcon } from '@/components/ui-icons';

export default async function SetupPage() {
  const data = await getSetupWorkspace();

  return (
    <div className="page-stack">
      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">Setup workspace</p>
          <h1>Lightweight organization</h1>
          <p>
            Setup still supports the work instead of blocking it. Products, destinations, recurring
            rhythms, and active users stay visible without turning into ERP-heavy configuration.
          </p>
        </div>
      </section>

      <section className="page-context-card">
        <SetupIcon className="callout-icon" />
        <div>
          <strong>Keep setup practical.</strong>
          <p className="helper-text no-margin">These lists should help operators work faster, not force heavy data maintenance before first use.</p>
        </div>
      </section>

      <section className="grid-two">
        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>Products and variants</h2>
              <p>Use practical names that operators already understand on the floor.</p>
            </div>
            <span className="summary-pill">{data.products.length} products</span>
          </div>
          <ul className="stack-list">
            {data.products.map((product) => (
              <li key={product.id}>
                <strong>{product.name}</strong>
                <span>{product.variants.map((variant) => variant.name).join(', ')}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>Destinations</h2>
              <p>These should stay recognizable to both sales and kitchen teams.</p>
            </div>
            <span className="summary-pill">{data.destinations.length} destinations</span>
          </div>
          <ul className="stack-list">
            {data.destinations.map((destination) => (
              <li key={destination.id}>
                <strong>{destination.name}</strong>
                <span>{destination.kind}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid-two">
        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>Recurring rhythms</h2>
              <p>Repeated work should stay explicit and easy to review.</p>
            </div>
            <span className="summary-pill">{data.recurringTemplates.length} rhythms</span>
          </div>
          <ul className="stack-list">
            {data.recurringTemplates.map((template) => (
              <li key={template.id}>
                <strong>{template.customerLabel}</strong>
                <span>
                  {formatTemplateScheduleLabel(template)} · next {formatDateLabel(template.nextOccurrenceDate)}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>Users</h2>
              <p>Visible roles support handoff and accountability without adding admin-heavy complexity.</p>
            </div>
            <span className="summary-pill">{data.users.length} users</span>
          </div>
          <ul className="stack-list">
            {data.users.map((user) => (
              <li key={user.id}>
                <strong>{user.displayName}</strong>
                <span>{user.role}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="page-context-card">
        <SparklesIcon className="callout-icon" />
        <div>
          <strong>Future setup should follow repeated need.</strong>
          <p className="helper-text no-margin">If a field or list does not help real daily work, it should not become mandatory by default.</p>
        </div>
      </section>
    </div>
  );
}
