import type {
  AppData,
  Customer,
  CustomerContactMethod,
  DeliveryProvider,
  FulfillmentType,
  Order,
  OrderLine,
  Product,
  RawMaterial,
  Recipe,
  RecurringTemplate,
  ShiftLog,
  ShiftNote,
  Supplier,
  SupplierPriceEntry,
  User,
  UserRole,
  WeekdayKey,
  WipEntry,
  WorkspaceSurface,
} from '@/lib/domain/types';
import { calculateRecipeEstimatedMaterialCost } from '@/lib/domain/recipe-costing';
import { deliveryProviderValues, getFocusDate, getLineCompletion, getLineStatus, getOrderProgress, getAllProductionDates, resolveDeliveryProviderLabel } from '@/lib/domain/order-helpers';
import { readStore } from '@/lib/server/store';
import { getDefaultWorkspaceForRole } from '@/lib/workspaces';

export { getLineStatus, getOrderProgress } from '@/lib/domain/order-helpers';

export interface OrderFormValues {
  customerId?: string;
  customerLabel: string;
  customerPhone?: string;
  destinationLabel?: string;
  fulfillmentType: FulfillmentType;
  deliveryProvider?: DeliveryProvider;
  deliveryProviderCustom?: string;
  deliveryAssignee?: string;
  promisedTime?: string;
  dispatchNotes?: string;
  dueDate: string;
  productionDate: string;
  notes?: string;
  source: Order['source'];
  status: Order['status'];
  changedInKitchen: boolean;
  visibleOnProductionBoard: boolean;
  lines: Array<{
    lineType: OrderLine['lineType'];
    productLabel: string;
    quantity: number;
    unit: string;
    note?: string;
  }>;
}

export interface SupplierFormValues {
  name: string;
  contact?: string;
  notes?: string;
  active: boolean;
}

export interface CustomerFormValues {
  displayName: string;
  phone?: string;
  email?: string;
  preferredContactMethod?: CustomerContactMethod;
  address?: string;
  deliveryNote?: string;
  internalNote?: string;
  active: boolean;
}

export interface CustomerOrderContext {
  linkedOrderCount: number;
  lastOrderDate?: string;
  recentOrders: Array<{
    id: string;
    productionDate: string;
    fulfillmentType: Order['fulfillmentType'];
    destinationLabel?: string;
    promisedTime?: string;
  }>;
}

export interface RawMaterialFormValues {
  name: string;
  category?: string;
  defaultUnit?: string;
  brand?: string;
  notes?: string;
  active: boolean;
}

export interface RecipeFormValues {
  productId: string;
  productVariantId?: string;
  title?: string;
  batchYieldQuantity?: number;
  batchYieldUnit?: string;
  instructions?: string;
  active: boolean;
  lines: Array<{
    id?: string;
    rawMaterialId: string;
    quantity?: number;
    unit?: string;
    note?: string;
    remove: boolean;
  }>;
}

export interface SupplierPriceEntryFormValues {
  supplierId: string;
  rawMaterialId: string;
  presentation?: string;
  brand?: string;
  packageQuantity?: number;
  packageUnit?: string;
  price: number;
  priceDate: string;
  note?: string;
}

export interface RecurringTemplateFormValues {
  customerLabel: string;
  customerPhone?: string;
  destinationLabel?: string;
  notes?: string;
  frequency: RecurringTemplate['frequency'];
  weeklyDays: WeekdayKey[];
  nextOccurrenceDate: string;
  lines: Array<{
    lineType: OrderLine['lineType'];
    productLabel: string;
    quantity: number;
    unit: string;
    note?: string;
  }>;
}

export interface UserFormValues {
  displayName: string;
  loginIdentifier: string;
  password?: string;
  resetPassword: boolean;
  role: UserRole;
  defaultWorkspace: WorkspaceSurface;
  active: boolean;
}

export const weekdayOptions: Array<{ value: WeekdayKey; label: string; index: number }> = [
  { value: 'sun', label: 'Sun', index: 0 },
  { value: 'mon', label: 'Mon', index: 1 },
  { value: 'tue', label: 'Tue', index: 2 },
  { value: 'wed', label: 'Wed', index: 3 },
  { value: 'thu', label: 'Thu', index: 4 },
  { value: 'fri', label: 'Fri', index: 5 },
  { value: 'sat', label: 'Sat', index: 6 },
];

function sortOrders(left: Order, right: Order) {
  return left.productionDate === right.productionDate
    ? right.updatedAt.localeCompare(left.updatedAt)
    : left.productionDate.localeCompare(right.productionDate);
}

function sortShiftLogs(left: ShiftLog, right: ShiftLog) {
  return right.updatedAt.localeCompare(left.updatedAt);
}

function getProductLabel(product: Pick<Product, 'name'>, variant?: { name: string } | null) {
  return variant ? `${product.name} / ${variant.name}` : product.name;
}

function getProductSuggestions(products: Array<{ name: string; variants: Array<{ name: string }> }>) {
  return products.flatMap((product) => product.variants.map((variant) => `${product.name} / ${variant.name}`));
}

function getCustomerById(customers: Customer[], customerId?: string) {
  if (!customerId) {
    return null;
  }

  return customers.find((customer) => customer.id === customerId) ?? null;
}

function toStageStatus(stage: WipEntry['stage']): WipEntry['status'] {
  return stage === 'ready' || stage === 'baked' ? 'ready' : 'in_progress';
}

function hasOrderCoreChanges(existingOrder: Order, values: OrderFormValues) {
  const nextLines = values.lines.filter((line) => line.productLabel.trim() && line.quantity > 0);

  return (
    (existingOrder.customerId ?? '') !== (values.customerId ?? '') ||
    existingOrder.customerLabel !== values.customerLabel.trim() ||
    (existingOrder.customerPhone ?? '') !== (values.customerPhone?.trim() ?? '') ||
    (existingOrder.destinationLabel ?? '') !== (values.destinationLabel?.trim() ?? '') ||
    existingOrder.fulfillmentType !== values.fulfillmentType ||
    (existingOrder.deliveryProvider ?? '') !== (values.deliveryProvider ?? '') ||
    (existingOrder.deliveryProviderLabel ?? '') !== (values.deliveryProviderCustom?.trim() ?? '') ||
    (existingOrder.deliveryAssignee ?? '') !== (values.deliveryAssignee?.trim() ?? '') ||
    (existingOrder.promisedTime ?? '') !== (values.promisedTime ?? '') ||
    (existingOrder.dispatchNotes ?? '') !== (values.dispatchNotes?.trim() ?? '') ||
    existingOrder.productionDate !== values.productionDate ||
    existingOrder.dueDate !== values.dueDate ||
    (existingOrder.notes ?? '') !== (values.notes?.trim() ?? '') ||
    existingOrder.visibleOnProductionBoard !== values.visibleOnProductionBoard ||
    existingOrder.lines.length !== nextLines.length ||
    existingOrder.lines.some((line, index) => {
      const nextLine = nextLines[index];
      return (
        !nextLine ||
        line.lineType !== nextLine.lineType ||
        line.productLabel !== nextLine.productLabel.trim() ||
        line.quantity !== nextLine.quantity ||
        line.unit !== (nextLine.unit.trim() || 'pieces') ||
        (line.note ?? '') !== (nextLine.note?.trim() ?? '')
      );
    })
  );
}

