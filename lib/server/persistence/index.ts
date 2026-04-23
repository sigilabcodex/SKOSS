import type { AppData } from '@/lib/domain/types';
import { createPersistenceGateway } from '@/lib/server/persistence/postgres-hybrid-adapter';

const gateway = createPersistenceGateway();

export function getPersistenceGateway() {
  return gateway;
}

export async function readPersistence() {
  return gateway.read();
}

export async function readAppData(): Promise<AppData> {
  const context = await readPersistence();
  return context.raw;
}

export async function readSeedAppData(): Promise<AppData> {
  return gateway.readSeed();
}

export async function reseedRuntimeAppData() {
  await gateway.reseedRuntime();
}

// TODO(next-pr/persistence-segmented-writes): Replace blob-style mutateAppData callsites with domain repository writes (users/customers/session -> orders/recurring -> production/activity).
export async function mutateAppData(next: AppData | ((data: AppData) => Promise<void> | void)) {
  await gateway.write(async ({ raw }) => {
    if (typeof next === 'function') {
      await next(raw);
      return;
    }

    Object.assign(raw, next);
  });
}
