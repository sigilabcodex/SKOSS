'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  buildCustomerRecord,
  buildProductRecord,
  buildRawMaterialRecord,
  buildRecipeRecord,
  buildSupplierPriceEntryRecord,
  buildSupplierRecord,
  buildUserRecord,
  normalizeProductForm,
  normalizeRawMaterialForm,
  normalizeRecipeForm,
  normalizeSupplierForm,
  normalizeSupplierPriceEntryForm,
  normalizeUserForm,
  validateProductForm,
  validateRawMaterialForm,
  validateRecipeForm,
  validateSupplierForm,
  validateSupplierPriceEntryForm,
  validateUserForm,
} from '@/lib/server/demo-data';
import { getPersistenceGateway, readAppData, readPersistence, mutateAppData, reseedRuntimeAppData } from '@/lib/server/persistence';
import { appendActivity } from '@/lib/server/activity';
import { hashPassword } from '@/lib/server/passwords';
import {
  buildCustomerImportPayload,
  buildRawMaterialImportPayload,
  buildSupplierImportPayload,
  parseCsvContent,
  parseCsvMapping,
  type CsvEntity,
} from '@/lib/domain/csv-import';
import { moduleRegistry } from '@/lib/modules';
import { getCurrentUserContext } from '@/lib/server/auth';
import { isNonProductionMode } from '@/lib/server/runtime-mode';
import type { AppData } from '@/lib/domain/types';

function quoteLabel(label: string) {
  return `"${label}"`;
}

const persistence = getPersistenceGateway();

async function getActorUserId(data: AppData) {
  const { currentUser } = await getCurrentUserContext(data);
  return currentUser?.id;
}

function revalidateAllWorkspaces() {
  revalidatePath('/');
  revalidatePath('/timeline');
  revalidatePath('/orders');
  revalidatePath('/customers');
  revalidatePath('/production');
  revalidatePath('/handoff');
  revalidatePath('/preferences');
  revalidatePath('/admin/setup');
  revalidatePath('/login');
}

function resolveRedirectTo(formData: FormData, fallback: string) {
  const redirectTo = String(formData.get('redirectTo') ?? '').trim();
  return redirectTo.startsWith('/') ? redirectTo : fallback;
}

function shouldAllowEmpty(formData: FormData) {
  return String(formData.get('allowEmpty') ?? '') === '1';
}

export async function resetDemoWorkspaceAction() {
  if (!isNonProductionMode()) {
    redirect('/admin/setup?error=' + encodeURIComponent('Demo reset is disabled in production mode.'));
  }

  await reseedRuntimeAppData();
  revalidateAllWorkspaces();
  redirect('/admin/setup?saved=demo-reset');
}

export async function updateModuleRegistryAction(formData: FormData) {
  const nextStates: Record<string, boolean> = {};

  for (const manifest of moduleRegistry) {
    if (manifest.required) {
      nextStates[manifest.id] = true;
      continue;
    }

    nextStates[manifest.id] = String(formData.get(`module:${manifest.id}`) ?? '') === '1';
  }

  await persistence.write(({ instance }) => {
    instance.updateModuleStates(nextStates);
  });
  revalidatePath('/admin/modules');
  redirect('/admin/modules?saved=modules');
}

