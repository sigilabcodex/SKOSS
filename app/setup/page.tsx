import { redirect } from 'next/navigation';
import { skossCoreRoutes } from '@/lib/application-planes';

export default function LegacySetupRedirectPage() {
  redirect(skossCoreRoutes.adminSetup);
}
