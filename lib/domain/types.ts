export type UserRole = 'owner_admin' | 'sales' | 'kitchen' | 'shift_lead';

export type OrderStatus = 'draft' | 'active' | 'changed' | 'cancelled' | 'completed';
export type OrderLineStatus = 'draft' | 'planned' | 'in_progress' | 'done' | 'cancelled';
export type OrderSource = 'manual' | 'whatsapp' | 'phone' | 'walk_in' | 'generated';
export type DestinationKind = 'pickup' | 'delivery_stop' | 'counter' | 'internal';
export type WipStatus = 'planned' | 'in_progress' | 'ready' | 'consumed' | 'discarded';
export type WipStage = 'prepared' | 'shaped' | 'baked' | 'ready';
export type ShiftStatus = 'open' | 'ready_for_handoff' | 'acknowledged' | 'closed';
export type ShiftNoteState = 'info' | 'watch' | 'blocked' | 'done';

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
  lines: OrderLine[];
}

export interface RecurringTemplate {
  id: string;
  templateType: 'customer_order' | 'internal_task';
  title: string;
  scheduleRule: string;
  active: boolean;
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
