'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUserContext, loggedOutSessionValue, sessionUserCookieName } from '@/lib/server/auth';
import { getPersistenceGateway, readSeedAppData, readAppData, reseedRuntimeAppData, mutateAppData } from '@/lib/server/persistence';
import { hashPassword, verifyPassword } from '@/lib/server/passwords';
import { isSupportedLocale, isSupportedPreset, localeCookieName, supportedLocales, presetCookieName, supportedPresets } from '@/lib/i18n/config';
import { themeCookieName } from '@/lib/theme';
import { getDefaultWorkspaceForRole, isPrimaryWorkspaceSurface } from '@/lib/workspaces';
import { isNonProductionMode } from '@/lib/server/runtime-mode';
import type { AppData } from '@/lib/domain/types';
import { detectInstanceGatewayState, shouldRouteToEntryGateway } from '@/lib/server/instance-entry';

const supportedThemes = ['light', 'dark', 'system'] as const;
const supportedOperatingModes = ['pickup', 'delivery', 'mixed'] as const;
const supportedPreferenceWorkspaces = ['timeline', 'orders', 'customers', 'production', 'handoff', 'admin'] as const;
const sessionMaxAgeSeconds = 60 * 60 * 24 * 14;
const persistence = getPersistenceGateway();

function revalidateAllWorkspaces() {
  revalidatePath('/');
  revalidatePath('/timeline');
  revalidatePath('/orders');
  revalidatePath('/customers');
  revalidatePath('/production');
  revalidatePath('/handoff');
  revalidatePath('/preferences');
  revalidatePath('/admin/setup');
  revalidatePath('/login');
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

export async function resetLocalRuntimeDataAction() {
  if (!isNonProductionMode()) {
    redirect('/entry?error=' + encodeURIComponent('Local runtime reset is disabled in production mode.'));
  }

  await reseedRuntimeAppData();
  revalidateAllWorkspaces();
  redirect('/entry?saved=runtime-reset');
}

export async function launchDemoModeAction() {
  if (!isNonProductionMode()) {
    redirect('/entry?error=' + encodeURIComponent('Demo launch is disabled in production mode.'));
  }

  const data = await readSeedAppData();
  await persistence.write(({ instance }) => {
    instance.updateInstanceState({
      ...data.instance,
      demoModeActive: true,
      initialized: false,
      onboardingStatus: 'not_started',
      environmentType: 'demo',
    });
    instance.updatePreferences({
      ...data.preferences,
      onboardingCompleted: false,
    });
  });
  revalidateAllWorkspaces();
  redirect('/?demo=1');
}

export async function recoverLocalAdminAccessAction() {
  if (!isNonProductionMode()) {
    redirect('/entry?error=' + encodeURIComponent('Local recovery is disabled in production mode.'));
  }

  const data = await readAppData();
  const now = new Date().toISOString();
  const adminUser = data.users.find((user) => user.role === 'owner_admin' || user.roles?.includes('owner_admin'));

  if (!adminUser) {
    redirect('/entry?error=' + encodeURIComponent('No admin account found. Use restore or guided activation.'));
  }

  const temporaryPassword = 'skoss-local-admin';
  const nextUsers = data.users.map((user) => user.id === adminUser.id
    ? {
        ...user,
        passwordHash: hashPassword(temporaryPassword),
        passwordUpdatedAt: now,
        mustChangePassword: true,
        active: true,
        updatedAt: now,
      }
    : user);
  await persistence.write(({ users, instance }) => {
    users.replaceAll(nextUsers);
    instance.updateInstanceState({
      ...data.instance,
      initialized: true,
      onboardingProgress: {
        ...data.instance.onboardingProgress,
        adminAccount: true,
      },
      onboardingStatus: data.preferences.onboardingCompleted ? 'completed' : 'in_progress',
    });
    instance.updateSessionState({
      ...data.session,
      currentUserId: undefined,
      lastLoginAt: undefined,
    });
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionUserCookieName, loggedOutSessionValue, { path: '/', maxAge: sessionMaxAgeSeconds, sameSite: 'lax' });
  revalidateAllWorkspaces();
  redirect(`/entry?saved=recovered&recoveryUser=${encodeURIComponent(adminUser.loginIdentifier)}`);
}

export async function resetLocalUsersAndCredentialsAction() {
  if (!isNonProductionMode()) {
    redirect('/entry?error=' + encodeURIComponent('Local user reset is disabled in production mode.'));
  }

  const seedData = await readSeedAppData();
  const data = await readAppData();
  await persistence.write(({ users, instance }) => {
    users.replaceAll(seedData.users);
    instance.updateSessionState({
      ...data.session,
      currentUserId: undefined,
      lastLoginAt: undefined,
    });
    instance.updateInstanceState({
      ...data.instance,
      initialized: true,
      onboardingStatus: 'in_progress',
    });
    instance.updatePreferences({
      ...data.preferences,
      onboardingCompleted: false,
    });
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionUserCookieName, loggedOutSessionValue, { path: '/', maxAge: sessionMaxAgeSeconds, sameSite: 'lax' });
  revalidateAllWorkspaces();
  redirect('/entry?saved=users-reset');
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
    ...(restoredData.instance ?? (await readSeedAppData()).instance),
    initialized: true,
    backupHintAvailable: true,
    lastRestoreAt: new Date().toISOString(),
  };
  await mutateAppData(restoredData);
  revalidateAllWorkspaces();
  redirect('/entry?saved=restored');
}

export async function saveOnboardingPreferencesAction(formData: FormData) {
  const data = await readAppData();
  const businessName = String(formData.get('businessName') ?? '').trim();
  const locale = String(formData.get('locale') ?? '');
  const preset = String(formData.get('preset') ?? '');
  const operatingMode = String(formData.get('operatingMode') ?? '');
  const theme = String(formData.get('theme') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '/');

  if (!businessName) {
    redirect(`${redirectTo.startsWith('/admin/setup') ? '/admin/setup' : '/'}?error=${encodeURIComponent('Add a business name to continue.')}`);
  }

  if (!isSupportedLocale(locale) || !supportedLocales.includes(locale)) {
    redirect(`${redirectTo.startsWith('/admin/setup') ? '/admin/setup' : '/'}?error=${encodeURIComponent('Choose a supported language.')}`);
  }

  if (!isSupportedPreset(preset) || !supportedPresets.includes(preset)) {
    redirect(`${redirectTo.startsWith('/admin/setup') ? '/admin/setup' : '/'}?error=${encodeURIComponent('Choose a supported preset.')}`);
  }

  if (!supportedOperatingModes.includes(operatingMode as (typeof supportedOperatingModes)[number])) {
    redirect(`${redirectTo.startsWith('/admin/setup') ? '/admin/setup' : '/'}?error=${encodeURIComponent('Choose how you usually operate.')}`);
  }

  if (!supportedThemes.includes(theme as (typeof supportedThemes)[number])) {
    redirect(`${redirectTo.startsWith('/admin/setup') ? '/admin/setup' : '/'}?error=${encodeURIComponent('Choose an appearance theme.')}`);
  }

  const now = new Date().toISOString();
  const nextWorkspace = {
    ...data.workspace,
    name: businessName,
  };
  const nextPreferences: AppData['preferences'] = {
    locale,
    preset,
    operatingMode: operatingMode as (typeof supportedOperatingModes)[number],
    theme: theme as (typeof supportedThemes)[number],
    onboardingCompleted: true,
    completedAt: data.preferences.completedAt ?? now,
    updatedAt: now,
  };
  const nextInstance: AppData['instance'] = {
    ...data.instance,
    initialized: true,
    onboardingStatus: 'completed',
    onboardingProgress: {
      ...data.instance.onboardingProgress,
      workspaceBasics: true,
      timezone: true,
    },
  };

  await persistence.write(({ instance }) => {
    instance.updateWorkspace(nextWorkspace);
    instance.updatePreferences(nextPreferences);
    instance.updateInstanceState(nextInstance);
  });

  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, locale, { path: '/', maxAge: 31536000, sameSite: 'lax' });
  cookieStore.set(presetCookieName, preset, { path: '/', maxAge: 31536000, sameSite: 'lax' });
  cookieStore.set(themeCookieName, theme, { path: '/', maxAge: 31536000, sameSite: 'lax' });

  revalidatePath('/');
  revalidatePath('/admin/setup');
  revalidatePath('/timeline');
  revalidatePath('/orders');
  revalidatePath('/production');
  revalidatePath('/handoff');

  if (redirectTo.startsWith('/admin/setup')) {
    redirect('/admin/setup?saved=preferences');
  }

  redirect('/?welcome=1');
}

export async function saveBootstrapStepAction(formData: FormData) {
  const data = await readAppData();
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
    const existingAdmin = data.users.find((user) => user.role === 'owner_admin' || user.roles?.includes('owner_admin'));
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
      existingAdmin.role = 'owner_admin';
      existingAdmin.roles = existingAdmin.roles?.includes('owner_admin')
        ? existingAdmin.roles
        : ['owner_admin', ...(existingAdmin.roles ?? []).filter((role) => role !== 'owner_admin')];
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
        role: 'owner_admin',
        roles: ['owner_admin'],
        email: email || undefined,
        phone: phone || undefined,
        workspaceId: data.workspace.id,
        defaultWorkspace: 'admin',
        active: true,
        preferences: {
          defaultWorkspace: 'admin',
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
        .filter((role) => ['owner_admin', 'shift_lead', 'kitchen', 'sales'].includes(role))
        .filter((role, index, list) => list.indexOf(role) === index) as Array<'owner_admin' | 'shift_lead' | 'kitchen' | 'sales'>;
      const primaryRole = roleList[0] ?? 'sales';

      if (!displayName || !username) {
        continue;
      }

      const existing = data.users.find((user) => user.loginIdentifier.toLowerCase() === username);
      if (existing) {
        existing.displayName = displayName;
        existing.role = primaryRole;
        existing.roles = roleList.length > 0 ? roleList : [primaryRole];
        existing.defaultWorkspace = isPrimaryWorkspaceSurface(defaultWorkspace as 'home' | 'timeline' | 'orders' | 'customers' | 'production' | 'handoff' | 'preferences' | 'admin')
          ? (defaultWorkspace as 'home' | 'timeline' | 'orders' | 'customers' | 'production' | 'handoff' | 'preferences' | 'admin')
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
          defaultWorkspace: isPrimaryWorkspaceSurface(defaultWorkspace as 'home' | 'timeline' | 'orders' | 'customers' | 'production' | 'handoff' | 'preferences' | 'admin')
            ? (defaultWorkspace as 'home' | 'timeline' | 'orders' | 'customers' | 'production' | 'handoff' | 'preferences' | 'admin')
            : 'orders',
          active: enabled,
          username,
          preferences: {
            defaultWorkspace: isPrimaryWorkspaceSurface(defaultWorkspace as 'home' | 'timeline' | 'orders' | 'customers' | 'production' | 'handoff' | 'preferences' | 'admin')
              ? (defaultWorkspace as 'home' | 'timeline' | 'orders' | 'customers' | 'production' | 'handoff' | 'preferences' | 'admin')
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
    await persistence.write(({ raw, instance, users }) => {
      instance.updateInstanceState(data.instance);
      instance.updateWorkspace(data.workspace);
      instance.updatePreferences(data.preferences);
      instance.updateSessionState(data.session);
      users.replaceAll(data.users);
      if (step === 6) {
        raw.products = data.products;
      }
    });
    revalidateAllWorkspaces();
    redirect('/login?redirectTo=/');
  }

  await persistence.write(({ raw, instance, users }) => {
    instance.updateInstanceState(data.instance);
    instance.updateWorkspace(data.workspace);
    instance.updatePreferences(data.preferences);
    instance.updateSessionState(data.session);
    users.replaceAll(data.users);
    if (step === 6) {
      raw.products = data.products;
    }
  });
  revalidateAllWorkspaces();
  if (intent === 'skip') {
    redirect(`/bootstrap?step=${Math.min(8, step + 1)}&saved=progress`);
  }

  const nextStep = nextBootstrapStep(step, intent === 'back' ? 'back' : intent === 'stay' ? 'stay' : 'next');
  redirect(`/bootstrap?step=${nextStep}&saved=progress`);
}

export async function saveUserPreferencesAction(formData: FormData) {
  const data = await readAppData();
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

  const nextUsers = data.users.map((user) => user.id === currentUser.id
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

  await persistence.write(({ users }) => {
    users.replaceAll(nextUsers);
  });

  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, locale, { path: '/', maxAge: 31536000, sameSite: 'lax' });
  cookieStore.set(themeCookieName, theme, { path: '/', maxAge: 31536000, sameSite: 'lax' });

  revalidateAllWorkspaces();
  redirect('/preferences?saved=preferences');
}

export async function loginAction(formData: FormData) {
  const data = await readAppData();
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
  await persistence.write(({ instance }) => {
    instance.updateSessionState({
      ...data.session,
      currentUserId: user.id,
      lastLoginAt: now,
    });
  });

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

  if (gatewayState.onboardingIncomplete && (user.roles?.includes('owner_admin') || user.roles?.includes('shift_lead') || user.role === 'owner_admin' || user.role === 'shift_lead')) {
    revalidateAllWorkspaces();
    redirect('/bootstrap?step=1');
  }

  revalidateAllWorkspaces();
  redirect(redirectTo.startsWith('/') ? redirectTo : '/');
}

export async function logoutAction() {
  const data = await readAppData();
  await persistence.write(({ instance }) => {
    instance.updateSessionState({
      ...data.session,
      currentUserId: undefined,
    });
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionUserCookieName, loggedOutSessionValue, { path: '/', maxAge: sessionMaxAgeSeconds, sameSite: 'lax' });
  revalidateAllWorkspaces();
  redirect('/login');
}