export function buildOrderRecord(data: AppData, values: OrderFormValues, actorUserId?: string, existingOrder?: Order): Order {
  const now = new Date().toISOString();
  const customer = getCustomerById(data.customers, values.customerId);
  const cleanInputLines = values.lines.filter((line) => line.productLabel.trim() && line.quantity > 0);
  const cleanLines: OrderLine[] = cleanInputLines.map((line, index) => {
    const previousLine = existingOrder?.lines[index];
    const completedQuantity = Math.max(0, Math.min(line.quantity, previousLine?.completedQuantity ?? 0));
    const lineStatus = previousLine?.lineStatus ?? 'pending';

    return {
      id: previousLine?.id ?? `line-${crypto.randomUUID()}`,
      lineType: line.lineType,
      productLabel: line.productLabel.trim(),
      quantity: line.quantity,
      completedQuantity,
      unit: line.unit.trim() || 'pieces',
      lineStatus: getLineStatus({ quantity: line.quantity, completedQuantity, lineStatus }),
      note: line.note?.trim() || undefined,
    };
  });

  const changedInKitchen = values.changedInKitchen || values.status === 'changed';
  const templateEdited = existingOrder?.generatedFromTemplate
    ? existingOrder.templateEdited || hasOrderCoreChanges(existingOrder, values)
    : existingOrder?.templateEdited ?? false;
  const nextStatus = values.status === 'changed'
    ? 'changed'
    : changedInKitchen && values.status === 'active'
      ? 'changed'
      : values.status;

  return {
    id: existingOrder?.id ?? `order-${crypto.randomUUID()}`,
    source: values.source,
    status: nextStatus,
    fulfillmentType: values.fulfillmentType,
    customerId: customer?.id,
    customerLabel: values.customerLabel.trim() || customer?.displayName || 'Walk-in customer',
    customerPhone: values.customerPhone?.trim() || customer?.phone || undefined,
    destinationLabel: values.destinationLabel?.trim() || undefined,
    deliveryProvider: values.deliveryProvider || undefined,
    deliveryProviderLabel: values.deliveryProvider === 'other' ? values.deliveryProviderCustom?.trim() || undefined : undefined,
    deliveryAssignee: values.deliveryAssignee?.trim() || undefined,
    promisedTime: values.promisedTime || undefined,
    dispatchNotes: values.dispatchNotes?.trim() || undefined,
    dueDate: values.dueDate,
    productionDate: values.productionDate,
    notes: values.notes?.trim() || undefined,
    createdAt: existingOrder?.createdAt ?? now,
    updatedAt: now,
    createdByUserId: existingOrder?.createdByUserId ?? actorUserId,
    updatedByUserId: actorUserId ?? existingOrder?.updatedByUserId,
    changedInKitchen,
    visibleOnProductionBoard: values.visibleOnProductionBoard,
    templateId: existingOrder?.templateId,
    templateTitle: existingOrder?.templateTitle,
    generatedOccurrenceDate: existingOrder?.generatedOccurrenceDate,
    generatedFromTemplate: existingOrder?.generatedFromTemplate ?? values.source === 'generated',
    templateEdited,
    lines: cleanLines,
  };
}

export function buildRecurringTemplateRecord(values: RecurringTemplateFormValues, actorUserId?: string): RecurringTemplate {
  const now = new Date().toISOString();

  return {
    id: `template-${crypto.randomUUID()}`,
    templateType: 'customer_order',
    customerLabel: values.customerLabel.trim(),
    customerPhone: values.customerPhone?.trim() || undefined,
    destinationLabel: values.destinationLabel?.trim() || undefined,
    notes: values.notes?.trim() || undefined,
    frequency: values.frequency,
    weeklyDays: values.frequency === 'weekly' ? values.weeklyDays : [],
    nextOccurrenceDate: values.nextOccurrenceDate,
    active: true,
    createdAt: now,
    updatedAt: now,
    createdByUserId: actorUserId,
    updatedByUserId: actorUserId,
    lines: values.lines
      .filter((line) => line.productLabel.trim() && line.quantity > 0)
      .map((line) => ({
        id: `template-line-${crypto.randomUUID()}`,
        lineType: line.lineType,
        productLabel: line.productLabel.trim(),
        quantity: line.quantity,
        unit: line.unit.trim() || 'pieces',
        note: line.note?.trim() || undefined,
      })),
  };
}

const supportedUserRoles: UserRole[] = ['admin', 'manager', 'production', 'frontdesk', 'delivery'];
const supportedWorkspaceDefaults: WorkspaceSurface[] = ['home', 'timeline', 'orders', 'customers', 'production', 'handoff', 'preferences', 'setup'];

export function normalizeUserForm(formData: FormData): UserFormValues {
  const requestedRole = String(formData.get('role') ?? 'frontdesk') as UserRole;
  const requestedWorkspace = String(formData.get('defaultWorkspace') ?? '') as WorkspaceSurface;
  const role = supportedUserRoles.includes(requestedRole) ? requestedRole : 'frontdesk';

  return {
    displayName: String(formData.get('displayName') ?? ''),
    loginIdentifier: String(formData.get('loginIdentifier') ?? ''),
    password: String(formData.get('password') ?? ''),
    resetPassword: formData.get('resetPassword') !== null,
    role,
    defaultWorkspace: supportedWorkspaceDefaults.includes(requestedWorkspace)
      ? requestedWorkspace
      : getDefaultWorkspaceForRole(role),
    active: formData.get('active') !== null,
  };
}

export function validateUserForm(values: UserFormValues, data: Pick<AppData, 'users'>, existingUserId?: string) {
  if (!values.displayName.trim()) {
    return 'User name is required.';
  }

  if (!values.loginIdentifier.trim()) {
    return 'Login identifier is required.';
  }

  const normalizedIdentifier = values.loginIdentifier.trim().toLowerCase();
  const duplicate = data.users.find((user) => user.loginIdentifier.trim().toLowerCase() === normalizedIdentifier && user.id !== existingUserId);
  if (duplicate) {
    return 'Login identifier must stay unique.';
  }

  if (!existingUserId && !values.password?.trim()) {
    return 'Password is required for a new user.';
  }

  return null;
}

export function buildUserRecord(
  values: UserFormValues,
  data: Pick<AppData, 'workspace'>,
  existingUser?: User,
): User {
  const now = new Date().toISOString();
  const defaultWorkspace = values.defaultWorkspace || getDefaultWorkspaceForRole(values.role);

  return {
    id: existingUser?.id ?? `user-${crypto.randomUUID()}` ,
    displayName: values.displayName.trim(),
    loginIdentifier: values.loginIdentifier.trim().toLowerCase(),
    passwordHash: existingUser?.passwordHash ?? '',
    passwordUpdatedAt: existingUser?.passwordUpdatedAt,
    mustChangePassword: existingUser?.mustChangePassword ?? false,
    role: values.role,
    workspaceId: existingUser?.workspaceId ?? data.workspace.id,
    defaultWorkspace,
    active: values.active,
    preferences: {
      ...existingUser?.preferences,
      defaultWorkspace,
    },
    createdAt: existingUser?.createdAt ?? now,
    updatedAt: now,
  };
}

