import { cookies } from 'next/headers';
import { createTranslator, resolveLocale, resolvePreset } from '@/lib/i18n';
import { localeCookieName, presetCookieName } from '@/lib/i18n/config';
import type { ThemeName } from '@/lib/domain/types';
import { readStore } from '@/lib/server/store';
import { loggedOutSessionValue, sessionUserCookieName } from '@/lib/server/auth';
import { themeCookieName } from '@/lib/theme';

function resolveTheme(value: string | undefined, fallback: ThemeName): ThemeName {
  return value === 'light' || value === 'dark' || value === 'garden' ? value : fallback;
}

export async function getRequestPreferences() {
  const cookieStore = await cookies();
  const data = await readStore();
  const requestedUserId = cookieStore.get(sessionUserCookieName)?.value;
  const resolvedUserId = requestedUserId && requestedUserId !== loggedOutSessionValue ? requestedUserId : data.session.currentUserId;
  const currentUser = requestedUserId === loggedOutSessionValue
    ? undefined
    : data.users.find((user) => user.id === resolvedUserId && user.active)
      ?? data.users.find((user) => user.active);
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value ?? currentUser?.preferences?.locale ?? data.preferences.locale);
  const preset = resolvePreset(cookieStore.get(presetCookieName)?.value ?? data.preferences.preset);
  const theme = resolveTheme(cookieStore.get(themeCookieName)?.value ?? currentUser?.preferences?.theme, data.preferences.theme);
  const operatingMode = data.preferences.operatingMode;

  return { locale, preset, theme, operatingMode };
}

export async function getServerTranslator() {
  const preferences = await getRequestPreferences();

  return createTranslator(preferences);
}
