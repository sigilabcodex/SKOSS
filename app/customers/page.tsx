import Link from 'next/link';
import { formatDateLabel, formatStatusLabel } from '@/lib/domain/formatters';
import { createCustomerAction, updateCustomerAction } from '@/lib/server/actions';
import { getCustomersWorkspace } from '@/lib/server/demo-data';
import { getServerTranslator } from '@/lib/i18n/server';
import { ArrowRightIcon, CheckIcon, CustomersIcon } from '@/components/ui-icons';
import { ActivityFeed } from '@/components/activity-feed';

type CustomerSearchParams = {
  customer?: string;
  saved?: string;
  error?: string;
};

const contactMethodOptions = ['phone', 'email', 'whatsapp'] as const;

function customerOrdersBadgeLabel(linkedOrderCount: number) {
  return `${linkedOrderCount}`;
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams?: Promise<CustomerSearchParams>;
}) {
  const params = await searchParams;
  const [view, { t, locale }] = await Promise.all([
    getCustomersWorkspace(params?.customer),
    getServerTranslator(),
  ]);
  const selectedCustomer = view.selectedCustomer;
  const formAction = selectedCustomer
    ? updateCustomerAction.bind(null, selectedCustomer.id)
    : createCustomerAction;

  return (
    <div className="page-stack">
      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">{t('customers.workspace')}</p>
          <h1>{t('customers.title')}</h1>
          <p>{t('customers.description')}</p>
        </div>
        <div className="inline-action-row">
          <Link href="/admin/setup#imports" className="button-secondary">
            <span>{t('customers.actions.importCsv')}</span>
          </Link>
          <Link href="/orders" className="button-secondary">
            <ArrowRightIcon className="button-icon button-icon-reverse" />
            <span>{t('common.backToOrders')}</span>
          </Link>
        </div>
      </section>

      {params?.saved === 'customer' ? <p className="inline-success"><CheckIcon className="button-icon" />{t('customers.saved')}</p> : null}
      {params?.error ? <p className="inline-warning">{params.error}</p> : null}

      <section className="stats-grid compact-stats-grid">
        <article className="stat-card">
          <span className="stat-label">{t('customers.stats.active')}</span>
          <strong>{view.activeCustomers}</strong>
          <span>{t('customers.stats.activeHelp')}</span>
        </article>
        <article className="stat-card stat-card-info">
          <span className="stat-label">{t('customers.stats.inactive')}</span>
          <strong>{view.inactiveCustomers}</strong>
          <span>{t('customers.stats.inactiveHelp')}</span>
        </article>
        <article className="stat-card stat-card-neutral">
          <span className="stat-label">{t('customers.stats.linkedOrders')}</span>
          <strong>{view.linkedOrders}</strong>
          <span>{t('customers.stats.linkedOrdersHelp')}</span>
        </article>
      </section>

      <section className="grid-two customers-layout">
        <article className="panel page-stack customers-list-panel">
          <div className="table-header-row">
            <div>
              <h2>{t('customers.listTitle')}</h2>
              <p>{t('customers.listHelp')}</p>
            </div>
            <span className="summary-pill">{view.customers.length} {t('customers.summary')}</span>
          </div>
          {view.customers.length > 0 ? (
            <ul className="stack-list compact-list">
              {view.customers.map((customer) => {
                const linkedOrderCount = view.orderCountByCustomer.get(customer.id) ?? 0;
                const isSelected = selectedCustomer?.id === customer.id;

                return (
                  <li key={customer.id} className={`list-with-actions ${isSelected ? 'is-selected-row' : ''}`}>
                    <div>
                      <strong>
                        {customer.displayName}
                      </strong>
                      <span>
                        {customer.phone ?? customer.email ?? t('customers.noContactYet')}
                        {customer.deliveryNote ? ` · ${customer.deliveryNote}` : ''}
                        {view.lastOrderDateByCustomer.get(customer.id)
                          ? ` · ${t('customers.lastOrderOn')} ${formatDateLabel(view.lastOrderDateByCustomer.get(customer.id)!, locale)}`
                          : ''}
                      </span>
                    </div>
                    <div className="page-stack compact-badge-stack align-end">
                      <span className={`badge badge-${customer.active ? 'ready' : 'neutral'}`}>
                        {customer.active ? t('common.active') : t('common.inactive')}
                      </span>
                      <span className="badge badge-manual">{customerOrdersBadgeLabel(linkedOrderCount)} {t('common.orders')}</span>
                      <Link href={`/customers?customer=${customer.id}`} className="inline-link">
                        {t('customers.editAction')}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="empty-state">{t('customers.listEmpty')}</p>
          )}
        </article>

        <div className="page-stack customers-editor-panel">
          <form action={formAction} className="panel page-stack" id="new-customer">
            <div className="table-header-row">
              <div>
                <h2>{selectedCustomer ? t('customers.editTitle') : t('customers.newTitle')}</h2>
                <p>{t('customers.formHelp')}</p>
              </div>
              {selectedCustomer ? (
                <Link href="/customers" className="inline-link">{t('customers.newAction')}</Link>
              ) : null}
            </div>

            <div className="grid-two">
              <label>
                <span className="field-heading">{t('customers.fields.displayName')} <span className="setup-required-mark" aria-hidden="true">*</span></span>
                <input name="displayName" defaultValue={selectedCustomer?.displayName ?? ''} placeholder={t('customers.placeholders.displayName')} required />
              </label>
              <label>
                <span className="field-heading">{t('customers.fields.preferredContactMethod')} <span className="optional-pill">{t('common.optional')}</span></span>
                <select name="preferredContactMethod" defaultValue={selectedCustomer?.preferredContactMethod ?? ''}>
                  <option value="">{t('customers.placeholders.contactMethod')}</option>
                  {contactMethodOptions.map((option) => (
                    <option key={option} value={option}>{t(`customers.contactMethods.${option}`)}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="field-heading">{t('customers.fields.phone')} <span className="optional-pill">{t('common.optional')}</span></span>
                <input name="phone" defaultValue={selectedCustomer?.phone ?? ''} placeholder={t('customers.placeholders.phone')} />
              </label>
              <label>
                <span className="field-heading">{t('customers.fields.email')} <span className="optional-pill">{t('common.optional')}</span></span>
                <input name="email" type="email" defaultValue={selectedCustomer?.email ?? ''} placeholder={t('customers.placeholders.email')} />
              </label>
            </div>

            <label>
              <span className="field-heading">{t('customers.fields.address')} <span className="optional-pill">{t('common.optional')}</span></span>
              <textarea name="address" defaultValue={selectedCustomer?.address ?? ''} placeholder={t('customers.placeholders.address')} />
            </label>
            <label>
              <span className="field-heading">{t('customers.fields.deliveryNote')} <span className="optional-pill">{t('common.optional')}</span></span>
              <textarea name="deliveryNote" defaultValue={selectedCustomer?.deliveryNote ?? ''} placeholder={t('customers.placeholders.deliveryNote')} />
            </label>
            <label>
              <span className="field-heading">{t('customers.fields.internalNote')} <span className="optional-pill">{t('common.optional')}</span></span>
              <textarea name="internalNote" defaultValue={selectedCustomer?.internalNote ?? ''} placeholder={t('customers.placeholders.internalNote')} />
            </label>
            <label className="checkbox-row">
              <input name="active" type="checkbox" defaultChecked={selectedCustomer?.active ?? true} />
              <span>
                <strong>{t('customers.fields.active')}</strong>
                <span className="helper-text">{t('customers.fields.activeHelp')}</span>
              </span>
            </label>

            <button type="submit" className="button-primary">{selectedCustomer ? t('customers.updateAction') : t('customers.createAction')}</button>
            {selectedCustomer ? (
              <Link href={`/orders/new?customerId=${selectedCustomer.id}`} className="button-secondary">
                {t('customers.createOrderAction')}
              </Link>
            ) : null}
          </form>

          <article className="panel page-stack customers-detail-panel">
            <div className="table-header-row">
              <div>
                <h2>{t('customers.detailTitle')}</h2>
                <p>{t('customers.detailHelp')}</p>
              </div>
              {selectedCustomer ? <span className="summary-pill">{selectedCustomer.displayName}</span> : null}
            </div>

            {selectedCustomer ? (
              <>
                <section className="page-context-card">
                  <CustomersIcon className="callout-icon" />
                  <div>
                    <strong>{selectedCustomer.displayName}</strong>
                    <p className="helper-text no-margin">
                      {selectedCustomer.phone ?? selectedCustomer.email ?? t('customers.noContactYet')}
                    </p>
                    <p className="helper-text no-margin">
                      {selectedCustomer.preferredContactMethod
                        ? t('customers.preferredContactSummary', { method: t(`customers.contactMethods.${selectedCustomer.preferredContactMethod}`) })
                        : t('customers.noPreferredContact')}
                    </p>
                  </div>
                </section>

                <ul className="stack-list compact-list">
                  <li>
                    <strong>{t('customers.fields.address')}</strong>
                    <span>{selectedCustomer.address ?? t('common.clear')}</span>
                  </li>
                  <li>
                    <strong>{t('customers.fields.deliveryNote')}</strong>
                    <span>{selectedCustomer.deliveryNote ?? t('common.clear')}</span>
                  </li>
                  <li>
                    <strong>{t('customers.fields.internalNote')}</strong>
                    <span>{selectedCustomer.internalNote ?? t('common.clear')}</span>
                  </li>
                  <li>
                    <strong>{t('customers.lastUpdated')}</strong>
                    <span>{formatDateLabel(selectedCustomer.updatedAt.slice(0, 10), locale)}</span>
                  </li>
                </ul>

                <div className="table-header-row">
                  <div>
                    <h3>{t('customers.recentOrdersTitle')}</h3>
                    <p>{t('customers.recentOrdersHelp')}</p>
                  </div>
                  <span className="summary-pill">{view.customerOrderHistory.length} {t('common.orders')}</span>
                </div>
                {view.customerOrderHistory.length > 0 ? (
                  <ul className="stack-list muted-list">
                    {view.customerOrderHistory.map((order) => (
                      <li key={order.id}>
                        <strong>
                          <Link href={`/orders/${order.id}`} className="inline-link">
                            {formatDateLabel(order.productionDate, locale)}
                          </Link>
                        </strong>
                        <span>
                          {formatStatusLabel(order.fulfillmentType, t)}
                          {order.destinationLabel ? ` · ${order.destinationLabel}` : ''}
                          {order.promisedTime ? ` · ${order.promisedTime}` : ''}
                          {order.dispatchNotes ? ` · ${order.dispatchNotes}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-state">{t('customers.recentOrdersEmpty')}</p>
                )}

                <ActivityFeed
                  title={t('activity.customerTitle')}
                  description={t('activity.customerHelp')}
                  emptyLabel={t('activity.empty')}
                  items={view.selectedCustomerActivity}
                  compact
                />
              </>
            ) : (
              <section className="page-context-card">
                <CustomersIcon className="callout-icon" />
                <div>
                  <strong>{t('customers.emptyTitle')}</strong>
                  <p className="helper-text no-margin">{t('customers.emptyBody')}</p>
                </div>
              </section>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}