export async function getWorkspaceSummary() {
  const data = await readStore();
  const focusDate = getFocusDate(data);
  const ordersToday = data.orders.filter((order) => order.productionDate === focusDate);
  const activePriceEntries = data.supplierPriceEntries.filter((entry) => entry.priceDate <= focusDate);

  return {
    workspace: data.workspace,
    preferences: data.preferences,
    focusDate,
    ordersToday: ordersToday.length,
    changedOrders: ordersToday.filter(
      (order) => order.status === 'changed' || order.changedInKitchen || order.templateEdited,
    ).length,
    readyWip: data.wipEntries.filter((entry) => entry.productionDate === focusDate && entry.status === 'ready').length,
    recurringTemplates: data.recurringTemplates.filter((template) => template.active).length,
    partialOrders: ordersToday.filter((order) => getOrderProgress(order).partialLines > 0).length,
    suppliers: data.suppliers.filter((supplier) => supplier.active).length,
    rawMaterials: data.rawMaterials.filter((material) => material.active).length,
    procurementPrices: activePriceEntries.length,
  };
}

export async function getOrdersWorkspace() {
  const data = await readStore();
  const dates = getAllProductionDates(data);
  const focusDate = getFocusDate(data);
  const orders = [...data.orders].sort(sortOrders);
  const customers = [...data.customers].sort((left, right) => left.displayName.localeCompare(right.displayName));
  const recurringTemplates = [...data.recurringTemplates].sort((left, right) =>
    left.nextOccurrenceDate === right.nextOccurrenceDate
      ? left.customerLabel.localeCompare(right.customerLabel)
      : left.nextOccurrenceDate.localeCompare(right.nextOccurrenceDate),
  );

  return {
    focusDate,
    dates,
    orders,
    customers,
    recurringTemplates,
    orderGroups: dates
      .map((productionDate) => ({
        productionDate,
        orders: orders.filter((order) => order.productionDate === productionDate),
      }))
      .filter((group) => group.orders.length > 0),
    productSuggestions: getProductSuggestions(data.products),
    destinations: data.destinations,
    sources: ['manual', 'whatsapp', 'phone', 'walk_in'] as const,
  };
}

export async function getCustomersWorkspace(selectedCustomerId?: string) {
  const data = await readStore();
  const customers = [...data.customers].sort((left, right) => left.displayName.localeCompare(right.displayName));
  const orderCountByCustomer = new Map<string, number>();
  const lastOrderDateByCustomer = new Map<string, string>();
  for (const order of [...data.orders].sort(sortOrders)) {
    if (!order.customerId) {
      continue;
    }

    orderCountByCustomer.set(order.customerId, (orderCountByCustomer.get(order.customerId) ?? 0) + 1);
    if (!lastOrderDateByCustomer.has(order.customerId)) {
      lastOrderDateByCustomer.set(order.customerId, order.productionDate);
    }
  }
  const selectedCustomer = selectedCustomerId
    ? customers.find((customer) => customer.id === selectedCustomerId) ?? null
    : null;
  const customerOrderHistory = selectedCustomer
    ? [...data.orders]
      .filter((order) => order.customerId === selectedCustomer.id)
      .sort(sortOrders)
      .slice(0, 8)
    : [];

  return {
    customers,
    selectedCustomer,
    customerOrderHistory,
    orderCountByCustomer,
    lastOrderDateByCustomer,
    activeCustomers: customers.filter((customer) => customer.active).length,
    inactiveCustomers: customers.filter((customer) => !customer.active).length,
    linkedOrders: data.orders.filter((order) => order.customerId).length,
  };
}

export async function getOrderEditor(orderId?: string, initialCustomerId?: string) {
  const data = await readStore();
  const order = orderId ? data.orders.find((entry) => entry.id === orderId) ?? null : null;
  const customerContextById: Record<string, CustomerOrderContext> = {};

  for (const customer of data.customers) {
    const recentOrders = [...data.orders]
      .filter((entry) => entry.customerId === customer.id)
      .sort(sortOrders);

    customerContextById[customer.id] = {
      linkedOrderCount: recentOrders.length,
      lastOrderDate: recentOrders[0]?.productionDate,
      recentOrders: recentOrders.slice(0, 3).map((entry) => ({
        id: entry.id,
        productionDate: entry.productionDate,
        fulfillmentType: entry.fulfillmentType,
        destinationLabel: entry.destinationLabel,
        promisedTime: entry.promisedTime,
      })),
    };
  }

  return {
    order,
    customers: [...data.customers].sort((left, right) => left.displayName.localeCompare(right.displayName)),
    customerContextById,
    destinations: data.destinations,
    productSuggestions: getProductSuggestions(data.products),
    focusDate: getFocusDate(data),
    initialCustomerId,
  };
}

export async function getRecurringTemplateEditor() {
  const data = await readStore();

  return {
    destinations: data.destinations,
    productSuggestions: getProductSuggestions(data.products),
    focusDate: getFocusDate(data),
    weekdayOptions,
  };
}

function getOrderFulfillmentState(order: Order) {
  const progress = getOrderProgress(order);
  const providerLabel = resolveDeliveryProviderLabel(order);

  return {
    progress,
    providerLabel,
    needsPacking: (order.fulfillmentType === 'own_delivery' || order.fulfillmentType === 'app_delivery') && progress.remainingQuantity > 0,
    needsAssignment: order.fulfillmentType === 'own_delivery' && !order.deliveryAssignee?.trim(),
    waitingForPickup: order.fulfillmentType === 'pickup' && progress.remainingQuantity === 0 && order.status !== 'cancelled',
  };
}

function parsePromisedTimeMinutes(promisedTime?: string) {
  if (!promisedTime || !/^\d{2}:\d{2}$/.test(promisedTime)) {
    return null;
  }

  const [hours, minutes] = promisedTime.split(':').map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : null;
}

function groupOrdersByDate(orders: Order[]) {
  const grouped = new Map<string, Order[]>();

  for (const order of orders) {
    const existing = grouped.get(order.productionDate) ?? [];
    existing.push(order);
    grouped.set(order.productionDate, existing);
  }

  return grouped;
}

