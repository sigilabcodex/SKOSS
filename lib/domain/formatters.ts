import type { OrderLine, RecurringTemplate, SupplierPriceEntry, WeekdayKey } from '@/lib/domain/types';
import type { AppLocale } from '@/lib/i18n/config';

export function formatDateLabel(date: string, locale: AppLocale = 'en') {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatDateTimeLabel(date: string, locale: AppLocale = 'en') {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(date));
}

export function formatShiftKeyLabel(
  shiftKey: 'night' | 'morning' | 'afternoon',
  t?: (key: string) => string,
) {
  return t ? t(`shifts.${shiftKey}`) : shiftKey.charAt(0).toUpperCase() + shiftKey.slice(1);
}

export function formatStatusLabel(value: string, t?: (key: string) => string) {
  return t ? t(`status.${value}`) : value.replaceAll('_', ' ');
}

export function formatCurrency(value: number, locale: AppLocale = 'en') {
  const currency = locale === 'pt' ? 'BRL' : locale === 'es' ? 'EUR' : 'USD';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatUnitRate(
  entry: Pick<SupplierPriceEntry, 'price' | 'packageQuantity' | 'packageUnit'>,
  locale: AppLocale = 'en',
) {
  if (!entry.packageQuantity) {
    return '—';
  }

  return `${formatCurrency(entry.price / entry.packageQuantity, locale)} / ${entry.packageUnit}`;
}

export function formatLineProgressLabel(line: Pick<OrderLine, 'completedQuantity' | 'quantity' | 'unit'>) {
  return `${line.completedQuantity}/${line.quantity} ${line.unit}`;
}

export function formatWeekdayLabel(day: WeekdayKey, t?: (key: string) => string) {
  return t ? t(`weekdays.${day}`) : day.charAt(0).toUpperCase() + day.slice(1, 3);
}

export function formatTemplateScheduleLabel(
  template: Pick<RecurringTemplate, 'frequency' | 'weeklyDays'>,
  t?: (key: string) => string,
) {
  if (template.frequency === 'daily') {
    return t ? t('orders.recurringForm.frequency.daily') : 'Daily';
  }

  const labels = template.weeklyDays.map((day) => formatWeekdayLabel(day, t));
  const weeklyLabel = t ? t('orders.recurringForm.frequency.weekly') : 'Weekly';

  return `${weeklyLabel} · ${labels.join(', ')}`;
}
