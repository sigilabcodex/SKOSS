import Link from 'next/link';
import { skossCoreRoutes } from '@/lib/application-planes';
import { requireAdminPlaneAccess } from '@/lib/server/application-access';

export default async function AdminHomePage() {
  await requireAdminPlaneAccess(skossCoreRoutes.admin);

  return (
    <div className="page-stack">
      <section className="hero-card">
        <p className="eyebrow">SKOSS Core / Admin Console</p>
        <h1>Instance administration</h1>
        <p className="lede">Structural setup, module control, imports, and system configuration stay on the admin plane.</p>
      </section>
      <section className="grid-cards">
        <Link href={skossCoreRoutes.adminSetup} className="panel-link">
          <h2>Structural setup</h2>
          <p>Users, suppliers, materials, recipes, imports, and business fine tuning.</p>
        </Link>
        <Link href={skossCoreRoutes.adminModules} className="panel-link">
          <h2>Module control</h2>
          <p>Core-required and optional module defaults for this instance.</p>
        </Link>
      </section>
    </div>
  );
}
