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
  generic: {},
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
  cafe: {
    en: {
      terms: {
        workItem: { one: 'prep item', many: 'prep items' },
        destination: { one: 'pickup point', many: 'pickup points' },
        handoff: 'counter handoff',
        fulfillment: 'counter / delivery',
        productionDay: 'service day',
      },
    },
    es: {
      terms: {
        workItem: { one: 'ítem de preparación', many: 'ítems de preparación' },
        destination: { one: 'punto de retiro', many: 'puntos de retiro' },
        handoff: 'relevo de mostrador',
        fulfillment: 'mostrador / entrega',
        productionDay: 'día de servicio',
      },
    },
    pt: {
      terms: {
        workItem: { one: 'item de preparo', many: 'itens de preparo' },
        destination: { one: 'ponto de retirada', many: 'pontos de retirada' },
        handoff: 'passagem de balcão',
        fulfillment: 'balcão / entrega',
        productionDay: 'dia de serviço',
      },
    },
  },
  small_restaurant: {
    en: {
      terms: {
        workItem: { one: 'service item', many: 'service items' },
        destination: { one: 'service point', many: 'service points' },
        handoff: 'service handoff',
        fulfillment: 'service / dispatch',
        productionDay: 'service shift',
      },
    },
    es: {
      terms: {
        workItem: { one: 'ítem de servicio', many: 'ítems de servicio' },
        destination: { one: 'punto de servicio', many: 'puntos de servicio' },
        handoff: 'relevo de servicio',
        fulfillment: 'servicio / despacho',
        productionDay: 'turno de servicio',
      },
    },
    pt: {
      terms: {
        workItem: { one: 'item de serviço', many: 'itens de serviço' },
        destination: { one: 'ponto de serviço', many: 'pontos de serviço' },
        handoff: 'passagem de serviço',
        fulfillment: 'serviço / despacho',
        productionDay: 'turno de serviço',
      },
    },
  },
  dark_kitchen: {
    en: {
      terms: {
        workItem: { one: 'dispatch item', many: 'dispatch items' },
        destination: { one: 'delivery zone', many: 'delivery zones' },
        handoff: 'dispatch handoff',
        fulfillment: 'dispatch',
        productionDay: 'dispatch run',
      },
    },
    es: {
      terms: {
        workItem: { one: 'ítem de despacho', many: 'ítems de despacho' },
        destination: { one: 'zona de entrega', many: 'zonas de entrega' },
        handoff: 'relevo de despacho',
        fulfillment: 'despacho',
        productionDay: 'salida de despacho',
      },
    },
    pt: {
      terms: {
        workItem: { one: 'item de despacho', many: 'itens de despacho' },
        destination: { one: 'zona de entrega', many: 'zonas de entrega' },
        handoff: 'passagem de despacho',
        fulfillment: 'despacho',
        productionDay: 'rodada de despacho',
      },
    },
  },
  food_stall: {
    en: {
      terms: {
        workItem: { one: 'stall item', many: 'stall items' },
        destination: { one: 'stall point', many: 'stall points' },
        handoff: 'stall handoff',
        fulfillment: 'stall pickup',
        productionDay: 'stall day',
      },
    },
    es: {
      terms: {
        workItem: { one: 'ítem del puesto', many: 'ítems del puesto' },
        destination: { one: 'punto del puesto', many: 'puntos del puesto' },
        handoff: 'relevo del puesto',
        fulfillment: 'retiro del puesto',
        productionDay: 'día del puesto',
      },
    },
    pt: {
      terms: {
        workItem: { one: 'item da barraca', many: 'itens da barraca' },
        destination: { one: 'ponto da barraca', many: 'pontos da barraca' },
        handoff: 'passagem da barraca',
        fulfillment: 'retirada na barraca',
        productionDay: 'dia da barraca',
      },
    },
  },
  other: {},
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
