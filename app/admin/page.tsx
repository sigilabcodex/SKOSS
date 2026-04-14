import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/server/auth';

export default async function AdminHomePage() {
  const userContext = await getCurrentUserContext();

  if (!userContext.currentUser) {
    redirect('/login?redirectTo=/admin');
  }

  if (!userContext.canManageSettings) {
    redirect('/');
  }

  return (
    <div className="page-stack">
      <section className="hero-card">
        <p className="eyebrow">SKOSS Core / Admin Console</p>
        <h1>Instance administration</h1>
        <p className="lede">Structural setup, module control, imports, and system configuration stay on the admin plane.</p>
      </section>
      <section className="grid-cards">
        <Link href="/admin/setup" className="panel-link">
          <h2>Structural setup</h2>
          <p>Users, suppliers, materials, recipes, imports, and business fine tuning.</p>
        </Link>
        <Link href="/admin/modules" className="panel-link">
          <h2>Module control</h2>
          <p>Core-required and optional module defaults for this instance.</p>
        </Link>
      </section>
    </div>
  );
}
