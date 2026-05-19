import { skossCoreRoutes } from '@/lib/application-planes';
import { moduleRegistry } from '@/lib/modules';
import { requireAdminPlaneAccess } from '@/lib/server/application-access';
import { readPersistence } from '@/lib/server/persistence';
import { updateModuleRegistryAction } from '@/lib/server/actions';

export default async function AdminModulesPage({ searchParams }: { searchParams?: Promise<{ saved?: string }> }) {
  await requireAdminPlaneAccess(skossCoreRoutes.adminModules);
  const [persistence, params] = await Promise.all([readPersistence(), searchParams]);
  const moduleStates = persistence.instance.getInstanceState().moduleStates ?? {};

  return (
    <div className="page-stack">
      <section className="hero-card">
        <p className="eyebrow">Module registry</p>
        <h1>Core and optional modules</h1>
        <p className="lede">Required modules stay always enabled. Optional modules follow preset defaults and can be toggled here.</p>
      </section>
      {params?.saved === 'modules' ? <p className="inline-success">Module settings updated.</p> : null}
      <form action={updateModuleRegistryAction} className="panel page-stack">
        {moduleRegistry.map((module) => {
          const enabled = module.required || moduleStates[module.id] !== false;
          return (
            <label key={module.id} className="checkbox-row">
              <input
                type="checkbox"
                name={`module:${module.id}`}
                value="1"
                defaultChecked={enabled}
                disabled={module.required}
              />
              <span>
                <strong>{module.label} {module.required ? '(required)' : '(optional)'}</strong>
                <span className="helper-text">{module.description}</span>
              </span>
            </label>
          );
        })}
        <button type="submit" className="button-primary">Save module settings</button>
      </form>
    </div>
  );
}
