import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { demoSeed } from '@/data/demo-seed';
import { inferFulfillmentType } from '@/lib/domain/order-helpers';
import type { AppData, Order, OrderLine, RecurringTemplate, WeekdayKey, WorkspacePreferences } from '@/lib/domain/types';
import { defaultLocale, defaultPreset } from '@/lib/i18n/config';

const storePath = path.join(process.cwd(), 'data', 'demo-store.json');
const generationHorizonDays = 10;

function getLineStatus(line: Pick<OrderLine, 'quantity' | 'completedQuantity' | 'lineStatus'>): OrderLine['lineStatus'] {
  if (line.lineStatus === 'cancelled') {
    return 'cancelled';
  }

  const completedQuantity = Math.max(0, Math.min(line.quantity, line.completedQuantity));
  if (completedQuantity <= 0) {
    return 'pending';
  }

  if (completedQuantity >= line.quantity) {
    return 'done';
  }

  return 'in_progress';
}

function isoDateFromDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: string, days: number) {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return isoDateFromDate(next);
}

function weekdayToIndex(day: WeekdayKey) {
  return {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  }[day];
}

function normalizeLines(lines: OrderLine[] = []): OrderLine[] {
  return lines.map((line) => {
    const completedQuantity = Math.max(0, Math.min(line.quantity ?? 0, Number(line.completedQuantity ?? 0)));
    const lineStatus = getLineStatus({
      quantity: Number(line.quantity ?? 0),
      completedQuantity,
      lineStatus: (line.lineStatus as OrderLine['lineStatus']) ?? 'pending',
    });

    return {
      ...line,
      quantity: Number(line.quantity ?? 0),
      completedQuantity,
      lineStatus,
    };
  });
}

function normalizeTemplate(template: Partial<RecurringTemplate>): RecurringTemplate {
  const legacyTemplate = template as Partial<RecurringTemplate> & { title?: string; scheduleRule?: string };
  const createdAt = template.createdAt ?? new Date().toISOString();
  const updatedAt = template.updatedAt ?? createdAt;
  const customerLabel = template.customerLabel ?? legacyTemplate.title ?? 'Recurring order';
  const frequency = template.frequency
    ?? (legacyTemplate.scheduleRule?.toLowerCase().includes('every day') ? 'daily' : 'weekly');
  const defaultWeeklyDays = template.weeklyDays && template.weeklyDays.length > 0
    ? template.weeklyDays
    : (legacyTemplate.scheduleRule?.toLowerCase().includes('saturday') ? (['sat'] as WeekdayKey[]) : (['sun'] as WeekdayKey[]));

  return {
    id: template.id ?? `template-${crypto.randomUUID()}`,
    templateType: 'customer_order',
    customerLabel,
    customerPhone: template.customerPhone,
    destinationLabel: template.destinationLabel,
    notes: template.notes,
    frequency,
    weeklyDays: frequency === 'weekly' ? defaultWeeklyDays : [],
    nextOccurrenceDate: template.nextOccurrenceDate ?? addDays(isoDateFromDate(new Date()), 1),
    active: template.active ?? true,
    createdAt,
    updatedAt,
    lines: (template.lines ?? []).map((line) => ({
      id: line.id ?? `template-line-${crypto.randomUUID()}`,
      lineType: line.lineType,
      productLabel: line.productLabel,
      quantity: Number(line.quantity ?? 0),
      unit: line.unit || 'pieces',
      note: line.note,
    })),
  };
}

function nextOccurrenceDate(template: RecurringTemplate, currentDate: string) {
  if (template.frequency === 'daily') {
    return addDays(currentDate, 1);
  }

  const allowedIndexes = template.weeklyDays.map(weekdayToIndex).sort((left, right) => left - right);
  const next = new Date(`${currentDate}T00:00:00Z`);

  for (let offset = 1; offset <= 14; offset += 1) {
    next.setUTCDate(next.getUTCDate() + 1);
    if (allowedIndexes.includes(next.getUTCDay())) {
      return isoDateFromDate(next);
    }
  }

  return addDays(currentDate, 7);
}

