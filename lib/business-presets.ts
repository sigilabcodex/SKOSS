import type { OperatingMode } from '@/lib/domain/types';
import type { AppPreset } from '@/lib/i18n/config';

export type WorkspaceLinkKey = 'orders' | 'production' | 'handoff' | 'setup';

type PresetExperience = {
  featuredWorkspaces: WorkspaceLinkKey[];
  starterSuggestionKeys: string[];
  exampleKeys: string[];
  emphasisWorkspace: WorkspaceLinkKey;
};

export const presetOptions: AppPreset[] = [
  'bakery',
  'cafe',
  'small_restaurant',
  'dark_kitchen',
  'food_stall',
  'generic',
  'other',
];

export const operatingModeOptions: OperatingMode[] = ['pickup', 'delivery', 'mixed'];

const presetExperience: Record<AppPreset, Record<OperatingMode, PresetExperience>> = {
  bakery: {
    pickup: {
      featuredWorkspaces: ['production', 'orders', 'handoff', 'setup'],
      starterSuggestionKeys: ['sharedCutoff', 'morningCounter'],
      exampleKeys: ['counterPickup', 'nightShift'],
      emphasisWorkspace: 'production',
    },
    delivery: {
      featuredWorkspaces: ['production', 'orders', 'handoff', 'setup'],
      starterSuggestionKeys: ['sharedCutoff', 'routePacking'],
      exampleKeys: ['routeDrop', 'nightShift'],
      emphasisWorkspace: 'production',
    },
    mixed: {
      featuredWorkspaces: ['production', 'orders', 'handoff', 'setup'],
      starterSuggestionKeys: ['sharedCutoff', 'mixedDispatch'],
      exampleKeys: ['counterPickup', 'routeDrop'],
      emphasisWorkspace: 'production',
    },
  },
  cafe: {
    pickup: {
      featuredWorkspaces: ['orders', 'production', 'setup', 'handoff'],
      starterSuggestionKeys: ['counterRush', 'simpleMenu'],
      exampleKeys: ['counterPickup', 'rushBoard'],
      emphasisWorkspace: 'orders',
    },
    delivery: {
      featuredWorkspaces: ['orders', 'production', 'setup', 'handoff'],
      starterSuggestionKeys: ['counterRush', 'courierReady'],
      exampleKeys: ['appCourier', 'rushBoard'],
      emphasisWorkspace: 'orders',
    },
    mixed: {
      featuredWorkspaces: ['orders', 'production', 'setup', 'handoff'],
      starterSuggestionKeys: ['counterRush', 'courierReady'],
      exampleKeys: ['counterPickup', 'appCourier'],
      emphasisWorkspace: 'orders',
    },
  },
  small_restaurant: {
    pickup: {
      featuredWorkspaces: ['orders', 'production', 'handoff', 'setup'],
      starterSuggestionKeys: ['menuBoards', 'prepNotes'],
      exampleKeys: ['serviceWindow', 'prepList'],
      emphasisWorkspace: 'orders',
    },
    delivery: {
      featuredWorkspaces: ['orders', 'production', 'handoff', 'setup'],
      starterSuggestionKeys: ['menuBoards', 'dispatchFlow'],
      exampleKeys: ['serviceWindow', 'appCourier'],
      emphasisWorkspace: 'orders',
    },
    mixed: {
      featuredWorkspaces: ['orders', 'production', 'handoff', 'setup'],
      starterSuggestionKeys: ['menuBoards', 'dispatchFlow'],
      exampleKeys: ['serviceWindow', 'prepList'],
      emphasisWorkspace: 'orders',
    },
  },
  dark_kitchen: {
    pickup: {
      featuredWorkspaces: ['orders', 'production', 'handoff', 'setup'],
      starterSuggestionKeys: ['dispatchFlow', 'handoffNotes'],
      exampleKeys: ['pickupWindow', 'expediteLane'],
      emphasisWorkspace: 'handoff',
    },
    delivery: {
      featuredWorkspaces: ['orders', 'handoff', 'production', 'setup'],
      starterSuggestionKeys: ['dispatchFlow', 'courierReady'],
      exampleKeys: ['appCourier', 'expediteLane'],
      emphasisWorkspace: 'handoff',
    },
    mixed: {
      featuredWorkspaces: ['orders', 'handoff', 'production', 'setup'],
      starterSuggestionKeys: ['dispatchFlow', 'handoffNotes'],
      exampleKeys: ['pickupWindow', 'appCourier'],
      emphasisWorkspace: 'handoff',
    },
  },
  food_stall: {
    pickup: {
      featuredWorkspaces: ['orders', 'production', 'setup', 'handoff'],
      starterSuggestionKeys: ['fastCapture', 'singleBoard'],
      exampleKeys: ['stallPickup', 'rushBoard'],
      emphasisWorkspace: 'orders',
    },
    delivery: {
      featuredWorkspaces: ['orders', 'production', 'setup', 'handoff'],
      starterSuggestionKeys: ['fastCapture', 'dispatchFlow'],
      exampleKeys: ['stallPickup', 'courierPocket'],
      emphasisWorkspace: 'orders',
    },
    mixed: {
      featuredWorkspaces: ['orders', 'production', 'setup', 'handoff'],
      starterSuggestionKeys: ['fastCapture', 'singleBoard'],
      exampleKeys: ['stallPickup', 'courierPocket'],
      emphasisWorkspace: 'orders',
    },
  },
  generic: {
    pickup: {
      featuredWorkspaces: ['orders', 'production', 'setup', 'handoff'],
      starterSuggestionKeys: ['simpleStart', 'notesFirst'],
      exampleKeys: ['counterPickup', 'prepList'],
      emphasisWorkspace: 'orders',
    },
    delivery: {
      featuredWorkspaces: ['orders', 'production', 'handoff', 'setup'],
      starterSuggestionKeys: ['simpleStart', 'dispatchFlow'],
      exampleKeys: ['routeDrop', 'appCourier'],
      emphasisWorkspace: 'orders',
    },
    mixed: {
      featuredWorkspaces: ['orders', 'production', 'handoff', 'setup'],
      starterSuggestionKeys: ['simpleStart', 'notesFirst'],
      exampleKeys: ['counterPickup', 'routeDrop'],
      emphasisWorkspace: 'orders',
    },
  },
  other: {
    pickup: {
      featuredWorkspaces: ['orders', 'production', 'setup', 'handoff'],
      starterSuggestionKeys: ['simpleStart', 'notesFirst'],
      exampleKeys: ['counterPickup', 'prepList'],
      emphasisWorkspace: 'orders',
    },
    delivery: {
      featuredWorkspaces: ['orders', 'production', 'handoff', 'setup'],
      starterSuggestionKeys: ['simpleStart', 'dispatchFlow'],
      exampleKeys: ['routeDrop', 'courierPocket'],
      emphasisWorkspace: 'orders',
    },
    mixed: {
      featuredWorkspaces: ['orders', 'production', 'handoff', 'setup'],
      starterSuggestionKeys: ['simpleStart', 'notesFirst'],
      exampleKeys: ['counterPickup', 'routeDrop'],
      emphasisWorkspace: 'orders',
    },
  },
};

export function getPresetExperience(preset: AppPreset, operatingMode: OperatingMode) {
  return presetExperience[preset][operatingMode];
}
