import { boolean, integer, jsonb, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';
import type {
  CustomerContactMethod,
  InstanceState,
  SessionState,
  UserPreferences,
  UserRole,
  Workspace,
  WorkspacePreferences,
} from '@/lib/domain/types';

export const workspaceTable = pgTable('workspace', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  timezone: text('timezone').notNull(),
  defaultProductionCutoffHour: integer('default_production_cutoff_hour').notNull(),
});

export const workspacePreferencesTable = pgTable('workspace_preferences', {
  workspaceId: text('workspace_id').primaryKey().references(() => workspaceTable.id, { onDelete: 'cascade' }),
  locale: text('locale').notNull(),
  preset: text('preset').notNull(),
  operatingMode: text('operating_mode').notNull(),
  theme: text('theme').notNull(),
  onboardingCompleted: boolean('onboarding_completed').notNull(),
  completedAt: text('completed_at'),
  updatedAt: text('updated_at'),
});

export const instanceStateTable = pgTable('instance_state', {
  id: text('id').primaryKey(),
  initialized: boolean('initialized').notNull(),
  onboardingStatus: text('onboarding_status').notNull(),
  demoModeActive: boolean('demo_mode_active').notNull(),
  environmentType: text('environment_type').notNull(),
  backupHintAvailable: boolean('backup_hint_available').notNull(),
  lastRestoreAt: text('last_restore_at'),
  onboardingProgress: jsonb('onboarding_progress').$type<InstanceState['onboardingProgress']>().notNull(),
  operatorOnboardingByUserId: jsonb('operator_onboarding_by_user_id').$type<Record<string, boolean> | null>(),
  moduleStates: jsonb('module_states').$type<Record<string, boolean> | null>(),
});

export const sessionStateTable = pgTable('session_state', {
  id: text('id').primaryKey(),
  currentUserId: text('current_user_id'),
  lastLoginAt: text('last_login_at'),
});

export const usersTable = pgTable('users', {
  id: text('id').primaryKey(),
  displayName: text('display_name').notNull(),
  username: text('username'),
  loginIdentifier: text('login_identifier').notNull(),
  passwordHash: text('password_hash').notNull(),
  passwordUpdatedAt: text('password_updated_at'),
  mustChangePassword: boolean('must_change_password').notNull(),
  role: text('role').$type<UserRole>().notNull(),
  workspaceId: text('workspace_id').notNull().references(() => workspaceTable.id, { onDelete: 'cascade' }),
  defaultWorkspace: text('default_workspace'),
  email: text('email'),
  phone: text('phone'),
  active: boolean('active').notNull(),
  preferences: jsonb('preferences').$type<UserPreferences | null>(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const userRolesTable = pgTable('user_roles', {
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  role: text('role').$type<UserRole>().notNull(),
}, (table) => ({
  pk: primaryKey(table.userId, table.role),
}));

export const customersTable = pgTable('customers', {
  id: text('id').primaryKey(),
  displayName: text('display_name').notNull(),
  phone: text('phone'),
  email: text('email'),
  preferredContactMethod: text('preferred_contact_method').$type<CustomerContactMethod>(),
  address: text('address'),
  deliveryNote: text('delivery_note'),
  internalNote: text('internal_note'),
  active: boolean('active').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdByUserId: text('created_by_user_id'),
  updatedByUserId: text('updated_by_user_id'),
});

export type WorkspaceRow = typeof workspaceTable.$inferSelect;
export type WorkspacePreferencesRow = typeof workspacePreferencesTable.$inferSelect;
export type InstanceStateRow = typeof instanceStateTable.$inferSelect;
export type SessionStateRow = typeof sessionStateTable.$inferSelect;
export type UserRow = typeof usersTable.$inferSelect;
export type UserRoleRow = typeof userRolesTable.$inferSelect;
export type CustomerRow = typeof customersTable.$inferSelect;

export type WorkspaceInsert = typeof workspaceTable.$inferInsert;
export type WorkspacePreferencesInsert = typeof workspacePreferencesTable.$inferInsert;
export type InstanceStateInsert = typeof instanceStateTable.$inferInsert;
export type SessionStateInsert = typeof sessionStateTable.$inferInsert;
export type UserInsert = typeof usersTable.$inferInsert;
export type UserRoleInsert = typeof userRolesTable.$inferInsert;
export type CustomerInsert = typeof customersTable.$inferInsert;

export type MigratedSchemaShapes = {
  workspace: Workspace;
  preferences: WorkspacePreferences;
  instance: InstanceState;
  session: SessionState;
};