function buildGeneratedOrder(template: RecurringTemplate, productionDate: string): Order {
  const timestamp = new Date().toISOString();
  const fulfillmentType = inferFulfillmentType(template.destinationLabel);

  return {
    id: `order-${template.id}-${productionDate}`,
    source: 'generated',
    status: 'active',
    fulfillmentType,
    customerLabel: template.customerLabel,
    customerPhone: template.customerPhone,
    destinationLabel: template.destinationLabel,
    deliveryProvider: undefined,
    deliveryProviderLabel: undefined,
    deliveryAssignee: undefined,
    promisedTime: undefined,
    dispatchNotes: template.notes,
    dueDate: productionDate,
    productionDate,
    notes: template.notes,
    createdAt: timestamp,
    updatedAt: timestamp,
    changedInKitchen: false,
    visibleOnProductionBoard: true,
    templateId: template.id,
    templateTitle: `${template.customerLabel} recurring`,
    generatedOccurrenceDate: productionDate,
    generatedFromTemplate: true,
    templateEdited: false,
    lines: template.lines.map((line) => ({
      id: `line-${crypto.randomUUID()}`,
      lineType: line.lineType,
      productLabel: line.productLabel,
      quantity: line.quantity,
      completedQuantity: 0,
      unit: line.unit,
      lineStatus: 'pending',
      note: line.note,
    })),
  };
}

function ensureGeneratedOrders(data: AppData) {
  const today = isoDateFromDate(new Date());
  const horizon = addDays(today, generationHorizonDays);
  let changed = false;

  for (const template of data.recurringTemplates) {
    if (!template.active) {
      continue;
    }

    while (template.nextOccurrenceDate <= horizon) {
      const existingOrder = data.orders.find(
        (order) => order.templateId === template.id && order.generatedOccurrenceDate === template.nextOccurrenceDate,
      );

      if (!existingOrder) {
        data.orders.push(buildGeneratedOrder(template, template.nextOccurrenceDate));
        changed = true;
      }

      const nextDate = nextOccurrenceDate(template, template.nextOccurrenceDate);
      if (nextDate === template.nextOccurrenceDate) {
        break;
      }

      template.nextOccurrenceDate = nextDate;
      template.updatedAt = new Date().toISOString();
      changed = true;
    }
  }

  if (changed) {
    data.orders = [...data.orders].sort((left, right) =>
      left.productionDate === right.productionDate
        ? right.updatedAt.localeCompare(left.updatedAt)
        : left.productionDate.localeCompare(right.productionDate),
    );
  }

  return changed;
}

function hydrateStore(rawData: AppData): AppData {
  const preferences: WorkspacePreferences = {
    locale: rawData.preferences?.locale ?? defaultLocale,
    preset: rawData.preferences?.preset ?? defaultPreset,
    operatingMode: rawData.preferences?.operatingMode ?? 'mixed',
    theme: rawData.preferences?.theme ?? 'light',
    onboardingCompleted: rawData.preferences?.onboardingCompleted ?? false,
    completedAt: rawData.preferences?.completedAt,
    updatedAt: rawData.preferences?.updatedAt,
  };

  const data: AppData = {
    ...rawData,
    preferences,
    recurringTemplates: (rawData.recurringTemplates ?? []).map((template) =>
      normalizeTemplate(template as Partial<RecurringTemplate>),
    ),
    orders: (rawData.orders ?? []).map((order) => ({
      ...order,
      fulfillmentType: order.fulfillmentType ?? inferFulfillmentType(order.destinationLabel),
      deliveryProvider: order.deliveryProvider,
      deliveryProviderLabel: order.deliveryProviderLabel,
      deliveryAssignee: order.deliveryAssignee,
      promisedTime: order.promisedTime,
      dispatchNotes: order.dispatchNotes,
      changedInKitchen: order.changedInKitchen ?? false,
      visibleOnProductionBoard: order.visibleOnProductionBoard ?? true,
      templateId: order.templateId,
      templateTitle: order.templateTitle,
      generatedOccurrenceDate: order.generatedOccurrenceDate ?? order.productionDate,
      generatedFromTemplate: order.generatedFromTemplate ?? order.source === 'generated',
      templateEdited: order.templateEdited ?? false,
      lines: normalizeLines(order.lines),
    })),
    suppliers: rawData.suppliers ?? [],
    rawMaterials: rawData.rawMaterials ?? [],
    supplierPriceEntries: rawData.supplierPriceEntries ?? [],
    wipEntries: rawData.wipEntries ?? [],
    shiftLogs: rawData.shiftLogs ?? [],
  };

  return data;
}

async function ensureStore() {
  try {
    await readFile(storePath, 'utf8');
  } catch {
    await mkdir(path.dirname(storePath), { recursive: true });
    await writeFile(storePath, JSON.stringify(demoSeed, null, 2), 'utf8');
  }
}

export async function readStore(): Promise<AppData> {
  await ensureStore();
  const raw = await readFile(storePath, 'utf8');
  const data = hydrateStore(JSON.parse(raw) as AppData);
  const generatedChanged = ensureGeneratedOrders(data);

  if (generatedChanged || raw !== JSON.stringify(data, null, 2)) {
    await writeStore(data);
  }

  return data;
}

export async function writeStore(data: AppData) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(data, null, 2), 'utf8');
}