export async function getTimelineWorkspace() {
  const data = await readStore();
  const focusDate = getFocusDate(data);
  const today = new Date().toISOString().slice(0, 10);
  const currentMinutes = new Date().getUTCHours() * 60 + new Date().getUTCMinutes();
  const activeOrders = [...data.orders]
    .filter((order) => order.status !== 'cancelled')
    .sort(sortOrders);
  const groupedByDate = groupOrdersByDate(activeOrders);
  const focusOrders = groupedByDate.get(focusDate) ?? [];
  const firstTimedFocusOrder = focusOrders
    .filter((order) => parsePromisedTimeMinutes(order.promisedTime) !== null)
    .sort((left, right) => (parsePromisedTimeMinutes(left.promisedTime) ?? 1440) - (parsePromisedTimeMinutes(right.promisedTime) ?? 1440))[0];
  const referenceMinutes = focusDate === today
    ? currentMinutes
    : parsePromisedTimeMinutes(firstTimedFocusOrder?.promisedTime) ?? 8 * 60;
  const dueNowEnd = referenceMinutes + 30;
  const comingSoonEnd = referenceMinutes + 180;

  const entries = activeOrders.map((order) => {
    const progress = getOrderProgress(order);
    const customer = getCustomerById(data.customers, order.customerId);
    const promisedMinutes = parsePromisedTimeMinutes(order.promisedTime);
    const isPastDate = order.productionDate < focusDate;
    const isSameDay = order.productionDate === focusDate;
    const isOverdueOnFocusDay = focusDate === today
      && isSameDay
      && promisedMinutes !== null
      && promisedMinutes < referenceMinutes
      && order.status !== 'completed';
    const isOverdue = isPastDate || isOverdueOnFocusDay;
    const dueNow = isSameDay
      && !isOverdue
      && promisedMinutes !== null
      && promisedMinutes <= dueNowEnd;
    const comingSoon = isSameDay
      && !isOverdue
      && promisedMinutes !== null
      && promisedMinutes > dueNowEnd
      && promisedMinutes <= comingSoonEnd;
    const timingBucket = isOverdue
      ? 'overdue'
      : dueNow
        ? 'due_now'
        : comingSoon
          ? 'coming_soon'
          : isSameDay
            ? 'later_today'
            : order.productionDate > focusDate
              ? 'upcoming'
              : 'unscheduled';

    return {
      id: order.id,
      orderId: order.id,
      customerId: order.customerId,
      customerLabel: order.customerLabel,
      customerPhone: order.customerPhone ?? customer?.phone,
      customerDeliveryNote: customer?.deliveryNote,
      destinationLabel: order.destinationLabel,
      fulfillmentType: order.fulfillmentType,
      deliveryProvider: order.deliveryProvider,
      providerLabel: resolveDeliveryProviderLabel(order),
      deliveryAssignee: order.deliveryAssignee,
      promisedTime: order.promisedTime,
      promisedMinutes,
      productionDate: order.productionDate,
      dueDate: order.dueDate,
      status: order.status,
      changed: order.status === 'changed' || order.changedInKitchen || order.templateEdited,
      generatedFromTemplate: order.generatedFromTemplate,
      visibleOnProductionBoard: order.visibleOnProductionBoard,
      dispatchNotes: order.dispatchNotes,
      notes: order.notes,
      remainingQuantity: progress.remainingQuantity,
      completedQuantity: progress.completedQuantity,
      requiredQuantity: progress.requiredQuantity,
      partialLines: progress.partialLines,
      lineSummary: order.lines
        .filter((line) => line.lineType !== 'note_item')
        .slice(0, 2)
        .map((line) => `${line.quantity} ${line.unit} ${line.productLabel}`),
      extraLineCount: Math.max(0, order.lines.filter((line) => line.lineType !== 'note_item').length - 2),
      timingBucket,
      dueNow,
      comingSoon,
      isOverdue,
      needsAssignment: order.fulfillmentType === 'own_delivery' && !order.deliveryAssignee?.trim(),
      readyForPickup: order.fulfillmentType === 'pickup' && progress.remainingQuantity === 0 && order.status !== 'completed',
      readyForDispatch: (order.fulfillmentType === 'own_delivery' || order.fulfillmentType === 'app_delivery') && progress.remainingQuantity === 0,
    };
  });

  const focusEntries = entries
    .filter((entry) => entry.productionDate === focusDate)
    .sort((left, right) => (left.promisedMinutes ?? 1440) - (right.promisedMinutes ?? 1440));
  const overdueEntries = entries.filter((entry) => entry.isOverdue);
  const dueNowEntries = focusEntries.filter((entry) => entry.timingBucket === 'due_now');
  const comingSoonEntries = focusEntries.filter((entry) => entry.timingBucket === 'coming_soon');
  const laterTodayEntries = focusEntries.filter((entry) => entry.timingBucket === 'later_today');
  const upcomingEntries = entries.filter((entry) => entry.timingBucket === 'upcoming');
  const upcomingEntriesByDate = new Map<string, typeof upcomingEntries>();

  for (const entry of upcomingEntries) {
    const existing = upcomingEntriesByDate.get(entry.productionDate) ?? [];
    existing.push(entry);
    upcomingEntriesByDate.set(entry.productionDate, existing);
  }

  return {
    focusDate,
    today,
    referenceMinutes,
    focusEntries,
    overdueEntries,
    dueNowEntries,
    comingSoonEntries,
    laterTodayEntries,
    upcomingDateGroups: Array.from(upcomingEntriesByDate.entries()).map(([productionDate, groupedEntries]) => ({
      productionDate,
      entries: [...groupedEntries].sort((left, right) => (left.promisedMinutes ?? 1440) - (right.promisedMinutes ?? 1440)),
      count: groupedEntries.length,
    })),
    summary: {
      overdue: overdueEntries.length,
      dueNow: dueNowEntries.length,
      comingSoon: comingSoonEntries.length,
      laterToday: laterTodayEntries.length,
      needsAssignment: focusEntries.filter((entry) => entry.needsAssignment).length,
      readyForPickup: focusEntries.filter((entry) => entry.readyForPickup).length,
      readyForDispatch: focusEntries.filter((entry) => entry.readyForDispatch).length,
    },
  };
}

export async function getProductionBoard() {
  const data = await readStore();
  const dates = getAllProductionDates(data);

  return {
    dates,
    boards: dates.map((productionDate) => buildProductionDayView(data, productionDate)),
  };
}

