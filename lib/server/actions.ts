'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  buildRawMaterialRecord,
  buildOrderRecord,
  buildRecurringTemplateRecord,
  buildShiftLog,
  buildShiftNote,
  buildSupplierPriceEntryRecord,
  buildSupplierRecord,
  buildWipEntry,
  getLineStatus,
  normalizeRawMaterialForm,
  normalizeOrderForm,
  normalizeRecurringTemplateForm,
  normalizeSupplierForm,
  normalizeSupplierPriceEntryForm,
  validateRawMaterialForm,
  validateOrderForm,
  validateRecurringTemplateForm,
  validateShiftLog,
  validateShiftNote,
  validateSupplierForm,
  validateSupplierPriceEntryForm,
  validateWipEntry,
} from '@/lib/server/demo-data';
import { readStore, writeStore } from '@/lib/server/store';
import { isSupportedLocale, isSupportedPreset, localeCookieName, supportedLocales, presetCookieName, supportedPresets } from '@/lib/i18n/config';
import { themeCookieName } from '@/lib/theme';

function sortOrders(left: { productionDate: string; updatedAt: string }, right: { productionDate: string; updatedAt: string }) {
  return left.productionDate === right.productionDate
    ? right.updatedAt.localeCompare(left.updatedAt)
    : left.productionDate.localeCompare(right.productionDate);
}

const supportedThemes = ['light', 'dark', 'garden'] as const;
const supportedOperatingModes = ['pickup', 'delivery', 'mixed'] as const;

export async function saveOnboardingPreferencesAction(formData: FormData) {
  const data = await readStore();
  const businessName = String(formData.get('businessName') ?? '').trim();
  const locale = String(formData.get('locale') ?? '');
  const preset = String(formData.get('preset') ?? '');
  const operatingMode = String(formData.get('operatingMode') ?? '');
  const theme = String(formData.get('theme') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '/');

  if (!businessName) {
    redirect(`${redirectTo.startsWith('/setup') ? '/setup' : '/'}?error=${encodeURIComponent('Add a business name to continue.')}`);
  }

  if (!isSupportedLocale(locale) || !supportedLocales.includes(locale)) {
    redirect(`${redirectTo.startsWith('/setup') ? '/setup' : '/'}?error=${encodeURIComponent('Choose a supported language.')}`);
  }

  if (!isSupportedPreset(preset) || !supportedPresets.includes(preset)) {
    redirect(`${redirectTo.startsWith('/setup') ? '/setup' : '/'}?error=${encodeURIComponent('Choose a supported preset.')}`);
  }

  if (!supportedOperatingModes.includes(operatingMode as (typeof supportedOperatingModes)[number])) {
    redirect(`${redirectTo.startsWith('/setup') ? '/setup' : '/'}?error=${encodeURIComponent('Choose how you usually operate.')}`);
  }

  if (!supportedThemes.includes(theme as (typeof supportedThemes)[number])) {
    redirect(`${redirectTo.startsWith('/setup') ? '/setup' : '/'}?error=${encodeURIComponent('Choose an appearance theme.')}`);
  }

  const now = new Date().toISOString();
  data.workspace.name = businessName;
  data.preferences = {
    locale,
    preset,
    operatingMode: operatingMode as (typeof supportedOperatingModes)[number],
    theme: theme as (typeof supportedThemes)[number],
    onboardingCompleted: true,
    completedAt: data.preferences.completedAt ?? now,
    updatedAt: now,
  };

  await writeStore(data);

  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, locale, { path: '/', maxAge: 31536000, sameSite: 'lax' });
  cookieStore.set(presetCookieName, preset, { path: '/', maxAge: 31536000, sameSite: 'lax' });
  cookieStore.set(themeCookieName, theme, { path: '/', maxAge: 31536000, sameSite: 'lax' });

  revalidatePath('/');
  revalidatePath('/setup');
  revalidatePath('/orders');
  revalidatePath('/production');
  revalidatePath('/handoff');

  if (redirectTo.startsWith('/setup')) {
    redirect('/setup?saved=preferences');
  }

  redirect('/?welcome=1');
}

