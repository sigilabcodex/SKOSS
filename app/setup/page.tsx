import { destinations, products, recurringTemplates, users } from '@/data/demo-fixtures';

export default function SetupPage() {
  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <p className="eyebrow">Setup workspace</p>
          <h1>Lightweight organization</h1>
          <p>
            v0 setup supports the work. It should never force a heavy admin project before daily
            use.
          </p>
        </div>
      </section>

      <section className="grid-two">
        <article className="panel">
          <h2>Products and variants</h2>
          <ul className="stack-list">
            {products.map((product) => (
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
            {destinations.map((destination) => (
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
          <h2>Recurring templates</h2>
          <ul className="stack-list">
            {recurringTemplates.map((template) => (
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
            {users.map((user) => (
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
