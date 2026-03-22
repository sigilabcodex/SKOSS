import { formatCurrency, formatDateLabel, formatTemplateScheduleLabel, formatUnitRate } from '@/lib/domain/formatters';
import { createRawMaterialAction, createSupplierAction, createSupplierPriceEntryAction } from '@/lib/server/actions';
import { getSetupWorkspace } from '@/lib/server/demo-data';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { SetupIcon, SparklesIcon } from '@/components/ui-icons';

function SavedMessage({ saved }: { saved?: string }) {
  if (saved === 'supplier') {
    return <p className="inline-success">Supplier saved. Keep growing structure only where it helps daily work.</p>;
  }

  if (saved === 'raw-material') {
    return <p className="inline-success">Raw material saved. Future recipe costing can now point to a real ingredient foundation.</p>;
  }

  if (saved === 'price') {
    return <p className="inline-success">Supplier price saved. Historical comparisons are now available for future costing and buying choices.</p>;
  }

  return null;
}

export default async function SetupPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; saved?: string }>;
}) {
  const [data, params] = await Promise.all([getSetupWorkspace(), searchParams]);

  return (
    <div className="page-stack">
      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">Setup workspace</p>
          <h1>Lightweight organization</h1>
          <p>
            Setup still supports the work instead of blocking it. Orders, suppliers, raw materials,
            and price memory stay visible without turning SKOSS into a huge back office.
          </p>
        </div>
      </section>

      <SavedMessage saved={params?.saved} />
      {params?.error ? <p className="inline-warning">{params.error}</p> : null}

      <section className="page-context-card">
        <SetupIcon className="callout-icon" />
        <div>
          <strong>Keep setup practical.</strong>
          <p className="helper-text no-margin">
            These lists should help operators work faster, not force heavy data maintenance before first use.
          </p>
        </div>
      </section>

      <section className="panel page-stack">
        <div className="table-header-row">
          <div>
            <h2>Appearance</h2>
            <p>Global theme controls should stay available, but the fuller choice belongs in setup instead of dominating the header.</p>
          </div>
          <span className="summary-pill">Quick switch in header</span>
        </div>
        <ThemeSwitcher variant="panel" />
      </section>

      <section className="stats-grid compact-stats-grid">
        <article className="stat-card">
          <span className="stat-label">Active suppliers</span>
          <strong>{data.suppliers.filter((supplier) => supplier.active).length}</strong>
          <span>Practical vendor contacts ready for replenishment conversations.</span>
        </article>
        <article className="stat-card stat-card-info">
          <span className="stat-label">Raw materials</span>
          <strong>{data.rawMaterials.length}</strong>
          <span>Ingredient structure that future recipe costing can point to.</span>
        </article>
        <article className="stat-card stat-card-success">
          <span className="stat-label">Recorded prices</span>
          <strong>{data.supplierPriceEntries.length}</strong>
          <span>Historical supplier prices ready for later comparison and costing logic.</span>
        </article>
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

      <section className="panel page-stack">
        <div className="table-header-row">
          <div>
            <h2>Operational data layer</h2>
            <p>
              These records add just enough structure for supplier comparison, ingredient cleanup, and
              future recipe costing without forcing a full procurement suite.
            </p>
          </div>
          <span className="summary-pill">Draft-first friendly</span>
        </div>
        <div className="grid-two">
          <article className="subpanel page-stack">
            <div className="table-header-row">
              <div>
                <h3>Suppliers</h3>
                <p>Keep the contact detail and operational note that the team actually uses.</p>
              </div>
              <span className="summary-pill">{data.suppliers.length} suppliers</span>
            </div>
            <ul className="stack-list">
              {data.suppliers.map((supplier) => (
                <li key={supplier.id}>
                  <strong>
                    {supplier.name}
                    {!supplier.active ? ' · inactive' : ''}
                  </strong>
                  <span>{supplier.contact ?? supplier.notes ?? 'No extra contact detail yet.'}</span>
                </li>
              ))}
            </ul>
            <form action={createSupplierAction} className="field-section page-stack">
              <div className="field-section-header">
                <div>
                  <h3>Add supplier</h3>
                  <p className="helper-text">Simple enough to capture now, detailed enough to support future buying comparisons.</p>
                </div>
              </div>
              <div className="grid-two">
                <label>
                  <span className="field-heading">Supplier name <span className="required-dot">Required</span></span>
                  <input name="name" placeholder="Harina Viva" required />
                </label>
                <label>
                  <span className="field-heading">Contact <span className="optional-pill">Optional</span></span>
                  <input name="contact" placeholder="María · WhatsApp · phone" />
                </label>
              </div>
              <label>
                <span className="field-heading">Notes <span className="optional-pill">Optional</span></span>
                <textarea name="notes" placeholder="Delivery rhythm, minimum order, payment reminder, or route note" />
              </label>
              <label className="checkbox-row">
                <input name="active" type="checkbox" defaultChecked />
                <span>
                  <strong>Active supplier</strong>
                  <span className="helper-text">Turn this off when the contact should stay in history but out of active choices.</span>
                </span>
              </label>
              <button type="submit" className="button-primary">Save supplier</button>
            </form>
          </article>

          <article className="subpanel page-stack">
            <div className="table-header-row">
              <div>
                <h3>Raw materials</h3>
                <p>Keep ingredient language practical so future costing can reference real kitchen inputs.</p>
              </div>
              <span className="summary-pill">{data.rawMaterials.length} materials</span>
            </div>
            <ul className="stack-list">
              {data.rawMaterials.map((material) => {
                const latestPrice = data.latestPriceByMaterial.get(material.id);

                return (
                  <li key={material.id}>
                    <strong>
                      {material.name}
                      {!material.active ? ' · inactive' : ''}
                    </strong>
                    <span>
                      {[material.category, `${material.defaultUnit} default`, latestPrice ? `latest ${formatUnitRate(latestPrice)}` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </li>
                );
              })}
            </ul>
            <form action={createRawMaterialAction} className="field-section page-stack">
              <div className="field-section-header">
                <div>
                  <h3>Add raw material</h3>
                  <p className="helper-text">Keep defaults lightweight. Recipe and costing detail can grow later from this base.</p>
                </div>
              </div>
              <div className="grid-two">
                <label>
                  <span className="field-heading">Raw material name <span className="required-dot">Required</span></span>
                  <input name="name" placeholder="Bread flour" required />
                </label>
                <label>
                  <span className="field-heading">Category <span className="optional-pill">Optional</span></span>
                  <input name="category" placeholder="Flour, dairy, packaging" />
                </label>
                <label>
                  <span className="field-heading">Default unit <span className="required-dot">Required</span></span>
                  <input name="defaultUnit" defaultValue="kg" required />
                </label>
                <label>
                  <span className="field-heading">Brand <span className="optional-pill">Optional</span></span>
                  <input name="brand" placeholder="Default or preferred brand" />
                </label>
              </div>
              <label>
                <span className="field-heading">Notes <span className="optional-pill">Optional</span></span>
                <textarea name="notes" placeholder="Strength, substitution note, or prep reminder" />
              </label>
              <label className="checkbox-row">
                <input name="active" type="checkbox" defaultChecked />
                <span>
                  <strong>Active raw material</strong>
                  <span className="helper-text">Inactive materials remain available in history for past prices and future costing traces.</span>
                </span>
              </label>
              <button type="submit" className="button-primary">Save raw material</button>
            </form>
          </article>
        </div>
      </section>

      <section className="panel page-stack">
        <div className="table-header-row">
          <div>
            <h2>Supplier price memory</h2>
            <p>
              Record what was actually paid over time so SKOSS can later compare vendors and feed recipe
              costing without guessing from one current price.
            </p>
          </div>
          <span className="summary-pill">{data.supplierPriceEntries.length} entries</span>
        </div>

        <div className="grid-two">
          <div className="subpanel page-stack">
            <ul className="stack-list">
              {data.supplierPriceEntries.map((entry) => (
                <li key={entry.id}>
                  <strong>
                    {entry.rawMaterialLabel} · {formatCurrency(entry.price)}
                  </strong>
                  <span>
                    {entry.supplierLabel} · {entry.packageQuantity} {entry.packageUnit}
                    {entry.presentation ? ` · ${entry.presentation}` : ''}
                    {' · '}
                    {formatDateLabel(entry.priceDate)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <form action={createSupplierPriceEntryAction} className="subpanel page-stack">
            <div className="field-section-header">
              <div>
                <h3>Add supplier price</h3>
                <p className="helper-text">Capture the supplier, package size, and date once. SKOSS can normalize rates later.</p>
              </div>
            </div>
            <div className="grid-two">
              <label>
                <span className="field-heading">Supplier <span className="required-dot">Required</span></span>
                <select name="supplierId" defaultValue="" required>
                  <option value="" disabled>Select supplier</option>
                  {data.suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="field-heading">Raw material <span className="required-dot">Required</span></span>
                <select name="rawMaterialId" defaultValue="" required>
                  <option value="" disabled>Select raw material</option>
                  {data.rawMaterials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="field-heading">Presentation <span className="optional-pill">Optional</span></span>
                <input name="presentation" placeholder="25 kg sack, 5 kg block, tray" />
              </label>
              <label>
                <span className="field-heading">Brand <span className="optional-pill">Optional</span></span>
                <input name="brand" placeholder="Supplier brand or specific pack label" />
              </label>
              <label>
                <span className="field-heading">Package quantity <span className="required-dot">Required</span></span>
                <input name="packageQuantity" type="number" min="0.01" step="0.01" placeholder="25" required />
              </label>
              <label>
                <span className="field-heading">Package unit <span className="required-dot">Required</span></span>
                <input name="packageUnit" placeholder="kg, L, dozen, eggs" required />
              </label>
              <label>
                <span className="field-heading">Price <span className="required-dot">Required</span></span>
                <input name="price" type="number" min="0.01" step="0.01" placeholder="30" required />
              </label>
              <label>
                <span className="field-heading">Date <span className="required-dot">Required</span></span>
                <input name="priceDate" type="date" defaultValue={data.supplierPriceEntries[0]?.priceDate ?? ''} required />
              </label>
            </div>
            <label>
              <span className="field-heading">Note <span className="optional-pill">Optional</span></span>
              <textarea name="note" placeholder="Promo, emergency buy, route change, or quality note" />
            </label>
            <button type="submit" className="button-primary">Save supplier price</button>
          </form>
        </div>
      </section>

      <section className="page-context-card">
        <SparklesIcon className="callout-icon" />
        <div>
          <strong>Future setup should follow repeated need.</strong>
          <p className="helper-text no-margin">
            The goal here is future costing compatibility and better buying memory, not a full accounting or procurement module.
          </p>
        </div>
      </section>
    </div>
  );
}
