import type { UserRole, WorkspaceSurface } from '@/lib/domain/types';

export const workspaceSurfaceOrder: WorkspaceSurface[] = ['home', 'timeline', 'orders', 'customers', 'production', 'handoff', 'preferences', 'setup'];

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
      return ['setup', 'timeline', 'customers', 'orders', 'production', 'handoff', 'home'];
    case 'manager':
      return ['timeline', 'orders', 'production', 'handoff', 'customers', 'setup', 'home'];
    case 'production':
      return ['timeline', 'production', 'handoff', 'orders', 'home'];
    case 'frontdesk':
      return ['timeline', 'orders', 'customers', 'handoff', 'home'];
    case 'delivery':
      return ['timeline', 'handoff', 'customers', 'orders', 'home'];
    default:
      return ['home', 'timeline', 'orders', 'customers', 'production', 'handoff', 'setup'];
  }
}

export function getVisibleWorkspacesForRole(role: UserRole) {
  return getWorkspacePriorityForRole(role).filter((workspace, index, items) => items.indexOf(workspace) === index);
}

export function canManageSettings(role: UserRole) {
  return role === 'admin' || role === 'manager';
}
