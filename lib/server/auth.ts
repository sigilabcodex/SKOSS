import { cookies } from 'next/headers';
import type { AppData, User, WorkspaceSurface } from '@/lib/domain/types';
import { getDefaultWorkspaceForRole, getVisibleWorkspacesForRole, isPrimaryWorkspaceSurface } from '@/lib/workspaces';
import { readStore } from '@/lib/server/store';

export const sessionUserCookieName = 'skoss-user';
export const loggedOutSessionValue = '__logged_out__';
const sessionMaxAgeMs = 1000 * 60 * 60 * 24 * 14;

function getFallbackUser(users: User[]) {
  return users.find((user) => user.active) ?? users[0] ?? null;
}

export function resolveUserHomeWorkspace(user: User | null | undefined): WorkspaceSurface {
  if (!user) {
    return 'home';
  }

  const preferredWorkspace = user.preferences?.defaultWorkspace ?? user.defaultWorkspace;

  if (!preferredWorkspace || !isPrimaryWorkspaceSurface(preferredWorkspace)) {
    return getDefaultWorkspaceForRole(user.role);
  }

  return preferredWorkspace;
}

export async function getCurrentUserContext(sourceData?: AppData) {
  const data = sourceData ?? await readStore();
  const cookieStore = await cookies();
  const requestedUserId = cookieStore.get(sessionUserCookieName)?.value;
  const sessionUserId = requestedUserId && requestedUserId !== loggedOutSessionValue ? requestedUserId : data.session.currentUserId;
  const sessionExpired = data.session.lastLoginAt
    ? Date.now() - new Date(data.session.lastLoginAt).getTime() > sessionMaxAgeMs
    : false;
  const currentUser = requestedUserId === loggedOutSessionValue
    || sessionExpired
    ? null
    : data.users.find((user) => user.id === sessionUserId && user.active) ?? getFallbackUser(data.users);
  const visibleWorkspaces: WorkspaceSurface[] = currentUser ? getVisibleWorkspacesForRole(currentUser.role) : ['home'];
  const homeWorkspace = resolveUserHomeWorkspace(currentUser);

  return {
    currentUser,
    visibleWorkspaces,
    homeWorkspace,
    canManageSettings: currentUser ? currentUser.role === 'owner_admin' : false,
  };
}
