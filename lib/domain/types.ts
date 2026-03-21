export type UserRole = 'owner_admin' | 'sales' | 'kitchen' | 'shift_lead';

export type OrderStatus = 'draft' | 'active' | 'changed' | 'cancelled' | 'completed';
export type OrderLineStatus = 'draft' | 'planned' | 'in_progress' | 'done' | 'cancelled';
export type OrderSource = 'manual' | 'whatsapp' | 'phone' | 'walk_in' | 'generated';
export type DestinationKind = 'pickup' | 'delivery_stop' | 'counter' | 'internal';
export type WipStatus = 'planned' | 'in_progress' | 'ready' | 'consumed' | 'discarded';
export type ShiftStatus = 'open' | 'ready_for_handoff' | 'acknowledged' | 'closed';

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
  destinationLabel?: string;
  dueDate: string;
  productionDate: string;
  notes?: string;
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
  wipType: 'base_dough' | 'prep' | 'baked_items' | 'packed_items' | 'other';
  referenceLabel: string;
  quantity: number;
  unit: string;
  status: WipStatus;
  notes?: string;
}

export interface ShiftLog {
  id: string;
  productionDate: string;
  shiftKey: 'night' | 'morning' | 'afternoon';
  status: ShiftStatus;
  summary: string;
  openItems: string[];
  handoffNotes: string;
}
