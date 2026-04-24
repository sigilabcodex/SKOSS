'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  buildCustomerRecord,
  buildOrderRecord,
  buildRecurringTemplateRecord,
  buildShiftLog,
  buildShiftNote,
  buildWipEntry,
  getLineStatus,
  normalizeCustomerForm,
  normalizeOrderForm,
  normalizeRecurringTemplateForm,
  validateCustomerForm,
  validateOrderForm,
  validateRecurringTemplateForm,
  validateShiftLog,
  validateShiftNote,
  validateWipEntry,
} from '@/lib/server/demo-data';
import { getCurrentUserContext } from '@/lib/server/auth';
import { readAppData, mutateAppData } from '@/lib/server/persistence';
import { appendActivity } from '@/lib/server/activity';

function sortOrders(left: { productionDate: string; updatedAt: string }, right: { productionDate: string; updatedAt: string }) {
  return left.productionDate === right.productionDate
    ? right.updatedAt.localeCompare(left.updatedAt)
    : left.productionDate.localeCompare(right.productionDate);
}

function quoteLabel(label: string) {
  return `"${label}"`;
}

async function getActorUserId(data: Awaited<ReturnType<typeof readAppData>>) {
  const { currentUser } = await getCurrentUserContext(data);
  return currentUser?.id;
}

function resolveRedirectTo(formData: FormData, fallback: string) {
  const redirectTo = String(formData.get('redirectTo') ?? '').trim();
  return redirectTo.startsWith('/') ? redirectTo : fallback;
}

function shouldAllowEmpty(formData: FormData) {
  return String(formData.get('allowEmpty') ?? '') === '1';
}

export async function createCustomerAction(formData: FormData) {
  const data = await readAppData();
  const redirectTo = resolveRedirectTo(formData, '/customers');
  const allowEmpty = shouldAllowEmpty(formData);
  const values = normalizeCustomerForm(formData);
  if (allowEmpty && !values.displayName.trim()) {
    redirect(redirectTo);
  }
  const error = validateCustomerForm(values);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const customer = buildCustomerRecord(values, actorUserId);
  data.customers = [...data.customers, customer].sort((left, right) => left.displayName.localeCompare(right.displayName));
  appendActivity(data, {
    entityType: 'customer',
    entityId: customer.id,
    action: 'created',
    userId: actorUserId,
    summary: `Customer ${quoteLabel(customer.displayName)} created.`,
  });
  await mutateAppData(data);
  revalidatePath('/');
  revalidatePath('/timeline');
  revalidatePath('/orders');
  revalidatePath('/customers');
  revalidatePath('/production');
  revalidatePath('/handoff');
  if (redirectTo.startsWith('/customers')) {
    redirect(`/customers?customer=${customer.id}&saved=customer`);
  }

  redirect(`${redirectTo}?saved=customer`);
}

