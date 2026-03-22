import type { OrderLine, RecurringTemplate, SupplierPriceEntry } from '@/lib/domain/types';

export function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatDateTimeLabel(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(date));
}

export function formatShiftKeyLabel(shiftKey: 'night' | 'morning' | 'afternoon') {
  return shiftKey.charAt(0).toUpperCase() + shiftKey.slice(1);
}

export function formatStatusLabel(value: string) {
  return value.replaceAll('_', ' ');
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatUnitRate(entry: Pick<SupplierPriceEntry, 'price' | 'packageQuantity' | 'packageUnit'>) {
  if (!entry.packageQuantity) {
    return 'Rate unavailable';
  }

  return `${formatCurrency(entry.price / entry.packageQuantity)} / ${entry.packageUnit}`;
}

export function formatLineProgressLabel(line: Pick<OrderLine, 'completedQuantity' | 'quantity' | 'unit'>) {
  return `${line.completedQuantity}/${line.quantity} ${line.unit}`;
}

export function formatTemplateScheduleLabel(template: Pick<RecurringTemplate, 'frequency' | 'weeklyDays'>) {
  if (template.frequency === 'daily') {
    return 'Daily';
  }

  const labels = template.weeklyDays.map((day) => day.charAt(0).toUpperCase() + day.slice(1, 3));
  return `Weekly · ${labels.join(', ')}`;
}
