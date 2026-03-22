export const localeCookieName = 'skoss-locale';
export const localeStorageKey = 'skoss-locale';
export const presetCookieName = 'skoss-preset';
export const presetStorageKey = 'skoss-preset';

export const supportedLocales = ['en', 'es', 'pt'] as const;
export type AppLocale = (typeof supportedLocales)[number];

export const supportedPresets = [
  'generic',
  'bakery',
  'cafe',
  'small_restaurant',
  'dark_kitchen',
  'food_stall',
  'other',
] as const;
export type AppPreset = (typeof supportedPresets)[number];

export const defaultLocale: AppLocale = 'en';
export const defaultPreset: AppPreset = 'generic';

export const localeOptions: Array<{ value: AppLocale; label: string; nativeLabel: string }> = [
  { value: 'en', label: 'English', nativeLabel: 'English' },
  { value: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { value: 'pt', label: 'Portuguese', nativeLabel: 'Português' },
];

export function isSupportedLocale(value: string | undefined | null): value is AppLocale {
  return Boolean(value && supportedLocales.includes(value as AppLocale));
}

export function isSupportedPreset(value: string | undefined | null): value is AppPreset {
  return Boolean(value && supportedPresets.includes(value as AppPreset));
}