export async function createOrderAction(formData: FormData) {
  const data = await readStore();
  const values = normalizeOrderForm(formData);
  const error = validateOrderForm(values);

  if (error) {
    redirect(`/orders/new?error=${encodeURIComponent(error)}`);
  }

  const order = buildOrderRecord(data, values);
  data.orders = [...data.orders, order].sort(sortOrders);
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/orders');
  revalidatePath('/production');
  revalidatePath('/handoff');
  redirect(`/orders/${order.id}?saved=1`);
}

export async function updateOrderAction(orderId: string, formData: FormData) {
  const data = await readStore();
  const existing = data.orders.find((entry) => entry.id === orderId);
  if (!existing) {
    redirect('/orders?error=missing-order');
  }

  const values = normalizeOrderForm(formData);
  const error = validateOrderForm(values);

  if (error) {
    redirect(`/orders/${orderId}?error=${encodeURIComponent(error)}`);
  }

  const updated = buildOrderRecord(data, values, existing);
  data.orders = data.orders.map((entry) => (entry.id === orderId ? updated : entry)).sort(sortOrders);
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/production');
  revalidatePath('/handoff');
  redirect(`/orders/${orderId}?saved=1`);
}

export async function createRecurringTemplateAction(formData: FormData) {
  const data = await readStore();
  const values = normalizeRecurringTemplateForm(formData);
  const error = validateRecurringTemplateForm(values);

  if (error) {
    redirect(`/orders/templates/new?error=${encodeURIComponent(error)}`);
  }

  const template = buildRecurringTemplateRecord(values);
  data.recurringTemplates = [...data.recurringTemplates, template].sort((left, right) =>
    left.nextOccurrenceDate === right.nextOccurrenceDate
      ? left.customerLabel.localeCompare(right.customerLabel)
      : left.nextOccurrenceDate.localeCompare(right.nextOccurrenceDate),
  );
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/orders');
  revalidatePath('/orders/templates/new');
  revalidatePath('/production');
  redirect('/orders?saved=template');
}

export async function updateOrderLineProgressAction(orderId: string, lineId: string, formData: FormData) {
  const data = await readStore();
  const order = data.orders.find((entry) => entry.id === orderId);

  if (!order) {
    redirect('/orders?error=missing-order');
  }

  const line = order.lines.find((entry) => entry.id === lineId);
  if (!line) {
    redirect(`/orders/${orderId}?error=missing-line`);
  }

  const requestedCompletedQuantity = Number(formData.get('completedQuantity') ?? line.completedQuantity ?? 0);
  const completedQuantity = Math.max(0, Math.min(line.quantity, requestedCompletedQuantity));
  line.completedQuantity = completedQuantity;
  line.lineStatus = getLineStatus({
    quantity: line.quantity,
    completedQuantity,
    lineStatus: line.lineStatus,
  });
  order.updatedAt = new Date().toISOString();

  const activeLines = order.lines.filter((entry) => entry.lineType !== 'note_item' && entry.lineStatus !== 'cancelled');
  const allDone = activeLines.length > 0 && activeLines.every((entry) => entry.lineStatus === 'done');
  const anyStarted = activeLines.some((entry) => entry.completedQuantity > 0);
  if (allDone) {
    order.status = 'completed';
  } else if (order.status === 'completed') {
    order.status = anyStarted ? 'changed' : 'active';
  }

  data.orders = [...data.orders].sort(sortOrders);
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/production');
  revalidatePath('/handoff');
  redirect(`/orders/${orderId}?saved=progress`);
}

export async function addWipEntryAction(formData: FormData) {
  const data = await readStore();
  const entry = buildWipEntry(formData);
  const error = validateWipEntry(entry);

  if (error) {
    redirect(`/handoff?error=${encodeURIComponent(error)}`);
  }

  data.wipEntries = [entry, ...data.wipEntries].sort(sortOrders);
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/production');
  revalidatePath('/handoff');
  redirect('/handoff?saved=wip');
}