export async function createUserAction(formData: FormData) {
  const context = await readPersistence();
  const data = context.raw;
  const actorUserId = await getActorUserId(data);
  const redirectTo = resolveRedirectTo(formData, '/admin/setup');
  const allowEmpty = shouldAllowEmpty(formData);
  const values = normalizeUserForm(formData);
  if (allowEmpty && !values.displayName.trim() && !values.loginIdentifier.trim()) {
    redirect(redirectTo);
  }
  const error = validateUserForm(values, data);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error)}`);
  }

  const user = buildUserRecord(values, data);
  user.passwordHash = hashPassword(values.password?.trim() || 'skoss-demo');
  user.passwordUpdatedAt = new Date().toISOString();
  user.mustChangePassword = !values.password?.trim();
  const createdOwnerAdmin = user.roles.includes('owner_admin') || user.role === 'owner_admin';
  appendActivity(data, {
    entityType: 'user',
    entityId: user.id,
    action: 'created',
    userId: actorUserId,
    summary: `User ${quoteLabel(user.displayName)} created.`,
  });
  await persistence.write(({ raw, instance, users }) => {
    users.upsert(user);
    if (createdOwnerAdmin) {
      instance.setInitialized(true);
      instance.updateOnboardingProgress({
        adminAccount: true,
        roles: true,
        users: true,
      });
    }
    raw.activities = data.activities;
  });
  revalidateAllWorkspaces();
  redirect(`${redirectTo}?saved=user`);
}

export async function updateUserAction(userId: string, formData: FormData) {
  const context = await readPersistence();
  const data = context.raw;
  const existing = context.users.getById(userId);

  if (!existing) {
    redirect('/admin/setup?error=missing-user');
  }

  const values = normalizeUserForm(formData);
  const error = validateUserForm(values, data, userId);

  if (error) {
    redirect(`/admin/setup?user=${userId}&error=${encodeURIComponent(error)}`);
  }

  const user = buildUserRecord(values, data, existing);
  if (values.resetPassword || values.password?.trim()) {
    user.passwordHash = hashPassword(values.password?.trim() || 'skoss-demo');
    user.passwordUpdatedAt = new Date().toISOString();
    user.mustChangePassword = !values.password?.trim();
  }
  appendActivity(data, {
    entityType: 'user',
    entityId: user.id,
    action: existing.active !== user.active ? 'status_changed' : 'updated',
    userId: data.session.currentUserId,
    summary: existing.active !== user.active
      ? `User ${quoteLabel(user.displayName)} marked as ${user.active ? 'active' : 'inactive'}.`
      : `User ${quoteLabel(user.displayName)} updated.`,
  });

  const wasSessionUser = data.session.currentUserId === userId;
  const nextSessionUserId = data.users.find((entry) => entry.active && entry.id !== userId)?.id;

  if (!user.active && wasSessionUser) {
    data.session.currentUserId = nextSessionUserId;
  }

  await persistence.write(({ raw, instance, users }) => {
    users.upsert(user);
    if (!user.active && wasSessionUser) {
      instance.setSessionUser(nextSessionUserId, data.session.lastLoginAt);
    }
    raw.activities = data.activities;
  });
  revalidateAllWorkspaces();
  redirect('/admin/setup?saved=user');
}


export async function createProductAction(formData: FormData) {
  const context = await readPersistence();
  const data = context.raw;
  const redirectTo = resolveRedirectTo(formData, '/admin/setup');
  const allowEmpty = shouldAllowEmpty(formData);
  const values = normalizeProductForm(formData);
  if (allowEmpty && !values.name.trim()) {
    redirect(redirectTo);
  }
  const error = validateProductForm(values, data);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const product = buildProductRecord(values);
  appendActivity(data, {
    entityType: 'product',
    entityId: product.id,
    action: 'created',
    userId: actorUserId,
    summary: `Product ${quoteLabel(product.name)} created.`,
  });
  await persistence.write(({ raw, catalog }) => {
    catalog.upsertProduct(product);
    raw.activities = data.activities;
  });
  revalidateAllWorkspaces();
  redirect(`${redirectTo}?saved=product&productSetup=${product.id}#products`);
}

export async function updateProductAction(productId: string, formData: FormData) {
  const context = await readPersistence();
  const data = context.raw;
  const existing = context.catalog.getProductById(productId);

  if (!existing) {
    redirect('/admin/setup?error=missing-product#products');
  }

  const values = normalizeProductForm(formData);
  const error = validateProductForm(values, data, productId);

  if (error) {
    redirect(`/admin/setup?productSetup=${productId}&error=${encodeURIComponent(error)}#products`);
  }

  const actorUserId = await getActorUserId(data);
  const product = buildProductRecord(values, existing);
  appendActivity(data, {
    entityType: 'product',
    entityId: product.id,
    action: existing.active !== product.active ? 'status_changed' : 'updated',
    userId: actorUserId,
    summary: existing.active !== product.active
      ? `Product ${quoteLabel(product.name)} marked as ${product.active ? 'active' : 'inactive'}.`
      : `Product ${quoteLabel(product.name)} updated.`,
  });
  await persistence.write(({ raw, catalog }) => {
    catalog.upsertProduct(product);
    raw.activities = data.activities;
  });
  revalidateAllWorkspaces();
  redirect(`/admin/setup?saved=product&productSetup=${product.id}#products`);
}

export async function createSupplierAction(formData: FormData) {
  const data = await readAppData();
  const redirectTo = resolveRedirectTo(formData, '/admin/setup');
  const allowEmpty = shouldAllowEmpty(formData);
  const values = normalizeSupplierForm(formData);
  if (allowEmpty && !values.name.trim()) {
    redirect(redirectTo);
  }
  const error = validateSupplierForm(values);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const supplier = buildSupplierRecord(values, actorUserId);
  data.suppliers = [...data.suppliers, supplier].sort((left, right) => left.name.localeCompare(right.name));
  appendActivity(data, {
    entityType: 'supplier',
    entityId: supplier.id,
    action: 'created',
    userId: actorUserId,
    summary: `Supplier ${quoteLabel(supplier.name)} created.`,
  });
  await mutateAppData(data);
  revalidatePath('/');
  revalidatePath('/admin/setup');
  redirect(`${redirectTo}?saved=supplier`);
}

