import { cookies } from 'next/headers';
import { createTranslator, resolveLocale, resolvePreset } from '@/lib/i18n';
import { isSupportedLocale, localeCookieName, presetCookieName } from '@/lib/i18n/config';
import { loggedOutSessionValue, sessionUserCookieName } from '@/lib/server/auth';
import { resolveThemePreference, themeCookieName } from '@/lib/theme';
import { headers } from 'next/headers';
import { readPersistence } from '@/lib/server/persistence';

function detectLocaleFromAcceptLanguage(headerValue: string | null | undefined) {
  if (!headerValue) {
    return undefined;
  }

  const languageTags = headerValue
    .split(',')
    .map((entry) => entry.trim().split(';')[0]?.trim().toLowerCase())
    .filter(Boolean);

  for (const tag of languageTags) {
    if (isSupportedLocale(tag)) {
      return tag;
    }

    const baseTag = tag.split('-')[0];
    if (isSupportedLocale(baseTag)) {
      return baseTag;
    }
  }

  return undefined;
}

export async function getRequestPreferences() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const context = await readPersistence();
  const workspacePreferences = context.instance.getPreferences();
  const session = context.instance.getSessionState();
  const users = context.users.list();

  const requestedUserId = cookieStore.get(sessionUserCookieName)?.value;
  const resolvedUserId = requestedUserId && requestedUserId !== loggedOutSessionValue ? requestedUserId : session.currentUserId;
  const currentUser = requestedUserId === loggedOutSessionValue
    ? undefined
    : users.find((user) => user.id === resolvedUserId && user.active)
      ?? users.find((user) => user.active);
  const browserLocale = detectLocaleFromAcceptLanguage(headerStore.get('accept-language'));
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value ?? currentUser?.preferences?.locale ?? browserLocale ?? workspacePreferences.locale);
  const preset = resolvePreset(cookieStore.get(presetCookieName)?.value ?? workspacePreferences.preset);
  const theme = resolveThemePreference(cookieStore.get(themeCookieName)?.value ?? currentUser?.preferences?.theme, workspacePreferences.theme);
  const operatingMode = workspacePreferences.operatingMode;

  return { locale, preset, theme, operatingMode };
}

export async function getServerTranslator() {
  const preferences = await getRequestPreferences();

  return createTranslator(preferences);
}
