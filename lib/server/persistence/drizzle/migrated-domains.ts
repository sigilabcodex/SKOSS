import { asc, eq, sql } from 'drizzle-orm';
import type { AppData, Customer, User } from '@/lib/domain/types';
import { getPostgresDb } from '@/lib/server/db/client';
import {
  customersTable,
  instanceStateTable,
  sessionStateTable,
  userRolesTable,
  usersTable,
  workspacePreferencesTable,
  workspaceTable,
  type CustomerRow,
  type UserRoleRow,
  type UserRow,
} from '@/lib/server/db/schema';

const singletonRecordId = 'singleton';

export async function migratedDomainsReady() {
  const { db } = getPostgresDb();
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(workspaceTable);
  return Number(count ?? 0) > 0;
}

export async function loadMigratedDomains() {
  const { db } = getPostgresDb();
  const [workspaceRow] = await db.select().from(workspaceTable).limit(1);
  if (!workspaceRow) {
    return null;
  }

  const [preferencesRow] = await db.select().from(workspacePreferencesTable)
    .where(eq(workspacePreferencesTable.workspaceId, workspaceRow.id)).limit(1);
  const [instanceRow] = await db.select().from(instanceStateTable)
    .where(eq(instanceStateTable.id, singletonRecordId)).limit(1);
  const [sessionRow] = await db.select().from(sessionStateTable)
    .where(eq(sessionStateTable.id, singletonRecordId)).limit(1);

  const userRows: UserRow[] = await db.select().from(usersTable);
  const roleRows: UserRoleRow[] = await db.select().from(userRolesTable).orderBy(asc(userRolesTable.userId));
  const customerRows: CustomerRow[] = await db.select().from(customersTable);

  const rolesByUserId = roleRows.reduce<Record<string, User['roles']>>((acc: Record<string, User['roles']>, row: { userId: string; role: User['role'] }) => {
    if (!acc[row.userId]) {
      acc[row.userId] = [];
    }
    if (!acc[row.userId].includes(row.role)) {
      acc[row.userId].push(row.role);
    }
    return acc;
  }, {});

  const users: User[] = userRows.map((row) => ({
    id: row.id,
    displayName: row.displayName,
    username: row.username ?? undefined,
    loginIdentifier: row.loginIdentifier,
    passwordHash: row.passwordHash,
    passwordUpdatedAt: row.passwordUpdatedAt ?? undefined,
    mustChangePassword: row.mustChangePassword,
    role: row.role,
    roles: rolesByUserId[row.id] ?? [row.role],
    workspaceId: row.workspaceId,
    defaultWorkspace: row.defaultWorkspace as User['defaultWorkspace'] | undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    active: row.active,
    preferences: row.preferences ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));

  const customers: Customer[] = customerRows.map((row) => ({
    id: row.id,
    displayName: row.displayName,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    preferredContactMethod: row.preferredContactMethod ?? undefined,
    address: row.address ?? undefined,
    deliveryNote: row.deliveryNote ?? undefined,
    internalNote: row.internalNote ?? undefined,
    active: row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdByUserId: row.createdByUserId ?? undefined,
    updatedByUserId: row.updatedByUserId ?? undefined,
  }));

  return {
    workspace: {
      id: workspaceRow.id,
      name: workspaceRow.name,
      slug: workspaceRow.slug,
      timezone: workspaceRow.timezone,
      defaultProductionCutoffHour: workspaceRow.defaultProductionCutoffHour,
    },
    preferences: preferencesRow
      ? {
          locale: preferencesRow.locale as AppData['preferences']['locale'],
          preset: preferencesRow.preset as AppData['preferences']['preset'],
          operatingMode: preferencesRow.operatingMode as AppData['preferences']['operatingMode'],
          theme: preferencesRow.theme as AppData['preferences']['theme'],
          onboardingCompleted: preferencesRow.onboardingCompleted,
          completedAt: preferencesRow.completedAt ?? undefined,
          updatedAt: preferencesRow.updatedAt ?? undefined,
        }
      : null,
    instance: instanceRow
      ? {
          initialized: instanceRow.initialized,
          onboardingStatus: instanceRow.onboardingStatus as AppData['instance']['onboardingStatus'],
          demoModeActive: instanceRow.demoModeActive,
          environmentType: instanceRow.environmentType as AppData['instance']['environmentType'],
          backupHintAvailable: instanceRow.backupHintAvailable,
          lastRestoreAt: instanceRow.lastRestoreAt ?? undefined,
          onboardingProgress: instanceRow.onboardingProgress,
          operatorOnboardingByUserId: instanceRow.operatorOnboardingByUserId ?? undefined,
          moduleStates: instanceRow.moduleStates ?? undefined,
        }
      : null,
    session: sessionRow
      ? {
          currentUserId: sessionRow.currentUserId ?? undefined,
          lastLoginAt: sessionRow.lastLoginAt ?? undefined,
        }
      : null,
    users,
    customers,
  };
}

export async function saveMigratedDomains(data: AppData) {
  const { db } = getPostgresDb();

  await db.insert(workspaceTable).values({
    id: data.workspace.id,
    name: data.workspace.name,
    slug: data.workspace.slug,
    timezone: data.workspace.timezone,
    defaultProductionCutoffHour: data.workspace.defaultProductionCutoffHour,
  }).onConflictDoUpdate({
    target: workspaceTable.id,
    set: {
      name: data.workspace.name,
      slug: data.workspace.slug,
      timezone: data.workspace.timezone,
      defaultProductionCutoffHour: data.workspace.defaultProductionCutoffHour,
    },
  });

  await db.insert(workspacePreferencesTable).values({
    workspaceId: data.workspace.id,
    locale: data.preferences.locale,
    preset: data.preferences.preset,
    operatingMode: data.preferences.operatingMode,
    theme: data.preferences.theme,
    onboardingCompleted: data.preferences.onboardingCompleted,
    completedAt: data.preferences.completedAt ?? null,
    updatedAt: data.preferences.updatedAt ?? null,
  }).onConflictDoUpdate({
    target: workspacePreferencesTable.workspaceId,
    set: {
      locale: data.preferences.locale,
      preset: data.preferences.preset,
      operatingMode: data.preferences.operatingMode,
      theme: data.preferences.theme,
      onboardingCompleted: data.preferences.onboardingCompleted,
      completedAt: data.preferences.completedAt ?? null,
      updatedAt: data.preferences.updatedAt ?? null,
    },
  });

  await db.insert(instanceStateTable).values({
    id: singletonRecordId,
    initialized: data.instance.initialized,
    onboardingStatus: data.instance.onboardingStatus,
    demoModeActive: data.instance.demoModeActive,
    environmentType: data.instance.environmentType,
    backupHintAvailable: data.instance.backupHintAvailable,
    lastRestoreAt: data.instance.lastRestoreAt ?? null,
    onboardingProgress: data.instance.onboardingProgress,
    operatorOnboardingByUserId: data.instance.operatorOnboardingByUserId ?? null,
    moduleStates: data.instance.moduleStates ?? null,
  }).onConflictDoUpdate({
    target: instanceStateTable.id,
    set: {
      initialized: data.instance.initialized,
      onboardingStatus: data.instance.onboardingStatus,
      demoModeActive: data.instance.demoModeActive,
      environmentType: data.instance.environmentType,
      backupHintAvailable: data.instance.backupHintAvailable,
      lastRestoreAt: data.instance.lastRestoreAt ?? null,
      onboardingProgress: data.instance.onboardingProgress,
      operatorOnboardingByUserId: data.instance.operatorOnboardingByUserId ?? null,
      moduleStates: data.instance.moduleStates ?? null,
    },
  });

  await db.insert(sessionStateTable).values({
    id: singletonRecordId,
    currentUserId: data.session.currentUserId ?? null,
    lastLoginAt: data.session.lastLoginAt ?? null,
  }).onConflictDoUpdate({
    target: sessionStateTable.id,
    set: {
      currentUserId: data.session.currentUserId ?? null,
      lastLoginAt: data.session.lastLoginAt ?? null,
    },
  });

  await db.delete(userRolesTable);
  await db.delete(usersTable);
  if (data.users.length > 0) {
    await db.insert(usersTable).values(data.users.map((user) => ({
      id: user.id,
      displayName: user.displayName,
      username: user.username ?? null,
      loginIdentifier: user.loginIdentifier,
      passwordHash: user.passwordHash,
      passwordUpdatedAt: user.passwordUpdatedAt ?? null,
      mustChangePassword: user.mustChangePassword ?? false,
      role: user.role,
      workspaceId: user.workspaceId,
      defaultWorkspace: user.defaultWorkspace ?? null,
      email: user.email ?? null,
      phone: user.phone ?? null,
      active: user.active,
      preferences: user.preferences ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })));

    const roleRecords = data.users.flatMap((user) => {
      const roles = user.roles.length > 0 ? user.roles : [user.role];
      return roles.map((role) => ({ userId: user.id, role }));
    });

    if (roleRecords.length > 0) {
      await db.insert(userRolesTable).values(roleRecords);
    }
  }

  await db.delete(customersTable);
  if (data.customers.length > 0) {
    await db.insert(customersTable).values(data.customers.map((customer) => ({
      id: customer.id,
      displayName: customer.displayName,
      phone: customer.phone ?? null,
      email: customer.email ?? null,
      preferredContactMethod: customer.preferredContactMethod ?? null,
      address: customer.address ?? null,
      deliveryNote: customer.deliveryNote ?? null,
      internalNote: customer.internalNote ?? null,
      active: customer.active,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      createdByUserId: customer.createdByUserId ?? null,
      updatedByUserId: customer.updatedByUserId ?? null,
    })));
  }
}
