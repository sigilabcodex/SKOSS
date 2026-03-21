import { getSetupWorkspace } from '@/lib/server/demo-data';

export default async function SetupPage() {
  const data = await getSetupWorkspace();

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <p className="eyebrow">Setup workspace</p>
          <h1>Lightweight organization</h1>
          <p>
            Setup still supports the work instead of blocking it. Products, destinations, and rhythms
            are visible, but draft capture remains first-class.
          </p>
        </div>
      </section>

      <section className="grid-two">
        <article className="panel">
          <h2>Products and variants</h2>
          <ul className="stack-list">
            {data.products.map((product) => (
              <li key={product.id}>
                <strong>{product.name}</strong>
                <span>{product.variants.map((variant) => variant.name).join(', ')}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>Destinations</h2>
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
        <article className="panel">
          <h2>Recurring rhythms</h2>
          <ul className="stack-list">
            {data.recurringTemplates.map((template) => (
              <li key={template.id}>
                <strong>{template.title}</strong>
                <span>{template.scheduleRule}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>Users</h2>
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
    </div>
  );
}
