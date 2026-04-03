'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  buildCustomerRecord,
  buildRawMaterialRecord,
  buildRecipeRecord,
  buildOrderRecord,
  buildRecurringTemplateRecord,
  buildShiftLog,
  buildShiftNote,
  buildSupplierPriceEntryRecord,
  buildSupplierRecord,
  buildUserRecord,
  buildWipEntry,
  getLineStatus,
  normalizeCustomerForm,
  normalizeRawMaterialForm,
  normalizeRecipeForm,
  normalizeOrderForm,
  normalizeRecurringTemplateForm,
  normalizeSupplierForm,
  normalizeSupplierPriceEntryForm,
  normalizeUserForm,
  validateCustomerForm,
  validateRawMaterialForm,
  validateRecipeForm,
  validateOrderForm,
  validateRecurringTemplateForm,
  validateShiftLog,
  validateShiftNote,
  validateSupplierForm,
  validateSupplierPriceEntryForm,
  validateUserForm,
  validateWipEntry,
} from '@/lib/server/demo-data';
import { getCurrentUserContext, loggedOutSessionValue, sessionUserCookieName } from '@/lib/server/auth';
import { readSeedStore, readStore, reseedRuntimeStore, writeStore } from '@/lib/server/store';
import { appendActivity } from '@/lib/server/activity';
import { hashPassword, verifyPassword } from '@/lib/server/passwords';
import {
  buildCustomerImportPayload,
  buildRawMaterialImportPayload,
  buildSupplierImportPayload,
  parseCsvContent,
  parseCsvMapping,
  type CsvEntity,
} from '@/lib/domain/csv-import';
import { isSupportedLocale, isSupportedPreset, localeCookieName, supportedLocales, presetCookieName, supportedPresets } from '@/lib/i18n/config';
import { themeCookieName } from '@/lib/theme';
import { getDefaultWorkspaceForRole, isPrimaryWorkspaceSurface } from '@/lib/workspaces';
import { isNonProductionMode } from '@/lib/server/runtime-mode';
import type { AppData } from '@/lib/domain/types';
import { detectInstanceGatewayState, shouldRouteToEntryGateway } from '@/lib/server/instance-entry';

function sortOrders(left: { productionDate: string; updatedAt: string }, right: { productionDate: string; updatedAt: string }) {
  return left.productionDate === right.productionDate
    ? right.updatedAt.localeCompare(left.updatedAt)
    : left.productionDate.localeCompare(right.productionDate);
}

const supportedThemes = ['light', 'dark', 'system'] as const;
const supportedOperatingModes = ['pickup', 'delivery', 'mixed'] as const;
const supportedPreferenceWorkspaces = ['timeline', 'orders', 'customers', 'production', 'handoff', 'setup'] as const;
const sessionMaxAgeSeconds = 60 * 60 * 24 * 14;

function sortUsers(left: { displayName: string }, right: { displayName: string }) {
  return left.displayName.localeCompare(right.displayName);
}

async function getActorUserId(data: Awaited<ReturnType<typeof readStore>>) {
  const { currentUser } = await getCurrentUserContext(data);
  return currentUser?.id;
}

function revalidateAllWorkspaces() {
  revalidatePath('/');
  revalidatePath('/timeline');
  revalidatePath('/orders');
  revalidatePath('/customers');
  revalidatePath('/production');
  revalidatePath('/handoff');
  revalidatePath('/preferences');
  revalidatePath('/setup');
  revalidatePath('/login');
}

function resolveRedirectTo(formData: FormData, fallback: string) {
  const redirectTo = String(formData.get('redirectTo') ?? '').trim();
  return redirectTo.startsWith('/') ? redirectTo : fallback;
}

function shouldAllowEmpty(formData: FormData) {
  return String(formData.get('allowEmpty') ?? '') === '1';
}

function quoteLabel(label: string) {
  return `"${label}"`;
}

function slugifyUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 40);
}

function nextBootstrapStep(current: number, direction: 'next' | 'back' | 'stay') {
  if (direction === 'back') {
    return Math.max(1, current - 1);
  }

  if (direction === 'stay') {
    return current;
  }

  return Math.min(8, current + 1);
}


export async function resetDemoWorkspaceAction() {
  if (!isNonProductionMode()) {
    redirect('/setup?error=' + encodeURIComponent('Demo reset is disabled in production mode.'));
  }

  await reseedRuntimeStore();
  revalidateAllWorkspaces();
  redirect('/setup?saved=demo-reset');
}

function isRestorableBackupShape(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<AppData>;
  return Boolean(
    candidate.workspace
    && candidate.preferences
    && Array.isArray(candidate.users)
    && Array.isArray(candidate.orders),
  );
}

export async function launchDemoModeAction() {
  if (!isNonProductionMode()) {
    redirect('/entry?error=' + encodeURIComponent('Demo launch is disabled in production mode.'));
  }

  const data = await readSeedStore();
  data.instance.demoModeActive = true;
  data.instance.initialized = false;
  data.instance.onboardingStatus = 'not_started';
  data.preferences.onboardingCompleted = false;
  data.instance.environmentType = 'demo';
  await writeStore(data);
  revalidateAllWorkspaces();
  redirect('/?demo=1');
}