export async function createSupplierAction(formData: FormData) {
  const data = await readStore();
  const values = normalizeSupplierForm(formData);
  const error = validateSupplierForm(values);

  if (error) {
    redirect(`/setup?error=${encodeURIComponent(error)}`);
  }

  const supplier = buildSupplierRecord(values);
  data.suppliers = [...data.suppliers, supplier].sort((left, right) => left.name.localeCompare(right.name));
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/setup');
  redirect('/setup?saved=supplier');
}

export async function createRawMaterialAction(formData: FormData) {
  const data = await readStore();
  const values = normalizeRawMaterialForm(formData);
  const error = validateRawMaterialForm(values);

  if (error) {
    redirect(`/setup?error=${encodeURIComponent(error)}`);
  }

  const rawMaterial = buildRawMaterialRecord(values);
  data.rawMaterials = [...data.rawMaterials, rawMaterial].sort((left, right) => left.name.localeCompare(right.name));
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/setup');
  redirect('/setup?saved=raw-material');
}

export async function createSupplierPriceEntryAction(formData: FormData) {
  const data = await readStore();
  const values = normalizeSupplierPriceEntryForm(formData);
  const error = validateSupplierPriceEntryForm(values, data);

  if (error) {
    redirect(`/setup?error=${encodeURIComponent(error)}`);
  }

  const priceEntry = buildSupplierPriceEntryRecord(values, data);
  data.supplierPriceEntries = [...data.supplierPriceEntries, priceEntry].sort((left, right) =>
    left.priceDate === right.priceDate
      ? left.rawMaterialLabel.localeCompare(right.rawMaterialLabel)
      : right.priceDate.localeCompare(left.priceDate),
  );
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/setup');
  redirect('/setup?saved=price');
}

export async function saveShiftLogAction(formData: FormData) {
  const data = await readStore();
  const productionDate = String(formData.get('productionDate') ?? '');
  const shiftKey = String(formData.get('shiftKey') ?? 'night');
  const existing = data.shiftLogs.find(
    (entry) => entry.productionDate === productionDate && entry.shiftKey === shiftKey,
  );

  const nextLog = buildShiftLog(existing, formData);
  const error = validateShiftLog(nextLog);

  if (error) {
    redirect(`/handoff?error=${encodeURIComponent(error)}`);
  }

  data.shiftLogs = (existing
    ? data.shiftLogs.map((entry) =>
        entry.productionDate === productionDate && entry.shiftKey === shiftKey ? nextLog : entry,
      )
    : [nextLog, ...data.shiftLogs]
  ).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/production');
  revalidatePath('/handoff');
  redirect('/handoff?saved=shift');
}

export async function addShiftNoteAction(formData: FormData) {
  const data = await readStore();
  const productionDate = String(formData.get('productionDate') ?? '');
  const shiftKey = String(formData.get('shiftKey') ?? 'night');
  const shiftNote = buildShiftNote(formData);
  const error = validateShiftNote(shiftNote, productionDate);

  if (error) {
    redirect(`/handoff?error=${encodeURIComponent(error)}`);
  }

  const targetLog = data.shiftLogs.find(
    (entry) => entry.productionDate === productionDate && entry.shiftKey === shiftKey,
  );

  if (targetLog) {
    targetLog.shiftNotes = [shiftNote, ...targetLog.shiftNotes];
    targetLog.updatedAt = shiftNote.createdAt;
  } else {
    data.shiftLogs = [
      {
        id: `shift-${crypto.randomUUID()}`,
        productionDate,
        shiftKey: shiftKey as 'night' | 'morning' | 'afternoon',
        status: 'open',
        summary: 'Shift note started before a full handoff summary was written.',
        openItems: [],
        handoffNotes: '',
        updatedAt: shiftNote.createdAt,
        shiftNotes: [shiftNote],
      },
      ...data.shiftLogs,
    ];
  }

  data.shiftLogs = [...data.shiftLogs].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/handoff');
  revalidatePath('/production');
  redirect('/handoff?saved=note');
}
