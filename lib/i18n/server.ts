import { cookies } from 'next/headers';
import { createTranslator, resolveLocale, resolvePreset } from '@/lib/i18n';
import { localeCookieName, presetCookieName } from '@/lib/i18n/config';
import type { ThemeName } from '@/lib/domain/types';
import { readStore } from '@/lib/server/store';
import { themeCookieName } from '@/lib/theme';

function resolveTheme(value: string | undefined, fallback: ThemeName): ThemeName {
  return value === 'light' || value === 'dark' || value === 'garden' ? value : fallback;
}

export async function getRequestPreferences() {
  const cookieStore = await cookies();
  const data = await readStore();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value ?? data.preferences.locale);
  const preset = resolvePreset(cookieStore.get(presetCookieName)?.value ?? data.preferences.preset);
  const theme = resolveTheme(cookieStore.get(themeCookieName)?.value, data.preferences.theme);
  const operatingMode = data.preferences.operatingMode;

  return { locale, preset, theme, operatingMode };
}

export async function getServerTranslator() {
  const preferences = await getRequestPreferences();

  return createTranslator(preferences);
}
