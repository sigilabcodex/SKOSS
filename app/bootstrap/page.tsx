import { redirect } from 'next/navigation';
import { CsvImportCard } from '@/components/setup/csv-import-card';
import { saveBootstrapStepAction, importCsvEntitiesAction } from '@/lib/server/actions';
import { readStore } from '@/lib/server/store';
import { detectInstanceGatewayState } from '@/lib/server/instance-entry';

const totalSteps = 8;

function bootstrapStep(step: number) {
  return Math.max(1, Math.min(totalSteps, step));
}

export default async function BootstrapPage({
  searchParams,
}: {
  searchParams?: Promise<{ step?: string; error?: string; saved?: string }>;
}) {
  const [data, params] = await Promise.all([
    readStore(),
    searchParams,
  ]);
  const state = await detectInstanceGatewayState(data);

  if (!state.canRunBootstrap) {
    redirect('/entry?error=' + encodeURIComponent('First-use bootstrap is locked for initialized instances.'));
  }

  const step = bootstrapStep(Number(params?.step ?? 1));
  const progress = Math.round((step / totalSteps) * 100);
  const adminUser = data.users.find((user) => user.role === 'admin');

  return (
    <div className="page-stack bootstrap-flow">
      <section className="hero-card">
        <div className="hero-header">
          <div>
            <p className="eyebrow">Instance bootstrap</p>
            <h1>First-use wizard</h1>
            <p className="lede">Complete setup step-by-step. This flow is separate from normal workspaces and app navigation.</p>
          </div>
          <span className="summary-pill">Step {step} of {totalSteps}</span>
        </div>
        <div className="bootstrap-progress-track">
          <span className="bootstrap-progress-value" style={{ width: `${progress}%` }} aria-hidden="true" />
        </div>
      </section>

      {params?.saved === 'progress' ? <p className="inline-success">Progress saved.</p> : null}
      {params?.error ? <p className="inline-warning">{params.error}</p> : null}

      <form action={saveBootstrapStepAction} className="panel page-stack">
        <input type="hidden" name="step" value={step} />

        {step === 1 ? (
          <section className="page-stack">
            <h2>Welcome and confirmation</h2>
            <p>This is an instance-level action. Use it for first-time bootstrap, not for day-to-day settings changes.</p>
            <ul className="stack-list">
              <li><strong>Safe to pause:</strong> progress is persisted after each step.</li>
              <li><strong>Safe to skip:</strong> optional sections can be skipped and completed later in Setup.</li>
              <li><strong>Separate from demo:</strong> demo mode and regular login stay outside this flow.</li>
            </ul>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="page-stack">
            <h2>Create first admin</h2>
            <div className="grid-two">
              <label>
                <span className="field-heading">Admin name <span className="setup-required-mark" aria-hidden="true">*</span></span>
                <input name="adminDisplayName" defaultValue={adminUser?.displayName ?? ''} placeholder="Owner / lead" required />
              </label>
              <label>
                <span className="field-heading">Username <span className="setup-required-mark" aria-hidden="true">*</span></span>
                <input name="adminUsername" defaultValue={adminUser?.loginIdentifier ?? ''} placeholder="owner" required />
              </label>
            </div>
            <label>
              <span className="field-heading">Password <span className="setup-required-mark" aria-hidden="true">*</span></span>
              <input name="adminPassword" type="password" autoComplete="new-password" required />
            </label>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="page-stack">
            <h2>Workspace basics</h2>
            <div className="grid-two">
              <label>
                <span className="field-heading">Business name</span>
                <input name="businessName" defaultValue={data.workspace.name} required />
              </label>
              <label>
                <span className="field-heading">Timezone</span>
                <input name="timezone" defaultValue={data.workspace.timezone} />
              </label>
            </div>
            <div className="grid-two">
              <label>
                <span className="field-heading">Language</span>
                <select name="locale" defaultValue={data.preferences.locale}>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="pt">Português</option>
                </select>
              </label>
              <label>
                <span className="field-heading">Operating mode</span>
                <select name="operatingMode" defaultValue={data.preferences.operatingMode}>
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                  <option value="mixed">Mixed</option>
                </select>
              </label>
            </div>
            <div className="grid-two">
              <label>
                <span className="field-heading">Preset</span>
                <select name="preset" defaultValue={data.preferences.preset}>
                  <option value="bakery">Bakery</option>
                  <option value="cafe">Cafe</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="dark_kitchen">Dark kitchen</option>
                  <option value="food_stall">Food stall</option>
                  <option value="generic">Generic</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label>
                <span className="field-heading">Theme</span>
                <select name="theme" defaultValue={data.preferences.theme}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </label>
            </div>
          </section>
        ) : null}

        {step === 4 ? (
          <section className="page-stack">
            <h2>Team and roles</h2>
            <p>Create initial users with username-based sign-in, role assignment, and default workspace access.</p>
            {[1, 2, 3].map((row) => (
              <div key={row} className="subpanel page-stack">
                <h3>Team member {row}</h3>
                <div className="grid-two">
                  <label>
                    <span className="field-heading">Display name</span>
                    <input name={`teamDisplayName${row}`} placeholder={row === 1 ? 'Owner' : row === 2 ? 'Frontdesk' : 'Night shift'} />
                  </label>
                  <label>
                    <span className="field-heading">Username</span>
                    <input name={`teamUsername${row}`} placeholder={row === 1 ? 'owner' : row === 2 ? 'frontdesk' : 'nightshift'} />
                  </label>
                </div>
                <div className="grid-two">
                  <label>
                    <span className="field-heading">Role</span>
                    <select name={`teamRole${row}`} defaultValue={row === 1 ? 'manager' : row === 2 ? 'frontdesk' : 'production'}>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="frontdesk">Frontdesk</option>
                      <option value="production">Production</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  </label>
                  <label>
                    <span className="field-heading">Default workspace</span>
                    <select name={`teamWorkspace${row}`} defaultValue={row === 3 ? 'production' : 'orders'}>
                      <option value="orders">Orders</option>
                      <option value="timeline">Timeline</option>
                      <option value="customers">Customers</option>
                      <option value="production">Production</option>
                      <option value="handoff">Handoff</option>
                      <option value="setup">Setup</option>
                    </select>
                  </label>
                </div>
                <label className="checkbox-row">
                  <input type="checkbox" name={`teamEnabled${row}`} defaultChecked />
                  <span><strong>Active now</strong></span>
                </label>
              </div>
            ))}
          </section>
        ) : null}

        {step === 5 ? (
          <section className="page-stack">
            <h2>Shifts</h2>
            <p>Confirm the shifts you will use first. You can edit details later in Setup.</p>
            <div className="grid-two">
              <label className="checkbox-row"><input type="checkbox" defaultChecked disabled /> <span><strong>Night production</strong></span></label>
              <label className="checkbox-row"><input type="checkbox" defaultChecked disabled /> <span><strong>Morning bake / dispatch</strong></span></label>
            </div>
            <p className="helper-text">This step marks shift intent for bootstrap continuity without introducing heavy scheduling configuration.</p>
          </section>
        ) : null}

        {step === 6 ? (
          <section className="page-stack">
            <h2>Products and recipes</h2>
            <p>Start with simple product setup. Add recipes progressively as operations stabilize.</p>
            <p className="helper-text">CSV import is attached to this step so product-oriented setup is not detached from first-run flow.</p>
            <CsvImportCard
              entity="rawMaterials"
              title="Recipe materials import"
              description="Import raw materials used by recipe lines."
              hint="CSV sample"
              sampleHeader="name,category,defaultUnit,brand,notes"
              actionLabel="Import materials"
              chooseFileLabel="Choose CSV"
              mappingTitle="Map columns"
              previewTitle="Preview"
              emptyPreview="No rows"
              noFileLabel="No file selected"
              parseErrorNoColumns="Could not detect CSV columns."
              parseErrorReadFile="Could not read CSV file."
              fields={[
                { key: 'name', label: 'Material name', required: true },
                { key: 'category', label: 'Category' },
                { key: 'defaultUnit', label: 'Unit' },
                { key: 'brand', label: 'Brand' },
                { key: 'notes', label: 'Notes' },
              ]}
              action={importCsvEntitiesAction}
              redirectTo="/bootstrap?step=6"
            />
          </section>
        ) : null}

        {step === 7 ? (
          <section className="page-stack">
            <h2>Customers, suppliers, and materials</h2>
            <div className="grid-two">
              <CsvImportCard
                entity="customers"
                title="Customer import"
                description="Bring repeating customer records into the instance."
                hint="CSV sample"
                sampleHeader="displayName,phone,email,address,deliveryNote,internalNote"
                actionLabel="Import customers"
                chooseFileLabel="Choose CSV"
                mappingTitle="Map columns"
                previewTitle="Preview"
                emptyPreview="No rows"
                noFileLabel="No file selected"
                parseErrorNoColumns="Could not detect CSV columns."
                parseErrorReadFile="Could not read CSV file."
                fields={[
                  { key: 'displayName', label: 'Customer', required: true },
                  { key: 'phone', label: 'Phone' },
                  { key: 'email', label: 'Email' },
                  { key: 'address', label: 'Address' },
                  { key: 'deliveryNote', label: 'Delivery note' },
                  { key: 'internalNote', label: 'Internal note' },
                ]}
                action={importCsvEntitiesAction}
                redirectTo="/bootstrap?step=7"
              />
              <CsvImportCard
                entity="suppliers"
                title="Supplier import"
                description="Add supplier memory during bootstrap."
                hint="CSV sample"
                sampleHeader="name,contact,notes"
                actionLabel="Import suppliers"
                chooseFileLabel="Choose CSV"
                mappingTitle="Map columns"
                previewTitle="Preview"
                emptyPreview="No rows"
                noFileLabel="No file selected"
                parseErrorNoColumns="Could not detect CSV columns."
                parseErrorReadFile="Could not read CSV file."
                fields={[
                  { key: 'name', label: 'Supplier', required: true },
                  { key: 'contact', label: 'Contact' },
                  { key: 'notes', label: 'Notes' },
                ]}
                action={importCsvEntitiesAction}
                redirectTo="/bootstrap?step=7"
              />
            </div>
          </section>
        ) : null}

        {step === 8 ? (
          <section className="page-stack">
            <h2>Review and launch</h2>
            <ul className="stack-list">
              <li><strong>Admin account:</strong> {data.instance.onboardingProgress.adminAccount ? 'ready' : 'missing'}</li>
              <li><strong>Workspace basics:</strong> {data.instance.onboardingProgress.workspaceBasics ? 'saved' : 'pending'}</li>
              <li><strong>Team/roles:</strong> {data.instance.onboardingProgress.users ? 'saved' : 'pending'}</li>
              <li><strong>Shifts:</strong> {data.instance.onboardingProgress.shifts ? 'saved' : 'pending'}</li>
              <li><strong>Imports:</strong> optional {data.instance.onboardingProgress.optionalImports ? 'attempted' : 'skipped'}</li>
            </ul>
            <p className="helper-text">Launch exits bootstrap and returns to entry/login flow for normal use.</p>
          </section>
        ) : null}

        <div className="onboarding-actions">
          {step > 1 ? (
            <button type="submit" name="intent" value="back" className="button-secondary">Back</button>
          ) : null}
          {step < 8 ? (
            <>
              <button type="submit" name="intent" value="next" className="button-primary">Next</button>
              <button type="submit" name="intent" value="skip" className="button-ghost">Skip</button>
            </>
          ) : (
            <button type="submit" name="intent" value="launch" className="button-primary">Launch workspace</button>
          )}
        </div>
      </form>
    </div>
  );
}
