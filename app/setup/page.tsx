import Link from 'next/link';
import {
  formatCurrency,
  formatDateLabel,
  formatTemplateScheduleLabel,
  formatUnitRate,
} from '@/lib/domain/formatters';
import type { Product, Recipe } from '@/lib/domain/types';
import { buildCostingSnapshotItems } from '@/lib/domain/recipe-costing';
import {
  createRawMaterialAction,
  createRecipeAction,
  createSupplierAction,
  createSupplierPriceEntryAction,
  createUserAction,
  updateRawMaterialAction,
  updateRecipeAction,
  updateSupplierAction,
  updateUserAction,
} from '@/lib/server/actions';
import { getSetupWorkspace } from '@/lib/server/demo-data';
import { getCurrentUserContext } from '@/lib/server/auth';
import { getPresetExperience } from '@/lib/business-presets';
import { getServerTranslator } from '@/lib/i18n/server';
import { getVisibleWorkspacesForRole } from '@/lib/workspaces';
import { OnboardingAssistant } from '@/components/setup/onboarding-assistant';
import { ImportHub } from '@/components/setup/import-hub';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { SetupIcon, SparklesIcon } from '@/components/ui-icons';

const basicUnits = [
  'g',
  'kg',
  'ml',
  'l',
  'unit',
  'piece',
  'dozen',
  'eggs',
] as const;

type SetupSearchParams = {
  error?: string;
  saved?: string;
  supplier?: string;
  material?: string;
  product?: string;
  historySupplier?: string;
  historyMaterial?: string;
  recipe?: string;
  user?: string;
  costingStatus?:
    | 'all'
    | 'fully_costed'
    | 'partially_costed'
    | 'missing_cost_evidence'
    | 'no_recipe';
  costingItem?: string;
  importedEntity?: 'customers' | 'suppliers' | 'rawMaterials';
  importedCount?: string;
  skippedCount?: string;
};

function buildSetupHref(params: Record<string, string | undefined>) {
  return {
    pathname: '/setup',
    query: Object.fromEntries(
      Object.entries(params).filter(([, value]) => Boolean(value)),
    ),
  };
}

function getProductLabel(
  product: Pick<Product, 'name'>,
  variant?: { name: string } | null,
) {
  return variant ? `${product.name} / ${variant.name}` : product.name;
}

function getRecipeLinkLabel(recipe: Recipe, products: Product[]) {
  const product = products.find((entry) => entry.id === recipe.productId);
  if (!product) {
    return recipe.title;
  }

  const variant = recipe.productVariantId
    ? (product.variants.find((entry) => entry.id === recipe.productVariantId) ??
      null)
    : null;

  return getProductLabel(product, variant);
}

function buildRecipeLineRows(recipe?: Recipe | null) {
  const existing = recipe?.lines ?? [];
  const blankCount = Math.max(3, 5 - existing.length);

  return [
    ...existing.map((line) => ({ ...line, isBlank: false, key: line.id })),
    ...Array.from({ length: blankCount }, (_, index) => ({
      id: '',
      rawMaterialId: '',
      rawMaterialLabel: '',
      quantity: undefined,
      unit: '',
      note: '',
      isBlank: true,
      key: `blank-${index}`,
    })),
  ];
}

function renderRequiredMark() {
  return (
    <span className="setup-required-mark" aria-hidden="true">
      *
    </span>
  );
}

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

  if (saved === 'recipe') {
    return <p className="inline-success">{t('setup.saved.recipe')}</p>;
  }

  if (saved === 'preferences') {
    return <p className="inline-success">{t('setup.saved.preferences')}</p>;
  }

  if (saved === 'user') {
    return <p className="inline-success">{t('setup.saved.user')}</p>;
  }

  if (saved === 'import') {
    return <p className="inline-success">{t('setup.saved.import')}</p>;
  }

  return null;
}

