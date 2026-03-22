import { cookies } from 'next/headers';
import { createTranslator, resolveLocale, resolvePreset } from '@/lib/i18n';
import { localeCookieName, presetCookieName } from '@/lib/i18n/config';

export async function getRequestPreferences() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);
  const preset = resolvePreset(cookieStore.get(presetCookieName)?.value);

  return { locale, preset };
}

export async function getServerTranslator() {
  const preferences = await getRequestPreferences();

  return createTranslator(preferences);
}
