import { redirect } from 'next/navigation';
import { CsvImportCard } from '@/components/setup/csv-import-card';
import { TeamRosterBuilder } from '@/components/setup/team-roster-builder';
import { TimezoneSelect } from '@/components/setup/timezone-select';
import { saveBootstrapStepAction, importCsvEntitiesAction } from '@/lib/server/actions';
import { readAppData } from '@/lib/server/persistence';
import { detectInstanceGatewayState } from '@/lib/server/instance-entry';

const totalSteps = 8;
const requiredSteps = new Set([1, 2]);

function bootstrapStep(step: number) {
  return Math.max(1, Math.min(totalSteps, step));
}

export default async function BootstrapPage({
  searchParams,
}: {
  searchParams?: Promise<{ step?: string; error?: string; saved?: string }>;
}) {
  const [data, params] = await Promise.all([readAppData(), searchParams]);
  const state = await detectInstanceGatewayState(data);

  if (!state.canRunBootstrap) {
    redirect('/entry?error=' + encodeURIComponent('Setup is locked for initialized instances.'));
  }

  const step = bootstrapStep(Number(params?.step ?? 1));
  const progress = Math.round((step / totalSteps) * 100);
  const adminUser = data.users.find((user) => user.role === 'owner_admin' || user.roles?.includes('owner_admin'));
  const isRequiredStep = requiredSteps.has(step);

  return (
    <div className="page-stack bootstrap-flow">
      <section className="hero-card">
        <div className="hero-header">
          <div>
            <p className="eyebrow">First-time setup</p>
            <h1>Start your kitchen workspace</h1>
            <p className="lede">
              Guided activation first, then optional setup. Required steps are marked so you can launch fast and keep configuring later.
            </p>
          </div>
          <span className="summary-pill">Step {step} of {totalSteps}</span>
        </div>
        <div className="bootstrap-progress-track">
          <span className="bootstrap-progress-value" style={{ width: `${progress}%` }} aria-hidden="true" />
        </div>
        <p className="helper-text no-margin">
          Required now: steps 1-2 (admin account and workspace basics). Optional and skippable: steps 3-7.
        </p>
      </section>

      {params?.saved === 'progress' ? <p className="inline-success">Saved.</p> : null}
      {params?.error ? <p className="inline-warning">{params.error}</p> : null}

      <form action={saveBootstrapStepAction} className="panel page-stack">
        <input type="hidden" name="step" value={step} />

        {step === 1 ? (
          <section className="page-stack">
            <h2>Admin account (required)</h2>
            <div className="grid-two">
              <label>
                <span className="field-heading">Full name <span className="setup-required-mark" aria-hidden="true">*</span></span>
                <input name="adminDisplayName" defaultValue={adminUser?.displayName ?? ''} placeholder="Alex Rivera" required />
              </label>
              <label>
                <span className="field-heading">Username <span className="setup-required-mark" aria-hidden="true">*</span></span>
                <input name="adminUsername" defaultValue={adminUser?.loginIdentifier ?? ''} placeholder="alex" required />
                <span className="helper-text">Use 3-40 characters with letters, numbers, dot, dash, or underscore.</span>
              </label>
            </div>
            <div className="grid-two">
              <label>
                <span className="field-heading">Email (optional)</span>
                <input name="adminEmail" type="email" placeholder="owner@kitchen.local" />
              </label>
              <label>
                <span className="field-heading">Phone (optional)</span>
                <input name="adminPhone" placeholder="+1 555 0100" />
              </label>
            </div>
            <label>
              <span className="field-heading">Password <span className="setup-required-mark" aria-hidden="true">*</span></span>
              <input name="adminPassword" type="password" autoComplete="new-password" required />
            </label>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="page-stack">
            <h2>Workspace basics (required)</h2>
            <div className="grid-two">
              <label>
                <span className="field-heading">Business name <span className="setup-required-mark" aria-hidden="true">*</span></span>
                <input name="businessName" defaultValue={data.workspace.name} required />
              </label>
              <TimezoneSelect defaultValue={data.workspace.timezone || 'UTC'} />
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
                <span className="field-heading">Theme</span>
                <select name="theme" defaultValue={data.preferences.theme}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </label>
            </div>
            <fieldset className="subpanel page-stack">
              <legend className="field-heading">Operating mode</legend>
              <div className="grid-two">
                <label className="checkbox-row"><input type="radio" name="operatingMode" value="pickup" defaultChecked={data.preferences.operatingMode === 'pickup'} /><span><strong>Pickup</strong><span className="helper-text">Most orders are picked up at your location.</span></span></label>
                <label className="checkbox-row"><input type="radio" name="operatingMode" value="delivery" defaultChecked={data.preferences.operatingMode === 'delivery'} /><span><strong>Delivery</strong><span className="helper-text">Most orders go out for delivery.</span></span></label>
                <label className="checkbox-row"><input type="radio" name="operatingMode" value="mixed" defaultChecked={data.preferences.operatingMode === 'mixed'} /><span><strong>Mixed</strong><span className="helper-text">You handle both pickup and delivery.</span></span></label>
              </div>
            </fieldset>
            <label>
              <span className="field-heading">Preset</span>
              <select name="preset" defaultValue={data.preferences.preset}>
                <option value="bakery">Bakery — dough and bake oriented</option>
                <option value="cafe">Cafe — service and prep oriented</option>
                <option value="restaurant">Restaurant — shift and order paced</option>
                <option value="dark_kitchen">Dark kitchen — delivery-first flow</option>
                <option value="food_stall">Food stall — fast daily rhythm</option>
                <option value="generic">Generic — flexible baseline</option>
                <option value="other">Other — start simple</option>
              </select>
            </label>
            <p className="helper-text">You can change all of this later.</p>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="page-stack">
            <h2>Work style (optional)</h2>
            <p>Choose how you run day-to-day. This helps us suggest defaults.</p>
            <div className="grid-two">
              <label className="checkbox-row"><input type="radio" name="workStyle" value="solo" defaultChecked /><span><strong>Solo operator</strong><span className="helper-text">One person handles most tasks.</span></span></label>
              <label className="checkbox-row"><input type="radio" name="workStyle" value="team" /><span><strong>Small team</strong><span className="helper-text">You hand work across roles and shifts.</span></span></label>
            </div>
          </section>
        ) : null}

        {step === 4 ? (
          <section className="page-stack">
            <h2>Team and roles (optional)</h2>
            <p>Add one user or a full small team. You can also skip and continue from Setup later.</p>
            <TeamRosterBuilder initialRows={1} />
            <p className="helper-text">
              Team members created here receive a temporary password and must update it at first sign-in.
            </p>
          </section>
        ) : null}

        {step === 5 ? (
          <section className="page-stack">
            <h2>Operational rhythm (optional)</h2>
            <p>Set your basic working hours. Keep this light; detailed scheduling can come later.</p>
            <div className="grid-two">
              <label>
                <span className="field-heading">Start time</span>
                <input name="rhythmStart" type="time" defaultValue="06:00" />
              </label>
              <label>
                <span className="field-heading">End time</span>
                <input name="rhythmEnd" type="time" defaultValue="18:00" />
              </label>
            </div>
          </section>
        ) : null}

        {step === 6 ? (
          <section className="page-stack">
            <h2>First product (optional)</h2>
            <p>Create one starter product now for immediate order capture, or skip and add products later.</p>
            <div className="grid-two">
              <label>
                <span className="field-heading">Product name</span>
                <input name="starterProductName" placeholder="Sourdough loaf" />
              </label>
              <label>
                <span className="field-heading">Unit</span>
                <input name="starterProductUnit" placeholder="pieces" />
              </label>
            </div>
            <p className="helper-text">Need bulk import later? Use Setup → Imports after launch.</p>
          </section>
        ) : null}

        {step === 7 ? (
          <section className="page-stack">
            <h2>Imports (optional)</h2>
            <p>Import customers, suppliers, or materials if you already have CSV files. Manual setup remains available in Setup.</p>
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
                fields={[{ key: 'displayName', label: 'Customer', required: true }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }]}
                action={importCsvEntitiesAction}
                redirectTo="/bootstrap?step=7"
              />
              <CsvImportCard
                entity="suppliers"
                title="Supplier import"
                description="Add supplier records from your existing file."
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
                fields={[{ key: 'name', label: 'Supplier', required: true }, { key: 'contact', label: 'Contact' }, { key: 'notes', label: 'Notes' }]}
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
              <li><strong>Identity:</strong> {data.instance.onboardingProgress.adminAccount ? 'ready' : 'missing'}</li>
              <li><strong>Kitchen basics:</strong> {data.instance.onboardingProgress.workspaceBasics ? 'saved' : 'pending'}</li>
              <li><strong>Team:</strong> {data.instance.onboardingProgress.users ? 'saved' : 'pending'}</li>
              <li><strong>Operational rhythm:</strong> {data.instance.onboardingProgress.shifts ? 'saved' : 'pending'}</li>
              <li><strong>Imports:</strong> optional {data.instance.onboardingProgress.optionalImports ? 'attempted' : 'skipped'}</li>
            </ul>
            <p className="helper-text">
              Launch takes you to sign-in. Optional items can be resumed later from Setup.
            </p>
          </section>
        ) : null}

        <div className="onboarding-actions">
          {step > 1 ? <button type="submit" name="intent" value="back" className="button-secondary">Back</button> : null}
          {step < 8 ? (
            <>
              {!isRequiredStep ? <button type="submit" name="intent" value="skip" className="button-ghost">Skip for now</button> : null}
              <button type="submit" name="intent" value="next" className="button-primary">Next</button>
            </>
          ) : <button type="submit" name="intent" value="launch" className="button-primary">Launch workspace</button>}
        </div>
      </form>
    </div>
  );
}
