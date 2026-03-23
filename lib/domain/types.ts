import type { AppLocale, AppPreset } from '@/lib/i18n/config';

export type UserRole = 'admin' | 'manager' | 'production' | 'frontdesk' | 'delivery';
export type ThemeName = 'light' | 'dark' | 'system';
export type OperatingMode = 'pickup' | 'delivery' | 'mixed';
export type WorkspaceSurface = 'home' | 'orders' | 'customers' | 'production' | 'handoff' | 'preferences' | 'setup';
export type CustomerContactMethod = 'phone' | 'email' | 'whatsapp';

export type OrderStatus = 'draft' | 'active' | 'changed' | 'cancelled' | 'completed';
export type OrderLineStatus = 'pending' | 'in_progress' | 'done' | 'cancelled';
export type OrderSource = 'manual' | 'whatsapp' | 'phone' | 'walk_in' | 'generated';
export type FulfillmentType = 'standard' | 'pickup' | 'own_delivery' | 'app_delivery';
export type DeliveryProvider = 'internal' | 'uber' | 'rappi' | 'didi' | 'other';
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

export interface WorkspacePreferences {
  locale: AppLocale;
  preset: AppPreset;
  operatingMode: OperatingMode;
  theme: ThemeName;
  onboardingCompleted: boolean;
  completedAt?: string;
  updatedAt?: string;
}

export interface UserPreferences {
  locale?: AppLocale;
  theme?: ThemeName;
  defaultWorkspace?: WorkspaceSurface;
}

export interface User {
  id: string;
  displayName: string;
  loginIdentifier: string;
  role: UserRole;
  workspaceId: string;
  defaultWorkspace: WorkspaceSurface;
  active: boolean;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface SessionState {
  currentUserId?: string;
  lastLoginAt?: string;
}

export interface AuditFields {
  createdByUserId?: string;
  updatedByUserId?: string;
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

export interface Customer extends AuditFields {
  id: string;
  displayName: string;
  phone?: string;
  email?: string;
  preferredContactMethod?: CustomerContactMethod;
  address?: string;
  deliveryNote?: string;
  internalNote?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface Order extends AuditFields {
  id: string;
  source: OrderSource;
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
  customerId?: string;
  customerLabel: string;
  customerPhone?: string;
  destinationLabel?: string;
  deliveryProvider?: DeliveryProvider;
  deliveryProviderLabel?: string;
  deliveryAssignee?: string;
  promisedTime?: string;
  dispatchNotes?: string;
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

export interface Supplier extends AuditFields {
  id: string;
  name: string;
  contact?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RawMaterial extends AuditFields {
  id: string;
  name: string;
  category?: string;
  defaultUnit?: string;
  brand?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierPriceEntry extends AuditFields {
  id: string;
  supplierId: string;
  supplierLabel: string;
  rawMaterialId: string;
  rawMaterialLabel: string;
  presentation?: string;
  brand?: string;
  packageQuantity?: number;
  packageUnit?: string;
  price: number;
  priceDate: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeLine {
  id: string;
  rawMaterialId: string;
  rawMaterialLabel: string;
  quantity: number;
  unit: string;
  note?: string;
}

export interface Recipe extends AuditFields {
  id: string;
  productId: string;
  productVariantId?: string;
  title: string;
  batchYieldQuantity?: number;
  batchYieldUnit?: string;
  instructions?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lines: RecipeLine[];
}

export interface RecurringTemplateLine {
  id: string;
  lineType: OrderLine['lineType'];
  productLabel: string;
  quantity: number;
  unit: string;
  note?: string;
}

export interface RecurringTemplate extends AuditFields {
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

export interface WipEntry extends AuditFields {
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
  authorUserId?: string;
  note: string;
  state: ShiftNoteState;
  linkedItemLabel?: string;
  createdAt: string;
}

export interface ShiftLog extends AuditFields {
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
  preferences: WorkspacePreferences;
  session: SessionState;
  users: User[];
  customers: Customer[];
  destinations: Destination[];
  products: Product[];
  suppliers: Supplier[];
  rawMaterials: RawMaterial[];
  supplierPriceEntries: SupplierPriceEntry[];
  recipes: Recipe[];
  recurringTemplates: RecurringTemplate[];
  orders: Order[];
  wipEntries: WipEntry[];
  shiftLogs: ShiftLog[];
}