export async function restoreInstanceFromBackupAction(formData: FormData) {
  const uploaded = formData.get('backupFile');
  if (!(uploaded instanceof File) || uploaded.size <= 0) {
    redirect('/entry?error=' + encodeURIComponent('Select a backup file first.'));
  }

  const rawText = await uploaded.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    redirect('/entry?error=' + encodeURIComponent('Backup file must be valid JSON.'));
  }

  if (!isRestorableBackupShape(parsed)) {
    redirect('/entry?error=' + encodeURIComponent('Backup structure is not valid for this SKOSS version.'));
  }

  const restoredData = parsed;
  restoredData.instance = {
    ...(restoredData.instance ?? (await readSeedStore()).instance),
    initialized: true,
    backupHintAvailable: true,
    lastRestoreAt: new Date().toISOString(),
  };
  await writeStore(restoredData);
  revalidateAllWorkspaces();
  redirect('/entry?saved=restored');
}

export async function saveOnboardingPreferencesAction(formData: FormData) {
  const data = await readStore();
  const businessName = String(formData.get('businessName') ?? '').trim();
  const locale = String(formData.get('locale') ?? '');
  const preset = String(formData.get('preset') ?? '');
  const operatingMode = String(formData.get('operatingMode') ?? '');
  const theme = String(formData.get('theme') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '/');

  if (!businessName) {
    redirect(`${redirectTo.startsWith('/setup') ? '/setup' : '/'}?error=${encodeURIComponent('Add a business name to continue.')}`);
  }

  if (!isSupportedLocale(locale) || !supportedLocales.includes(locale)) {
    redirect(`${redirectTo.startsWith('/setup') ? '/setup' : '/'}?error=${encodeURIComponent('Choose a supported language.')}`);
  }

  if (!isSupportedPreset(preset) || !supportedPresets.includes(preset)) {
    redirect(`${redirectTo.startsWith('/setup') ? '/setup' : '/'}?error=${encodeURIComponent('Choose a supported preset.')}`);
  }

  if (!supportedOperatingModes.includes(operatingMode as (typeof supportedOperatingModes)[number])) {
    redirect(`${redirectTo.startsWith('/setup') ? '/setup' : '/'}?error=${encodeURIComponent('Choose how you usually operate.')}`);
  }

  if (!supportedThemes.includes(theme as (typeof supportedThemes)[number])) {
    redirect(`${redirectTo.startsWith('/setup') ? '/setup' : '/'}?error=${encodeURIComponent('Choose an appearance theme.')}`);
  }

  const now = new Date().toISOString();
  data.workspace.name = businessName;
  data.preferences = {
    locale,
    preset,
    operatingMode: operatingMode as (typeof supportedOperatingModes)[number],
    theme: theme as (typeof supportedThemes)[number],
    onboardingCompleted: true,
    completedAt: data.preferences.completedAt ?? now,
    updatedAt: now,
  };
  data.instance = {
    ...data.instance,
    initialized: true,
    onboardingStatus: 'completed',
    onboardingProgress: {
      ...data.instance.onboardingProgress,
      workspaceBasics: true,
      timezone: true,
    },
  };

  await writeStore(data);

  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, locale, { path: '/', maxAge: 31536000, sameSite: 'lax' });
  cookieStore.set(presetCookieName, preset, { path: '/', maxAge: 31536000, sameSite: 'lax' });
  cookieStore.set(themeCookieName, theme, { path: '/', maxAge: 31536000, sameSite: 'lax' });

  revalidatePath('/');
  revalidatePath('/setup');
  revalidatePath('/timeline');
  revalidatePath('/orders');
  revalidatePath('/production');
  revalidatePath('/handoff');

  if (redirectTo.startsWith('/setup')) {
    redirect('/setup?saved=preferences');
  }

  redirect('/?welcome=1');
}

