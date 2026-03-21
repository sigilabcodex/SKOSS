'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  buildOrderRecord,
  buildShiftLog,
  buildShiftNote,
  buildWipEntry,
  normalizeOrderForm,
  validateOrderForm,
  validateShiftLog,
  validateShiftNote,
  validateWipEntry,
} from '@/lib/server/demo-data';
import { readStore, writeStore } from '@/lib/server/store';

export async function createOrderAction(formData: FormData) {
  const data = await readStore();
  const values = normalizeOrderForm(formData);
  const error = validateOrderForm(values);

  if (error) {
    redirect(`/orders/new?error=${encodeURIComponent(error)}`);
  }

  const order = buildOrderRecord(data, values);
  data.orders = [...data.orders, order].sort((left, right) =>
    left.productionDate === right.productionDate
      ? right.updatedAt.localeCompare(left.updatedAt)
      : left.productionDate.localeCompare(right.productionDate),
  );
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
  data.orders = data.orders
    .map((entry) => (entry.id === orderId ? updated : entry))
    .sort((left, right) =>
      left.productionDate === right.productionDate
        ? right.updatedAt.localeCompare(left.updatedAt)
        : left.productionDate.localeCompare(right.productionDate),
    );
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/production');
  revalidatePath('/handoff');
  redirect(`/orders/${orderId}?saved=1`);
}

export async function addWipEntryAction(formData: FormData) {
  const data = await readStore();
  const entry = buildWipEntry(formData);
  const error = validateWipEntry(entry);

  if (error) {
    redirect(`/handoff?error=${encodeURIComponent(error)}`);
  }

  data.wipEntries = [entry, ...data.wipEntries].sort((left, right) =>
    left.productionDate === right.productionDate
      ? right.updatedAt.localeCompare(left.updatedAt)
      : left.productionDate.localeCompare(right.productionDate),
  );
  await writeStore(data);
  revalidatePath('/');
  revalidatePath('/production');
  revalidatePath('/handoff');
  redirect('/handoff?saved=wip');
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