function buildProductionDayView(data: AppData, productionDate: string) {
  const productionOrders = data.orders
    .filter((order) => order.productionDate === productionDate)
    .sort((left, right) => (left.destinationLabel ?? '').localeCompare(right.destinationLabel ?? ''));
  const boardOrders = productionOrders.filter((order) => order.visibleOnProductionBoard !== false);

  const groupedDemandMap = new Map<
    string,
    {
      label: string;
      quantity: number;
      completedQuantity: number;
      remainingQuantity: number;
      unit: string;
      orderCount: number;
      destinations: Set<string>;
      draft: boolean;
      partial: boolean;
      changed: boolean;
    }
  >();

  for (const order of boardOrders) {
    for (const line of order.lines) {
      if (line.lineType === 'note_item') {
        continue;
      }

      const completedQuantity = getLineCompletion(line);
      const existing = groupedDemandMap.get(line.productLabel);
      if (existing) {
        existing.quantity += line.quantity;
        existing.completedQuantity += completedQuantity;
        existing.remainingQuantity += Math.max(0, line.quantity - completedQuantity);
        existing.orderCount += 1;
        if (order.destinationLabel) {
          existing.destinations.add(order.destinationLabel);
        }
        if (line.lineType === 'draft_product') {
          existing.draft = true;
        }
        if (getLineStatus(line) === 'in_progress') {
          existing.partial = true;
        }
        if (order.status === 'changed' || order.changedInKitchen || order.templateEdited) {
          existing.changed = true;
        }
      } else {
        groupedDemandMap.set(line.productLabel, {
          label: line.productLabel,
          quantity: line.quantity,
          completedQuantity,
          remainingQuantity: Math.max(0, line.quantity - completedQuantity),
          unit: line.unit,
          orderCount: 1,
          destinations: new Set(order.destinationLabel ? [order.destinationLabel] : []),
          draft: line.lineType === 'draft_product',
          partial: getLineStatus(line) === 'in_progress',
          changed: order.status === 'changed' || order.changedInKitchen || order.templateEdited,
        });
      }
    }
  }

  const shiftLogs = data.shiftLogs
    .filter((entry) => entry.productionDate === productionDate)
    .sort(sortShiftLogs);
  const wipEntries = data.wipEntries.filter((entry) => entry.productionDate === productionDate);
  const handoffEntries = shiftLogs.flatMap((log) =>
    log.shiftNotes.map((note) => ({
      ...note,
      shiftKey: log.shiftKey,
      productionDate: log.productionDate,
    })),
  );
  const boardProgress = boardOrders.reduce(
    (summary, order) => {
      const progress = getOrderProgress(order);
      summary.requiredQuantity += progress.requiredQuantity;
      summary.completedQuantity += progress.completedQuantity;
      summary.remainingQuantity += progress.remainingQuantity;
      summary.partialOrders += progress.partialLines > 0 ? 1 : 0;
      return summary;
    },
    { requiredQuantity: 0, completedQuantity: 0, remainingQuantity: 0, partialOrders: 0 },
  );
  const fulfillmentSummary = productionOrders.reduce(
    (summary, order) => {
      summary[order.fulfillmentType] += 1;
      return summary;
    },
    { standard: 0, pickup: 0, own_delivery: 0, app_delivery: 0 },
  );
  const deliveryPackingQueue = boardOrders
    .map((order) => ({ order, state: getOrderFulfillmentState(order) }))
    .filter(({ state }) => state.needsPacking);
  const assignmentNeededOrders = boardOrders
    .map((order) => ({ order, state: getOrderFulfillmentState(order) }))
    .filter(({ state }) => state.needsAssignment);
  const pickupReadyOrders = boardOrders
    .map((order) => ({ order, state: getOrderFulfillmentState(order) }))
    .filter(({ state }) => state.waitingForPickup);

  return {
    productionDate,
    orders: productionOrders,
    boardOrders,
    groupedDemand: [...groupedDemandMap.values()].map((entry) => ({
      ...entry,
      destinations: [...entry.destinations],
    })),
    draftLines: boardOrders.flatMap((order) =>
      order.lines
        .filter((line) => line.lineType === 'draft_product' || line.lineType === 'note_item')
        .map((line) => ({
          customerId: order.customerId,
          id: line.id,
          label: line.productLabel,
          quantity: line.quantity,
          unit: line.unit,
          note: line.note ?? order.notes ?? 'Needs review',
          orderId: order.id,
          customerLabel: order.customerLabel,
        })),
    ),
    changedOrders: productionOrders.filter(
      (order) => order.status === 'changed' || order.changedInKitchen || order.templateEdited,
    ),
    hiddenOrders: productionOrders.filter((order) => order.visibleOnProductionBoard === false),
    wipEntries,
    handoffEntries,
    fulfillmentSummary,
    deliveryPackingQueue: deliveryPackingQueue.map(({ order, state }) => ({
      customerId: order.customerId,
      id: order.id,
      customerLabel: order.customerLabel,
      customerPhone: order.customerPhone ?? getCustomerById(data.customers, order.customerId)?.phone,
      deliveryNote: getCustomerById(data.customers, order.customerId)?.deliveryNote,
      destinationLabel: order.destinationLabel,
      deliveryProvider: order.deliveryProvider,
      providerLabel: state.providerLabel,
      promisedTime: order.promisedTime,
      remainingQuantity: state.progress.remainingQuantity,
      dispatchNotes: order.dispatchNotes,
    })),
    assignmentNeededOrders: assignmentNeededOrders.map(({ order, state }) => ({
      customerId: order.customerId,
      id: order.id,
      customerLabel: order.customerLabel,
      customerPhone: order.customerPhone ?? getCustomerById(data.customers, order.customerId)?.phone,
      deliveryNote: getCustomerById(data.customers, order.customerId)?.deliveryNote,
      destinationLabel: order.destinationLabel,
      deliveryProvider: order.deliveryProvider,
      providerLabel: state.providerLabel,
      promisedTime: order.promisedTime,
      dispatchNotes: order.dispatchNotes,
    })),
    pickupReadyOrders: pickupReadyOrders.map(({ order }) => ({
      customerId: order.customerId,
      id: order.id,
      customerLabel: order.customerLabel,
      customerPhone: order.customerPhone ?? getCustomerById(data.customers, order.customerId)?.phone,
      destinationLabel: order.destinationLabel,
      promisedTime: order.promisedTime,
      dispatchNotes: order.dispatchNotes,
    })),
    readyCount: wipEntries.filter((entry) => entry.status === 'ready').length,
    handoffCount: shiftLogs.length,
    boardProgress,
  };
}

export async function getHandoffWorkspace() {
  const data = await readStore();
  const dates = getAllProductionDates(data);
  const focusDate = getFocusDate(data);
  const logs = [...data.shiftLogs].sort(sortShiftLogs);
  const wipByDate = new Map<string, WipEntry[]>();

  for (const entry of data.wipEntries) {
    const existing = wipByDate.get(entry.productionDate) ?? [];
    existing.push(entry);
    wipByDate.set(entry.productionDate, existing);
  }

  const focusOrders = data.orders.filter((order) => order.productionDate === focusDate);
  const handoffFulfillment = focusOrders.map((order) => ({
    customerId: order.customerId,
    id: order.id,
    customerLabel: order.customerLabel,
    customerPhone: order.customerPhone ?? getCustomerById(data.customers, order.customerId)?.phone,
    deliveryNote: getCustomerById(data.customers, order.customerId)?.deliveryNote,
    destinationLabel: order.destinationLabel,
    fulfillmentType: order.fulfillmentType,
    deliveryProvider: order.deliveryProvider,
    providerLabel: resolveDeliveryProviderLabel(order),
    deliveryAssignee: order.deliveryAssignee,
    promisedTime: order.promisedTime,
    dispatchNotes: order.dispatchNotes,
    remainingQuantity: getOrderProgress(order).remainingQuantity,
  }));

  return {
    focusDate,
    dates,
    shiftLogs: logs,
    shiftLogMap: new Map(logs.map((log) => [`${log.productionDate}:${log.shiftKey}`, log])),
    wipByDate,
    focusOrders,
    packingWatch: handoffFulfillment.filter((order) => (order.fulfillmentType === 'own_delivery' || order.fulfillmentType === 'app_delivery') && order.remainingQuantity > 0),
    assignmentWatch: handoffFulfillment.filter((order) => order.fulfillmentType === 'own_delivery' && !order.deliveryAssignee),
    pickupWatch: handoffFulfillment.filter((order) => order.fulfillmentType === 'pickup' && order.remainingQuantity === 0),
  };
}

