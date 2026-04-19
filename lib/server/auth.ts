import { cookies } from 'next/headers';
import type { AppData, User, WorkspaceSurface } from '@/lib/domain/types';
import { getDefaultWorkspaceForRole, getVisibleWorkspacesForRole, isPrimaryWorkspaceSurface } from '@/lib/workspaces';
import { readPersistence } from '@/lib/server/persistence';

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
  const persisted = sourceData
    ? {
        users: sourceData.users,
        session: sourceData.session,
      }
    : await (async () => {
        const context = await readPersistence();
        return {
          users: context.users.list(),
          session: context.instance.getSessionState(),
        };
      })();

  const cookieStore = await cookies();
  const requestedUserId = cookieStore.get(sessionUserCookieName)?.value;
  const sessionUserId = requestedUserId && requestedUserId !== loggedOutSessionValue ? requestedUserId : persisted.session.currentUserId;
  const sessionExpired = persisted.session.lastLoginAt
    ? Date.now() - new Date(persisted.session.lastLoginAt).getTime() > sessionMaxAgeMs
    : false;
  const currentUser = requestedUserId === loggedOutSessionValue
    || sessionExpired
    ? null
    : persisted.users.find((user) => user.id === sessionUserId && user.active) ?? getFallbackUser(persisted.users);
  const visibleWorkspaces: WorkspaceSurface[] = currentUser ? getVisibleWorkspacesForRole(currentUser.role) : ['home'];
  const homeWorkspace = resolveUserHomeWorkspace(currentUser);

  return {
    currentUser,
    visibleWorkspaces,
    homeWorkspace,
    canManageSettings: currentUser ? currentUser.role === 'owner_admin' : false,
  };
}
