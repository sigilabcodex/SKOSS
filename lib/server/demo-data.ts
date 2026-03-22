import type {
  AppData,
  DeliveryProvider,
  FulfillmentType,
  Order,
  OrderLine,
  RawMaterial,
  RecurringTemplate,
  ShiftLog,
  ShiftNote,
  Supplier,
  SupplierPriceEntry,
  WeekdayKey,
  WipEntry,
} from '@/lib/domain/types';
import { deliveryProviderValues, getFocusDate, getLineCompletion, getLineStatus, getOrderProgress, getAllProductionDates, resolveDeliveryProviderLabel } from '@/lib/domain/order-helpers';
import { readStore } from '@/lib/server/store';

export { getLineStatus, getOrderProgress } from '@/lib/domain/order-helpers';

export interface OrderFormValues {
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

export interface RawMaterialFormValues {
  name: string;
  category?: string;
  defaultUnit?: string;
  brand?: string;
  notes?: string;
  active: boolean;
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

function getProductSuggestions(products: Array<{ name: string; variants: Array<{ name: string }> }>) {
  return products.flatMap((product) => product.variants.map((variant) => `${product.name} / ${variant.name}`));
}

function toStageStatus(stage: WipEntry['stage']): WipEntry['status'] {
  return stage === 'ready' || stage === 'baked' ? 'ready' : 'in_progress';
}

function hasOrderCoreChanges(existingOrder: Order, values: OrderFormValues) {
  return (
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
    existingOrder.lines.length !== values.lines.filter((line) => line.productLabel.trim() && line.quantity > 0).length ||
    existingOrder.lines.some((line, index) => {
      const nextLine = values.lines.filter((entry) => entry.productLabel.trim() && entry.quantity > 0)[index];
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

export function buildOrderRecord(data: AppData, values: OrderFormValues, existingOrder?: Order): Order {
  const now = new Date().toISOString();
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
    customerLabel: values.customerLabel.trim() || 'Walk-in customer',
    customerPhone: values.customerPhone?.trim() || undefined,
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

export function buildRecurringTemplateRecord(values: RecurringTemplateFormValues): RecurringTemplate {
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
  const recurringTemplates = [...data.recurringTemplates].sort((left, right) =>
    left.nextOccurrenceDate === right.nextOccurrenceDate
      ? left.customerLabel.localeCompare(right.customerLabel)
      : left.nextOccurrenceDate.localeCompare(right.nextOccurrenceDate),
  );

  return {
    focusDate,
    dates,
    orders,
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

export async function getOrderEditor(orderId?: string) {
  const data = await readStore();
  const order = orderId ? data.orders.find((entry) => entry.id === orderId) ?? null : null;

  return {
    order,
    destinations: data.destinations,
    productSuggestions: getProductSuggestions(data.products),
    focusDate: getFocusDate(data),
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
      id: order.id,
      customerLabel: order.customerLabel,
      destinationLabel: order.destinationLabel,
      deliveryProvider: order.deliveryProvider,
      providerLabel: state.providerLabel,
      promisedTime: order.promisedTime,
      remainingQuantity: state.progress.remainingQuantity,
      dispatchNotes: order.dispatchNotes,
    })),
    assignmentNeededOrders: assignmentNeededOrders.map(({ order, state }) => ({
      id: order.id,
      customerLabel: order.customerLabel,
      destinationLabel: order.destinationLabel,
      deliveryProvider: order.deliveryProvider,
      providerLabel: state.providerLabel,
      promisedTime: order.promisedTime,
      dispatchNotes: order.dispatchNotes,
    })),
    pickupReadyOrders: pickupReadyOrders.map(({ order }) => ({
      id: order.id,
      customerLabel: order.customerLabel,
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
    id: order.id,
    customerLabel: order.customerLabel,
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

  return {
    ...data,
    suppliers: [...data.suppliers].sort((left, right) => left.name.localeCompare(right.name)),
    rawMaterials: [...data.rawMaterials].sort((left, right) => left.name.localeCompare(right.name)),
    supplierPriceEntries: [...data.supplierPriceEntries].sort((left, right) =>
      left.priceDate === right.priceDate
        ? left.rawMaterialLabel.localeCompare(right.rawMaterialLabel)
        : right.priceDate.localeCompare(left.priceDate),
    ),
    latestPriceByMaterial,
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

export function buildSupplierRecord(values: SupplierFormValues, existingSupplier?: Supplier): Supplier {
  const now = new Date().toISOString();

  return {
    id: existingSupplier?.id ?? `supplier-${crypto.randomUUID()}`,
    name: values.name.trim(),
    contact: values.contact?.trim() || undefined,
    notes: values.notes?.trim() || undefined,
    active: values.active,
    createdAt: existingSupplier?.createdAt ?? now,
    updatedAt: now,
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

export function buildRawMaterialRecord(values: RawMaterialFormValues, existingRawMaterial?: RawMaterial): RawMaterial {
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

export function buildWipEntry(formData: FormData): WipEntry {
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
  };
}

export function validateWipEntry(entry: WipEntry) {
  if (!entry.productionDate || !entry.referenceLabel || entry.quantity <= 0) {
    return 'WIP needs a production day, label, and quantity greater than zero.';
  }

  return null;
}

export function buildShiftLog(existing: ShiftLog | undefined, formData: FormData): ShiftLog {
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
    shiftNotes: existing?.shiftNotes ?? [],
  };
}

export function validateShiftLog(log: ShiftLog) {
  if (!log.productionDate || !log.summary) {
    return 'Shift handoff needs a production day and summary.';
  }

  return null;
}

export function buildShiftNote(formData: FormData): ShiftNote {
  return {
    id: `shift-note-${crypto.randomUUID()}`,
    authorLabel: String(formData.get('authorLabel') ?? '').trim() || 'Shift note',
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
