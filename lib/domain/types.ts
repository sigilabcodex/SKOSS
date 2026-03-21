export type UserRole = 'owner_admin' | 'sales' | 'kitchen' | 'shift_lead';

export type OrderStatus = 'draft' | 'active' | 'changed' | 'cancelled' | 'completed';
export type OrderLineStatus = 'pending' | 'in_progress' | 'done' | 'cancelled';
export type OrderSource = 'manual' | 'whatsapp' | 'phone' | 'walk_in' | 'generated';
export type DestinationKind = 'pickup' | 'delivery_stop' | 'counter' | 'internal';
export type WipStatus = 'planned' | 'in_progress' | 'ready' | 'consumed' | 'discarded';
export type WipStage = 'prepared' | 'shaped' | 'baked' | 'ready';
export type ShiftStatus = 'open' | 'ready_for_handoff' | 'acknowledged' | 'closed';
export type ShiftNoteState = 'info' | 'watch' | 'blocked' | 'done';
export type RecurrenceFrequency = 'daily' | 'weekly';
export type WeekdayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  defaultProductionCutoffHour: number;
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  workspaceId: string;
  active: boolean;
}

export interface Destination {
  id: string;
  name: string;
  kind: DestinationKind;
  notes?: string;
  active: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  defaultUnit: string;
  productionTag?: string;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  category?: string;
  baseDoughId?: string;
  defaultUnit: string;
  active: boolean;
  variants: ProductVariant[];
}

export interface OrderLine {
  id: string;
  lineType: 'product_variant' | 'draft_product' | 'note_item';
  productLabel: string;
  quantity: number;
  completedQuantity: number;
  unit: string;
  lineStatus: OrderLineStatus;
  note?: string;
}

export interface Order {
  id: string;
  source: OrderSource;
  status: OrderStatus;
  customerLabel: string;
  customerPhone?: string;
  destinationLabel?: string;
  dueDate: string;
  productionDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  changedInKitchen: boolean;
  visibleOnProductionBoard: boolean;
  templateId?: string;
  templateTitle?: string;
  generatedOccurrenceDate?: string;
  generatedFromTemplate: boolean;
  templateEdited: boolean;
  lines: OrderLine[];
}

export interface RecurringTemplateLine {
  id: string;
  lineType: OrderLine['lineType'];
  productLabel: string;
  quantity: number;
  unit: string;
  note?: string;
}

export interface RecurringTemplate {
  id: string;
  templateType: 'customer_order';
  customerLabel: string;
  destinationLabel?: string;
  customerPhone?: string;
  notes?: string;
  frequency: RecurrenceFrequency;
  weeklyDays: WeekdayKey[];
  nextOccurrenceDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lines: RecurringTemplateLine[];
}

export interface WipEntry {
  id: string;
  productionDate: string;
  shiftKey: 'night' | 'morning' | 'afternoon';
  wipType: 'base_dough' | 'prep' | 'baked_items' | 'packed_items' | 'other';
  referenceLabel: string;
  quantity: number;
  unit: string;
  stage: WipStage;
  status: WipStatus;
  notes?: string;
  updatedAt: string;
}

export interface ShiftNote {
  id: string;
  authorLabel: string;
  note: string;
  state: ShiftNoteState;
  linkedItemLabel?: string;
  createdAt: string;
}

export interface ShiftLog {
  id: string;
  productionDate: string;
  shiftKey: 'night' | 'morning' | 'afternoon';
  status: ShiftStatus;
  summary: string;
  openItems: string[];
  handoffNotes: string;
  updatedAt: string;
  shiftNotes: ShiftNote[];
}

export interface AppData {
  workspace: Workspace;
  users: User[];
  destinations: Destination[];
  products: Product[];
  recurringTemplates: RecurringTemplate[];
  orders: Order[];
  wipEntries: WipEntry[];
  shiftLogs: ShiftLog[];
}