export async function saveBootstrapStepAction(formData: FormData) {
  const data = await readStore();
  const step = Number(formData.get('step') ?? 1);
  const intent = String(formData.get('intent') ?? 'next') as 'next' | 'back' | 'stay' | 'launch' | 'skip';
  const isRequiredStep = step === 1 || step === 2;

  data.instance.initialized = true;
  data.instance.onboardingStatus = 'in_progress';

  if (intent === 'skip' && isRequiredStep) {
    redirect(`/bootstrap?step=${step}&error=${encodeURIComponent('This step is required before launch.')}`);
  }

  if (step === 1) {
    const displayName = String(formData.get('adminDisplayName') ?? '').trim();
    const username = slugifyUsername(String(formData.get('adminUsername') ?? ''));
    const email = String(formData.get('adminEmail') ?? '').trim();
    const phone = String(formData.get('adminPhone') ?? '').trim();
    const password = String(formData.get('adminPassword') ?? '').trim();

    if (!displayName || !username || !password) {
      redirect('/bootstrap?step=1&error=' + encodeURIComponent('Add full name, username, and password.'));
    }

    if (username.length < 3) {
      redirect('/bootstrap?step=1&error=' + encodeURIComponent('Username must be at least 3 characters.'));
    }

    const now = new Date().toISOString();
    const existingAdmin = data.users.find((user) => user.role === 'admin' || user.roles?.includes('admin'));
    const duplicate = data.users.find(
      (user) => user.id !== existingAdmin?.id && user.loginIdentifier.toLowerCase() === username,
    );
    if (duplicate) {
      redirect('/bootstrap?step=1&error=' + encodeURIComponent('Username is already in use.'));
    }

    if (existingAdmin) {
      existingAdmin.displayName = displayName;
      existingAdmin.loginIdentifier = username;
      existingAdmin.username = username;
      existingAdmin.passwordHash = hashPassword(password);
      existingAdmin.passwordUpdatedAt = now;
      existingAdmin.active = true;
      existingAdmin.email = email || undefined;
      existingAdmin.phone = phone || undefined;
      existingAdmin.role = 'admin';
      existingAdmin.roles = existingAdmin.roles?.includes('admin')
        ? existingAdmin.roles
        : ['admin', ...(existingAdmin.roles ?? []).filter((role) => role !== 'admin')];
      existingAdmin.updatedAt = now;
    } else {
      data.users.push({
        id: `user-${crypto.randomUUID()}`,
        displayName,
        loginIdentifier: username,
        username,
        passwordHash: hashPassword(password),
        passwordUpdatedAt: now,
        mustChangePassword: false,
        role: 'admin',
        roles: ['admin'],
        email: email || undefined,
        phone: phone || undefined,
        workspaceId: data.workspace.id,
        defaultWorkspace: 'setup',
        active: true,
        preferences: {
          defaultWorkspace: 'setup',
        },
        createdAt: now,
        updatedAt: now,
      });
    }

    data.instance.onboardingProgress.adminAccount = true;
    data.instance.onboardingProgress.users = true;
    data.instance.onboardingProgress.roles = true;
  }

  if (step === 2) {
    const businessName = String(formData.get('businessName') ?? '').trim();
    const timezone = String(formData.get('timezone') ?? '').trim();
    const locale = String(formData.get('locale') ?? '').trim();
    const preset = String(formData.get('preset') ?? '').trim();
    const operatingMode = String(formData.get('operatingMode') ?? '').trim();
    const theme = String(formData.get('theme') ?? '').trim();

    if (!businessName) {
      redirect('/bootstrap?step=2&error=' + encodeURIComponent('Business name is required.'));
    }

    data.workspace.name = businessName;
    data.workspace.timezone = timezone || data.workspace.timezone;
    data.preferences.locale = isSupportedLocale(locale) ? locale : data.preferences.locale;
    data.preferences.preset = isSupportedPreset(preset) ? preset : data.preferences.preset;
    if (supportedOperatingModes.includes(operatingMode as (typeof supportedOperatingModes)[number])) {
      data.preferences.operatingMode = operatingMode as (typeof supportedOperatingModes)[number];
    }
    if (supportedThemes.includes(theme as (typeof supportedThemes)[number])) {
      data.preferences.theme = theme as (typeof supportedThemes)[number];
    }
    data.instance.onboardingProgress.workspaceBasics = true;
    data.instance.onboardingProgress.timezone = Boolean(data.workspace.timezone);
  }

  if (step === 4) {
    const now = new Date().toISOString();
    for (const row of Array.from({ length: 12 }, (_, index) => index + 1)) {
      const displayName = String(formData.get(`teamDisplayName${row}`) ?? '').trim();
      const username = slugifyUsername(String(formData.get(`teamUsername${row}`) ?? ''));
      const selectedRoles = formData.getAll(`teamRoles${row}`).map((value) => String(value));
      const defaultWorkspace = String(formData.get(`teamWorkspace${row}`) ?? 'orders');
      const enabled = formData.get(`teamEnabled${row}`) !== null;
      const roleList = selectedRoles
        .filter((role) => ['admin', 'manager', 'production', 'frontdesk', 'delivery'].includes(role))
        .filter((role, index, list) => list.indexOf(role) === index) as Array<'admin' | 'manager' | 'production' | 'frontdesk' | 'delivery'>;
      const primaryRole = roleList[0] ?? 'frontdesk';

      if (!displayName || !username) {
        continue;
      }

      const existing = data.users.find((user) => user.loginIdentifier.toLowerCase() === username);
      if (existing) {
        existing.displayName = displayName;
        existing.role = primaryRole;
        existing.roles = roleList.length > 0 ? roleList : [primaryRole];
        existing.defaultWorkspace = isPrimaryWorkspaceSurface(defaultWorkspace as 'home' | 'timeline' | 'orders' | 'customers' | 'production' | 'handoff' | 'preferences' | 'setup')
          ? (defaultWorkspace as 'home' | 'timeline' | 'orders' | 'customers' | 'production' | 'handoff' | 'preferences' | 'setup')
          : existing.defaultWorkspace;
        existing.active = enabled;
        existing.updatedAt = now;
      } else {
        data.users.push({
          id: `user-${crypto.randomUUID()}`,
          displayName,
          loginIdentifier: username,
          passwordHash: hashPassword('skoss-demo'),
          passwordUpdatedAt: now,
          mustChangePassword: true,
          role: primaryRole,
          roles: roleList.length > 0 ? roleList : [primaryRole],
          workspaceId: data.workspace.id,
          defaultWorkspace: isPrimaryWorkspaceSurface(defaultWorkspace as 'home' | 'timeline' | 'orders' | 'customers' | 'production' | 'handoff' | 'preferences' | 'setup')
            ? (defaultWorkspace as 'home' | 'timeline' | 'orders' | 'customers' | 'production' | 'handoff' | 'preferences' | 'setup')
            : 'orders',
          active: enabled,
          username,
          preferences: {
            defaultWorkspace: isPrimaryWorkspaceSurface(defaultWorkspace as 'home' | 'timeline' | 'orders' | 'customers' | 'production' | 'handoff' | 'preferences' | 'setup')
              ? (defaultWorkspace as 'home' | 'timeline' | 'orders' | 'customers' | 'production' | 'handoff' | 'preferences' | 'setup')
              : 'orders',
          },
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    data.instance.onboardingProgress.users = true;
    data.instance.onboardingProgress.roles = true;
  }

  if (step === 5) {
    data.instance.onboardingProgress.shifts = true;
  }

  if (step === 6) {
    const productName = String(formData.get('starterProductName') ?? '').trim();
    const productUnit = String(formData.get('starterProductUnit') ?? '').trim() || 'pieces';
    if (productName) {
      const existing = data.products.find((product) => product.name.trim().toLowerCase() === productName.toLowerCase());
      if (!existing) {
        data.products.push({
          id: `product-${crypto.randomUUID()}`,
          name: productName,
          defaultUnit: productUnit,
          active: true,
          variants: [
            {
              id: `variant-${crypto.randomUUID()}`,
              name: 'Default',
              defaultUnit: productUnit,
              active: true,
            },
          ],
        });
      }
    }
  }

  if (step === 7) {
    data.instance.onboardingProgress.optionalImports = true;
  }

  if (intent === 'launch') {
    if (!data.instance.onboardingProgress.adminAccount) {
      redirect('/bootstrap?step=2&error=' + encodeURIComponent('Create an admin before launch.'));
    }
    if (!data.instance.onboardingProgress.workspaceBasics) {
      redirect('/bootstrap?step=2&error=' + encodeURIComponent('Save workspace basics before launch.'));
    }

    data.preferences.onboardingCompleted = true;
    data.preferences.completedAt = data.preferences.completedAt ?? new Date().toISOString();
    data.preferences.updatedAt = new Date().toISOString();
    data.instance.onboardingStatus = 'completed';
    data.instance.demoModeActive = false;
    data.session.currentUserId = undefined;
    await writeStore(data);
    revalidateAllWorkspaces();
    redirect('/login?redirectTo=/');
  }

  await writeStore(data);
  revalidateAllWorkspaces();
  if (intent === 'skip') {
    redirect(`/bootstrap?step=${Math.min(8, step + 1)}&saved=progress`);
  }

  const nextStep = nextBootstrapStep(step, intent === 'back' ? 'back' : intent === 'stay' ? 'stay' : 'next');
  redirect(`/bootstrap?step=${nextStep}&saved=progress`);
}


export async function saveUserPreferencesAction(formData: FormData) {
  const data = await readStore();
  const { currentUser } = await getCurrentUserContext(data);

  if (!currentUser) {
    redirect('/login?error=missing-user');
  }

  const locale = String(formData.get('locale') ?? '');
  const theme = String(formData.get('theme') ?? '');
  const defaultWorkspaceValue = String(formData.get('defaultWorkspace') ?? '');

  if (!isSupportedLocale(locale) || !supportedLocales.includes(locale)) {
    redirect('/preferences?error=' + encodeURIComponent('Choose a supported language.'));
  }

  if (!supportedThemes.includes(theme as (typeof supportedThemes)[number])) {
    redirect('/preferences?error=' + encodeURIComponent('Choose an appearance theme.'));
  }

  const requestedWorkspace = defaultWorkspaceValue as typeof supportedPreferenceWorkspaces[number];
  const currentWorkspace = currentUser.preferences?.defaultWorkspace ?? currentUser.defaultWorkspace;
  const fallbackWorkspace = currentWorkspace && isPrimaryWorkspaceSurface(currentWorkspace)
    ? currentWorkspace
    : getDefaultWorkspaceForRole(currentUser.role);

  if (defaultWorkspaceValue && !supportedPreferenceWorkspaces.includes(requestedWorkspace)) {
    redirect('/preferences?error=' + encodeURIComponent('Choose a supported landing workspace.'));
  }

  const defaultWorkspace = defaultWorkspaceValue ? requestedWorkspace : fallbackWorkspace;
  const nextUpdatedAt = new Date().toISOString();

  data.users = data.users.map((user) => user.id === currentUser.id
    ? {
        ...user,
        defaultWorkspace,
        preferences: {
          ...user.preferences,
          locale,
          theme: theme as (typeof supportedThemes)[number],
          defaultWorkspace,
        },
        updatedAt: nextUpdatedAt,
      }
    : user);

  await writeStore(data);

  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, locale, { path: '/', maxAge: 31536000, sameSite: 'lax' });
  cookieStore.set(themeCookieName, theme, { path: '/', maxAge: 31536000, sameSite: 'lax' });

  revalidateAllWorkspaces();
  redirect('/preferences?saved=preferences');
}

export async function loginAction(formData: FormData) {
  const data = await readStore();
  const requestedIdentifier = String(formData.get('loginIdentifier') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '/');
  const user = data.users.find((entry) => entry.active && entry.loginIdentifier.trim().toLowerCase() === requestedIdentifier);

  if (!user) {
    redirect(`/login?error=${encodeURIComponent('Sign-in details are not valid.')}`);
  }

  if (!verifyPassword(password, user.passwordHash)) {
    redirect(`/login?error=${encodeURIComponent('Sign-in details are not valid.')}`);
  }

  const now = new Date().toISOString();
  data.session.currentUserId = user.id;
  data.session.lastLoginAt = now;
  await writeStore(data);

  const cookieStore = await cookies();
  cookieStore.set(sessionUserCookieName, user.id, { path: '/', maxAge: sessionMaxAgeSeconds, sameSite: 'lax' });
  if (user.preferences?.locale) {
    cookieStore.set(localeCookieName, user.preferences.locale, { path: '/', maxAge: 31536000, sameSite: 'lax' });
  }
  if (user.preferences?.theme) {
    cookieStore.set(themeCookieName, user.preferences.theme, { path: '/', maxAge: 31536000, sameSite: 'lax' });
  }

  const gatewayState = await detectInstanceGatewayState(data);
  if (shouldRouteToEntryGateway(gatewayState, true)) {
    revalidateAllWorkspaces();
    redirect('/entry');
  }

  if (gatewayState.onboardingIncomplete && (user.roles?.includes('admin') || user.roles?.includes('manager') || user.role === 'admin' || user.role === 'manager')) {
    revalidateAllWorkspaces();
    redirect('/bootstrap?step=1');
  }

  revalidateAllWorkspaces();
  redirect(redirectTo.startsWith('/') ? redirectTo : '/');
}

export async function logoutAction() {
  const data = await readStore();
  data.session.currentUserId = undefined;
  await writeStore(data);

  const cookieStore = await cookies();
  cookieStore.set(sessionUserCookieName, loggedOutSessionValue, { path: '/', maxAge: sessionMaxAgeSeconds, sameSite: 'lax' });
  revalidateAllWorkspaces();
  redirect('/login');
}

export async function createUserAction(formData: FormData) {
  const data = await readStore();
  const actorUserId = await getActorUserId(data);
  const redirectTo = resolveRedirectTo(formData, '/setup');
  const allowEmpty = shouldAllowEmpty(formData);
  const values = normalizeUserForm(formData);
  if (allowEmpty && !values.displayName.trim() && !values.loginIdentifier.trim()) {
    redirect(redirectTo);
  }
  const error = validateUserForm(values, data);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error)}`);
  }

  const user = buildUserRecord(values, data);
  user.passwordHash = hashPassword(values.password?.trim() || 'skoss-demo');
  user.passwordUpdatedAt = new Date().toISOString();
  user.mustChangePassword = !values.password?.trim();
  data.users = [...data.users, user].sort(sortUsers);
  if (user.roles.includes('admin') || user.role === 'admin') {
    data.instance = {
      ...data.instance,
      initialized: true,
      onboardingProgress: {
        ...data.instance.onboardingProgress,
        adminAccount: true,
        roles: true,
        users: true,
      },
    };
  }
  appendActivity(data, {
    entityType: 'user',
    entityId: user.id,
    action: 'created',
    userId: actorUserId,
    summary: `User ${quoteLabel(user.displayName)} created.`,
  });
  await writeStore(data);
  revalidateAllWorkspaces();
  redirect(`${redirectTo}?saved=user`);
}

export async function updateUserAction(userId: string, formData: FormData) {
  const data = await readStore();
  const existing = data.users.find((entry) => entry.id === userId);

  if (!existing) {
    redirect('/setup?error=missing-user');
  }

  const values = normalizeUserForm(formData);
  const error = validateUserForm(values, data, userId);

  if (error) {
    redirect(`/setup?user=${userId}&error=${encodeURIComponent(error)}`);
  }

  const user = buildUserRecord(values, data, existing);
  if (values.resetPassword || values.password?.trim()) {
    user.passwordHash = hashPassword(values.password?.trim() || 'skoss-demo');
    user.passwordUpdatedAt = new Date().toISOString();
    user.mustChangePassword = !values.password?.trim();
  }
  data.users = data.users.map((entry) => (entry.id === userId ? user : entry)).sort(sortUsers);
  appendActivity(data, {
    entityType: 'user',
    entityId: user.id,
    action: existing.active !== user.active ? 'status_changed' : 'updated',
    userId: data.session.currentUserId,
    summary: existing.active !== user.active
      ? `User ${quoteLabel(user.displayName)} marked as ${user.active ? 'active' : 'inactive'}.`
      : `User ${quoteLabel(user.displayName)} updated.`,
  });

  if (!user.active && data.session.currentUserId === userId) {
    data.session.currentUserId = data.users.find((entry) => entry.active && entry.id !== userId)?.id;
  }

  await writeStore(data);
  revalidateAllWorkspaces();
  redirect('/setup?saved=user');
}

export async function createCustomerAction(formData: FormData) {
  const data = await readStore();
  const redirectTo = resolveRedirectTo(formData, '/customers');
  const allowEmpty = shouldAllowEmpty(formData);
  const values = normalizeCustomerForm(formData);
  if (allowEmpty && !values.displayName.trim()) {
    redirect(redirectTo);
  }
  const error = validateCustomerForm(values);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const customer = buildCustomerRecord(values, actorUserId);
  data.customers = [...data.customers, customer].sort((left, right) => left.displayName.localeCompare(right.displayName));
  appendActivity(data, {
    entityType: 'customer',
    entityId: customer.id,
    action: 'created',
    userId: actorUserId,
    summary: `Customer ${quoteLabel(customer.displayName)} created.`,
  });
  await writeStore(data);
  revalidateAllWorkspaces();
  if (redirectTo.startsWith('/customers')) {
    redirect(`/customers?customer=${customer.id}&saved=customer`);
  }

  redirect(`${redirectTo}?saved=customer`);
}

export async function updateCustomerAction(customerId: string, formData: FormData) {
  const data = await readStore();
  const existing = data.customers.find((entry) => entry.id === customerId);

  if (!existing) {
    redirect('/customers?error=missing-customer');
  }

  const values = normalizeCustomerForm(formData);
  const error = validateCustomerForm(values);

  if (error) {
    redirect(`/customers?customer=${customerId}&error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const customer = buildCustomerRecord(values, actorUserId, existing);
  data.customers = data.customers.map((entry) => (entry.id === customerId ? customer : entry))
    .sort((left, right) => left.displayName.localeCompare(right.displayName));
  appendActivity(data, {
    entityType: 'customer',
    entityId: customer.id,
    action: existing.active !== customer.active ? 'status_changed' : 'updated',
    userId: actorUserId,
    summary: existing.active !== customer.active
      ? `Customer ${quoteLabel(customer.displayName)} marked as ${customer.active ? 'active' : 'inactive'}.`
      : `Customer ${quoteLabel(customer.displayName)} updated.`,
  });
  await writeStore(data);
  revalidateAllWorkspaces();
  redirect(`/customers?customer=${customer.id}&saved=customer`);
}

export async function createOrderAction(formData: FormData) {
  const data = await readStore();
  const values = normalizeOrderForm(formData);
  const error = validateOrderForm(values);

  if (error) {
    redirect(`/orders/new?error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const order = buildOrderRecord(data, values, actorUserId);
  data.orders = [...data.orders, order].sort(sortOrders);
  appendActivity(data, {
    entityType: 'order',
    entityId: order.id,
    action: 'created',
    userId: actorUserId,
    summary: `Order ${quoteLabel(order.customerLabel)} created for ${order.productionDate}.`,
  });
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/timeline');
  revalidatePath('/orders');
  revalidatePath('/customers');
  revalidatePath('/production');
  revalidatePath('/handoff');
  redirect(`/orders/${order.id}?saved=1`);
}

export async function updateOrderAction(orderId: string, formData: FormData) {
  const data = await readStore();
  const existing = data.orders.find((entry) => entry.id === orderId);
  if (!existing) {
    redirect('/orders?error=missing-order');
  }

  const values = normalizeOrderForm(formData);
  const error = validateOrderForm(values);

  if (error) {
    redirect(`/orders/${orderId}?error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const updated = buildOrderRecord(data, values, actorUserId, existing);
  data.orders = data.orders.map((entry) => (entry.id === orderId ? updated : entry)).sort(sortOrders);
  appendActivity(data, {
    entityType: 'order',
    entityId: updated.id,
    action: existing.status !== updated.status ? 'status_changed' : 'updated',
    userId: actorUserId,
    summary: existing.status !== updated.status
      ? `Order ${quoteLabel(updated.customerLabel)} changed from ${existing.status} to ${updated.status}.`
      : `Order ${quoteLabel(updated.customerLabel)} updated.`,
  });
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/customers');
  revalidatePath('/production');
  revalidatePath('/handoff');
  redirect(`/orders/${orderId}?saved=1`);
}

export async function createRecurringTemplateAction(formData: FormData) {
  const data = await readStore();
  const values = normalizeRecurringTemplateForm(formData);
  const error = validateRecurringTemplateForm(values);

  if (error) {
    redirect(`/orders/templates/new?error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const template = buildRecurringTemplateRecord(values, actorUserId);
  data.recurringTemplates = [...data.recurringTemplates, template].sort((left, right) =>
    left.nextOccurrenceDate === right.nextOccurrenceDate
      ? left.customerLabel.localeCompare(right.customerLabel)
      : left.nextOccurrenceDate.localeCompare(right.nextOccurrenceDate),
  );
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/orders');
  revalidatePath('/orders/templates/new');
  revalidatePath('/production');
  redirect('/orders?saved=template');
}

export async function updateOrderLineProgressAction(orderId: string, lineId: string, formData: FormData) {
  const data = await readStore();
  const order = data.orders.find((entry) => entry.id === orderId);

  if (!order) {
    redirect('/orders?error=missing-order');
  }

  const line = order.lines.find((entry) => entry.id === lineId);
  if (!line) {
    redirect(`/orders/${orderId}?error=missing-line`);
  }

  const actorUserId = await getActorUserId(data);
  const requestedCompletedQuantity = Number(formData.get('completedQuantity') ?? line.completedQuantity ?? 0);
  const completedQuantity = Math.max(0, Math.min(line.quantity, requestedCompletedQuantity));
  line.completedQuantity = completedQuantity;
  line.lineStatus = getLineStatus({
    quantity: line.quantity,
    completedQuantity,
    lineStatus: line.lineStatus,
  });
  order.updatedAt = new Date().toISOString();
  order.updatedByUserId = actorUserId ?? order.updatedByUserId;

  const activeLines = order.lines.filter((entry) => entry.lineType !== 'note_item' && entry.lineStatus !== 'cancelled');
  const allDone = activeLines.length > 0 && activeLines.every((entry) => entry.lineStatus === 'done');
  const anyStarted = activeLines.some((entry) => entry.completedQuantity > 0);
  if (allDone) {
    order.status = 'completed';
  } else if (order.status === 'completed') {
    order.status = anyStarted ? 'changed' : 'active';
  }
  appendActivity(data, {
    entityType: 'order',
    entityId: order.id,
    action: line.lineStatus === 'done' && order.status === 'completed' ? 'status_changed' : 'updated',
    userId: actorUserId,
    summary: line.lineStatus === 'done' && order.status === 'completed'
      ? `Order ${quoteLabel(order.customerLabel)} marked as completed.`
      : `Order ${quoteLabel(order.customerLabel)} progress updated.`,
  });

  data.orders = [...data.orders].sort(sortOrders);
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/customers');
  revalidatePath('/production');
  revalidatePath('/handoff');
  redirect(`/orders/${orderId}?saved=progress`);
}

export async function addWipEntryAction(formData: FormData) {
  const data = await readStore();
  const actorUserId = await getActorUserId(data);
  const entry = buildWipEntry(formData, actorUserId);
  const error = validateWipEntry(entry);

  if (error) {
    redirect(`/handoff?error=${encodeURIComponent(error)}`);
  }

  data.wipEntries = [entry, ...data.wipEntries].sort(sortOrders);
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/production');
  revalidatePath('/handoff');
  redirect('/handoff?saved=wip');
}

export async function createSupplierAction(formData: FormData) {
  const data = await readStore();
  const redirectTo = resolveRedirectTo(formData, '/setup');
  const allowEmpty = shouldAllowEmpty(formData);
  const values = normalizeSupplierForm(formData);
  if (allowEmpty && !values.name.trim()) {
    redirect(redirectTo);
  }
  const error = validateSupplierForm(values);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const supplier = buildSupplierRecord(values, actorUserId);
  data.suppliers = [...data.suppliers, supplier].sort((left, right) => left.name.localeCompare(right.name));
  appendActivity(data, {
    entityType: 'supplier',
    entityId: supplier.id,
    action: 'created',
    userId: actorUserId,
    summary: `Supplier ${quoteLabel(supplier.name)} created.`,
  });
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/setup');
  redirect(`${redirectTo}?saved=supplier`);
}

export async function updateSupplierAction(supplierId: string, formData: FormData) {
  const data = await readStore();
  const existing = data.suppliers.find((entry) => entry.id === supplierId);

  if (!existing) {
    redirect('/setup?error=missing-supplier');
  }

  const values = normalizeSupplierForm(formData);
  const error = validateSupplierForm(values);

  if (error) {
    redirect(`/setup?supplier=${supplierId}&error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const supplier = buildSupplierRecord(values, actorUserId, existing);
  data.suppliers = data.suppliers
    .map((entry) => (entry.id === supplierId ? supplier : entry))
    .sort((left, right) => left.name.localeCompare(right.name));
  appendActivity(data, {
    entityType: 'supplier',
    entityId: supplier.id,
    action: existing.active !== supplier.active ? 'status_changed' : 'updated',
    userId: actorUserId,
    summary: existing.active !== supplier.active
      ? `Supplier ${quoteLabel(supplier.name)} marked as ${supplier.active ? 'active' : 'inactive'}.`
      : `Supplier ${quoteLabel(supplier.name)} updated.`,
  });
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/setup');
  redirect('/setup?saved=supplier');
}

export async function createRawMaterialAction(formData: FormData) {
  const data = await readStore();
  const redirectTo = resolveRedirectTo(formData, '/setup');
  const allowEmpty = shouldAllowEmpty(formData);
  const values = normalizeRawMaterialForm(formData);
  if (allowEmpty && !values.name.trim()) {
    redirect(redirectTo);
  }
  const error = validateRawMaterialForm(values);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const rawMaterial = buildRawMaterialRecord(values, actorUserId);
  data.rawMaterials = [...data.rawMaterials, rawMaterial].sort((left, right) => left.name.localeCompare(right.name));
  appendActivity(data, {
    entityType: 'raw_material',
    entityId: rawMaterial.id,
    action: 'created',
    userId: actorUserId,
    summary: `Raw material ${quoteLabel(rawMaterial.name)} created.`,
  });
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/setup');
  redirect(`${redirectTo}?saved=raw-material`);
}

export async function importCsvEntitiesAction(formData: FormData) {
  const data = await readStore();
  const redirectTo = resolveRedirectTo(formData, '/setup');
  const entity = String(formData.get('entity') ?? '') as CsvEntity;
  const csvContent = String(formData.get('csvContent') ?? '');
  const rawMapping = String(formData.get('mapping') ?? '');

  if (!csvContent.trim()) {
    redirect(`${redirectTo}?error=${encodeURIComponent('Upload a CSV file before importing.')}`);
  }

  if (!['customers', 'suppliers', 'rawMaterials'].includes(entity)) {
    redirect(`${redirectTo}?error=${encodeURIComponent('Choose a supported import type.')}`);
  }

  const parsed = parseCsvContent(csvContent);
  const mapping = parseCsvMapping(rawMapping);
  const actorUserId = await getActorUserId(data);
  let imported = 0;
  let skipped = 0;

  if (entity === 'customers') {
    const payload = buildCustomerImportPayload(parsed.headers, parsed.rows, mapping);
    const importedRecords = payload.flatMap((entry) => {
      if (!entry.displayName.trim()) {
        skipped += 1;
        return [];
      }

      imported += 1;
      return [buildCustomerRecord(entry, actorUserId)];
    });

    data.customers = [...data.customers, ...importedRecords].sort((left, right) => left.displayName.localeCompare(right.displayName));
  }

  if (entity === 'suppliers') {
    const payload = buildSupplierImportPayload(parsed.headers, parsed.rows, mapping);
    const importedRecords = payload.flatMap((entry) => {
      if (!entry.name.trim()) {
        skipped += 1;
        return [];
      }

      imported += 1;
      return [buildSupplierRecord(entry, actorUserId)];
    });

    data.suppliers = [...data.suppliers, ...importedRecords].sort((left, right) => left.name.localeCompare(right.name));
  }

  if (entity === 'rawMaterials') {
    const payload = buildRawMaterialImportPayload(parsed.headers, parsed.rows, mapping);
    const importedRecords = payload.flatMap((entry) => {
      if (!entry.name.trim()) {
        skipped += 1;
        return [];
      }

      imported += 1;
      return [buildRawMaterialRecord(entry, actorUserId)];
    });

    data.rawMaterials = [...data.rawMaterials, ...importedRecords].sort((left, right) => left.name.localeCompare(right.name));
  }

  await writeStore(data);
  revalidateAllWorkspaces();
  redirect(`${redirectTo}?saved=import&importedEntity=${entity}&importedCount=${imported}&skippedCount=${skipped}`);
}

export async function updateRawMaterialAction(rawMaterialId: string, formData: FormData) {
  const data = await readStore();
  const existing = data.rawMaterials.find((entry) => entry.id === rawMaterialId);

  if (!existing) {
    redirect('/setup?error=missing-raw-material');
  }

  const values = normalizeRawMaterialForm(formData);
  const error = validateRawMaterialForm(values);

  if (error) {
    redirect(`/setup?material=${rawMaterialId}&error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const rawMaterial = buildRawMaterialRecord(values, actorUserId, existing);
  data.rawMaterials = data.rawMaterials
    .map((entry) => (entry.id === rawMaterialId ? rawMaterial : entry))
    .sort((left, right) => left.name.localeCompare(right.name));
  appendActivity(data, {
    entityType: 'raw_material',
    entityId: rawMaterial.id,
    action: existing.active !== rawMaterial.active ? 'status_changed' : 'updated',
    userId: actorUserId,
    summary: existing.active !== rawMaterial.active
      ? `Raw material ${quoteLabel(rawMaterial.name)} marked as ${rawMaterial.active ? 'active' : 'inactive'}.`
      : `Raw material ${quoteLabel(rawMaterial.name)} updated.`,
  });
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/setup');
  redirect('/setup?saved=raw-material');
}

export async function createRecipeAction(formData: FormData) {
  const data = await readStore();
  const values = normalizeRecipeForm(formData);
  const error = validateRecipeForm(values, data);

  if (error) {
    redirect(`/setup?error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const recipe = buildRecipeRecord(values, data, actorUserId);
  data.recipes = [...data.recipes, recipe].sort((left, right) => left.title.localeCompare(right.title));
  appendActivity(data, {
    entityType: 'recipe',
    entityId: recipe.id,
    action: 'created',
    userId: actorUserId,
    summary: `Recipe ${quoteLabel(recipe.title)} created.`,
  });
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/setup');
  redirect(`/setup?recipe=${recipe.id}&saved=recipe`);
}

export async function updateRecipeAction(recipeId: string, formData: FormData) {
  const data = await readStore();
  const existing = data.recipes.find((entry) => entry.id === recipeId);

  if (!existing) {
    redirect('/setup?error=missing-recipe');
  }

  const values = normalizeRecipeForm(formData);
  const error = validateRecipeForm(values, data);

  if (error) {
    redirect(`/setup?recipe=${recipeId}&error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const recipe = buildRecipeRecord(values, data, actorUserId, existing);
  data.recipes = data.recipes
    .map((entry) => (entry.id === recipeId ? recipe : entry))
    .sort((left, right) => left.title.localeCompare(right.title));
  appendActivity(data, {
    entityType: 'recipe',
    entityId: recipe.id,
    action: existing.active !== recipe.active ? 'status_changed' : 'updated',
    userId: actorUserId,
    summary: existing.active !== recipe.active
      ? `Recipe ${quoteLabel(recipe.title)} marked as ${recipe.active ? 'active' : 'inactive'}.`
      : `Recipe ${quoteLabel(recipe.title)} updated.`,
  });
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/setup');
  redirect(`/setup?recipe=${recipe.id}&saved=recipe`);
}

export async function createSupplierPriceEntryAction(formData: FormData) {
  const data = await readStore();
  const values = normalizeSupplierPriceEntryForm(formData);
  const error = validateSupplierPriceEntryForm(values, data);

  if (error) {
    redirect(`/setup?error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const priceEntry = buildSupplierPriceEntryRecord(values, data, actorUserId);
  data.supplierPriceEntries = [...data.supplierPriceEntries, priceEntry].sort((left, right) =>
    left.priceDate === right.priceDate
      ? left.rawMaterialLabel.localeCompare(right.rawMaterialLabel)
      : right.priceDate.localeCompare(left.priceDate),
  );
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/setup');
  redirect('/setup?saved=price');
}

export async function saveShiftLogAction(formData: FormData) {
  const data = await readStore();
  const productionDate = String(formData.get('productionDate') ?? '');
  const shiftKey = String(formData.get('shiftKey') ?? 'night');
  const existing = data.shiftLogs.find(
    (entry) => entry.productionDate === productionDate && entry.shiftKey === shiftKey,
  );

  const actorUserId = await getActorUserId(data);
  const nextLog = buildShiftLog(existing, formData, actorUserId);
  const error = validateShiftLog(nextLog);

  if (error) {
    redirect(`/handoff?error=${encodeURIComponent(error)}`);
  }

  data.shiftLogs = (existing
    ? data.shiftLogs.map((entry) =>
        entry.productionDate === productionDate && entry.shiftKey === shiftKey ? nextLog : entry,
      )
    : [nextLog, ...data.shiftLogs]
  ).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/production');
  revalidatePath('/handoff');
  redirect('/handoff?saved=shift');
}

export async function addShiftNoteAction(formData: FormData) {
  const data = await readStore();
  const productionDate = String(formData.get('productionDate') ?? '');
  const shiftKey = String(formData.get('shiftKey') ?? 'night');
  const actorUserId = await getActorUserId(data);
  const shiftNote = buildShiftNote(formData, actorUserId);
  const error = validateShiftNote(shiftNote, productionDate);

  if (error) {
    redirect(`/handoff?error=${encodeURIComponent(error)}`);
  }

  const targetLog = data.shiftLogs.find(
    (entry) => entry.productionDate === productionDate && entry.shiftKey === shiftKey,
  );

  if (targetLog) {
    targetLog.shiftNotes = [shiftNote, ...targetLog.shiftNotes];
    targetLog.updatedAt = shiftNote.createdAt;
    targetLog.updatedByUserId = actorUserId ?? targetLog.updatedByUserId;
  } else {
    data.shiftLogs = [
      {
        id: `shift-${crypto.randomUUID()}`,
        productionDate,
        shiftKey: shiftKey as 'night' | 'morning' | 'afternoon',
        status: 'open',
        summary: 'Shift note started before a full handoff summary was written.',
        openItems: [],
        handoffNotes: '',
        updatedAt: shiftNote.createdAt,
        createdByUserId: actorUserId,
        updatedByUserId: actorUserId,
        shiftNotes: [shiftNote],
      },
      ...data.shiftLogs,
    ];
  }

  data.shiftLogs = [...data.shiftLogs].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/handoff');
  revalidatePath('/production');
  redirect('/handoff?saved=note');
}
