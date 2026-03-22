import { formatCurrency, formatDateLabel, formatTemplateScheduleLabel, formatUnitRate } from '@/lib/domain/formatters';
import { createRawMaterialAction, createSupplierAction, createSupplierPriceEntryAction } from '@/lib/server/actions';
import { getSetupWorkspace } from '@/lib/server/demo-data';
import { getServerTranslator } from '@/lib/i18n/server';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { SetupIcon, SparklesIcon } from '@/components/ui-icons';

async function SavedMessage({ saved }: { saved?: string }) {
  const { t } = await getServerTranslator();

  if (saved === 'supplier') {
    return <p className="inline-success">{t('setup.saved.supplier')}</p>;
  }

  if (saved === 'raw-material') {
    return <p className="inline-success">{t('setup.saved.rawMaterial')}</p>;
  }

  if (saved === 'price') {
    return <p className="inline-success">{t('setup.saved.price')}</p>;
  }

  return null;
}

export default async function SetupPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; saved?: string }>;
}) {
  const [data, params, { t, locale, term }] = await Promise.all([getSetupWorkspace(), searchParams, getServerTranslator()]);

  return (
    <div className="page-stack">
      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">{t('setup.workspace')}</p>
          <h1>{t('setup.title')}</h1>
          <p>{t('setup.description')}</p>
        </div>
      </section>

      <SavedMessage saved={params?.saved} />
      {params?.error ? <p className="inline-warning">{params.error}</p> : null}

      <section className="page-context-card">
        <SetupIcon className="callout-icon" />
        <div>
          <strong>{t('setup.calloutTitle')}</strong>
          <p className="helper-text no-margin">{t('setup.calloutBody')}</p>
        </div>
      </section>

      <section className="panel page-stack">
        <div className="table-header-row">
          <div>
            <h2>{t('setup.appearance')}</h2>
            <p>{t('setup.appearanceHelp')}</p>
          </div>
          <span className="summary-pill">{t('theme.quickSwitchHeader')}</span>
        </div>
        <ThemeSwitcher variant="panel" />
      </section>

      <section className="stats-grid compact-stats-grid">
        <article className="stat-card">
          <span className="stat-label">{t('setup.activeSuppliers')}</span>
          <strong>{data.suppliers.filter((supplier) => supplier.active).length}</strong>
          <span>{t('setup.activeSuppliersHelp')}</span>
        </article>
        <article className="stat-card stat-card-info">
          <span className="stat-label">{t('setup.rawMaterials')}</span>
          <strong>{data.rawMaterials.length}</strong>
          <span>{t('setup.rawMaterialsHelp')}</span>
        </article>
        <article className="stat-card stat-card-success">
          <span className="stat-label">{t('setup.recordedPrices')}</span>
          <strong>{data.supplierPriceEntries.length}</strong>
          <span>{t('setup.recordedPricesHelp')}</span>
        </article>
      </section>

      <section className="grid-two">
        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('setup.productsAndVariants')}</h2>
              <p>{t('setup.productsAndVariantsHelp')}</p>
            </div>
            <span className="summary-pill">{data.products.length} {t('common.products')}</span>
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
              <h2>{t('setup.destinations')}</h2>
              <p>{t('setup.destinationsHelp')}</p>
            </div>
            <span className="summary-pill">{data.destinations.length} {term('destination', 'many')}</span>
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
              <h2>{t('setup.recurringRhythms')}</h2>
              <p>{t('setup.recurringRhythmsHelp')}</p>
            </div>
            <span className="summary-pill">{data.recurringTemplates.length} {t('common.templates')}</span>
          </div>
          <ul className="stack-list">
            {data.recurringTemplates.map((template) => (
              <li key={template.id}>
                <strong>{template.customerLabel}</strong>
                <span>
                  {formatTemplateScheduleLabel(template, t)} · {t('orders.nextUp')} {formatDateLabel(template.nextOccurrenceDate, locale)}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('setup.users')}</h2>
              <p>{t('setup.usersHelp')}</p>
            </div>
            <span className="summary-pill">{data.users.length} {t('common.users')}</span>
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
            <h2>{t('setup.operationalDataLayer')}</h2>
            <p>{t('setup.operationalDataLayerHelp')}</p>
          </div>
          <span className="summary-pill">{t('setup.draftFirstFriendly')}</span>
        </div>
        <div className="grid-two">
          <article className="subpanel page-stack">
            <div className="table-header-row">
              <div>
                <h3>{t('setup.suppliers')}</h3>
                <p>{t('setup.suppliersHelp')}</p>
              </div>
              <span className="summary-pill">{data.suppliers.length} {t('common.suppliers')}</span>
            </div>
            <ul className="stack-list">
              {data.suppliers.map((supplier) => (
                <li key={supplier.id}>
                  <strong>
                    {supplier.name}
                    {!supplier.active ? ` · ${t('common.inactive').toLowerCase()}` : ''}
                  </strong>
                  <span>{supplier.contact ?? supplier.notes ?? t('setup.noExtraContactYet')}</span>
                </li>
              ))}
            </ul>
            <form action={createSupplierAction} className="field-section page-stack">
              <div className="field-section-header">
                <div>
                  <h3>{t('setup.addSupplier')}</h3>
                  <p className="helper-text">{t('setup.addSupplierHelp')}</p>
                </div>
              </div>
              <div className="grid-two">
                <label>
                  <span className="field-heading">{t('setup.fields.supplierName')} <span className="required-dot">{t('common.required')}</span></span>
                  <input name="name" placeholder="Harina Viva" required />
                </label>
                <label>
                  <span className="field-heading">{t('setup.fields.contact')} <span className="optional-pill">{t('common.optional')}</span></span>
                  <input name="contact" placeholder={t('setup.placeholders.contact')} />
                </label>
              </div>
              <label>
                <span className="field-heading">{t('setup.fields.notes')} <span className="optional-pill">{t('common.optional')}</span></span>
                <textarea name="notes" placeholder={t('setup.placeholders.supplierNotes')} />
              </label>
              <label className="checkbox-row">
                <input name="active" type="checkbox" defaultChecked />
                <span>
                  <strong>{t('setup.fields.activeSupplier')}</strong>
                  <span className="helper-text">{t('setup.fields.activeSupplierHelp')}</span>
                </span>
              </label>
              <button type="submit" className="button-primary">{t('setup.actions.saveSupplier')}</button>
            </form>
          </article>

          <article className="subpanel page-stack">
            <div className="table-header-row">
              <div>
                <h3>{t('setup.rawMaterialsSection')}</h3>
                <p>{t('setup.rawMaterialsSectionHelp')}</p>
              </div>
              <span className="summary-pill">{data.rawMaterials.length} {t('common.materials')}</span>
            </div>
            <ul className="stack-list">
              {data.rawMaterials.map((material) => {
                const latestPrice = data.latestPriceByMaterial.get(material.id);

                return (
                  <li key={material.id}>
                    <strong>
                      {material.name}
                      {!material.active ? ` · ${t('common.inactive').toLowerCase()}` : ''}
                    </strong>
                    <span>
                      {[material.category, `${material.defaultUnit} ${t('setup.labels.defaultUnitSuffix')}`, latestPrice ? `${t('setup.labels.latest')} ${formatUnitRate(latestPrice, locale)}` : null]
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
                  <h3>{t('setup.addRawMaterial')}</h3>
                  <p className="helper-text">{t('setup.addRawMaterialHelp')}</p>
                </div>
              </div>
              <div className="grid-two">
                <label>
                  <span className="field-heading">{t('setup.fields.rawMaterialName')} <span className="required-dot">{t('common.required')}</span></span>
                  <input name="name" placeholder={t('setup.placeholders.rawMaterialName')} required />
                </label>
                <label>
                  <span className="field-heading">{t('setup.fields.category')} <span className="optional-pill">{t('common.optional')}</span></span>
                  <input name="category" placeholder={t('setup.placeholders.category')} />
                </label>
                <label>
                  <span className="field-heading">{t('setup.fields.defaultUnit')} <span className="required-dot">{t('common.required')}</span></span>
                  <input name="defaultUnit" defaultValue="kg" required />
                </label>
                <label>
                  <span className="field-heading">{t('setup.fields.brand')} <span className="optional-pill">{t('common.optional')}</span></span>
                  <input name="brand" placeholder={t('setup.placeholders.brand')} />
                </label>
              </div>
              <label>
                <span className="field-heading">{t('setup.fields.notes')} <span className="optional-pill">{t('common.optional')}</span></span>
                <textarea name="notes" placeholder={t('setup.placeholders.rawMaterialNotes')} />
              </label>
              <label className="checkbox-row">
                <input name="active" type="checkbox" defaultChecked />
                <span>
                  <strong>{t('setup.fields.activeRawMaterial')}</strong>
                  <span className="helper-text">{t('setup.fields.activeRawMaterialHelp')}</span>
                </span>
              </label>
              <button type="submit" className="button-primary">{t('setup.actions.saveRawMaterial')}</button>
            </form>
          </article>
        </div>
      </section>

      <section className="panel page-stack">
        <div className="table-header-row">
          <div>
            <h2>{t('setup.supplierPriceMemory')}</h2>
            <p>{t('setup.supplierPriceMemoryHelp')}</p>
          </div>
          <span className="summary-pill">{data.supplierPriceEntries.length} {t('common.entries')}</span>
        </div>

        <div className="grid-two">
          <div className="subpanel page-stack">
            <ul className="stack-list">
              {data.supplierPriceEntries.map((entry) => (
                <li key={entry.id}>
                  <strong>
                    {entry.rawMaterialLabel} · {formatCurrency(entry.price, locale)}
                  </strong>
                  <span>
                    {entry.supplierLabel} · {entry.packageQuantity} {entry.packageUnit}
                    {entry.presentation ? ` · ${entry.presentation}` : ''}
                    {' · '}
                    {formatDateLabel(entry.priceDate, locale)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <form action={createSupplierPriceEntryAction} className="subpanel page-stack">
            <div className="field-section-header">
              <div>
                <h3>{t('setup.addSupplierPrice')}</h3>
                <p className="helper-text">{t('setup.addSupplierPriceHelp')}</p>
              </div>
            </div>
            <div className="grid-two">
              <label>
                <span className="field-heading">{t('setup.fields.supplier')} <span className="required-dot">{t('common.required')}</span></span>
                <select name="supplierId" defaultValue="" required>
                  <option value="" disabled>{t('common.selectSupplier')}</option>
                  {data.suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="field-heading">{t('setup.fields.rawMaterial')} <span className="required-dot">{t('common.required')}</span></span>
                <select name="rawMaterialId" defaultValue="" required>
                  <option value="" disabled>{t('common.selectRawMaterial')}</option>
                  {data.rawMaterials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="field-heading">{t('setup.fields.presentation')} <span className="optional-pill">{t('common.optional')}</span></span>
                <input name="presentation" placeholder={t('setup.placeholders.presentation')} />
              </label>
              <label>
                <span className="field-heading">{t('setup.fields.brand')} <span className="optional-pill">{t('common.optional')}</span></span>
                <input name="brand" placeholder={t('setup.placeholders.supplierBrand')} />
              </label>
              <label>
                <span className="field-heading">{t('setup.fields.packageQuantity')} <span className="required-dot">{t('common.required')}</span></span>
                <input name="packageQuantity" type="number" min="0.01" step="0.01" placeholder={t('setup.placeholders.packageQuantity')} required />
              </label>
              <label>
                <span className="field-heading">{t('setup.fields.packageUnit')} <span className="required-dot">{t('common.required')}</span></span>
                <input name="packageUnit" placeholder={t('setup.placeholders.packageUnit')} required />
              </label>
              <label>
                <span className="field-heading">{t('setup.fields.price')} <span className="required-dot">{t('common.required')}</span></span>
                <input name="price" type="number" min="0.01" step="0.01" placeholder={t('setup.placeholders.price')} required />
              </label>
              <label>
                <span className="field-heading">{t('setup.fields.date')} <span className="required-dot">{t('common.required')}</span></span>
                <input name="priceDate" type="date" defaultValue={data.supplierPriceEntries[0]?.priceDate ?? ''} required />
              </label>
            </div>
            <label>
              <span className="field-heading">{t('setup.fields.note')} <span className="optional-pill">{t('common.optional')}</span></span>
              <textarea name="note" placeholder={t('setup.placeholders.priceNote')} />
            </label>
            <button type="submit" className="button-primary">{t('setup.actions.saveSupplierPrice')}</button>
          </form>
        </div>
      </section>

      <section className="page-context-card">
        <SparklesIcon className="callout-icon" />
        <div>
          <strong>{t('setup.futureTitle')}</strong>
          <p className="helper-text no-margin">{t('setup.futureBody')}</p>
        </div>
      </section>
    </div>
  );
}