export default async function SetupPage({
  searchParams,
}: {
  searchParams?: Promise<SetupSearchParams>;
}) {
  const [data, params, { t, locale, term }, userContext] = await Promise.all([
    getSetupWorkspace(),
    searchParams,
    getServerTranslator(),
    getCurrentUserContext(),
  ]);
  const presetExperience = getPresetExperience(
    data.preferences.preset,
    data.preferences.operatingMode,
  );
  const today = new Date().toISOString().slice(0, 10);

  const editingSupplier = params?.supplier
    ? (data.suppliers.find((supplier) => supplier.id === params.supplier) ??
      null)
    : null;
  const editingMaterial = params?.material
    ? (data.rawMaterials.find((material) => material.id === params.material) ??
      null)
    : null;
  const selectedProduct = params?.product
    ? (data.products.find((product) => product.id === params.product) ?? null)
    : null;
  const editingRecipe = params?.recipe
    ? (data.recipes.find((recipe) => recipe.id === params.recipe) ?? null)
    : null;
  const editingUser = params?.user
    ? (data.users.find((user) => user.id === params.user) ?? null)
    : null;
  const historySupplier = params?.historySupplier
    ? (data.suppliers.find(
        (supplier) => supplier.id === params.historySupplier,
      ) ?? null)
    : null;
  const historyMaterial = params?.historyMaterial
    ? (data.rawMaterials.find(
        (material) => material.id === params.historyMaterial,
      ) ?? null)
    : null;

  const supplierFormAction = editingSupplier
    ? updateSupplierAction.bind(null, editingSupplier.id)
    : createSupplierAction;
  const rawMaterialFormAction = editingMaterial
    ? updateRawMaterialAction.bind(null, editingMaterial.id)
    : createRawMaterialAction;
  const recipeFormAction = editingRecipe
    ? updateRecipeAction.bind(null, editingRecipe.id)
    : createRecipeAction;
  const userFormAction = editingUser
    ? updateUserAction.bind(null, editingUser.id)
    : createUserAction;

  const supplierPriceCounts = new Map<string, number>();
  const materialPriceCounts = new Map<string, number>();
  for (const entry of data.supplierPriceEntries) {
    supplierPriceCounts.set(
      entry.supplierId,
      (supplierPriceCounts.get(entry.supplierId) ?? 0) + 1,
    );
    materialPriceCounts.set(
      entry.rawMaterialId,
      (materialPriceCounts.get(entry.rawMaterialId) ?? 0) + 1,
    );
  }

  const filteredPriceEntries = data.supplierPriceEntries.filter((entry) => {
    if (historySupplier && entry.supplierId !== historySupplier.id) {
      return false;
    }

    if (historyMaterial && entry.rawMaterialId !== historyMaterial.id) {
      return false;
    }

    return true;
  });

  const supplierHistoryHref = (supplierId: string) =>
    buildSetupHref({
      historySupplier: supplierId,
      historyMaterial: historyMaterial?.id,
      supplier: editingSupplier?.id,
      material: editingMaterial?.id,
      recipe: editingRecipe?.id,
    });

  const materialHistoryHref = (materialId: string) =>
    buildSetupHref({
      historySupplier: historySupplier?.id,
      historyMaterial: materialId,
      supplier: editingSupplier?.id,
      material: editingMaterial?.id,
      recipe: editingRecipe?.id,
    });

  const recipeLineRows = buildRecipeLineRows(editingRecipe);
  const recipeProductId = editingRecipe?.productId ?? selectedProduct?.id ?? '';
  const editingRecipeCost = editingRecipe
    ? (data.recipeCostById.get(editingRecipe.id) ?? null)
    : null;
  const activeRecipes = data.recipes.filter((recipe) => recipe.active).length;
  const linkedProductCount = new Set(
    data.recipes.map((recipe) => recipe.productVariantId ?? recipe.productId),
  ).size;
  const recipesByProduct = new Map<string, Recipe[]>();
  for (const recipe of data.recipes) {
    const existingRecipes = recipesByProduct.get(recipe.productId) ?? [];
    recipesByProduct.set(recipe.productId, [...existingRecipes, recipe]);
  }
  const costingItems = buildCostingSnapshotItems(
    data.products,
    data.recipes,
    data.recipeCostById,
  );
  const costingStatusFilter = params?.costingStatus ?? 'all';
  const filteredCostingItems = costingItems.filter(
    (item) =>
      costingStatusFilter === 'all' || item.status === costingStatusFilter,
  );
  const selectedCostingItem =
    (params?.costingItem
      ? (filteredCostingItems.find((item) => item.id === params.costingItem) ??
        costingItems.find((item) => item.id === params.costingItem) ??
        null)
      : null) ??
    filteredCostingItems[0] ??
    costingItems[0] ??
    null;
  const costingSummary = {
    fullyCosted: costingItems.filter((item) => item.status === 'fully_costed')
      .length,
    partiallyCosted: costingItems.filter(
      (item) => item.status === 'partially_costed',
    ).length,
    missingEvidence: costingItems.filter(
      (item) => item.status === 'missing_cost_evidence',
    ).length,
    noRecipe: costingItems.filter((item) => item.status === 'no_recipe').length,
  };
  const buildCostingHref = (overrides: Record<string, string | undefined>) =>
    buildSetupHref({
      supplier: editingSupplier?.id,
      material: editingMaterial?.id,
      historySupplier: historySupplier?.id,
      historyMaterial: historyMaterial?.id,
      recipe: editingRecipe?.id,
      product: selectedProduct?.id,
      costingStatus: costingStatusFilter,
      costingItem: selectedCostingItem?.id,
      ...overrides,
    });
  const setupGroups = [
    {
      title: t('setup.groups.business.title'),
      description: t('setup.groups.business.description'),
      links: [
        { href: '#business-setup', label: t('setup.sections.businessSetup') },
        { href: '#customers-summary', label: t('setup.sections.customers') },
        { href: '#imports', label: t('setup.sections.imports') },
      ],
    },
    {
      title: t('setup.groups.team.title'),
      description: t('setup.groups.team.description'),
      links: [
        { href: '#team-users', label: t('setup.sections.teamUsers') },
        { href: '#users', label: t('setup.sections.users') },
        {
          href: '#preferences-system',
          label: t('setup.sections.preferencesSystem'),
        },
      ],
    },
    {
      title: t('setup.groups.catalog.title'),
      description: t('setup.groups.catalog.description'),
      links: [
        { href: '#catalog-data', label: t('setup.sections.catalogData') },
        { href: '#suppliers', label: t('setup.sections.suppliers') },
        { href: '#raw-materials', label: t('setup.sections.rawMaterials') },
        { href: '#recipes', label: t('setup.sections.recipes') },
        { href: '#costing', label: t('setup.sections.costing') },
        { href: '#price-history', label: t('setup.sections.priceHistory') },
      ],
    },
    {
      title: t('setup.groups.system.title'),
      description: t('setup.groups.system.description'),
      links: [
        {
          href: '#preferences-system',
          label: t('setup.sections.preferencesSystem'),
        },
        { href: '/orders', label: t('setup.sections.orders') },
      ],
    },
  ];
  const importedCount = Number(params?.importedCount ?? 0);
  const skippedCount = Number(params?.skippedCount ?? 0);
  const hasImportFeedback =
    params?.saved === 'import' && params?.importedEntity;

  return (
    <div className="page-stack">
      <datalist id="basic-unit-options">
        {basicUnits.map((unit) => (
          <option key={unit} value={unit} label={t(`units.${unit}`)} />
        ))}
      </datalist>

      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">{t('setup.workspace')}</p>
          <h1>{t('setup.title')}</h1>
          <p>{t('setup.description')}</p>
        </div>
      </section>

      <SavedMessage saved={params?.saved} />
      {params?.error ? <p className="inline-warning">{params.error}</p> : null}
      {hasImportFeedback ? (
        <p className="inline-success">
          {t('setup.import.result', {
            entity: t(`setup.import.entityLabels.${params.importedEntity}`),
            imported: Number.isFinite(importedCount) ? importedCount : 0,
            skipped: Number.isFinite(skippedCount) ? skippedCount : 0,
          })}
        </p>
      ) : null}

      <section className="panel page-stack">
        <div className="table-header-row">
          <div>
            <h2>{t('setup.adminReadinessTitle')}</h2>
            <p>{t('setup.adminReadinessHelp')}</p>
          </div>
        </div>
        <div className="workspace-map-grid">
          {setupGroups.map((group) => (
            <article key={group.title} className="subpanel page-stack">
              <div>
                <strong>{group.title}</strong>
                <p className="helper-text no-margin">{group.description}</p>
              </div>
              <div className="filter-pill-row">
                {group.links.map((link) => (
                  <a
                    key={link.href + link.label}
                    href={link.href}
                    className="summary-pill"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid-two" id="business-setup">
        <article className="panel page-stack" id="customers-summary">
          <div className="table-header-row">
            <div>
              <h2>{t('setup.customerMemoryTitle')}</h2>
              <p>{t('setup.customerMemoryHelp')}</p>
            </div>
            <span className="summary-pill">
              {data.customers.length} {t('common.customers')}
            </span>
          </div>
          {data.customers.length > 0 ? (
            <ul className="stack-list compact-list">
              {data.customers.slice(0, 6).map((customer) => (
                <li key={customer.id} className="list-with-actions">
                  <div>
                    <strong>{customer.displayName}</strong>
                    <span>
                      {customer.phone ??
                        customer.email ??
                        t('customers.noContactYet')}
                    </span>
                  </div>
                  <div className="inline-action-row">
                    <Link
                      href={`/customers?customer=${customer.id}`}
                      className="inline-link"
                    >
                      {t('setup.actions.openCustomer')}
                    </Link>
                    <Link
                      href={`/orders/new?customerId=${customer.id}`}
                      className="inline-link"
                    >
                      {t('setup.actions.newOrder')}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">{t('setup.customerMemoryEmpty')}</p>
          )}
          <div className="inline-action-row">
            <Link href="/customers" className="button-secondary compact-button">
              {t('setup.actions.manageCustomers')}
            </Link>
            <Link
              href="/customers#new-customer"
              className="button-secondary compact-button"
            >
              {t('setup.actions.addCustomer')}
            </Link>
          </div>
        </article>

        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('setup.operabilityChecklistTitle')}</h2>
              <p>{t('setup.operabilityChecklistHelp')}</p>
            </div>
            <span className="summary-pill">
              {t('setup.draftFirstFriendly')}
            </span>
          </div>
          <ul className="stack-list compact-list">
            <li>
              <strong>
                {t('setup.operabilityChecklist.customerOrderLink')}
              </strong>
              <span>
                {t('setup.operabilityChecklist.customerOrderLinkHelp')}
              </span>
            </li>
            <li>
              <strong>
                {t('setup.operabilityChecklist.supplierMaterialLink')}
              </strong>
              <span>
                {t('setup.operabilityChecklist.supplierMaterialLinkHelp')}
              </span>
            </li>
            <li>
              <strong>
                {t('setup.operabilityChecklist.recipeProductLink')}
              </strong>
              <span>
                {t('setup.operabilityChecklist.recipeProductLinkHelp')}
              </span>
            </li>
            <li>
              <strong>
                {t('setup.operabilityChecklist.userWorkspaceLink')}
              </strong>
              <span>
                {t('setup.operabilityChecklist.userWorkspaceLinkHelp')}
              </span>
            </li>
          </ul>
        </article>
      </section>

      <OnboardingAssistant
        businessName={data.workspace.name}
        preferences={data.preferences}
        variant="settings"
      />

      <ImportHub redirectTo="/setup" />

      <section className="page-context-card">
        <SetupIcon className="callout-icon" />
        <div>
          <strong>{t('setup.calloutTitle')}</strong>
          <p className="helper-text no-margin">{t('setup.calloutBody')}</p>
        </div>
      </section>

      {!userContext.canManageSettings ? (
        <p className="inline-warning">{t('setup.roleShapingNote')}</p>
      ) : null}

      <section className="grid-two" id="users">
        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('setup.presetWorkspaceTitle')}</h2>
              <p>{t('setup.presetWorkspaceHelp')}</p>
            </div>
            <span className="summary-pill">
              {t(`presets.${data.preferences.preset}.label`)}
            </span>
          </div>
          <ul className="stack-list">
            {presetExperience.featuredWorkspaces.map((workspaceKey, index) => (
              <li key={workspaceKey}>
                <strong>
                  {t(`nav.${workspaceKey}`)}
                  {index === 0 ? ` · ${t('home.recommendedFirst')}` : ''}
                </strong>
                <span>{t(`home.quickLinks.${workspaceKey}.description`)}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('setup.starterSuggestionsTitle')}</h2>
              <p>{t('setup.starterSuggestionsHelp')}</p>
            </div>
            <span className="summary-pill">
              {t(`operatingModes.${data.preferences.operatingMode}.label`)}
            </span>
          </div>
          <ul className="stack-list">
            {presetExperience.starterSuggestionKeys.map((key) => (
              <li key={key}>
                <strong>{t(`presetSuggestions.${key}.title`)}</strong>
                <span>{t(`presetSuggestions.${key}.body`)}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid-two" id="preferences-system">
        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('setup.settingsSplitTitle')}</h2>
              <p>{t('setup.settingsSplitBody')}</p>
            </div>
            <span className="summary-pill">{t('setup.title')}</span>
          </div>
          <ul className="stack-list compact-list">
            <li>
              <strong>{t('setup.settingsAreaTitle')}</strong>
              <span>{t('setup.settingsAreaBody')}</span>
            </li>
            <li>
              <strong>{t('setup.preferencesAreaTitle')}</strong>
              <span>{t('setup.preferencesAreaBody')}</span>
            </li>
          </ul>
          <Link href="/preferences" className="button-secondary compact-button">
            {t('setup.openPreferences')}
          </Link>
        </article>

        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('setup.appearance')}</h2>
              <p>{t('setup.appearanceHelp')}</p>
            </div>
            <span className="summary-pill">
              {userContext.currentUser
                ? userContext.currentUser.displayName
                : t('nav.preferences')}
            </span>
          </div>
          <ThemeSwitcher variant="panel" />
        </article>
      </section>

      <section className="stats-grid compact-stats-grid" id="catalog-data">
        <article className="stat-card">
          <span className="stat-label">{t('setup.activeSuppliers')}</span>
          <strong>
            {data.suppliers.filter((supplier) => supplier.active).length}
          </strong>
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
        <article className="stat-card stat-card-neutral">
          <span className="stat-label">{t('setup.recipes')}</span>
          <strong>{activeRecipes}</strong>
          <span>{t('setup.recipesHelp')}</span>
        </article>
      </section>

      <section className="grid-two">
        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('setup.productsAndVariants')}</h2>
              <p>{t('setup.productsAndVariantsHelp')}</p>
            </div>
            <span className="summary-pill">
              {data.products.length} {t('common.products')}
            </span>
          </div>
          <p className="helper-text no-margin">
            {t('setup.managedFromOrders')}{' '}
            <Link href="/orders/new" className="inline-link">
              {t('setup.openOrderCapture')}
            </Link>
          </p>
          <ul className="stack-list">
            {data.products.map((product) => (
              <li key={product.id} className="list-with-actions">
                <div>
                  <strong>{product.name}</strong>
                  <span>
                    {product.variants.map((variant) => variant.name).join(', ')}
                  </span>
                  <span className="inline-meta">
                    {(recipesByProduct.get(product.id) ?? []).length}{' '}
                    {t('common.recipes')}
                  </span>
                </div>
                <div className="inline-action-row">
                  <Link
                    href={buildSetupHref({
                      product: product.id,
                      supplier: editingSupplier?.id,
                      material: editingMaterial?.id,
                      historySupplier: historySupplier?.id,
                      historyMaterial: historyMaterial?.id,
                      recipe: undefined,
                    })}
                    className="inline-link"
                  >
                    {t('setup.actions.addRecipe')}
                  </Link>
                  {(recipesByProduct.get(product.id) ?? [])[0] ? (
                    <Link
                      href={buildSetupHref({
                        recipe: (recipesByProduct.get(product.id) ?? [])[0]?.id,
                        product: product.id,
                        supplier: editingSupplier?.id,
                        material: editingMaterial?.id,
                        historySupplier: historySupplier?.id,
                        historyMaterial: historyMaterial?.id,
                      })}
                      className="inline-link"
                    >
                      {t('setup.actions.editRecipe')}
                    </Link>
                  ) : null}
                </div>
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
            <span className="summary-pill">
              {data.destinations.length} {term('destination', 'many')}
            </span>
          </div>
          <p className="helper-text no-margin">
            {t('setup.destinationsManagedFromOrders')}{' '}
            <Link href="/orders/new" className="inline-link">
              {t('setup.openOrderCapture')}
            </Link>
          </p>
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

      <section className="grid-two" id="team-users">
        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('setup.recurringRhythms')}</h2>
              <p>{t('setup.recurringRhythmsHelp')}</p>
            </div>
            <span className="summary-pill">
              {data.recurringTemplates.length} {t('common.templates')}
            </span>
          </div>
          <p className="helper-text no-margin">
            {t('setup.managedFromRecurring')}{' '}
            <Link href="/orders/templates/new" className="inline-link">
              {t('setup.openRecurringCapture')}
            </Link>
          </p>
          <ul className="stack-list">
            {data.recurringTemplates.map((template) => (
              <li key={template.id}>
                <strong>{template.customerLabel}</strong>
                <span>
                  {formatTemplateScheduleLabel(template, t)} ·{' '}
                  {t('orders.nextUp')}{' '}
                  {formatDateLabel(template.nextOccurrenceDate, locale)}
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
            <span className="summary-pill">
              {data.users.length} {t('common.users')}
            </span>
          </div>
          <div className="filter-pill-row">
            <span className="summary-pill">
              {data.users.filter((user) => user.active).length}{' '}
              {t('setup.labels.activeUsers')}
            </span>
            <span className="summary-pill">
              {data.users.filter((user) => !user.active).length}{' '}
              {t('setup.labels.inactiveUsers')}
            </span>
            <span className="summary-pill">
              {new Set(data.users.map((user) => user.role)).size}{' '}
              {t('setup.labels.rolesInUse')}
            </span>
            <Link href="/preferences" className="inline-link">
              {t('setup.openPreferences')}
            </Link>
          </div>
          <div className="admin-split-layout">
            <div className="page-stack">
              {data.users.length > 0 ? (
                <ul className="stack-list compact-list">
                  {data.users.map((user) => (
                    <li key={user.id} className="list-with-actions">
                      <div>
                        <strong>
                          {user.displayName}
                          {!user.active
                            ? ` · ${t('common.inactive').toLowerCase()}`
                            : ''}
                        </strong>
                        <span>
                          {t(`roles.${user.role}.label`)} ·{' '}
                          {user.loginIdentifier}
                        </span>
                        <span className="inline-meta">
                          {t('setup.labels.defaultWorkspace')}:{' '}
                          {t(
                            `nav.${user.preferences?.defaultWorkspace ?? user.defaultWorkspace}`,
                          )}
                        </span>
                        <span className="inline-meta">
                          {t('setup.labels.visibleWorkspaces')}:{' '}
                          {getVisibleWorkspacesForRole(user.role)
                            .map((workspace) => t(`nav.${workspace}`))
                            .join(' · ')}
                        </span>
                      </div>
                      <div className="inline-action-row">
                        <Link
                          href={buildSetupHref({
                            user: user.id,
                            supplier: editingSupplier?.id,
                            material: editingMaterial?.id,
                            recipe: editingRecipe?.id,
                            historySupplier: historySupplier?.id,
                            historyMaterial: historyMaterial?.id,
                            costingStatus: costingStatusFilter,
                            costingItem: selectedCostingItem?.id,
                          })}
                          className="inline-link"
                        >
                          {t('setup.actions.edit')}
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">{t('setup.usersEmpty')}</p>
              )}
            </div>
            <form action={userFormAction} className="field-section page-stack">
              <div className="field-section-header">
                <div>
                  <h3>
                    {editingUser ? t('setup.editUser') : t('setup.addUser')}
                  </h3>
                  <p className="helper-text">
                    {editingUser
                      ? t('setup.editUserHelp')
                      : t('setup.addUserHelp')}
                  </p>
                </div>
                {editingUser ? (
                  <Link
                    href={buildSetupHref({
                      supplier: editingSupplier?.id,
                      material: editingMaterial?.id,
                      recipe: editingRecipe?.id,
                      historySupplier: historySupplier?.id,
                      historyMaterial: historyMaterial?.id,
                      costingStatus: costingStatusFilter,
                      costingItem: selectedCostingItem?.id,
                    })}
                    className="button-secondary compact-button"
                  >
                    {t('setup.actions.cancelEdit')}
                  </Link>
                ) : null}
              </div>
              <div className="grid-two">
                <label>
                  <span className="field-heading">
                    {t('setup.fields.userDisplayName')} {renderRequiredMark()}
                  </span>
                  <input
                    name="displayName"
                    placeholder={t('setup.placeholders.userDisplayName')}
                    defaultValue={editingUser?.displayName ?? ''}
                    required
                  />
                </label>
                <label>
                  <span className="field-heading">
                    {t('setup.fields.loginIdentifier')} {renderRequiredMark()}
                  </span>
                  <input
                    name="loginIdentifier"
                    placeholder="lucia@example.com"
                    defaultValue={editingUser?.loginIdentifier ?? ''}
                    required
                  />
                </label>
              </div>
              <div className="grid-two">
                <label>
                  <span className="field-heading">
                    {t('setup.fields.role')} {renderRequiredMark()}
                  </span>
                  <select
                    name="role"
                    defaultValue={editingUser?.role ?? 'frontdesk'}
                  >
                    {[
                      'admin',
                      'manager',
                      'production',
                      'frontdesk',
                      'delivery',
                    ].map((role) => (
                      <option key={role} value={role}>
                        {t(`roles.${role}.label`)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="field-heading">
                    {t('setup.fields.defaultWorkspace')} {renderRequiredMark()}
                  </span>
                  <select
                    name="defaultWorkspace"
                    defaultValue={
                      editingUser?.preferences?.defaultWorkspace ??
                      editingUser?.defaultWorkspace ??
                      'orders'
                    }
                  >
                    {[
                      'timeline',
                      'orders',
                      'customers',
                      'production',
                      'handoff',
                      'preferences',
                      'setup',
                    ].map((workspace) => (
                      <option key={workspace} value={workspace}>
                        {t(`nav.${workspace}`)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="checkbox-row">
                <input
                  name="active"
                  type="checkbox"
                  defaultChecked={editingUser?.active ?? true}
                />
                <span>
                  <strong>{t('setup.fields.userActive')}</strong>
                  <span className="helper-text">
                    {t('setup.fields.userActiveHelp')}
                  </span>
                </span>
              </label>
              <button type="submit" className="button-primary">
                {editingUser
                  ? t('setup.actions.updateUser')
                  : t('setup.actions.saveUser')}
              </button>
            </form>
          </div>
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
          <article className="subpanel page-stack" id="suppliers">
            <div className="table-header-row">
              <div>
                <h3>{t('setup.suppliers')}</h3>
                <p>{t('setup.suppliersHelp')}</p>
              </div>
              <span className="summary-pill">
                {data.suppliers.length} {t('common.suppliers')}
              </span>
            </div>
            <div className="admin-split-layout">
              {data.suppliers.length > 0 ? (
                <ul className="stack-list compact-list">
                  {data.suppliers.map((supplier) => (
                    <li key={supplier.id} className="list-with-actions">
                      <div>
                        <strong>
                          {supplier.name}
                          {!supplier.active
                            ? ` · ${t('common.inactive').toLowerCase()}`
                            : ''}
                        </strong>
                        <span>
                          {supplier.contact ??
                            supplier.notes ??
                            t('setup.noExtraContactYet')}
                        </span>
                        <span className="inline-meta">
                          {supplierPriceCounts.get(supplier.id) ?? 0}{' '}
                          {t('setup.labels.priceEntries')}
                        </span>
                      </div>
                      <div className="inline-action-row">
                        <Link
                          href={buildSetupHref({
                            supplier: supplier.id,
                            historySupplier: historySupplier?.id,
                            historyMaterial: historyMaterial?.id,
                            material: editingMaterial?.id,
                            recipe: editingRecipe?.id,
                          })}
                          className="inline-link"
                        >
                          {t('setup.actions.edit')}
                        </Link>
                        <Link
                          href={supplierHistoryHref(supplier.id)}
                          className="inline-link"
                        >
                          {t('setup.actions.viewHistory')}
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">{t('setup.suppliersEmpty')}</p>
              )}
              <form
                action={supplierFormAction}
                className="field-section page-stack"
              >
                <div className="field-section-header">
                  <div>
                    <h3>
                      {editingSupplier
                        ? t('setup.editSupplier')
                        : t('setup.addSupplier')}
                    </h3>
                    <p className="helper-text">
                      {editingSupplier
                        ? t('setup.editSupplierHelp')
                        : t('setup.addSupplierHelp')}
                    </p>
                  </div>
                  {editingSupplier ? (
                    <Link
                      href={buildSetupHref({
                        historySupplier: historySupplier?.id,
                        historyMaterial: historyMaterial?.id,
                        material: editingMaterial?.id,
                        recipe: editingRecipe?.id,
                      })}
                      className="button-secondary compact-button"
                    >
                      {t('setup.actions.cancelEdit')}
                    </Link>
                  ) : null}
                </div>
                <div className="grid-two">
                  <label>
                    <span className="field-heading">
                      {t('setup.fields.supplierName')} {renderRequiredMark()}
                    </span>
                    <input
                      name="name"
                      placeholder="Harina Viva"
                      defaultValue={editingSupplier?.name ?? ''}
                      required
                    />
                  </label>
                  <label>
                    <span className="field-heading">
                      {t('setup.fields.contact')}{' '}
                      <span className="optional-pill">
                        {t('common.optional')}
                      </span>
                    </span>
                    <input
                      name="contact"
                      placeholder={t('setup.placeholders.contact')}
                      defaultValue={editingSupplier?.contact ?? ''}
                    />
                  </label>
                </div>
                <label>
                  <span className="field-heading">
                    {t('setup.fields.notes')}{' '}
                    <span className="optional-pill">
                      {t('common.optional')}
                    </span>
                  </span>
                  <textarea
                    name="notes"
                    placeholder={t('setup.placeholders.supplierNotes')}
                    defaultValue={editingSupplier?.notes ?? ''}
                  />
                </label>
                <label className="checkbox-row">
                  <input
                    name="active"
                    type="checkbox"
                    defaultChecked={editingSupplier?.active ?? true}
                  />
                  <span>
                    <strong>{t('setup.fields.activeSupplier')}</strong>
                    <span className="helper-text">
                      {t('setup.fields.activeSupplierHelp')}
                    </span>
                  </span>
                </label>
                <button type="submit" className="button-primary">
                  {editingSupplier
                    ? t('setup.actions.updateSupplier')
                    : t('setup.actions.saveSupplier')}
                </button>
              </form>
            </div>
          </article>

          <article className="subpanel page-stack" id="raw-materials">
            <div className="table-header-row">
              <div>
                <h3>{t('setup.rawMaterialsSection')}</h3>
                <p>{t('setup.rawMaterialsSectionHelp')}</p>
              </div>
              <span className="summary-pill">
                {data.rawMaterials.length} {t('common.materials')}
              </span>
            </div>
            <div className="admin-split-layout">
              {data.rawMaterials.length > 0 ? (
                <ul className="stack-list compact-list">
                  {data.rawMaterials.map((material) => {
                    const latestPrice = data.latestPriceByMaterial.get(
                      material.id,
                    );

                    return (
                      <li key={material.id} className="list-with-actions">
                        <div>
                          <strong>
                            {material.name}
                            {!material.active
                              ? ` · ${t('common.inactive').toLowerCase()}`
                              : ''}
                          </strong>
                          <span>
                            {[
                              material.category,
                              material.defaultUnit
                                ? `${material.defaultUnit} ${t('setup.labels.defaultUnitSuffix')}`
                                : t('setup.labels.noDefaultUnit'),
                              latestPrice
                                ? `${t('setup.labels.latest')} ${formatUnitRate(latestPrice, locale)}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                          <span className="inline-meta">
                            {materialPriceCounts.get(material.id) ?? 0}{' '}
                            {t('setup.labels.priceEntries')}
                          </span>
                        </div>
                        <div className="inline-action-row">
                          <Link
                            href={buildSetupHref({
                              material: material.id,
                              historySupplier: historySupplier?.id,
                              historyMaterial: historyMaterial?.id,
                              supplier: editingSupplier?.id,
                              recipe: editingRecipe?.id,
                            })}
                            className="inline-link"
                          >
                            {t('setup.actions.edit')}
                          </Link>
                          <Link
                            href={materialHistoryHref(material.id)}
                            className="inline-link"
                          >
                            {t('setup.actions.viewHistory')}
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="empty-state">{t('setup.rawMaterialsEmpty')}</p>
              )}
              <form
                action={rawMaterialFormAction}
                className="field-section page-stack"
              >
                <div className="field-section-header">
                  <div>
                    <h3>
                      {editingMaterial
                        ? t('setup.editRawMaterial')
                        : t('setup.addRawMaterial')}
                    </h3>
                    <p className="helper-text">
                      {editingMaterial
                        ? t('setup.editRawMaterialHelp')
                        : t('setup.addRawMaterialHelp')}
                    </p>
                  </div>
                  {editingMaterial ? (
                    <Link
                      href={buildSetupHref({
                        historySupplier: historySupplier?.id,
                        historyMaterial: historyMaterial?.id,
                        supplier: editingSupplier?.id,
                        recipe: editingRecipe?.id,
                      })}
                      className="button-secondary compact-button"
                    >
                      {t('setup.actions.cancelEdit')}
                    </Link>
                  ) : null}
                </div>
                <div className="grid-two">
                  <label>
                    <span className="field-heading">
                      {t('setup.fields.rawMaterialName')} {renderRequiredMark()}
                    </span>
                    <input
                      name="name"
                      placeholder={t('setup.placeholders.rawMaterialName')}
                      defaultValue={editingMaterial?.name ?? ''}
                      required
                    />
                  </label>
                  <label>
                    <span className="field-heading">
                      {t('setup.fields.category')}{' '}
                      <span className="optional-pill">
                        {t('common.optional')}
                      </span>
                    </span>
                    <input
                      name="category"
                      placeholder={t('setup.placeholders.category')}
                      defaultValue={editingMaterial?.category ?? ''}
                    />
                  </label>
                  <label>
                    <span className="field-heading">
                      {t('setup.fields.defaultUnit')}{' '}
                      <span className="optional-pill">
                        {t('common.optional')}
                      </span>
                    </span>
                    <input
                      name="defaultUnit"
                      list="basic-unit-options"
                      placeholder={t('setup.placeholders.defaultUnit')}
                      defaultValue={editingMaterial?.defaultUnit ?? ''}
                    />
                  </label>
                  <label>
                    <span className="field-heading">
                      {t('setup.fields.brand')}{' '}
                      <span className="optional-pill">
                        {t('common.optional')}
                      </span>
                    </span>
                    <input
                      name="brand"
                      placeholder={t('setup.placeholders.brand')}
                      defaultValue={editingMaterial?.brand ?? ''}
                    />
                  </label>
                </div>
                <p className="helper-text">{t('setup.fields.unitQuickHelp')}</p>
                <label>
                  <span className="field-heading">
                    {t('setup.fields.notes')}{' '}
                    <span className="optional-pill">
                      {t('common.optional')}
                    </span>
                  </span>
                  <textarea
                    name="notes"
                    placeholder={t('setup.placeholders.rawMaterialNotes')}
                    defaultValue={editingMaterial?.notes ?? ''}
                  />
                </label>
                <label className="checkbox-row">
                  <input
                    name="active"
                    type="checkbox"
                    defaultChecked={editingMaterial?.active ?? true}
                  />
                  <span>
                    <strong>{t('setup.fields.activeRawMaterial')}</strong>
                    <span className="helper-text">
                      {t('setup.fields.activeRawMaterialHelp')}
                    </span>
                  </span>
                </label>
                <button type="submit" className="button-primary">
                  {editingMaterial
                    ? t('setup.actions.updateRawMaterial')
                    : t('setup.actions.saveRawMaterial')}
                </button>
              </form>
            </div>
          </article>
        </div>
      </section>

      <section className="panel page-stack" id="recipes">
        <div className="table-header-row">
          <div>
            <h2>{t('setup.recipeFoundationTitle')}</h2>
            <p>{t('setup.recipeFoundationHelp')}</p>
          </div>
          <span className="summary-pill">
            {linkedProductCount} {t('setup.recipeLabels.linkedProducts')}
          </span>
        </div>

        <div className="grid-two recipe-grid admin-split-layout">
          <article className="subpanel page-stack">
            <div className="table-header-row">
              <div>
                <h3>{t('setup.recipeListTitle')}</h3>
                <p>{t('setup.recipeListHelp')}</p>
              </div>
              <span className="summary-pill">
                {data.recipes.length} {t('common.recipes')}
              </span>
            </div>
            {data.recipes.length > 0 ? (
              <ul className="stack-list compact-list">
                {data.recipes.map((recipe) => {
                  const recipeCost = data.recipeCostById.get(recipe.id);
                  const productLabel = getRecipeLinkLabel(
                    recipe,
                    data.products,
                  );

                  return (
                    <li key={recipe.id} className="list-with-actions">
                      <div>
                        <strong>
                          {recipe.title}
                          {!recipe.active
                            ? ` · ${t('common.inactive').toLowerCase()}`
                            : ''}
                        </strong>
                        <span>{productLabel}</span>
                        <span className="inline-meta">
                          {recipe.lines.length} {t('setup.recipeLabels.lines')}
                          {recipeCost?.lineCount
                            ? ` · ${
                                recipeCost.complete
                                  ? `${t('setup.recipeLabels.costed')} ${formatCurrency(recipeCost.totalEstimatedCost, locale)}`
                                  : `${formatCurrency(recipeCost.totalEstimatedCost, locale)} · ${recipeCost.incompleteLineCount} ${t('setup.recipeLabels.incomplete')}`
                              }`
                            : ` · ${t('setup.recipeLabels.noLinesYet')}`}
                        </span>
                      </div>
                      <div className="inline-action-row">
                        <Link
                          href={buildSetupHref({
                            recipe: recipe.id,
                            supplier: editingSupplier?.id,
                            material: editingMaterial?.id,
                            historySupplier: historySupplier?.id,
                            historyMaterial: historyMaterial?.id,
                          })}
                          className="inline-link"
                        >
                          {t('setup.actions.edit')}
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="empty-state">{t('setup.recipeEmpty')}</p>
            )}
          </article>

          <div className="page-stack">
            <form action={recipeFormAction} className="subpanel page-stack">
              <div className="field-section-header">
                <div>
                  <h3>
                    {editingRecipe
                      ? t('setup.editRecipe')
                      : t('setup.addRecipe')}
                  </h3>
                  <p className="helper-text">
                    {editingRecipe
                      ? t('setup.editRecipeHelp')
                      : t('setup.addRecipeHelp')}
                  </p>
                </div>
                {editingRecipe ? (
                  <Link
                    href={buildSetupHref({
                      supplier: editingSupplier?.id,
                      material: editingMaterial?.id,
                      historySupplier: historySupplier?.id,
                      historyMaterial: historyMaterial?.id,
                    })}
                    className="button-secondary compact-button"
                  >
                    {t('setup.actions.cancelEdit')}
                  </Link>
                ) : null}
              </div>

              <div className="grid-two">
                <label>
                  <span className="field-heading">
                    {t('setup.fields.product')} {renderRequiredMark()}
                  </span>
                  <select
                    name="productId"
                    defaultValue={recipeProductId}
                    required
                  >
                    <option value="" disabled>
                      {t('common.selectProduct')}
                    </option>
                    {data.products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="field-heading">
                    {t('setup.fields.variant')}{' '}
                    <span className="optional-pill">
                      {t('common.optional')}
                    </span>
                  </span>
                  <select
                    name="productVariantId"
                    defaultValue={editingRecipe?.productVariantId ?? ''}
                  >
                    <option value="">
                      {t('setup.recipeLabels.productLevel')}
                    </option>
                    {data.products.map((product) => (
                      <optgroup key={product.id} label={product.name}>
                        {product.variants.map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {variant.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="field-heading">
                    {t('setup.fields.recipeTitle')}{' '}
                    <span className="optional-pill">
                      {t('common.optional')}
                    </span>
                  </span>
                  <input
                    name="title"
                    placeholder={t('setup.placeholders.recipeTitle')}
                    defaultValue={editingRecipe?.title ?? ''}
                  />
                </label>
                <label>
                  <span className="field-heading">
                    {t('setup.fields.batchYieldQuantity')}{' '}
                    <span className="optional-pill">
                      {t('common.optional')}
                    </span>
                  </span>
                  <input
                    name="batchYieldQuantity"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder={t('setup.placeholders.batchYieldQuantity')}
                    defaultValue={editingRecipe?.batchYieldQuantity ?? ''}
                  />
                </label>
                <label>
                  <span className="field-heading">
                    {t('setup.fields.batchYieldUnit')}{' '}
                    <span className="optional-pill">
                      {t('common.optional')}
                    </span>
                  </span>
                  <input
                    name="batchYieldUnit"
                    list="basic-unit-options"
                    placeholder={t('setup.placeholders.batchYieldUnit')}
                    defaultValue={editingRecipe?.batchYieldUnit ?? ''}
                  />
                </label>
              </div>
              <p className="helper-text">{t('setup.recipeYieldHelp')}</p>
              <label>
                <span className="field-heading">
                  {t('setup.fields.instructions')}{' '}
                  <span className="optional-pill">{t('common.optional')}</span>
                </span>
                <textarea
                  name="instructions"
                  placeholder={t('setup.placeholders.recipeInstructions')}
                  defaultValue={editingRecipe?.instructions ?? ''}
                />
              </label>
              <label className="checkbox-row">
                <input
                  name="active"
                  type="checkbox"
                  defaultChecked={editingRecipe?.active ?? true}
                />
                <span>
                  <strong>{t('setup.fields.activeRecipe')}</strong>
                  <span className="helper-text">
                    {t('setup.fields.activeRecipeHelp')}
                  </span>
                </span>
              </label>

              <div className="recipe-lines-block page-stack">
                <div>
                  <h3>{t('setup.recipeLinesTitle')}</h3>
                  <p className="helper-text">{t('setup.recipeLinesHelp')}</p>
                </div>
                <div className="recipe-line-list">
                  {recipeLineRows.map((line, index) => (
                    <div
                      key={line.id || line.key || `line-${index}`}
                      className="recipe-line-card"
                    >
                      <input
                        type="hidden"
                        name="recipeLineId"
                        value={line.id ?? ''}
                      />
                      <div className="grid-two">
                        <label>
                          <span className="field-heading">
                            {t('setup.fields.rawMaterial')}{' '}
                            {index < 2 ? (
                              <span className="optional-pill">
                                {t('common.optional')}
                              </span>
                            ) : null}
                          </span>
                          <select
                            name="lineRawMaterialId"
                            defaultValue={line.rawMaterialId ?? ''}
                          >
                            <option value="">
                              {t('setup.recipeLabels.selectMaterialOptional')}
                            </option>
                            {data.rawMaterials.map((material) => (
                              <option key={material.id} value={material.id}>
                                {material.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span className="field-heading">
                            {t('setup.fields.quantity')}{' '}
                            <span className="optional-pill">
                              {t('common.optional')}
                            </span>
                          </span>
                          <input
                            name="lineQuantity"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder={t(
                              'setup.placeholders.recipeLineQuantity',
                            )}
                            defaultValue={line.quantity ?? ''}
                          />
                        </label>
                        <label>
                          <span className="field-heading">
                            {t('setup.fields.unit')}{' '}
                            <span className="optional-pill">
                              {t('common.optional')}
                            </span>
                          </span>
                          <input
                            name="lineUnit"
                            list="basic-unit-options"
                            placeholder={t('setup.placeholders.recipeLineUnit')}
                            defaultValue={line.unit ?? ''}
                          />
                        </label>
                        <label>
                          <span className="field-heading">
                            {t('setup.fields.note')}{' '}
                            <span className="optional-pill">
                              {t('common.optional')}
                            </span>
                          </span>
                          <input
                            name="lineNote"
                            placeholder={t('setup.placeholders.recipeLineNote')}
                            defaultValue={line.note ?? ''}
                          />
                        </label>
                      </div>
                      {!line.isBlank ? (
                        <label className="checkbox-row recipe-remove-row">
                          <input
                            name="lineRemove"
                            type="checkbox"
                            value={`remove-${index}`}
                          />
                          <span>
                            <strong>{t('setup.actions.removeLine')}</strong>
                            <span className="helper-text">
                              {t('setup.recipeRemoveLineHelp')}
                            </span>
                          </span>
                        </label>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="button-primary">
                {editingRecipe
                  ? t('setup.actions.updateRecipe')
                  : t('setup.actions.saveRecipe')}
              </button>
            </form>

            <article className="subpanel page-stack">
              <div className="table-header-row">
                <div>
                  <h3>{t('setup.recipeCostingTitle')}</h3>
                  <p>{t('setup.recipeCostingHelp')}</p>
                </div>
                <span className="summary-pill">
                  {t('setup.recipeLabels.latestPricesOnly')}
                </span>
              </div>
              {editingRecipe && editingRecipeCost ? (
                editingRecipeCost.lineCount > 0 ? (
                  <>
                    <div className="recipe-cost-summary">
                      <strong>
                        {formatCurrency(
                          editingRecipeCost.totalEstimatedCost,
                          locale,
                        )}
                      </strong>
                      <span>
                        {editingRecipeCost.complete
                          ? t('setup.recipeCostComplete')
                          : `${editingRecipeCost.costedLineCount}/${editingRecipeCost.lineCount} ${t('setup.recipeLabels.linesCosted')}`}
                      </span>
                      {editingRecipe.batchYieldQuantity &&
                      editingRecipe.batchYieldUnit ? (
                        <span>
                          {t('setup.recipeLabels.approxPerYield')}{' '}
                          {formatCurrency(
                            editingRecipeCost.totalEstimatedCost /
                              editingRecipe.batchYieldQuantity,
                            locale,
                          )}{' '}
                          / {editingRecipe.batchYieldUnit}
                        </span>
                      ) : null}
                    </div>
                    <ul className="stack-list compact-list">
                      {editingRecipeCost.lines.map((line) => (
                        <li key={line.line.id} className="history-list-item">
                          <strong>
                            {line.line.rawMaterialLabel} · {line.line.quantity}{' '}
                            {line.line.unit}
                          </strong>
                          {line.status === 'costed' ? (
                            <>
                              <span>
                                {line.latestPriceEntry?.supplierLabel} ·{' '}
                                {formatDateLabel(
                                  line.latestPriceEntry?.priceDate ?? today,
                                  locale,
                                )}
                              </span>
                              <span>
                                {t('setup.recipeLabels.estimatedLineCost')}{' '}
                                {formatCurrency(
                                  line.estimatedCost ?? 0,
                                  locale,
                                )}
                                {line.latestPriceEntry
                                  ? ` · ${formatUnitRate(line.latestPriceEntry, locale)}`
                                  : ''}
                              </span>
                            </>
                          ) : (
                            <span>
                              {line.status === 'missing_price'
                                ? t('setup.recipeCostMissingPrice')
                                : line.status === 'missing_package'
                                  ? t('setup.recipeCostMissingPackage')
                                  : t('setup.recipeCostUnitMismatch')}
                            </span>
                          )}
                          {line.line.note ? (
                            <span className="helper-text">
                              {line.line.note}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    {!editingRecipeCost.complete ? (
                      <p className="inline-warning">
                        {t('setup.recipeCostIncomplete')}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="empty-state">{t('setup.recipeCostEmpty')}</p>
                )
              ) : (
                <p className="empty-state">{t('setup.recipeCostStart')}</p>
              )}
            </article>
          </div>
        </div>
      </section>

      <section className="panel page-stack" id="costing">
        <div className="table-header-row">
          <div>
            <h2>{t('setup.costingSnapshotTitle')}</h2>
            <p>{t('setup.costingSnapshotHelp')}</p>
          </div>
          <span className="summary-pill">
            {t('setup.costingLabels.latestRecipeEvidence')}
          </span>
        </div>

        <div className="stats-grid compact-stats-grid">
          <article className="stat-card stat-card-success">
            <span className="stat-label">
              {t('setup.costingSummary.fullyCosted')}
            </span>
            <strong>{costingSummary.fullyCosted}</strong>
            <span>{t('setup.costingSummary.fullyCostedHelp')}</span>
          </article>
          <article className="stat-card stat-card-info">
            <span className="stat-label">
              {t('setup.costingSummary.partiallyCosted')}
            </span>
            <strong>{costingSummary.partiallyCosted}</strong>
            <span>{t('setup.costingSummary.partiallyCostedHelp')}</span>
          </article>
          <article className="stat-card stat-card-warning">
            <span className="stat-label">
              {t('setup.costingSummary.missingEvidence')}
            </span>
            <strong>{costingSummary.missingEvidence}</strong>
            <span>{t('setup.costingSummary.missingEvidenceHelp')}</span>
          </article>
          <article className="stat-card stat-card-neutral">
            <span className="stat-label">
              {t('setup.costingSummary.noRecipe')}
            </span>
            <strong>{costingSummary.noRecipe}</strong>
            <span>{t('setup.costingSummary.noRecipeHelp')}</span>
          </article>
        </div>

        <div className="filter-pill-row">
          {(
            [
              'all',
              'fully_costed',
              'partially_costed',
              'missing_cost_evidence',
              'no_recipe',
            ] as const
          ).map((statusKey) => (
            <Link
              key={statusKey}
              href={buildCostingHref({
                costingStatus: statusKey,
                costingItem: (statusKey === 'all'
                  ? costingItems
                  : costingItems.filter((item) => item.status === statusKey))[0]
                  ?.id,
              })}
              className={`summary-pill ${costingStatusFilter === statusKey ? 'is-selected' : ''}`}
            >
              {t(`setup.costingFilters.${statusKey}`)}
            </Link>
          ))}
        </div>

        <div className="grid-two recipe-grid">
          <article className="subpanel page-stack">
            <div className="table-header-row">
              <div>
                <h3>{t('setup.costingListTitle')}</h3>
                <p>{t('setup.costingListHelp')}</p>
              </div>
              <span className="summary-pill">
                {filteredCostingItems.length} {t('setup.costingLabels.items')}
              </span>
            </div>
            {filteredCostingItems.length > 0 ? (
              <ul className="stack-list compact-list">
                {filteredCostingItems.map((item) => (
                  <li
                    key={item.id}
                    className={`list-with-actions ${selectedCostingItem?.id === item.id ? 'is-selected-row' : ''}`}
                  >
                    <div>
                      <strong>{item.productLabel}</strong>
                      <span>
                        {item.hasRecipe
                          ? `${item.recipeTitle ?? item.label} · ${t(`setup.costingStatuses.${item.status}`)}`
                          : t('setup.costingNoRecipe')}
                      </span>
                      <span className="inline-meta">
                        {item.estimatedBatchCost !== undefined
                          ? `${t('setup.costingLabels.batch')} ${formatCurrency(item.estimatedBatchCost, locale)}`
                          : t('setup.costingLabels.noBatchEstimate')}
                        {item.estimatedUnitCost !== undefined &&
                        item.batchYieldUnit
                          ? ` · ${t('setup.costingLabels.unit')} ${formatCurrency(item.estimatedUnitCost, locale)} / ${item.batchYieldUnit}`
                          : ''}
                      </span>
                    </div>
                    <div className="inline-action-row">
                      <Link
                        href={buildCostingHref({ costingItem: item.id })}
                        className="inline-link"
                      >
                        {t('setup.actions.viewCosting')}
                      </Link>
                      {item.recipeId ? (
                        <Link
                          href={buildSetupHref({
                            recipe: item.recipeId,
                            supplier: editingSupplier?.id,
                            material: editingMaterial?.id,
                            historySupplier: historySupplier?.id,
                            historyMaterial: historyMaterial?.id,
                            costingStatus: costingStatusFilter,
                            costingItem: item.id,
                          })}
                          className="inline-link"
                        >
                          {t('setup.actions.editRecipe')}
                        </Link>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">{t('setup.costingEmptyForFilter')}</p>
            )}
          </article>

          <article className="subpanel page-stack">
            <div className="table-header-row">
              <div>
                <h3>{t('setup.costingDetailTitle')}</h3>
                <p>{t('setup.costingDetailHelp')}</p>
              </div>
              {selectedCostingItem ? (
                <span className="summary-pill">
                  {t(`setup.costingStatuses.${selectedCostingItem.status}`)}
                </span>
              ) : null}
            </div>

            {selectedCostingItem ? (
              <>
                <div className="recipe-cost-summary">
                  <strong>{selectedCostingItem.productLabel}</strong>
                  <span>
                    {selectedCostingItem.hasRecipe
                      ? selectedCostingItem.recipeTitle
                      : t('setup.costingNoRecipe')}
                  </span>
                  <div className="costing-summary-grid">
                    <div>
                      <span className="helper-text">
                        {t('setup.costingLabels.batchCost')}
                      </span>
                      <strong>
                        {selectedCostingItem.estimatedBatchCost !== undefined
                          ? formatCurrency(
                              selectedCostingItem.estimatedBatchCost,
                              locale,
                            )
                          : '—'}
                      </strong>
                    </div>
                    <div>
                      <span className="helper-text">
                        {t('setup.costingLabels.unitCost')}
                      </span>
                      <strong>
                        {selectedCostingItem.estimatedUnitCost !== undefined &&
                        selectedCostingItem.batchYieldUnit
                          ? `${formatCurrency(selectedCostingItem.estimatedUnitCost, locale)} / ${selectedCostingItem.batchYieldUnit}`
                          : t('setup.costingLabels.noYield')}
                      </strong>
                    </div>
                  </div>
                  <span>
                    {t(
                      `setup.costingStatusesHelp.${selectedCostingItem.status}`,
                    )}
                  </span>
                  {selectedCostingItem.hasRecipe ? (
                    <span className="helper-text">
                      {selectedCostingItem.costedLineCount}/
                      {selectedCostingItem.lineCount}{' '}
                      {t('setup.recipeLabels.linesCosted')}
                      {selectedCostingItem.missingEvidenceCount
                        ? ` · ${selectedCostingItem.missingEvidenceCount} ${t('setup.costingLabels.missingPrice')}`
                        : ''}
                      {selectedCostingItem.missingPackageCount
                        ? ` · ${selectedCostingItem.missingPackageCount} ${t('setup.costingLabels.missingPackage')}`
                        : ''}
                      {selectedCostingItem.unitMismatchCount
                        ? ` · ${selectedCostingItem.unitMismatchCount} ${t('setup.costingLabels.unitMismatch')}`
                        : ''}
                    </span>
                  ) : null}
                </div>

                {selectedCostingItem.recipeCost?.lineCount ? (
                  <ul className="stack-list compact-list">
                    {selectedCostingItem.recipeCost.lines.map((line) => (
                      <li
                        key={line.line.id}
                        className="history-list-item costing-line-item"
                      >
                        <div className="costing-line-header">
                          <strong>{line.line.rawMaterialLabel}</strong>
                          <span
                            className={`summary-pill costing-status-pill is-${line.status}`}
                          >
                            {t(`setup.costingLineStatuses.${line.status}`)}
                          </span>
                        </div>
                        <span>
                          {line.line.quantity} {line.line.unit}
                        </span>
                        {line.status === 'costed' ? (
                          <>
                            <span>
                              {t('setup.costingLabels.lineContribution')}{' '}
                              {formatCurrency(line.estimatedCost ?? 0, locale)}
                              {line.latestPriceEntry
                                ? ` · ${formatUnitRate(line.latestPriceEntry, locale)}`
                                : ''}
                            </span>
                            {line.latestPriceEntry ? (
                              <span className="helper-text">
                                {t('setup.costingLabels.sourceEvidence')}{' '}
                                {line.latestPriceEntry.supplierLabel} ·{' '}
                                {formatDateLabel(
                                  line.latestPriceEntry.priceDate,
                                  locale,
                                )}
                              </span>
                            ) : null}
                          </>
                        ) : (
                          <>
                            <span>
                              {t(
                                `setup.costingLineStatusesHelp.${line.status}`,
                              )}
                            </span>
                            {line.latestPriceEntry ? (
                              <span className="helper-text">
                                {t('setup.costingLabels.lastSeenPrice')}{' '}
                                {line.latestPriceEntry.supplierLabel} ·{' '}
                                {formatDateLabel(
                                  line.latestPriceEntry.priceDate,
                                  locale,
                                )}
                              </span>
                            ) : null}
                          </>
                        )}
                        {line.line.note ? (
                          <span className="helper-text">{line.line.note}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : selectedCostingItem.hasRecipe ? (
                  <p className="empty-state">{t('setup.recipeCostEmpty')}</p>
                ) : (
                  <p className="empty-state">
                    {t('setup.costingNoRecipeHelp')}
                  </p>
                )}
              </>
            ) : (
              <p className="empty-state">{t('setup.costingEmpty')}</p>
            )}
          </article>
        </div>
      </section>

      <section className="panel page-stack" id="price-history">
        <div className="table-header-row">
          <div>
            <h2>{t('setup.supplierPriceMemory')}</h2>
            <p>{t('setup.supplierPriceMemoryHelp')}</p>
          </div>
          <span className="summary-pill">
            {data.supplierPriceEntries.length} {t('common.entries')}
          </span>
        </div>

        <div className="filter-pill-row">
          {historySupplier ? (
            <span className="summary-pill">
              {t('setup.history.supplierFilter')}: {historySupplier.name}
            </span>
          ) : null}
          {historyMaterial ? (
            <span className="summary-pill">
              {t('setup.history.materialFilter')}: {historyMaterial.name}
            </span>
          ) : null}
          {historySupplier || historyMaterial ? (
            <Link
              href={buildSetupHref({
                supplier: editingSupplier?.id,
                material: editingMaterial?.id,
                recipe: editingRecipe?.id,
              })}
              className="inline-link"
            >
              {t('setup.actions.clearHistoryFilters')}
            </Link>
          ) : (
            <span className="helper-text">{t('setup.history.allEntries')}</span>
          )}
        </div>

        <div className="grid-two">
          <div className="subpanel page-stack">
            <div className="table-header-row">
              <div>
                <h3>{t('setup.history.title')}</h3>
                <p>{t('setup.history.help')}</p>
              </div>
              <span className="summary-pill">
                {filteredPriceEntries.length} {t('common.entries')}
              </span>
            </div>
            {filteredPriceEntries.length > 0 ? (
              <ul className="stack-list compact-list">
                {filteredPriceEntries.map((entry) => (
                  <li key={entry.id} className="history-list-item">
                    <strong>
                      {entry.rawMaterialLabel} ·{' '}
                      {formatCurrency(entry.price, locale)}
                    </strong>
                    <span>
                      {entry.supplierLabel} ·{' '}
                      {formatDateLabel(entry.priceDate, locale)}
                    </span>
                    <span>
                      {[
                        entry.presentation,
                        entry.brand,
                        entry.packageQuantity && entry.packageUnit
                          ? `${entry.packageQuantity} ${entry.packageUnit}`
                          : null,
                        entry.packageQuantity && entry.packageUnit
                          ? formatUnitRate(entry, locale)
                          : t('setup.labels.noPackageDetails'),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    {entry.note ? (
                      <span className="helper-text">{entry.note}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">{t('setup.history.empty')}</p>
            )}
          </div>

          <form
            action={createSupplierPriceEntryAction}
            className="subpanel page-stack"
          >
            <div className="field-section-header">
              <div>
                <h3>{t('setup.addSupplierPrice')}</h3>
                <p className="helper-text">{t('setup.addSupplierPriceHelp')}</p>
              </div>
            </div>
            <div className="grid-two">
              <label>
                <span className="field-heading">
                  {t('setup.fields.supplier')} {renderRequiredMark()}
                </span>
                <select
                  name="supplierId"
                  defaultValue={historySupplier?.id ?? ''}
                  required
                >
                  <option value="" disabled>
                    {t('common.selectSupplier')}
                  </option>
                  {data.suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="field-heading">
                  {t('setup.fields.rawMaterial')} {renderRequiredMark()}
                </span>
                <select
                  name="rawMaterialId"
                  defaultValue={historyMaterial?.id ?? ''}
                  required
                >
                  <option value="" disabled>
                    {t('common.selectRawMaterial')}
                  </option>
                  {data.rawMaterials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="field-heading">
                  {t('setup.fields.price')} {renderRequiredMark()}
                </span>
                <input
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder={t('setup.placeholders.price')}
                  required
                />
              </label>
              <label>
                <span className="field-heading">
                  {t('setup.fields.date')} {renderRequiredMark()}
                </span>
                <input
                  name="priceDate"
                  type="date"
                  defaultValue={today}
                  required
                />
              </label>
              <label>
                <span className="field-heading">
                  {t('setup.fields.presentation')}{' '}
                  <span className="optional-pill">{t('common.optional')}</span>
                </span>
                <input
                  name="presentation"
                  placeholder={t('setup.placeholders.presentation')}
                />
              </label>
              <label>
                <span className="field-heading">
                  {t('setup.fields.brand')}{' '}
                  <span className="optional-pill">{t('common.optional')}</span>
                </span>
                <input
                  name="brand"
                  placeholder={t('setup.placeholders.supplierBrand')}
                />
              </label>
              <label>
                <span className="field-heading">
                  {t('setup.fields.packageQuantity')}{' '}
                  <span className="optional-pill">{t('common.optional')}</span>
                </span>
                <input
                  name="packageQuantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder={t('setup.placeholders.packageQuantity')}
                />
              </label>
              <label>
                <span className="field-heading">
                  {t('setup.fields.packageUnit')}{' '}
                  <span className="optional-pill">{t('common.optional')}</span>
                </span>
                <input
                  name="packageUnit"
                  list="basic-unit-options"
                  placeholder={t('setup.placeholders.packageUnit')}
                />
              </label>
            </div>
            <p className="helper-text">
              {t('setup.fields.packageOptionalHelp')}
            </p>
            <label>
              <span className="field-heading">
                {t('setup.fields.note')}{' '}
                <span className="optional-pill">{t('common.optional')}</span>
              </span>
              <textarea
                name="note"
                placeholder={t('setup.placeholders.priceNote')}
              />
            </label>
            <button type="submit" className="button-primary">
              {t('setup.actions.saveSupplierPrice')}
            </button>
          </form>
        </div>
      </section>

      <section className="page-context-card">
        <SparklesIcon className="callout-icon" />
        <div>
          <strong>{t('setup.nextStepsTitle')}</strong>
          <p className="helper-text no-margin">{t('setup.nextStepsBody')}</p>
        </div>
      </section>
    </div>
  );
}