export async function updateCustomerAction(customerId: string, formData: FormData) {
  const data = await readAppData();
  const existing = data.customers.find((entry) => entry.id === customerId);

  if (!existing) {
    redirect('/customers?error=missing-customer');
  }

  const values = normalizeCustomerForm(formData);
  const error = validateCustomerForm(values);

  if (error) {
    redirect(`/customers?customer=${customerId}&error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const customer = buildCustomerRecord(values, actorUserId, existing);
  data.customers = data.customers.map((entry) => (entry.id === customerId ? customer : entry))
    .sort((left, right) => left.displayName.localeCompare(right.displayName));
  appendActivity(data, {
    entityType: 'customer',
    entityId: customer.id,
    action: existing.active !== customer.active ? 'status_changed' : 'updated',
    userId: actorUserId,
    summary: existing.active !== customer.active
      ? `Customer ${quoteLabel(customer.displayName)} marked as ${customer.active ? 'active' : 'inactive'}.`
      : `Customer ${quoteLabel(customer.displayName)} updated.`,
  });
  await mutateAppData(data);
  revalidatePath('/');
  revalidatePath('/timeline');
  revalidatePath('/orders');
  revalidatePath('/customers');
  revalidatePath('/production');
  revalidatePath('/handoff');
  redirect(`/customers?customer=${customer.id}&saved=customer`);
}

export async function createOrderAction(formData: FormData) {
  const data = await readAppData();
  const values = normalizeOrderForm(formData);
  const error = validateOrderForm(values);

  if (error) {
    redirect(`/orders/new?error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const order = buildOrderRecord(data, values, actorUserId);
  data.orders = [...data.orders, order].sort(sortOrders);
  appendActivity(data, {
    entityType: 'order',
    entityId: order.id,
    action: 'created',
    userId: actorUserId,
    summary: `Order ${quoteLabel(order.customerLabel)} created for ${order.productionDate}.`,
  });
  await mutateAppData(data);
  revalidatePath('/');
  revalidatePath('/timeline');
  revalidatePath('/orders');
  revalidatePath('/customers');
  revalidatePath('/production');
  revalidatePath('/handoff');
  redirect(`/orders/${order.id}?saved=1`);
}

export async function updateOrderAction(orderId: string, formData: FormData) {
  const data = await readAppData();
  const existing = data.orders.find((entry) => entry.id === orderId);
  if (!existing) {
    redirect('/orders?error=missing-order');
  }

  const values = normalizeOrderForm(formData);
  const error = validateOrderForm(values);

  if (error) {
    redirect(`/orders/${orderId}?error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const updated = buildOrderRecord(data, values, actorUserId, existing);
  data.orders = data.orders.map((entry) => (entry.id === orderId ? updated : entry)).sort(sortOrders);
  appendActivity(data, {
    entityType: 'order',
    entityId: updated.id,
    action: existing.status !== updated.status ? 'status_changed' : 'updated',
    userId: actorUserId,
    summary: existing.status !== updated.status
      ? `Order ${quoteLabel(updated.customerLabel)} changed from ${existing.status} to ${updated.status}.`
      : `Order ${quoteLabel(updated.customerLabel)} updated.`,
  });
  await mutateAppData(data);
  revalidatePath('/');
  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/customers');
  revalidatePath('/production');
  revalidatePath('/handoff');
  redirect(`/orders/${orderId}?saved=1`);
}

export async function createRecurringTemplateAction(formData: FormData) {
  const data = await readAppData();
  const values = normalizeRecurringTemplateForm(formData);
  const error = validateRecurringTemplateForm(values);

  if (error) {
    redirect(`/orders/templates/new?error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const template = buildRecurringTemplateRecord(values, actorUserId);
  data.recurringTemplates = [...data.recurringTemplates, template].sort((left, right) =>
    left.nextOccurrenceDate === right.nextOccurrenceDate
      ? left.customerLabel.localeCompare(right.customerLabel)
      : left.nextOccurrenceDate.localeCompare(right.nextOccurrenceDate),
  );
  await mutateAppData(data);
  revalidatePath('/');
  revalidatePath('/orders');
  revalidatePath('/orders/templates/new');
  revalidatePath('/production');
  redirect('/orders?saved=template');
}

export async function updateOrderLineProgressAction(orderId: string, lineId: string, formData: FormData) {
  const data = await readAppData();
  const order = data.orders.find((entry) => entry.id === orderId);

  if (!order) {
    redirect('/orders?error=missing-order');
  }

  const line = order.lines.find((entry) => entry.id === lineId);
  if (!line) {
    redirect(`/orders/${orderId}?error=missing-line`);
  }

  const actorUserId = await getActorUserId(data);
  const requestedCompletedQuantity = Number(formData.get('completedQuantity') ?? line.completedQuantity ?? 0);
  const completedQuantity = Math.max(0, Math.min(line.quantity, requestedCompletedQuantity));
  line.completedQuantity = completedQuantity;
  line.lineStatus = getLineStatus({
    quantity: line.quantity,
    completedQuantity,
    lineStatus: line.lineStatus,
  });
  order.updatedAt = new Date().toISOString();
  order.updatedByUserId = actorUserId ?? order.updatedByUserId;

  const activeLines = order.lines.filter((entry) => entry.lineType !== 'note_item' && entry.lineStatus !== 'cancelled');
  const allDone = activeLines.length > 0 && activeLines.every((entry) => entry.lineStatus === 'done');
  const anyStarted = activeLines.some((entry) => entry.completedQuantity > 0);
  if (allDone) {
    order.status = 'completed';
  } else if (order.status === 'completed') {
    order.status = anyStarted ? 'changed' : 'active';
  }
  appendActivity(data, {
    entityType: 'order',
    entityId: order.id,
    action: line.lineStatus === 'done' && order.status === 'completed' ? 'status_changed' : 'updated',
    userId: actorUserId,
    summary: line.lineStatus === 'done' && order.status === 'completed'
      ? `Order ${quoteLabel(order.customerLabel)} marked as completed.`
      : `Order ${quoteLabel(order.customerLabel)} progress updated.`,
  });

  data.orders = [...data.orders].sort(sortOrders);
  await mutateAppData(data);
  revalidatePath('/');
  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/customers');
  revalidatePath('/production');
  revalidatePath('/handoff');
  redirect(`/orders/${orderId}?saved=progress`);
}

export async function addWipEntryAction(formData: FormData) {
  const data = await readAppData();
  const actorUserId = await getActorUserId(data);
  const entry = buildWipEntry(formData, actorUserId);
  const error = validateWipEntry(entry);

  if (error) {
    redirect(`/handoff?error=${encodeURIComponent(error)}`);
  }

  data.wipEntries = [entry, ...data.wipEntries].sort(sortOrders);
  await mutateAppData(data);
  revalidatePath('/');
  revalidatePath('/production');
  revalidatePath('/handoff');
  redirect('/handoff?saved=wip');
}

export async function saveShiftLogAction(formData: FormData) {
  const data = await readAppData();
  const productionDate = String(formData.get('productionDate') ?? '');
  const shiftKey = String(formData.get('shiftKey') ?? 'night');
  const existing = data.shiftLogs.find(
    (entry) => entry.productionDate === productionDate && entry.shiftKey === shiftKey,
  );

  const actorUserId = await getActorUserId(data);
  const nextLog = buildShiftLog(existing, formData, actorUserId);
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
  await mutateAppData(data);
  revalidatePath('/');
  revalidatePath('/production');
  revalidatePath('/handoff');
  redirect('/handoff?saved=shift');
}

export async function addShiftNoteAction(formData: FormData) {
  const data = await readAppData();
  const productionDate = String(formData.get('productionDate') ?? '');
  const shiftKey = String(formData.get('shiftKey') ?? 'night');
  const actorUserId = await getActorUserId(data);
  const shiftNote = buildShiftNote(formData, actorUserId);
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
    targetLog.updatedByUserId = actorUserId ?? targetLog.updatedByUserId;
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
        createdByUserId: actorUserId,
        updatedByUserId: actorUserId,
        shiftNotes: [shiftNote],
      },
      ...data.shiftLogs,
    ];
  }

  data.shiftLogs = [...data.shiftLogs].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  await mutateAppData(data);
  revalidatePath('/');
  revalidatePath('/handoff');
  revalidatePath('/production');
  redirect('/handoff?saved=note');
}
