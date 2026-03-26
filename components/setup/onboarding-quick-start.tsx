import Link from 'next/link';
import {
  createCustomerAction,
  createRawMaterialAction,
  createSupplierAction,
  createUserAction,
} from '@/lib/server/actions';
import { getServerTranslator } from '@/lib/i18n/server';

type OnboardingQuickStartProps = {
  redirectTo: string;
  compact?: boolean;
};

function RedirectField({ redirectTo }: { redirectTo: string }) {
  return (
    <>
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="allowEmpty" value="1" />
    </>
  );
}

export async function OnboardingQuickStart({ redirectTo, compact = false }: OnboardingQuickStartProps) {
  const { t } = await getServerTranslator();

  return (
    <section className={`panel page-stack ${compact ? 'onboarding-quick-start-compact' : ''}`}>
      <div className="table-header-row">
        <div>
          <h2>{t('setupAssistant.quickStart.title')}</h2>
          <p>{t('setupAssistant.quickStart.description')}</p>
        </div>
        <span className="summary-pill">{t('setupAssistant.quickStart.optional')}</span>
      </div>

      <div className="grid-two">
        <form action={createUserAction} className="subpanel page-stack">
          <RedirectField redirectTo={redirectTo} />
          <h3>{t('setupAssistant.quickStart.users')}</h3>
          <p className="helper-text">{t('setupAssistant.quickStart.usersHelp')}</p>
          <label>
            <span className="field-heading">{t('setup.fields.userDisplayName')}</span>
            <input name="displayName" placeholder={t('setup.placeholders.userDisplayName')} />
          </label>
          <label>
            <span className="field-heading">{t('setup.fields.loginIdentifier')}</span>
            <input name="loginIdentifier" placeholder="owner" />
          </label>
          <div className="grid-two">
            <label>
              <span className="field-heading">{t('setup.fields.role')}</span>
              <select name="role" defaultValue="frontdesk">
                {['admin', 'manager', 'production', 'frontdesk', 'delivery'].map((role) => (
                  <option key={role} value={role}>{t(`roles.${role}.label`)}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-heading">{t('setup.fields.defaultWorkspace')}</span>
              <select name="defaultWorkspace" defaultValue="orders">
                {['timeline', 'orders', 'customers', 'production', 'handoff', 'preferences', 'setup'].map((workspace) => (
                  <option key={workspace} value={workspace}>{t(`nav.${workspace}`)}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="checkbox-row">
            <input name="active" type="checkbox" defaultChecked />
            <span><strong>{t('setup.fields.userActive')}</strong></span>
          </label>
          <button type="submit" className="button-secondary compact-button">{t('setup.actions.saveUser')}</button>
        </form>

        <form action={createCustomerAction} className="subpanel page-stack">
          <RedirectField redirectTo={redirectTo} />
          <h3>{t('setupAssistant.quickStart.customers')}</h3>
          <p className="helper-text">{t('setupAssistant.quickStart.customersHelp')}</p>
          <label>
            <span className="field-heading">{t('customers.fields.displayName')}</span>
            <input name="displayName" placeholder={t('customers.placeholders.displayName')} />
          </label>
          <label>
            <span className="field-heading">{t('customers.fields.phone')}</span>
            <input name="phone" placeholder={t('customers.placeholders.phone')} />
          </label>
          <button type="submit" className="button-secondary compact-button">{t('setup.actions.addCustomer')}</button>
        </form>

        <form action={createSupplierAction} className="subpanel page-stack">
          <RedirectField redirectTo={redirectTo} />
          <h3>{t('setupAssistant.quickStart.suppliers')}</h3>
          <p className="helper-text">{t('setupAssistant.quickStart.suppliersHelp')}</p>
          <label>
            <span className="field-heading">{t('setup.fields.supplierName')}</span>
            <input name="name" placeholder={t('setup.placeholders.supplierName')} />
          </label>
          <label>
            <span className="field-heading">{t('setup.fields.contact')}</span>
            <input name="contact" placeholder={t('setup.placeholders.supplierContact')} />
          </label>
          <button type="submit" className="button-secondary compact-button">{t('setup.actions.saveSupplier')}</button>
        </form>

        <form action={createRawMaterialAction} className="subpanel page-stack">
          <RedirectField redirectTo={redirectTo} />
          <h3>{t('setupAssistant.quickStart.materials')}</h3>
          <p className="helper-text">{t('setupAssistant.quickStart.materialsHelp')}</p>
          <label>
            <span className="field-heading">{t('setup.fields.rawMaterialName')}</span>
            <input name="name" placeholder={t('setup.placeholders.rawMaterialName')} />
          </label>
          <label>
            <span className="field-heading">{t('setup.fields.defaultUnit')}</span>
            <input name="defaultUnit" placeholder={t('setup.placeholders.defaultUnit')} />
          </label>
          <button type="submit" className="button-secondary compact-button">{t('setup.actions.saveRawMaterial')}</button>
        </form>
      </div>

      <p className="helper-text no-margin">
        {t('setupAssistant.quickStart.skipHelp')} <Link href="/setup" className="inline-link">{t('setup.title')}</Link>
      </p>
    </section>
  );
}
