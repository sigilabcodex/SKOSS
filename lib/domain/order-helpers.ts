import type { AppData, DeliveryProvider, Order, OrderLine, WeekdayKey, WipEntry } from '@/lib/domain/types';

export const weekdayOptions: Array<{ value: WeekdayKey; label: string; index: number }> = [
  { value: 'sun', label: 'Sun', index: 0 },
  { value: 'mon', label: 'Mon', index: 1 },
  { value: 'tue', label: 'Tue', index: 2 },
  { value: 'wed', label: 'Wed', index: 3 },
  { value: 'thu', label: 'Thu', index: 4 },
  { value: 'fri', label: 'Fri', index: 5 },
  { value: 'sat', label: 'Sat', index: 6 },
];

export const fulfillmentTypeValues = ['standard', 'pickup', 'own_delivery', 'app_delivery'] as const;
export const deliveryProviderValues = ['internal', 'uber', 'rappi', 'didi', 'other'] as const satisfies readonly DeliveryProvider[];
export const orderLineTypeValues = ['product_variant', 'draft_product', 'note_item'] as const satisfies readonly OrderLine['lineType'][];

export function getOrderLineTypeLabelKey(lineType: OrderLine['lineType']) {
  switch (lineType) {
    case 'product_variant':
      return 'structuredItem';
    case 'draft_product':
      return 'draftItem';
    case 'note_item':
      return 'noteItem';
    default:
      return 'draftItem';
  }
}

export function getAllProductionDates(data: Pick<AppData, 'orders' | 'wipEntries' | 'shiftLogs' | 'recurringTemplates'>) {
  const dateSet = new Set<string>();

  for (const order of data.orders) {
    dateSet.add(order.productionDate);
  }

  for (const entry of data.wipEntries) {
    dateSet.add(entry.productionDate);
  }

  for (const log of data.shiftLogs) {
    dateSet.add(log.productionDate);
  }

  for (const template of data.recurringTemplates) {
    dateSet.add(template.nextOccurrenceDate);
  }

  return Array.from(dateSet).sort();
}

export function getFocusDate(data: Pick<AppData, 'orders' | 'wipEntries' | 'shiftLogs' | 'recurringTemplates'>) {
  const today = new Date().toISOString().slice(0, 10);
  const dates = getAllProductionDates(data);
  return dates.find((date) => date >= today) ?? dates[0] ?? today;
}

export function getDefaultLineDrafts(
  existingLines: Array<Pick<OrderLine, 'lineType' | 'productLabel' | 'quantity' | 'unit' | 'note'>> = [],
  desiredCount = 5,
) {
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

export function toStageStatus(stage: WipEntry['stage']): WipEntry['status'] {
  return stage === 'ready' || stage === 'baked' ? 'ready' : 'in_progress';
}

export function getLineCompletion(line: Pick<OrderLine, 'quantity' | 'completedQuantity'>) {
  return Math.max(0, Math.min(line.quantity, line.completedQuantity));
}

export function getLineStatus(line: Pick<OrderLine, 'quantity' | 'completedQuantity' | 'lineStatus'>): OrderLine['lineStatus'] {
  if (line.lineStatus === 'cancelled') {
    return 'cancelled';
  }

  const completedQuantity = getLineCompletion(line);
  if (completedQuantity <= 0) {
    return 'pending';
  }

  if (completedQuantity >= line.quantity) {
    return 'done';
  }

  return 'in_progress';
}

export function getOrderProgress(order: Pick<Order, 'lines'>) {
  let requiredQuantity = 0;
  let completedQuantity = 0;
  let partialLines = 0;
  let doneLines = 0;
  let lineCount = 0;

  for (const line of order.lines) {
    if (line.lineType === 'note_item') {
      continue;
    }

    lineCount += 1;
    requiredQuantity += line.quantity;
    completedQuantity += getLineCompletion(line);

    const lineStatus = getLineStatus(line);
    if (lineStatus === 'in_progress') {
      partialLines += 1;
    } else if (lineStatus === 'done') {
      doneLines += 1;
    }
  }

  const remainingQuantity = Math.max(0, requiredQuantity - completedQuantity);

  return {
    requiredQuantity,
    completedQuantity,
    remainingQuantity,
    partialLines,
    doneLines,
    lineCount,
  };
}

export function inferFulfillmentType(destinationLabel?: string) {
  const label = destinationLabel?.toLowerCase() ?? '';
  if (!label) {
    return 'standard' as const;
  }

  if (label.includes('counter') || label.includes('pickup')) {
    return 'pickup' as const;
  }

  return 'own_delivery' as const;
}

export function resolveDeliveryProviderLabel(order: { deliveryProvider?: string; deliveryProviderLabel?: string }) {
  if (order.deliveryProvider === 'other') {
    return order.deliveryProviderLabel?.trim() || 'other';
  }

  return order.deliveryProvider ?? order.deliveryProviderLabel;
}

export function isDeliveryOrder(order: Pick<Order, 'fulfillmentType'>) {
  return order.fulfillmentType === 'own_delivery' || order.fulfillmentType === 'app_delivery';
}

export function isPickupOrder(order: Pick<Order, 'fulfillmentType'>) {
  return order.fulfillmentType === 'pickup';
}