export async function updateSupplierAction(supplierId: string, formData: FormData) {
  const data = await readAppData();
  const existing = data.suppliers.find((entry) => entry.id === supplierId);

  if (!existing) {
    redirect('/admin/setup?error=missing-supplier');
  }

  const values = normalizeSupplierForm(formData);
  const error = validateSupplierForm(values);

  if (error) {
    redirect(`/admin/setup?supplier=${supplierId}&error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const supplier = buildSupplierRecord(values, actorUserId, existing);
  data.suppliers = data.suppliers
    .map((entry) => (entry.id === supplierId ? supplier : entry))
    .sort((left, right) => left.name.localeCompare(right.name));
  appendActivity(data, {
    entityType: 'supplier',
    entityId: supplier.id,
    action: existing.active !== supplier.active ? 'status_changed' : 'updated',
    userId: actorUserId,
    summary: existing.active !== supplier.active
      ? `Supplier ${quoteLabel(supplier.name)} marked as ${supplier.active ? 'active' : 'inactive'}.`
      : `Supplier ${quoteLabel(supplier.name)} updated.`,
  });
  await mutateAppData(data);
  revalidatePath('/');
  revalidatePath('/admin/setup');
  redirect('/admin/setup?saved=supplier');
}

export async function createRawMaterialAction(formData: FormData) {
  const data = await readAppData();
  const redirectTo = resolveRedirectTo(formData, '/admin/setup');
  const allowEmpty = shouldAllowEmpty(formData);
  const values = normalizeRawMaterialForm(formData);
  if (allowEmpty && !values.name.trim()) {
    redirect(redirectTo);
  }
  const error = validateRawMaterialForm(values);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const rawMaterial = buildRawMaterialRecord(values, actorUserId);
  data.rawMaterials = [...data.rawMaterials, rawMaterial].sort((left, right) => left.name.localeCompare(right.name));
  appendActivity(data, {
    entityType: 'raw_material',
    entityId: rawMaterial.id,
    action: 'created',
    userId: actorUserId,
    summary: `Raw material ${quoteLabel(rawMaterial.name)} created.`,
  });
  await mutateAppData(data);
  revalidatePath('/');
  revalidatePath('/admin/setup');
  redirect(`${redirectTo}?saved=raw-material`);
}

export async function importCsvEntitiesAction(formData: FormData) {
  const context = await readPersistence();
  const data = context.raw;
  const redirectTo = resolveRedirectTo(formData, '/admin/setup');
  const entity = String(formData.get('entity') ?? '') as CsvEntity;
  const csvContent = String(formData.get('csvContent') ?? '');
  const rawMapping = String(formData.get('mapping') ?? '');

  if (!csvContent.trim()) {
    redirect(`${redirectTo}?error=${encodeURIComponent('Upload a CSV file before importing.')}`);
  }

  if (!['customers', 'suppliers', 'rawMaterials'].includes(entity)) {
    redirect(`${redirectTo}?error=${encodeURIComponent('Choose a supported import type.')}`);
  }

  const parsed = parseCsvContent(csvContent);
  const mapping = parseCsvMapping(rawMapping);
  const actorUserId = await getActorUserId(data);
  let imported = 0;
  let skipped = 0;
  let importedCustomers: AppData['customers'] = [];

  if (entity === 'customers') {
    const payload = buildCustomerImportPayload(parsed.headers, parsed.rows, mapping);
    const importedRecords = payload.flatMap((entry) => {
      if (!entry.displayName.trim()) {
        skipped += 1;
        return [];
      }

      imported += 1;
      return [buildCustomerRecord(entry, actorUserId)];
    });

    importedCustomers = importedRecords;
  }

  if (entity === 'suppliers') {
    const payload = buildSupplierImportPayload(parsed.headers, parsed.rows, mapping);
    const importedRecords = payload.flatMap((entry) => {
      if (!entry.name.trim()) {
        skipped += 1;
        return [];
      }

      imported += 1;
      return [buildSupplierRecord(entry, actorUserId)];
    });

    data.suppliers = [...data.suppliers, ...importedRecords].sort((left, right) => left.name.localeCompare(right.name));
  }

  if (entity === 'rawMaterials') {
    const payload = buildRawMaterialImportPayload(parsed.headers, parsed.rows, mapping);
    const importedRecords = payload.flatMap((entry) => {
      if (!entry.name.trim()) {
        skipped += 1;
        return [];
      }

      imported += 1;
      return [buildRawMaterialRecord(entry, actorUserId)];
    });

    data.rawMaterials = [...data.rawMaterials, ...importedRecords].sort((left, right) => left.name.localeCompare(right.name));
  }

  await persistence.write(({ raw, customers }) => {
    customers.upsertMany(importedCustomers);
    raw.suppliers = data.suppliers;
    raw.rawMaterials = data.rawMaterials;
  });
  revalidateAllWorkspaces();
  redirect(`${redirectTo}?saved=import&importedEntity=${entity}&importedCount=${imported}&skippedCount=${skipped}`);
}

export async function updateRawMaterialAction(rawMaterialId: string, formData: FormData) {
  const data = await readAppData();
  const existing = data.rawMaterials.find((entry) => entry.id === rawMaterialId);

  if (!existing) {
    redirect('/admin/setup?error=missing-raw-material');
  }

  const values = normalizeRawMaterialForm(formData);
  const error = validateRawMaterialForm(values);

  if (error) {
    redirect(`/admin/setup?material=${rawMaterialId}&error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const rawMaterial = buildRawMaterialRecord(values, actorUserId, existing);
  data.rawMaterials = data.rawMaterials
    .map((entry) => (entry.id === rawMaterialId ? rawMaterial : entry))
    .sort((left, right) => left.name.localeCompare(right.name));
  appendActivity(data, {
    entityType: 'raw_material',
    entityId: rawMaterial.id,
    action: existing.active !== rawMaterial.active ? 'status_changed' : 'updated',
    userId: actorUserId,
    summary: existing.active !== rawMaterial.active
      ? `Raw material ${quoteLabel(rawMaterial.name)} marked as ${rawMaterial.active ? 'active' : 'inactive'}.`
      : `Raw material ${quoteLabel(rawMaterial.name)} updated.`,
  });
  await mutateAppData(data);
  revalidatePath('/');
  revalidatePath('/admin/setup');
  redirect('/admin/setup?saved=raw-material');
}

export async function createRecipeAction(formData: FormData) {
  const data = await readAppData();
  const values = normalizeRecipeForm(formData);
  const error = validateRecipeForm(values, data);

  if (error) {
    redirect(`/admin/setup?error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const recipe = buildRecipeRecord(values, data, actorUserId);
  data.recipes = [...data.recipes, recipe].sort((left, right) => left.title.localeCompare(right.title));
  appendActivity(data, {
    entityType: 'recipe',
    entityId: recipe.id,
    action: 'created',
    userId: actorUserId,
    summary: `Recipe ${quoteLabel(recipe.title)} created.`,
  });
  await mutateAppData(data);
  revalidatePath('/');
  revalidatePath('/admin/setup');
  redirect(`/admin/setup?recipe=${recipe.id}&saved=recipe`);
}

export async function updateRecipeAction(recipeId: string, formData: FormData) {
  const data = await readAppData();
  const existing = data.recipes.find((entry) => entry.id === recipeId);

  if (!existing) {
    redirect('/admin/setup?error=missing-recipe');
  }

  const values = normalizeRecipeForm(formData);
  const error = validateRecipeForm(values, data);

  if (error) {
    redirect(`/admin/setup?recipe=${recipeId}&error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const recipe = buildRecipeRecord(values, data, actorUserId, existing);
  data.recipes = data.recipes
    .map((entry) => (entry.id === recipeId ? recipe : entry))
    .sort((left, right) => left.title.localeCompare(right.title));
  appendActivity(data, {
    entityType: 'recipe',
    entityId: recipe.id,
    action: existing.active !== recipe.active ? 'status_changed' : 'updated',
    userId: actorUserId,
    summary: existing.active !== recipe.active
      ? `Recipe ${quoteLabel(recipe.title)} marked as ${recipe.active ? 'active' : 'inactive'}.`
      : `Recipe ${quoteLabel(recipe.title)} updated.`,
  });
  await mutateAppData(data);
  revalidatePath('/');
  revalidatePath('/admin/setup');
  redirect(`/admin/setup?recipe=${recipe.id}&saved=recipe`);
}

export async function createSupplierPriceEntryAction(formData: FormData) {
  const data = await readAppData();
  const values = normalizeSupplierPriceEntryForm(formData);
  const error = validateSupplierPriceEntryForm(values, data);

  if (error) {
    redirect(`/admin/setup?error=${encodeURIComponent(error)}`);
  }

  const actorUserId = await getActorUserId(data);
  const priceEntry = buildSupplierPriceEntryRecord(values, data, actorUserId);
  data.supplierPriceEntries = [...data.supplierPriceEntries, priceEntry].sort((left, right) =>
    left.priceDate === right.priceDate
      ? left.rawMaterialLabel.localeCompare(right.rawMaterialLabel)
      : right.priceDate.localeCompare(left.priceDate),
  );
  await mutateAppData(data);
  revalidatePath('/');
  revalidatePath('/admin/setup');
  redirect('/admin/setup?saved=price');
}
