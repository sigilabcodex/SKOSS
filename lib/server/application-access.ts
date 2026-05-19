import { redirect } from 'next/navigation';
import { skossinaRoutes, type SkossCoreRoute } from '@/lib/application-planes';
import { getCurrentUserContext } from '@/lib/server/auth';

export async function requireAdminPlaneAccess(redirectTo: SkossCoreRoute) {
  const userContext = await getCurrentUserContext();

  if (!userContext.currentUser) {
    redirect(`/login?redirectTo=${redirectTo}`);
  }

  if (!userContext.canManageSettings) {
    redirect(skossinaRoutes.home);
  }

  return userContext;
}
