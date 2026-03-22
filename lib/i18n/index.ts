import en from '@/lib/i18n/dictionaries/en';
import es from '@/lib/i18n/dictionaries/es';
import pt from '@/lib/i18n/dictionaries/pt';
import { AppLocale, AppPreset, defaultLocale, defaultPreset, isSupportedLocale, isSupportedPreset } from '@/lib/i18n/config';

export interface TranslationTree {
  [key: string]: string | TranslationTree;
}
export type TranslateValues = Record<string, string | number>;

const dictionaries: Record<AppLocale, TranslationTree> = { en, es, pt };

const presetOverrides: Record<AppPreset, Partial<Record<AppLocale, TranslationTree>>> = {
  core: {},
  bakery: {
    en: {
      terms: {
        workItem: { one: 'bake item', many: 'bake items' },
        destination: { one: 'route stop', many: 'route stops' },
        handoff: 'bake handoff',
        fulfillment: 'pickup / route',
        productionDay: 'bake day',
      },
    },
    es: {
      terms: {
        workItem: { one: 'ítem de horneado', many: 'ítems de horneado' },
        destination: { one: 'parada de ruta', many: 'paradas de ruta' },
        handoff: 'relevo de horneado',
        fulfillment: 'retiro / ruta',
        productionDay: 'día de horneado',
      },
    },
    pt: {
      terms: {
        workItem: { one: 'item de fornada', many: 'itens de fornada' },
        destination: { one: 'parada de rota', many: 'paradas de rota' },
        handoff: 'passagem de fornada',
        fulfillment: 'retirada / rota',
        productionDay: 'dia de fornada',
      },
    },
  },
};

function isRecord(value: unknown): value is TranslationTree {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge(base: TranslationTree, override?: TranslationTree): TranslationTree {
  if (!override) {
    return base;
  }

  const merged: TranslationTree = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const current = merged[key];

    if (isRecord(current) && isRecord(value)) {
      merged[key] = deepMerge(current, value);
      continue;
    }

    merged[key] = value;
  }

  return merged;
}

function resolveValue(messages: TranslationTree, key: string): string | undefined {
  const value = key.split('.').reduce<string | TranslationTree | undefined>((current, part) => {
    if (!isRecord(current)) {
      return undefined;
    }

    return current[part];
  }, messages);

  return typeof value === 'string' ? value : undefined;
}

function interpolate(message: string, values?: TranslateValues) {
  if (!values) {
    return message;
  }

  return message.replace(/\{\{(.*?)\}\}/g, (_, token: string) => {
    const trimmed = token.trim();
    const replacement = values[trimmed];

    return replacement === undefined ? `{{${trimmed}}}` : String(replacement);
  });
}

export function resolveLocale(value?: string | null): AppLocale {
  return isSupportedLocale(value) ? value : defaultLocale;
}

export function resolvePreset(value?: string | null): AppPreset {
  return isSupportedPreset(value) ? value : defaultPreset;
}

export function getMessages(locale: AppLocale, preset: AppPreset): TranslationTree {
  const base = dictionaries[locale];
  const override = presetOverrides[preset]?.[locale];

  return deepMerge(base, override);
}

export function createTranslator({
  locale = defaultLocale,
  preset = defaultPreset,
}: {
  locale?: AppLocale;
  preset?: AppPreset;
} = {}) {
  const resolvedLocale = resolveLocale(locale);
  const resolvedPreset = resolvePreset(preset);
  const messages = getMessages(resolvedLocale, resolvedPreset);
  const fallbackMessages = getMessages(defaultLocale, resolvedPreset);

  const t = (key: string, values?: TranslateValues) => {
    const message = resolveValue(messages, key) ?? resolveValue(fallbackMessages, key) ?? key;

    return interpolate(message, values);
  };

  const term = (name: 'workItem' | 'destination', count: 'one' | 'many' = 'one') => t(`terms.${name}.${count}`);

  return {
    locale: resolvedLocale,
    preset: resolvedPreset,
    messages,
    t,
    term,
  };
}

export type Translator = ReturnType<typeof createTranslator>;
