import { readdir } from 'node:fs/promises';
import path from 'node:path';
import type { AppData } from '@/lib/domain/types';

export type InstanceGatewayState = {
  hasInstance: boolean;
  hasAdminUser: boolean;
  hasActiveUsers: boolean;
  onboardingIncomplete: boolean;
  demoModeActive: boolean;
  backupAvailable: boolean;
  canOpenExistingInstance: boolean;
  canRunBootstrap: boolean;
};

export async function detectBackupAvailability() {
  const backupDir = path.join(process.cwd(), 'data', 'backups');

  try {
    const entries = await readdir(backupDir, { withFileTypes: true });
    return entries.some((entry) => entry.isFile() && entry.name.endsWith('.json'));
  } catch {
    return false;
  }
}

export async function detectInstanceGatewayState(data: AppData): Promise<InstanceGatewayState> {
  const activeUsers = data.users.filter((user) => user.active);
  const hasAdminUser = activeUsers.some((user) => user.role === 'owner_admin' || user.roles?.includes('owner_admin'));
  const backupAvailable = data.instance.backupHintAvailable || await detectBackupAvailability();

  return {
    hasInstance: data.instance.initialized,
    hasAdminUser,
    hasActiveUsers: activeUsers.length > 0,
    onboardingIncomplete: data.instance.onboardingStatus !== 'completed' || !data.preferences.onboardingCompleted,
    demoModeActive: data.instance.demoModeActive,
    backupAvailable,
    canOpenExistingInstance: data.instance.initialized && activeUsers.length > 0,
    canRunBootstrap: !data.instance.initialized
      || data.instance.onboardingStatus !== 'completed'
      || !hasAdminUser
      || !data.preferences.onboardingCompleted,
  };
}

export function shouldRouteToEntryGateway(state: InstanceGatewayState, hasSessionUser: boolean) {
  if (!state.hasInstance) {
    return true;
  }

  if (!state.hasAdminUser) {
    return true;
  }

  if (!hasSessionUser) {
    return true;
  }

  return false;
}
