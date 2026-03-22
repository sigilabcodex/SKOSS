import type { UserRole, WorkspaceSurface } from '@/lib/domain/types';

export const workspaceSurfaceOrder: WorkspaceSurface[] = ['home', 'orders', 'production', 'handoff', 'preferences', 'setup'];

export function getDefaultWorkspaceForRole(role: UserRole): WorkspaceSurface {
  switch (role) {
    case 'admin':
      return 'setup';
    case 'manager':
      return 'orders';
    case 'production':
      return 'production';
    case 'frontdesk':
      return 'orders';
    case 'delivery':
      return 'handoff';
    default:
      return 'home';
  }
}

export function getWorkspacePriorityForRole(role: UserRole): WorkspaceSurface[] {
  switch (role) {
    case 'admin':
      return ['setup', 'orders', 'production', 'handoff', 'preferences', 'home'];
    case 'manager':
      return ['orders', 'production', 'handoff', 'setup', 'preferences', 'home'];
    case 'production':
      return ['production', 'handoff', 'orders', 'preferences', 'home'];
    case 'frontdesk':
      return ['orders', 'handoff', 'preferences', 'home'];
    case 'delivery':
      return ['handoff', 'orders', 'preferences', 'home'];
    default:
      return ['home', 'orders', 'production', 'handoff', 'preferences', 'setup'];
  }
}

export function getVisibleWorkspacesForRole(role: UserRole) {
  return getWorkspacePriorityForRole(role).filter((workspace, index, items) => items.indexOf(workspace) === index);
}

export function canManageSettings(role: UserRole) {
  return role === 'admin' || role === 'manager';
}
