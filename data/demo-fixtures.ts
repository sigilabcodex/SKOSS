import type {
  Destination,
  Order,
  Product,
  RecurringTemplate,
  ShiftLog,
  User,
  WipEntry,
  Workspace,
} from '@/lib/domain/types';

export const workspace: Workspace = {
  id: 'ws-kalali',
  name: 'Kalali Demo',
  slug: 'kalali-demo',
  timezone: 'America/Mexico_City',
  defaultProductionCutoffHour: 4,
};

export const users: User[] = [
  {
    id: 'user-lucia',
    displayName: 'Lucía',
    email: 'lucia@example.com',
    role: 'owner_admin',
    workspaceId: workspace.id,
    active: true,
  },
  {
    id: 'user-mateo',
    displayName: 'Mateo',
    email: 'mateo@example.com',
    role: 'sales',
    workspaceId: workspace.id,
    active: true,
  },
  {
    id: 'user-noche',
    displayName: 'Noche',
    email: 'noche@example.com',
    role: 'shift_lead',
    workspaceId: workspace.id,
    active: true,
  },
];

export const destinations: Destination[] = [
  {
    id: 'dest-cafe-luna',
    name: 'Cafe Luna',
    kind: 'delivery_stop',
    active: true,
  },
  {
    id: 'dest-front-counter',
    name: 'Front Counter',
    kind: 'counter',
    active: true,
  },
];

export const products: Product[] = [
  {
    id: 'product-country-loaf',
    name: 'Country Loaf',
    defaultUnit: 'pieces',
    active: true,
    variants: [
      {
        id: 'variant-country-loaf-800g',
        name: '800g',
        defaultUnit: 'pieces',
        active: true,
      },
    ],
  },
  {
    id: 'product-croissant',
    name: 'Croissant',
    defaultUnit: 'pieces',
    active: true,
    variants: [
      {
        id: 'variant-croissant-butter',
        name: 'Butter',
        defaultUnit: 'pieces',
        active: true,
      },
    ],
  },
  {
    id: 'product-roll',
    name: 'Roll',
    defaultUnit: 'pieces',
    active: true,
    variants: [
      {
        id: 'variant-roll-sesame',
        name: 'Sesame',
        defaultUnit: 'pieces',
        active: true,
      },
    ],
  },
];

export const recurringTemplates: RecurringTemplate[] = [
  {
    id: 'rt-cafe-luna-saturday',
    templateType: 'customer_order',
    title: 'Cafe Luna Saturday delivery',
    scheduleRule: 'Every Saturday',
    active: true,
  },
  {
    id: 'rt-front-counter-saturday',
    templateType: 'internal_task',
    title: 'Saturday front counter production',
    scheduleRule: 'Every Saturday',
    active: true,
  },
];

export const orders: Order[] = [
  {
    id: 'order-cafe-luna-2026-03-28',
    source: 'generated',
    status: 'active',
    customerLabel: 'Cafe Luna',
    destinationLabel: 'Cafe Luna',
    dueDate: '2026-03-28',
    productionDate: '2026-03-28',
    notes: 'Recurring Saturday delivery.',
    lines: [
      {
        id: 'line-country-loaf',
        lineType: 'product_variant',
        productLabel: 'Country Loaf / 800g',
        quantity: 12,
        unit: 'pieces',
        lineStatus: 'planned',
      },
      {
        id: 'line-croissant',
        lineType: 'product_variant',
        productLabel: 'Croissant / Butter',
        quantity: 30,
        unit: 'pieces',
        lineStatus: 'planned',
      },
    ],
  },
  {
    id: 'order-front-counter-2026-03-28',
    source: 'generated',
    status: 'active',
    customerLabel: 'Front Counter',
    destinationLabel: 'Front Counter',
    dueDate: '2026-03-28',
    productionDate: '2026-03-28',
    notes: 'Internal recurring demand.',
    lines: [
      {
        id: 'line-roll-sesame-counter',
        lineType: 'product_variant',
        productLabel: 'Roll / Sesame',
        quantity: 20,
        unit: 'pieces',
        lineStatus: 'planned',
      },
      {
        id: 'line-croissant-counter',
        lineType: 'product_variant',
        productLabel: 'Croissant / Butter',
        quantity: 10,
        unit: 'pieces',
        lineStatus: 'planned',
      },
    ],
  },
  {
    id: 'order-sofia-birthday',
    source: 'whatsapp',
    status: 'changed',
    customerLabel: 'Sofía birthday (draft customer)',
    dueDate: '2026-03-28',
    productionDate: '2026-03-28',
    notes: 'Late change: sesame rolls increased from 6 to 8. Confirm decoration at pickup.',
    lines: [
      {
        id: 'line-roll-sesame-sofia',
        lineType: 'product_variant',
        productLabel: 'Roll / Sesame',
        quantity: 8,
        unit: 'pieces',
        lineStatus: 'planned',
      },
      {
        id: 'line-mini-sweet-tray',
        lineType: 'draft_product',
        productLabel: 'mini sweet tray',
        quantity: 2,
        unit: 'trays',
        lineStatus: 'planned',
        note: 'Draft product; decoration still to confirm.',
      },
    ],
  },
];

export const wipEntries: WipEntry[] = [
  {
    id: 'wip-country-dough',
    productionDate: '2026-03-28',
    wipType: 'base_dough',
    referenceLabel: 'Country dough',
    quantity: 1,
    unit: 'batch',
    status: 'in_progress',
    notes: 'Bulk fermentation complete.',
  },
  {
    id: 'wip-croissant-dough',
    productionDate: '2026-03-28',
    wipType: 'prep',
    referenceLabel: 'Croissant dough',
    quantity: 1,
    unit: 'batch',
    status: 'ready',
    notes: 'Use first in the morning.',
  },
  {
    id: 'wip-rolls-tray',
    productionDate: '2026-03-28',
    wipType: 'baked_items',
    referenceLabel: 'Sesame rolls first tray',
    quantity: 1,
    unit: 'tray',
    status: 'ready',
    notes: 'Includes part of the late WhatsApp order.',
  },
];

export const shiftLogs: ShiftLog[] = [
  {
    id: 'shift-night-2026-03-28',
    productionDate: '2026-03-28',
    shiftKey: 'night',
    status: 'ready_for_handoff',
    summary: 'Country dough fermentation complete. Croissant dough is ready for shaping.',
    openItems: [
      'Finish 2 trays of sweet items.',
      'Final sesame roll count includes the late WhatsApp edit.',
    ],
    handoffNotes: 'Use croissant dough first; fridge shelf 2 is tagged.',
  },
];
