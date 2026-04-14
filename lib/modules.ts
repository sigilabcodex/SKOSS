import type { AppPreset } from '@/lib/i18n/config';

export type ModuleCategory = 'core' | 'optional';

export type ModuleManifest = {
  id: string;
  label: string;
  description: string;
  category: ModuleCategory;
  required: boolean;
  defaultEnabled: boolean;
  presetOverrides?: Partial<Record<AppPreset, boolean>>;
};

export const moduleRegistry: ModuleManifest[] = [
  {
    id: 'orders',
    label: 'Orders',
    description: 'Order intake and recurring demand capture.',
    category: 'core',
    required: true,
    defaultEnabled: true,
  },
  {
    id: 'production',
    label: 'Production',
    description: 'Demand interpretation, production board, and WIP visibility.',
    category: 'core',
    required: true,
    defaultEnabled: true,
  },
  {
    id: 'handoff',
    label: 'Handoff',
    description: 'Shift handoff and fulfillment-ready visibility.',
    category: 'core',
    required: true,
    defaultEnabled: true,
  },
  {
    id: 'customer_memory',
    label: 'Customer memory',
    description: 'Saved customer context for repeat operational work.',
    category: 'optional',
    required: false,
    defaultEnabled: true,
  },
  {
    id: 'recipe_costing',
    label: 'Recipe and costing snapshot',
    description: 'Recipe links with lightweight costing evidence snapshots.',
    category: 'optional',
    required: false,
    defaultEnabled: true,
    presetOverrides: {
      dark_kitchen: false,
      food_stall: false,
    },
  },
  {
    id: 'imports',
    label: 'Imports',
    description: 'CSV-assisted setup imports for structure layers.',
    category: 'optional',
    required: false,
    defaultEnabled: true,
  },
];

export function getModuleStateMap(preset: AppPreset, existing?: Record<string, boolean>) {
  const states: Record<string, boolean> = {};

  for (const manifest of moduleRegistry) {
    if (existing && manifest.id in existing) {
      states[manifest.id] = existing[manifest.id];
      continue;
    }

    if (manifest.required) {
      states[manifest.id] = true;
      continue;
    }

    states[manifest.id] = manifest.presetOverrides?.[preset] ?? manifest.defaultEnabled;
  }

  return states;
}
