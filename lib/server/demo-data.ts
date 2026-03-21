import type {
  AppData,
  Order,
  OrderLine,
  Product,
  ShiftLog,
  ShiftNote,
  WipEntry,
} from '@/lib/domain/types';
import { readStore } from '@/lib/server/store';

export interface OrderFormValues {
  customerLabel: string;
  customerPhone?: string;
  destinationLabel?: string;
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

function sortOrders(left: Order, right: Order) {
  return left.productionDate === right.productionDate
    ? right.updatedAt.localeCompare(left.updatedAt)
    : left.productionDate.localeCompare(right.productionDate);
}

function sortShiftLogs(left: ShiftLog, right: ShiftLog) {
  return right.updatedAt.localeCompare(left.updatedAt);
}

export function getProductSuggestions(products: Product[]) {
  return products.flatMap((product) =>
    product.variants.map((variant) => `${product.name} / ${variant.name}`),
  );
}

export function getAllProductionDates(data: Pick<AppData, 'orders' | 'wipEntries' | 'shiftLogs'>) {
  return [...new Set([
    ...data.orders.map((order) => order.productionDate),
    ...data.wipEntries.map((entry) => entry.productionDate),
    ...data.shiftLogs.map((log) => log.productionDate),
  ])].sort();
}

export function getFocusDate(data: Pick<AppData, 'orders' | 'wipEntries' | 'shiftLogs'>) {
  const today = new Date().toISOString().slice(0, 10);
  const dates = getAllProductionDates(data);
  return dates.find((date) => date >= today) ?? dates[0] ?? today;
}

export function getDefaultLineDrafts(existingLines: OrderLine[] = [], desiredCount = 5) {
  const drafts = existingLines.map((line) => ({
    lineType: line.lineType,
    productLabel: line.productLabel,
    quantity: String(line.quantity),
    unit: line.unit,
    note: line.note ?? '',
  }));

  while (drafts.length < desiredCount) {
    drafts.push({
      lineType: 'draft_product',
      productLabel: '',
      quantity: '',
      unit: 'pieces',
      note: '',
    });
  }

  return drafts;
}

function toStageStatus(stage: WipEntry['stage']): WipEntry['status'] {
  return stage === 'ready' || stage === 'baked' ? 'ready' : 'in_progress';
}

export function buildOrderRecord(data: AppData, values: OrderFormValues, existingOrder?: Order): Order {
  const now = new Date().toISOString();
  const cleanLines = values.lines
    .map((line, index) => ({
      id: existingOrder?.lines[index]?.id ?? `line-${crypto.randomUUID()}`,
      lineType: line.lineType,
      productLabel: line.productLabel.trim(),
      quantity: line.quantity,
      unit: line.unit.trim() || 'pieces',
      lineStatus: existingOrder?.lines[index]?.lineStatus ?? ('planned' as const),
      note: line.note?.trim() || undefined,
    }))
    .filter((line) => line.productLabel && line.quantity > 0);

  const changedInKitchen = values.changedInKitchen || values.status === 'changed';
  const nextStatus = values.status === 'changed'
    ? 'changed'
    : changedInKitchen && values.status === 'active'
      ? 'changed'
      : values.status;

  return {
    id: existingOrder?.id ?? `order-${crypto.randomUUID()}`,
    source: values.source,
    status: nextStatus,
    customerLabel: values.customerLabel.trim() || 'Walk-in customer',
    customerPhone: values.customerPhone?.trim() || undefined,
    destinationLabel: values.destinationLabel?.trim() || undefined,
    dueDate: values.dueDate,
    productionDate: values.productionDate,
    notes: values.notes?.trim() || undefined,
    createdAt: existingOrder?.createdAt ?? now,
    updatedAt: now,
    changedInKitchen,
    visibleOnProductionBoard: values.visibleOnProductionBoard,
    lines: cleanLines,
  };
}

export async function getWorkspaceSummary() {
  const data = await readStore();
  const focusDate = getFocusDate(data);

  return {
    workspace: data.workspace,
    focusDate,
    ordersToday: data.orders.filter((order) => order.productionDate === focusDate).length,
    changedOrders: data.orders.filter(
      (order) => order.productionDate === focusDate && (order.status === 'changed' || order.changedInKitchen),
    ).length,
    readyWip: data.wipEntries.filter((entry) => entry.productionDate === focusDate && entry.status === 'ready').length,
  };
}

export async function getOrdersWorkspace() {
  const data = await readStore();
  const dates = getAllProductionDates(data);
  const focusDate = getFocusDate(data);
  const orders = [...data.orders].sort(sortOrders);

  return {
    focusDate,
    dates,
    orders,
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
      unit: string;
      orderCount: number;
      destinations: Set<string>;
      draft: boolean;
    }
  >();

  for (const order of boardOrders) {
    for (const line of order.lines) {
      if (line.lineType === 'note_item') {
        continue;
      }

      const existing = groupedDemandMap.get(line.productLabel);
      if (existing) {
        existing.quantity += line.quantity;
        existing.orderCount += 1;
        if (order.destinationLabel) {
          existing.destinations.add(order.destinationLabel);
        }
        if (line.lineType === 'draft_product') {
          existing.draft = true;
        }
      } else {
        groupedDemandMap.set(line.productLabel, {
          label: line.productLabel,
          quantity: line.quantity,
          unit: line.unit,
          orderCount: 1,
          destinations: new Set(order.destinationLabel ? [order.destinationLabel] : []),
          draft: line.lineType === 'draft_product',
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
    changedOrders: productionOrders.filter((order) => order.status === 'changed' || order.changedInKitchen),
    hiddenOrders: productionOrders.filter((order) => order.visibleOnProductionBoard === false),
    wipEntries,
    handoffEntries,
    readyCount: wipEntries.filter((entry) => entry.status === 'ready').length,
    handoffCount: shiftLogs.length,
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

  return {
    focusDate,
    dates,
    shiftLogs: logs,
    shiftLogMap: new Map(logs.map((log) => [`${log.productionDate}:${log.shiftKey}`, log])),
    wipByDate,
  };
}

export async function getSetupWorkspace() {
  return readStore();
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

  return {
    customerLabel: String(formData.get('customerLabel') ?? ''),
    customerPhone: String(formData.get('customerPhone') ?? ''),
    destinationLabel: String(formData.get('destinationLabel') ?? ''),
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

export function validateOrderForm(values: OrderFormValues) {
  if (!values.productionDate || !values.dueDate) {
    return 'Production and delivery dates are required.';
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
    return 'Production date, label, and quantity are required for WIP.';
  }

  return null;
}

export function buildShiftLog(log: ShiftLog | undefined, formData: FormData): ShiftLog {
  const now = new Date().toISOString();
  const openItems = String(formData.get('openItems') ?? '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    id: log?.id ?? `shift-${crypto.randomUUID()}`,
    productionDate: String(formData.get('productionDate') ?? ''),
    shiftKey: String(formData.get('shiftKey') ?? 'night') as ShiftLog['shiftKey'],
    status: String(formData.get('status') ?? 'open') as ShiftLog['status'],
    summary: String(formData.get('summary') ?? '').trim(),
    openItems,
    handoffNotes: String(formData.get('handoffNotes') ?? '').trim(),
    updatedAt: now,
    shiftNotes: log?.shiftNotes ?? [],
  };
}

export function validateShiftLog(log: ShiftLog) {
  if (!log.productionDate || !log.summary) {
    return 'Production date and summary are required for handoff.';
  }

  if (log.status === 'ready_for_handoff' && !log.handoffNotes) {
    return 'Add a short handoff note before marking the shift ready for handoff.';
  }

  return null;
}

export function buildShiftNote(formData: FormData): ShiftNote {
  return {
    id: `shift-note-${crypto.randomUUID()}`,
    authorLabel: String(formData.get('authorLabel') ?? 'Shift team').trim() || 'Shift team',
    note: String(formData.get('note') ?? '').trim(),
    state: String(formData.get('state') ?? 'info') as ShiftNote['state'],
    linkedItemLabel: String(formData.get('linkedItemLabel') ?? '').trim() || undefined,
    createdAt: new Date().toISOString(),
  };
}

export function validateShiftNote(note: ShiftNote, productionDate: string) {
  if (!productionDate || !note.note) {
    return 'Shift note needs a date and text.';
  }

  return null;
}
