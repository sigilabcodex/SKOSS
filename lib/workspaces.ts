import type { UserRole, WorkspaceSurface } from '@/lib/domain/types';

export const workspaceSurfaceOrder: WorkspaceSurface[] = ['home', 'timeline', 'orders', 'customers', 'production', 'handoff', 'preferences', 'admin'];

export function isPrimaryWorkspaceSurface(workspace: WorkspaceSurface): workspace is Exclude<WorkspaceSurface, 'preferences'> {
  return workspace !== 'preferences';
}

export function getDefaultWorkspaceForRole(role: UserRole): WorkspaceSurface {
  switch (role) {
    case 'owner_admin':
      return 'admin';
    case 'shift_lead':
      return 'orders';
    case 'kitchen':
      return 'production';
    case 'sales':
      return 'orders';
    default:
      return 'home';
  }
}

export function getWorkspacePriorityForRole(role: UserRole): WorkspaceSurface[] {
  switch (role) {
    case 'owner_admin':
      return ['admin', 'timeline', 'customers', 'orders', 'production', 'handoff', 'home'];
    case 'shift_lead':
      return ['timeline', 'orders', 'production', 'handoff', 'customers', 'admin', 'home'];
    case 'kitchen':
      return ['timeline', 'production', 'handoff', 'home'];
    case 'sales':
      return ['timeline', 'orders', 'customers', 'home'];
    default:
      return ['home', 'timeline', 'orders', 'customers', 'production', 'handoff', 'admin'];
  }
}

export function getVisibleWorkspacesForRole(role: UserRole) {
  return getWorkspacePriorityForRole(role).filter((workspace, index, items) => items.indexOf(workspace) === index);
}

export function canManageSettings(role: UserRole) {
  return role === 'owner_admin';
}