export async function getSetupWorkspace() {
  const data = await readStore();

  const latestPriceByMaterial = new Map<string, SupplierPriceEntry>();
  for (const entry of [...data.supplierPriceEntries].sort((left, right) => right.priceDate.localeCompare(left.priceDate))) {
    if (!latestPriceByMaterial.has(entry.rawMaterialId)) {
      latestPriceByMaterial.set(entry.rawMaterialId, entry);
    }
  }

  const recipes = [...data.recipes].sort((left, right) => left.title.localeCompare(right.title));

  return {
    ...data,
    suppliers: [...data.suppliers].sort((left, right) => left.name.localeCompare(right.name)),
    rawMaterials: [...data.rawMaterials].sort((left, right) => left.name.localeCompare(right.name)),
    recipes,
    supplierPriceEntries: [...data.supplierPriceEntries].sort((left, right) =>
      left.priceDate === right.priceDate
        ? left.rawMaterialLabel.localeCompare(right.rawMaterialLabel)
        : right.priceDate.localeCompare(left.priceDate),
    ),
    latestPriceByMaterial,
    recipeCostById: new Map(recipes.map((recipe) => [recipe.id, calculateRecipeEstimatedMaterialCost(recipe, latestPriceByMaterial)])),
  };
}

export function normalizeOrderForm(formData: FormData): OrderFormValues {
  const lineTypes = formData.getAll('lineType');
  const productLabels = formData.getAll('productLabel');
  const quantities = formData.getAll('quantity');
  const units = formData.getAll('unit');
  const lineNotes = formData.getAll('lineNote');

  const lines = productLabels.map((value, index) => ({
    lineType: (lineTypes[index] as OrderLine['lineType']) ?? 'draft_product',
    productLabel: String(value),
    quantity: Number(quantities[index] ?? 0),
    unit: String(units[index] ?? 'pieces'),
    note: String(lineNotes[index] ?? ''),
  }));

  const requestedProvider = String(formData.get('deliveryProvider') ?? '');
  const deliveryProvider = deliveryProviderValues.includes(requestedProvider as DeliveryProvider)
    ? requestedProvider as DeliveryProvider
    : undefined;

  return {
    customerId: String(formData.get('customerId') ?? ''),
    customerLabel: String(formData.get('customerLabel') ?? ''),
    customerPhone: String(formData.get('customerPhone') ?? ''),
    destinationLabel: String(formData.get('destinationLabel') ?? ''),
    fulfillmentType: String(formData.get('fulfillmentType') ?? 'standard') as FulfillmentType,
    deliveryProvider,
    deliveryProviderCustom: String(formData.get('deliveryProviderCustom') ?? ''),
    deliveryAssignee: String(formData.get('deliveryAssignee') ?? ''),
    promisedTime: String(formData.get('promisedTime') ?? ''),
    dispatchNotes: String(formData.get('dispatchNotes') ?? ''),
    dueDate: String(formData.get('dueDate') ?? ''),
    productionDate: String(formData.get('productionDate') ?? ''),
    notes: String(formData.get('notes') ?? ''),
    source: (String(formData.get('source') ?? 'manual') as Order['source']) ?? 'manual',
    status: (String(formData.get('status') ?? 'active') as Order['status']) ?? 'active',
    changedInKitchen: formData.get('changedInKitchen') === 'on',
    visibleOnProductionBoard: formData.get('visibleOnProductionBoard') !== null,
    lines,
  };
}

export function normalizeRecurringTemplateForm(formData: FormData): RecurringTemplateFormValues {
  const lineTypes = formData.getAll('lineType');
  const productLabels = formData.getAll('productLabel');
  const quantities = formData.getAll('quantity');
  const units = formData.getAll('unit');
  const lineNotes = formData.getAll('lineNote');
  const weeklyDays = formData.getAll('weeklyDays').map((value) => String(value) as WeekdayKey);

  return {
    customerLabel: String(formData.get('customerLabel') ?? ''),
    customerPhone: String(formData.get('customerPhone') ?? ''),
    destinationLabel: String(formData.get('destinationLabel') ?? ''),
    notes: String(formData.get('notes') ?? ''),
    frequency: String(formData.get('frequency') ?? 'daily') as RecurringTemplate['frequency'],
    weeklyDays,
    nextOccurrenceDate: String(formData.get('nextOccurrenceDate') ?? ''),
    lines: productLabels.map((value, index) => ({
      lineType: (lineTypes[index] as OrderLine['lineType']) ?? 'draft_product',
      productLabel: String(value),
      quantity: Number(quantities[index] ?? 0),
      unit: String(units[index] ?? 'pieces'),
      note: String(lineNotes[index] ?? ''),
    })),
  };
}

export function validateOrderForm(values: OrderFormValues) {
  if (!values.customerId?.trim() && !values.customerLabel.trim()) {
    return 'Add a customer name now, or link a saved customer.';
  }

  if (!values.productionDate || !values.dueDate) {
    return 'Production and delivery dates are required.';
  }

  if ((values.fulfillmentType === 'own_delivery' || values.fulfillmentType === 'app_delivery') && !values.destinationLabel?.trim()) {
    return 'Add a destination or route label for delivery orders.';
  }

  if (values.fulfillmentType === 'app_delivery' && !values.deliveryProvider) {
    return 'Add the app delivery source when using app delivery.';
  }

  if (values.deliveryProvider === 'other' && !values.deliveryProviderCustom?.trim()) {
    return 'Add a short custom provider label when choosing other.';
  }

  const usableLines = values.lines.filter((line) => line.productLabel.trim() && line.quantity > 0);
  if (usableLines.length === 0) {
    return 'Add at least one order line with a name and quantity.';
  }

  if (values.status === 'cancelled' && !values.notes?.trim()) {
    return 'Add a short note when cancelling an order.';
  }

  return null;
}

const supportedCustomerContactMethods: CustomerContactMethod[] = ['phone', 'email', 'whatsapp'];

