import type { UserRole, WorkspaceSurface } from '@/lib/domain/types';

export const workspaceSurfaceOrder: WorkspaceSurface[] = ['home', 'orders', 'customers', 'production', 'handoff', 'preferences', 'setup'];

export function isPrimaryWorkspaceSurface(workspace: WorkspaceSurface): workspace is Exclude<WorkspaceSurface, 'preferences'> {
  return workspace !== 'preferences';
}

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
      return ['setup', 'customers', 'orders', 'production', 'handoff', 'home'];
    case 'manager':
      return ['orders', 'customers', 'production', 'handoff', 'setup', 'home'];
    case 'production':
      return ['production', 'handoff', 'orders', 'home'];
    case 'frontdesk':
      return ['orders', 'customers', 'handoff', 'home'];
    case 'delivery':
      return ['handoff', 'customers', 'orders', 'home'];
    default:
      return ['home', 'orders', 'customers', 'production', 'handoff', 'setup'];
  }
}

export function getVisibleWorkspacesForRole(role: UserRole) {
  return getWorkspacePriorityForRole(role).filter((workspace, index, items) => items.indexOf(workspace) === index);
}

export function canManageSettings(role: UserRole) {
  return role === 'admin' || role === 'manager';
}