export function normalizeCustomerForm(formData: FormData): CustomerFormValues {
  const requestedMethod = String(formData.get('preferredContactMethod') ?? '') as CustomerContactMethod;

  return {
    displayName: String(formData.get('displayName') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    email: String(formData.get('email') ?? ''),
    preferredContactMethod: supportedCustomerContactMethods.includes(requestedMethod) ? requestedMethod : undefined,
    address: String(formData.get('address') ?? ''),
    deliveryNote: String(formData.get('deliveryNote') ?? ''),
    internalNote: String(formData.get('internalNote') ?? ''),
    active: formData.get('active') !== null,
  };
}

export function validateCustomerForm(values: CustomerFormValues) {
  if (!values.displayName.trim()) {
    return 'Customer name is required.';
  }

  return null;
}

export function buildCustomerRecord(values: CustomerFormValues, actorUserId?: string, existingCustomer?: Customer): Customer {
  const now = new Date().toISOString();

  return {
    id: existingCustomer?.id ?? `customer-${crypto.randomUUID()}`,
    displayName: values.displayName.trim(),
    phone: values.phone?.trim() || undefined,
    email: values.email?.trim() || undefined,
    preferredContactMethod: values.preferredContactMethod,
    address: values.address?.trim() || undefined,
    deliveryNote: values.deliveryNote?.trim() || undefined,
    internalNote: values.internalNote?.trim() || undefined,
    active: values.active,
    createdAt: existingCustomer?.createdAt ?? now,
    updatedAt: now,
    createdByUserId: existingCustomer?.createdByUserId ?? actorUserId,
    updatedByUserId: actorUserId ?? existingCustomer?.updatedByUserId,
  };
}

export function normalizeSupplierForm(formData: FormData): SupplierFormValues {
  return {
    name: String(formData.get('name') ?? ''),
    contact: String(formData.get('contact') ?? ''),
    notes: String(formData.get('notes') ?? ''),
    active: formData.get('active') !== null,
  };
}

export function validateSupplierForm(values: SupplierFormValues) {
  if (!values.name.trim()) {
    return 'Supplier name is required.';
  }

  return null;
}

export function buildSupplierRecord(values: SupplierFormValues, actorUserId?: string, existingSupplier?: Supplier): Supplier {
  const now = new Date().toISOString();

  return {
    id: existingSupplier?.id ?? `supplier-${crypto.randomUUID()}`,
    name: values.name.trim(),
    contact: values.contact?.trim() || undefined,
    notes: values.notes?.trim() || undefined,
    active: values.active,
    createdAt: existingSupplier?.createdAt ?? now,
    updatedAt: now,
    createdByUserId: existingSupplier?.createdByUserId ?? actorUserId,
    updatedByUserId: actorUserId ?? existingSupplier?.updatedByUserId,
  };
}

export function normalizeRawMaterialForm(formData: FormData): RawMaterialFormValues {
  return {
    name: String(formData.get('name') ?? ''),
    category: String(formData.get('category') ?? ''),
    defaultUnit: String(formData.get('defaultUnit') ?? ''),
    brand: String(formData.get('brand') ?? ''),
    notes: String(formData.get('notes') ?? ''),
    active: formData.get('active') !== null,
  };
}

export function validateRawMaterialForm(values: RawMaterialFormValues) {
  if (!values.name.trim()) {
    return 'Raw material name is required.';
  }

  return null;
}

export function buildRawMaterialRecord(values: RawMaterialFormValues, actorUserId?: string, existingRawMaterial?: RawMaterial): RawMaterial {
  const now = new Date().toISOString();

  return {
    id: existingRawMaterial?.id ?? `raw-material-${crypto.randomUUID()}`,
    name: values.name.trim(),
    category: values.category?.trim() || undefined,
    defaultUnit: values.defaultUnit?.trim() || undefined,
    brand: values.brand?.trim() || undefined,
    notes: values.notes?.trim() || undefined,
    active: values.active,
    createdAt: existingRawMaterial?.createdAt ?? now,
    updatedAt: now,
    createdByUserId: existingRawMaterial?.createdByUserId ?? actorUserId,
    updatedByUserId: actorUserId ?? existingRawMaterial?.updatedByUserId,
  };
}

export function normalizeSupplierPriceEntryForm(formData: FormData): SupplierPriceEntryFormValues {
  const quantityValue = String(formData.get('packageQuantity') ?? '').trim();

  return {
    supplierId: String(formData.get('supplierId') ?? ''),
    rawMaterialId: String(formData.get('rawMaterialId') ?? ''),
    presentation: String(formData.get('presentation') ?? ''),
    brand: String(formData.get('brand') ?? ''),
    packageQuantity: quantityValue ? Number(quantityValue) : undefined,
    packageUnit: String(formData.get('packageUnit') ?? ''),
    price: Number(formData.get('price') ?? 0),
    priceDate: String(formData.get('priceDate') ?? ''),
    note: String(formData.get('note') ?? ''),
  };
}

export function validateSupplierPriceEntryForm(
  values: SupplierPriceEntryFormValues,
  data: Pick<AppData, 'suppliers' | 'rawMaterials'>,
) {
  if (!values.supplierId || !data.suppliers.find((supplier) => supplier.id === values.supplierId)) {
    return 'Choose a supplier for the price entry.';
  }

  if (!values.rawMaterialId || !data.rawMaterials.find((material) => material.id === values.rawMaterialId)) {
    return 'Choose a raw material for the price entry.';
  }

  if (values.packageQuantity !== undefined && (!Number.isFinite(values.packageQuantity) || values.packageQuantity <= 0)) {
    return 'Package quantity must be greater than zero when included.';
  }

  if ((values.packageQuantity !== undefined && !values.packageUnit?.trim())
    || (values.packageUnit?.trim() && values.packageQuantity === undefined)) {
    return 'Add both package quantity and package unit, or leave both blank.';
  }

  if (values.price <= 0) {
    return 'Price must be greater than zero.';
  }

  if (!values.priceDate) {
    return 'Choose the date the supplier price applied.';
  }

  return null;
}

export function buildSupplierPriceEntryRecord(
  values: SupplierPriceEntryFormValues,
  data: Pick<AppData, 'suppliers' | 'rawMaterials'>,
  actorUserId?: string,
): SupplierPriceEntry {
  const now = new Date().toISOString();
  const supplier = data.suppliers.find((entry) => entry.id === values.supplierId);
  const rawMaterial = data.rawMaterials.find((entry) => entry.id === values.rawMaterialId);

  if (!supplier || !rawMaterial) {
    throw new Error('Supplier or raw material missing when building price entry.');
  }

  return {
    id: `supplier-price-${crypto.randomUUID()}`,
    supplierId: supplier.id,
    supplierLabel: supplier.name,
    rawMaterialId: rawMaterial.id,
    rawMaterialLabel: rawMaterial.name,
    presentation: values.presentation?.trim() || undefined,
    brand: values.brand?.trim() || rawMaterial.brand || undefined,
    packageQuantity: values.packageQuantity,
    packageUnit: values.packageUnit?.trim() || undefined,
    price: values.price,
    priceDate: values.priceDate,
    note: values.note?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    createdByUserId: actorUserId,
    updatedByUserId: actorUserId,
  };
}

export function normalizeRecipeForm(formData: FormData): RecipeFormValues {
  const lineIds = formData.getAll('recipeLineId');
  const rawMaterialIds = formData.getAll('lineRawMaterialId');
  const quantities = formData.getAll('lineQuantity');
  const units = formData.getAll('lineUnit');
  const notes = formData.getAll('lineNote');
  const removeIndexes = new Set(
    formData.getAll('lineRemove').map((value) => Number(String(value).replace('remove-', ''))).filter(Number.isFinite),
  );
  const batchYieldQuantity = String(formData.get('batchYieldQuantity') ?? '').trim();

  return {
    productId: String(formData.get('productId') ?? ''),
    productVariantId: String(formData.get('productVariantId') ?? ''),
    title: String(formData.get('title') ?? ''),
    batchYieldQuantity: batchYieldQuantity ? Number(batchYieldQuantity) : undefined,
    batchYieldUnit: String(formData.get('batchYieldUnit') ?? ''),
    instructions: String(formData.get('instructions') ?? ''),
    active: formData.get('active') !== null,
    lines: rawMaterialIds.map((value, index) => ({
      id: String(lineIds[index] ?? ''),
      rawMaterialId: String(value),
      quantity: String(quantities[index] ?? '').trim() ? Number(quantities[index]) : undefined,
      unit: String(units[index] ?? ''),
      note: String(notes[index] ?? ''),
      remove: removeIndexes.has(index),
    })),
  };
}

export function validateRecipeForm(
  values: RecipeFormValues,
  data: Pick<AppData, 'products' | 'rawMaterials'>,
) {
  const product = data.products.find((entry) => entry.id === values.productId);
  if (!product) {
    return 'Choose the product this recipe supports.';
  }

  if (values.productVariantId) {
    const variant = product.variants.find((entry) => entry.id === values.productVariantId);
    if (!variant) {
      return 'Choose a variant that belongs to the selected product, or leave variant blank.';
    }
  }

  if (values.batchYieldQuantity !== undefined && (!Number.isFinite(values.batchYieldQuantity) || values.batchYieldQuantity <= 0)) {
    return 'Batch yield quantity must be greater than zero when included.';
  }

  if ((values.batchYieldQuantity !== undefined && !values.batchYieldUnit?.trim())
    || (values.batchYieldUnit?.trim() && values.batchYieldQuantity === undefined)) {
    return 'Add both batch yield quantity and unit, or leave both blank.';
  }

  for (const line of values.lines.filter((entry) => !entry.remove)) {
    const hasMaterial = Boolean(line.rawMaterialId);
    const hasQuantity = line.quantity !== undefined;
    const hasUnit = Boolean(line.unit?.trim());

    if (!hasMaterial && !hasQuantity && !hasUnit && !line.note?.trim()) {
      continue;
    }

    if (!hasMaterial) {
      return 'Choose a raw material for each recipe line you keep.';
    }

    if (!data.rawMaterials.find((entry) => entry.id === line.rawMaterialId)) {
      return 'One recipe line points to a raw material that no longer exists.';
    }

    if (!hasQuantity || !Number.isFinite(line.quantity) || Number(line.quantity) <= 0) {
      return 'Recipe line quantity must be greater than zero.';
    }

    if (!hasUnit) {
      return 'Add a unit for each recipe line you keep.';
    }
  }

  return null;
}

export function buildRecipeRecord(
  values: RecipeFormValues,
  data: Pick<AppData, 'products' | 'rawMaterials'>,
  actorUserId?: string,
  existingRecipe?: Recipe,
): Recipe {
  const now = new Date().toISOString();
  const product = data.products.find((entry) => entry.id === values.productId);

  if (!product) {
    throw new Error('Product missing when building recipe.');
  }

  const variant = values.productVariantId
    ? product.variants.find((entry) => entry.id === values.productVariantId)
    : undefined;

  const title = values.title?.trim() || getProductLabel(product, variant);

  const lines = values.lines
    .filter((line) => !line.remove)
    .filter((line) => line.rawMaterialId && line.quantity !== undefined && Number(line.quantity) > 0 && line.unit?.trim())
    .map((line) => {
      const material = data.rawMaterials.find((entry) => entry.id === line.rawMaterialId);
      if (!material) {
        throw new Error('Raw material missing when building recipe line.');
      }

      return {
        id: line.id?.trim() || `recipe-line-${crypto.randomUUID()}`,
        rawMaterialId: material.id,
        rawMaterialLabel: material.name,
        quantity: Number(line.quantity),
        unit: line.unit?.trim() || material.defaultUnit || 'unit',
        note: line.note?.trim() || undefined,
      };
    });

  return {
    id: existingRecipe?.id ?? `recipe-${crypto.randomUUID()}`,
    productId: product.id,
    productVariantId: variant?.id,
    title,
    batchYieldQuantity: values.batchYieldQuantity,
    batchYieldUnit: values.batchYieldUnit?.trim() || undefined,
    instructions: values.instructions?.trim() || undefined,
    active: values.active,
    createdAt: existingRecipe?.createdAt ?? now,
    updatedAt: now,
    createdByUserId: existingRecipe?.createdByUserId ?? actorUserId,
    updatedByUserId: actorUserId ?? existingRecipe?.updatedByUserId,
    lines,
  };
}

export function validateRecurringTemplateForm(values: RecurringTemplateFormValues) {
  if (!values.customerLabel.trim()) {
    return 'Add a customer or route label for the recurring order.';
  }

  if (!values.nextOccurrenceDate) {
    return 'Choose the next occurrence date to seed generation.';
  }

  if (values.frequency === 'weekly' && values.weeklyDays.length === 0) {
    return 'Choose at least one weekday for a weekly recurring order.';
  }

  const usableLines = values.lines.filter((line) => line.productLabel.trim() && line.quantity > 0);
  if (usableLines.length === 0) {
    return 'Add at least one recurring line with a name and quantity.';
  }

  return null;
}

export function buildWipEntry(formData: FormData, actorUserId?: string): WipEntry {
  const stage = String(formData.get('stage') ?? 'prepared') as WipEntry['stage'];

  return {
    id: `wip-${crypto.randomUUID()}`,
    productionDate: String(formData.get('productionDate') ?? ''),
    shiftKey: String(formData.get('shiftKey') ?? 'night') as WipEntry['shiftKey'],
    wipType: String(formData.get('wipType') ?? 'other') as WipEntry['wipType'],
    referenceLabel: String(formData.get('referenceLabel') ?? '').trim(),
    quantity: Number(formData.get('quantity') ?? 0),
    unit: String(formData.get('unit') ?? 'pieces').trim() || 'pieces',
    stage,
    status: toStageStatus(stage),
    notes: String(formData.get('notes') ?? '').trim() || undefined,
    updatedAt: new Date().toISOString(),
    createdByUserId: actorUserId,
    updatedByUserId: actorUserId,
  };
}

export function validateWipEntry(entry: WipEntry) {
  if (!entry.productionDate || !entry.referenceLabel || entry.quantity <= 0) {
    return 'WIP needs a production day, label, and quantity greater than zero.';
  }

  return null;
}

export function buildShiftLog(existing: ShiftLog | undefined, formData: FormData, actorUserId?: string): ShiftLog {
  return {
    id: existing?.id ?? `shift-${crypto.randomUUID()}`,
    productionDate: String(formData.get('productionDate') ?? ''),
    shiftKey: String(formData.get('shiftKey') ?? 'night') as ShiftLog['shiftKey'],
    status: String(formData.get('status') ?? 'open') as ShiftLog['status'],
    summary: String(formData.get('summary') ?? '').trim(),
    openItems: String(formData.get('openItems') ?? '')
      .split('\n')
      .map((value) => value.trim())
      .filter(Boolean),
    handoffNotes: String(formData.get('handoffNotes') ?? '').trim(),
    updatedAt: new Date().toISOString(),
    createdByUserId: existing?.createdByUserId ?? actorUserId,
    updatedByUserId: actorUserId ?? existing?.updatedByUserId,
    shiftNotes: existing?.shiftNotes ?? [],
  };
}

export function validateShiftLog(log: ShiftLog) {
  if (!log.productionDate || !log.summary) {
    return 'Shift handoff needs a production day and summary.';
  }

  return null;
}

export function buildShiftNote(formData: FormData, actorUserId?: string): ShiftNote {
  return {
    id: `shift-note-${crypto.randomUUID()}`,
    authorLabel: String(formData.get('authorLabel') ?? '').trim() || 'Shift note',
    authorUserId: actorUserId,
    note: String(formData.get('note') ?? '').trim(),
    state: String(formData.get('state') ?? 'info') as ShiftNote['state'],
    linkedItemLabel: String(formData.get('linkedItemLabel') ?? '').trim() || undefined,
    createdAt: new Date().toISOString(),
  };
}

export function validateShiftNote(note: ShiftNote, productionDate: string) {
  if (!productionDate || !note.note) {
    return 'Shift note needs a production day and note text.';
  }

  return null;
}
